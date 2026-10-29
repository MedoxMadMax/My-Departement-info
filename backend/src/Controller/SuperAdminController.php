<?php

namespace App\Controller;

use App\Entity\Admin;
use App\Entity\Enseignant;
use App\Entity\Secretaire;
use App\Repository\ActualiteRepository;
use App\Repository\UtilisateurRepository;
use App\Service\ActualiteWorkflowService;
use App\Service\HistoriqueService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/super-admin')]
class SuperAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UtilisateurRepository $utilisateurRepository,
        private ActualiteRepository $actualiteRepository,
        private ActualiteWorkflowService $workflowService,
        private HistoriqueService $historiqueService,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    #[Route('/utilisateurs', name: 'api_super_admin_utilisateurs_list', methods: ['GET'])]
    public function listUtilisateurs(): JsonResponse
    {
        $users = $this->utilisateurRepository->findAll();
        $result = [];

        foreach ($users as $u) {
            $type = 'inconnu';
            if ($u instanceof Admin) $type = 'admin';
            elseif ($u instanceof Secretaire) $type = 'secretaire';
            elseif ($u instanceof Enseignant) $type = 'enseignant';

            $data = [
                'id' => $u->getId(),
                'email' => $u->getEmail(),
                'roles' => $u->getRoles(),
                'isActive' => $u->getIsActive(),
                'type' => $type,
            ];

            if ($u instanceof Enseignant) {
                $data['nom'] = $u->getNom();
                $data['prenom'] = $u->getPrenom();
                $data['grade'] = $u->getGrade();
            }

            $result[] = $data;
        }

        return $this->json($result);
    }

    #[Route('/utilisateurs', name: 'api_super_admin_utilisateurs_create', methods: ['POST'])]
    public function createUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password']) || empty($data['roles'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }

        $role = is_array($data['roles']) ? $data['roles'][0] : $data['roles'];

        if ($role === 'ROLE_ADMIN') {
            $user = new Admin();
        } elseif ($role === 'ROLE_SECRETAIRE') {
            $user = new Secretaire();
        } else {
            return $this->json(['error' => 'Unsupported role for generic creation. Use specific endpoint for Enseignants.'], 400);
        }

        $user->setEmail($data['email']);
        $user->setRoles([$role]);
        $user->setIsActive(true);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $data['password'])
        );

        $this->em->persist($user);
        $this->em->flush();

        $this->historiqueService->log(
            $this->getUser(),
            'Création',
            'Utilisateur',
            $user->getId(),
            "Compte $role créé avec email: " . $user->getEmail()
        );

        return $this->json([
            'success' => true,
            'id' => $user->getId(),
            'email' => $user->getEmail()
        ], 201);
    }

    #[Route('/utilisateurs/{id}/activer', name: 'api_super_admin_utilisateurs_toggle', methods: ['PATCH'])]
    public function toggleUserStatus(int $id): JsonResponse
    {
        $user = $this->utilisateurRepository->find($id);
        if (!$user) return $this->json(['error' => 'Not found'], 404);

        $user->setIsActive(!$user->getIsActive());
        $this->em->flush();

        $this->historiqueService->log(
            $this->getUser(),
            'Modification',
            'Utilisateur',
            $user->getId(),
            'Status set to ' . ($user->getIsActive() ? 'active' : 'inactive')
        );

        return $this->json(['success' => true, 'isActive' => $user->getIsActive()]);
    }

    #[Route('/utilisateurs/{id}/role', name: 'api_super_admin_utilisateurs_role', methods: ['PATCH'])]
    public function updateUserRole(int $id, Request $request): JsonResponse
    {
        $user = $this->utilisateurRepository->find($id);
        if (!$user) return $this->json(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        if (isset($data['roles']) && is_array($data['roles'])) {
            $user->setRoles($data['roles']);
            $this->em->flush();

            $this->historiqueService->log(
                $this->getUser(),
                'Modification',
                'Utilisateur',
                $user->getId(),
                'Roles updated: ' . implode(', ', $data['roles'])
            );
        }

        return $this->json(['success' => true, 'roles' => $user->getRoles()]);
    }

        #[Route('/actualites/pending', name: 'api_super_admin_actualites_pending', methods: ['GET'])]
    public function listPendingActualites(EntityManagerInterface $em): JsonResponse
    {
        $actualites = $this->actualiteRepository->findPending();
        $demandes = $em->getRepository(\App\Entity\DemandeValidation::class)->findBy(['statut' => 'En_Attente']);
        $result = [];

        foreach ($actualites as $act) {
            $auteur = $act->getAuteur();
            $result[] = [
                'id' => 'ACT-' . $act->getId(),
                'titre' => $act->getTitre(),
                'type' => $act->getType(),
                'dateCreation' => $act->getDateCreation()->format('Y-m-d H:i:s'),
                'auteur' => $auteur ? $auteur->getEmail() : 'Unknown',
            ];
        }

        foreach ($demandes as $dem) {
            $auteur = $dem->getAuteur();
            $titre = $dem->getAction() . ' ' . $dem->getTypeEntite();
            // If we have some specific name in donnees, use it
            if (isset($dem->getDonnees()['nom'])) $titre .= ' (' . $dem->getDonnees()['nom'] . ')';
            elseif (isset($dem->getDonnees()['email'])) $titre .= ' (' . $dem->getDonnees()['email'] . ')';
            
            $result[] = [
                'id' => 'DEM-' . $dem->getId(),
                'titre' => $titre,
                'type' => 'Demande ' . $dem->getTypeEntite(),
                'dateCreation' => $dem->getDateCreation()->format('Y-m-d H:i:s'),
                'auteur' => $auteur ? $auteur->getEmail() : 'Unknown',
            ];
        }

        return $this->json($result);
    }

    #[Route('/actualites/{id}/valider', name: 'api_super_admin_actualites_valider', methods: ['PATCH'])]
    public function validerActualite(string $id, EntityManagerInterface $em, \App\Service\ValidationExecutionService $execService = null): JsonResponse
    {
        if (str_starts_with($id, 'DEM-')) {
            $realId = (int) substr($id, 4);
            $demande = $em->getRepository(\App\Entity\DemandeValidation::class)->find($realId);
            if (!$demande) return $this->json(['error' => 'Demande non trouvée'], 404);
            
            // Validate the demande
            $demande->setStatut('Validee');
            $em->flush();
            
            // Execute the action if we have the service
            if ($execService) {
                try {
                    $execService->executeDemande($demande);
                } catch (\Exception $e) {
                    return $this->json(['error' => 'Erreur exécution: ' . $e->getMessage()], 500);
                }
            }

            $auteurEmail = $demande->getAuteur() ? $demande->getAuteur()->getEmail() : 'Secrétaire';
            $detailInfo = 'Demande ' . $demande->getAction() . ' validée pour ' . $demande->getTypeEntite() . ' (soumise par ' . $auteurEmail . ')';

            $this->historiqueService->log(
                $this->getUser(),
                'Validation',
                $demande->getTypeEntite(),
                $demande->getEntiteId() ?? $demande->getId(),
                $detailInfo
            );

            return $this->json(['success' => true]);
        }

        $realId = str_starts_with($id, 'ACT-') ? (int) substr($id, 4) : (int) $id;
        $act = $this->actualiteRepository->find($realId);
        if (!$act) return $this->json(['error' => 'Actualité non trouvée'], 404);

        $act->setStatut('Publiee');
        $em->flush();

        $this->historiqueService->log(
            $this->getUser(),
            'Validation',
            'Actualite',
            $act->getId(),
            'Publication validée pour l\'actualité : ' . $act->getTitre()
        );

        return $this->json(['success' => true]);
    }

    #[Route('/actualites/{id}/refuser', name: 'api_super_admin_actualites_refuser', methods: ['PATCH'])]
    public function refuserActualite(string $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $motif = $data['motifRefus'] ?? '';

        if (str_starts_with($id, 'DEM-')) {
            $realId = (int) substr($id, 4);
            $demande = $em->getRepository(\App\Entity\DemandeValidation::class)->find($realId);
            if (!$demande) return $this->json(['error' => 'Demande non trouvée'], 404);
            
            $demande->setStatut('Refusee');
            $demande->setMotifRefus($motif);
            $em->flush();
            
            $auteurEmail = $demande->getAuteur() ? $demande->getAuteur()->getEmail() : 'Secrétaire';
            $detailInfo = 'Demande ' . $demande->getAction() . ' refusée. Motif : ' . ($motif ?: 'Non spécifié') . ' (soumise par ' . $auteurEmail . ')';

            $this->historiqueService->log(
                $this->getUser(),
                'Refus',
                $demande->getTypeEntite(),
                $demande->getEntiteId() ?? $demande->getId(),
                $detailInfo
            );

            return $this->json(['success' => true]);
        }

        $realId = str_starts_with($id, 'ACT-') ? (int) substr($id, 4) : (int) $id;
        $act = $this->actualiteRepository->find($realId);
        if (!$act) return $this->json(['error' => 'Actualité non trouvée'], 404);

        $act->setStatut('Refusee');
        $act->setMotifRefus($motif);
        $em->flush();

        $this->historiqueService->log(
            $this->getUser(),
            'Refus',
            'Actualite',
            $act->getId(),
            'Actualité refusée. Motif : ' . ($motif ?: 'Non spécifié')
        );

        return $this->json(['success' => true]);
    }
}
