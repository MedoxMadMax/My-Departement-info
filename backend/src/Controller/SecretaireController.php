<?php

namespace App\Controller;

use App\Entity\Actualite;
use App\Repository\ActualiteRepository;
use App\Service\HistoriqueService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/secretaire')]
#[IsGranted('ROLE_SECRETAIRE')]
class SecretaireController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ActualiteRepository $actualiteRepository,
        private HistoriqueService $historiqueService,
        private SluggerInterface $slugger
    ) {
    }

    #[Route('/actualites', name: 'api_secretaire_actualites_create', methods: ['POST'])]
    public function createActualite(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['titre']) || !isset($data['contenu']) || !isset($data['type'])) {
            return $this->json(['error' => 'titre, contenu, and type are required'], 400);
        }

        $actualite = new Actualite();
        $actualite->setTitre($data['titre']);
        $actualite->setContenu($data['contenu']);
        $actualite->setType($data['type']);
        $actualite->setSlug(strtolower($this->slugger->slug($data['titre'])->toString() . '-' . uniqid()));
        $statut = ($data['statut'] ?? 'Publiee') === 'Brouillon' ? 'Brouillon' : 'En_Attente';
        $actualite->setStatut($statut);
        $actualite->setAuteur($user);

        if (isset($data['dateEvenement'])) {
            try {
                $actualite->setDateEvenement($data['dateEvenement'] ? new \DateTime($data['dateEvenement']) : null);
            } catch (\Exception $e) {
                return $this->json(['error' => 'Invalid date format'], 400);
            }
        }
        if (isset($data['imageCoverUrl'])) {
            $actualite->setImageCoverUrl($data['imageCoverUrl']);
        }

        $this->em->persist($actualite);
        $this->em->flush();

        $actionLabel = ($statut === 'Brouillon') ? 'Création Brouillon' : 'Demande de création';
        $this->historiqueService->log(
            $user,
            $actionLabel,
            'Actualite',
            $actualite->getId(),
            'Demande pour Actualite : ' . $actualite->getTitre()
        );

        return $this->json([
            'id' => $actualite->getId(),
            'titre' => $actualite->getTitre(),
            'statut' => $actualite->getStatut(),
        ], 201);
    }

    #[Route('/actualites', name: 'api_secretaire_actualites_list', methods: ['GET'])]
    public function listActualites(): JsonResponse
    {
        $actualites = $this->actualiteRepository->findBy([], ['dateCreation' => 'DESC']);
        $result = [];

        foreach ($actualites as $act) {
            $result[] = [
                'id' => $act->getId(),
                'titre' => $act->getTitre(),
                'slug' => $act->getSlug(),
                'contenu' => $act->getContenu(),
                'type' => $act->getType(),
                'statut' => $act->getStatut(),
                'motifRefus' => $act->getMotifRefus(),
                'imageCoverUrl' => $act->getImageCoverUrl(),
                'dateEvenement' => $act->getDateEvenement() ? $act->getDateEvenement()->format('Y-m-d\TH:i') : null,
                'dateCreation' => $act->getDateCreation()->format('Y-m-d H:i:s'),
                'auteur' => $act->getAuteur() ? $act->getAuteur()->getEmail() : null,
            ];
        }

        return $this->json($result);
    }

    #[Route('/actualites/{id}', name: 'api_secretaire_actualites_update', methods: ['PUT'])]
    public function updateActualite(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $actualite = $this->actualiteRepository->find($id);

        if (!$actualite) {
            return $this->json(['error' => 'Actualite not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['titre'])) {
            $actualite->setTitre($data['titre']);
            $actualite->setSlug(strtolower($this->slugger->slug($data['titre'])->toString() . '-' . uniqid()));
        }
        if (isset($data['contenu'])) {
            $actualite->setContenu($data['contenu']);
        }
        if (isset($data['type'])) {
            $actualite->setType($data['type']);
        }
        if (isset($data['dateEvenement'])) {
            try {
                $actualite->setDateEvenement($data['dateEvenement'] ? new \DateTime($data['dateEvenement']) : null);
            } catch (\Exception $e) {
                // ignore invalid dates in update
            }
        }
        if (isset($data['imageCoverUrl'])) {
            $actualite->setImageCoverUrl($data['imageCoverUrl']);
        }

        // Check if saved as draft or submitted for publication
        $statut = ($data['statut'] ?? '') === 'Brouillon' ? 'Brouillon' : 'En_Attente';
        $actualite->setStatut($statut);
        if ($statut === 'En_Attente') {
            $actualite->setMotifRefus(null); // Clear rejection motif on resubmission
        }

        $this->em->flush();

        $actionLabel = ($statut === 'Brouillon') ? 'Modification Brouillon' : 'Demande de modification';
        $this->historiqueService->log(
            $user,
            $actionLabel,
            'Actualite',
            $actualite->getId(),
            'Demande pour Actualite : ' . $actualite->getTitre()
        );

        return $this->json([
            'id' => $actualite->getId(),
            'titre' => $actualite->getTitre(),
            'statut' => $actualite->getStatut(),
        ]);
    }

    #[Route('/actualites/{id}', name: 'api_secretaire_actualites_delete', methods: ['DELETE'])]
    public function deleteActualite(int $id): JsonResponse
    {
        $user = $this->getUser();
        $actualite = $this->actualiteRepository->find($id);

        if (!$actualite) {
            return $this->json(['error' => 'Actualite not found'], 404);
        }

        $this->em->remove($actualite);
        $this->em->flush();

        $this->historiqueService->log($user, 'Suppression', 'Actualite', $id);

        return $this->json(['success' => true]);
    }

    #[Route('/historique', name: 'api_secretaire_historique_list', methods: ['GET'])]
    public function listHistorique(): JsonResponse
    {
        $user = $this->getUser();
        $logs = $this->em->getRepository(\App\Entity\HistoriqueAction::class)->findBy([], ['dateAction' => 'DESC']);
        $result = [];
        foreach ($logs as $log) {
            $isOwnAction = ($log->getUtilisateur() && $log->getUtilisateur()->getId() === $user->getId());
            $mentionsUser = $log->getDetailsChangement() && str_contains($log->getDetailsChangement(), $user->getEmail());
            
            if ($isOwnAction || $mentionsUser) {
                $result[] = [
                    'id' => $log->getId(),
                    'action' => $log->getAction(),
                    'entite' => $log->getEntiteConcernee(),
                    'entiteId' => $log->getIdEntite(),
                    'details' => $log->getDetailsChangement(),
                    'date' => $log->getDateAction()->format('Y-m-d H:i:s'),
                    'utilisateur' => $log->getUtilisateur() ? $log->getUtilisateur()->getEmail() : 'Système',
                ];
            }
        }
        return $this->json($result);
    }

    #[Route('/upload', name: 'api_secretaire_upload', methods: ['POST'])]
    public function uploadFile(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) return $this->json(['error' => 'No file provided'], 400);

        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx'];
        if (!$extension || !in_array(strtolower($extension), $allowedExtensions)) {
            return $this->json(['error' => 'Type de fichier non valide : ' . $extension], 400);
        }

        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $filename = uniqid() . '.' . $extension;
        $file->move($uploadDir, $filename);

        $url = $request->getSchemeAndHttpHost() . '/uploads/' . $filename;
        return $this->json(['url' => $url]);
    }

    #[Route('/demandes', name: 'api_secretaire_demandes_post', methods: ['POST'])]
    public function submitDemande(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Non autorisé'], 401);

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['typeEntite']) || !isset($data['action']) || !isset($data['donnees'])) {
            return $this->json(['error' => 'Données incomplètes'], 400);
        }

        $demande = new \App\Entity\DemandeValidation();
        $demande->setTypeEntite($data['typeEntite']);
        $demande->setAction($data['action']);
        $demande->setDonnees($data['donnees']);
        $demande->setEntiteId($data['entiteId'] ?? null);
        $demande->setAuteur($user);

        $em->persist($demande);
        $em->flush();

        $actionLabel = match($data['action']) {
            'CREATE' => 'Demande de création',
            'UPDATE' => 'Demande de modification',
            'DELETE' => 'Demande de suppression',
            default => 'Demande ' . $data['action']
        };

        $detailInfo = 'Demande pour ' . $data['typeEntite'];
        if (isset($data['donnees']['titre'])) $detailInfo .= ' : ' . $data['donnees']['titre'];
        elseif (isset($data['donnees']['nom'])) $detailInfo .= ' : ' . $data['donnees']['nom'];
        elseif (isset($data['donnees']['email'])) $detailInfo .= ' : ' . $data['donnees']['email'];

        $this->historiqueService->log(
            $user,
            $actionLabel,
            $data['typeEntite'],
            $data['entiteId'] ?? $demande->getId(),
            $detailInfo
        );

        return $this->json(['success' => true, 'id' => $demande->getId()]);
    }

    #[Route('/demandes', name: 'api_secretaire_demandes_get', methods: ['GET'])]
    public function getDemandes(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $demandes = $em->getRepository(\App\Entity\DemandeValidation::class)->findBy(['auteur' => $user], ['dateCreation' => 'DESC']);
        $result = [];
        foreach ($demandes as $d) {
            $result[] = [
                'id' => $d->getId(),
                'typeEntite' => $d->getTypeEntite(),
                'action' => $d->getAction(),
                'statut' => $d->getStatut(),
                'motifRefus' => $d->getMotifRefus(),
                'dateCreation' => $d->getDateCreation()->format('Y-m-d H:i:s'),
                'entiteId' => $d->getEntiteId(),
                'donnees' => $d->getDonnees()
            ];
        }
        return $this->json($result);
    }
}

