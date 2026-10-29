<?php

namespace App\Controller;

use App\Entity\Enseignant;
use App\Service\HistoriqueService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private HistoriqueService $historiqueService
    ) {
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'isActive' => $user->getIsActive(),
        ];

        if ($user instanceof Enseignant) {
            $data['nom'] = $user->getNom();
            $data['prenom'] = $user->getPrenom();
            $data['telephone'] = $user->getTelephone();
            $data['photo'] = $user->getPhoto();
            $data['grade'] = $user->getGrade();
            $data['specialite'] = $user->getSpecialite();
            $data['bureau'] = $user->getBureau();
            $data['cvUrl'] = $user->getCvUrl();
            $data['biographie'] = $user->getBiographie();
            $labs = [];
            foreach ($user->getLaboratoires() as $lab) {
                $labs[] = [
                    'id' => $lab->getId(),
                    'nom' => $lab->getNom(),
                    'acronyme' => $lab->getAcronyme(),
                ];
            }
            $data['laboratoires'] = $labs;
        }

        return $this->json($data);
    }

    #[Route('/me', name: 'api_me_update', methods: ['PUT', 'POST'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true) ?: [];

        if (!empty($data['password'])) {
            $hashed = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashed);
        }

        if ($user instanceof Enseignant) {
            if (isset($data['nom'])) $user->setNom($data['nom']);
            if (isset($data['prenom'])) $user->setPrenom($data['prenom']);
            if (isset($data['telephone'])) $user->setTelephone($data['telephone']);
            if (isset($data['photo'])) $user->setPhoto($data['photo']);
            if (isset($data['grade'])) $user->setGrade($data['grade']);
            if (isset($data['specialite'])) $user->setSpecialite($data['specialite']);
            if (isset($data['bureau'])) $user->setBureau($data['bureau']);
            if (isset($data['cvUrl'])) $user->setCvUrl($data['cvUrl']);
            if (isset($data['biographie'])) $user->setBiographie($data['biographie']);

            if (isset($data['laboratoireIds']) && is_array($data['laboratoireIds'])) {
                foreach ($user->getLaboratoires() as $lab) {
                    $user->removeLaboratoire($lab);
                }
                foreach ($data['laboratoireIds'] as $labId) {
                    $lab = $this->em->getRepository(\App\Entity\Laboratoire::class)->find($labId);
                    if ($lab) $user->addLaboratoire($lab);
                }
            } elseif (isset($data['laboratoireId'])) {
                foreach ($user->getLaboratoires() as $lab) {
                    $user->removeLaboratoire($lab);
                }
                if (!empty($data['laboratoireId'])) {
                    $lab = $this->em->getRepository(\App\Entity\Laboratoire::class)->find($data['laboratoireId']);
                    if ($lab) $user->addLaboratoire($lab);
                }
            }
        }

        $this->em->flush();

        $this->historiqueService->log(
            $user,
            'Modification Profil',
            'Utilisateur',
            $user->getId(),
            'Mise à jour immédiate des informations de profil / académiques'
        );

        $labs = [];
        if ($user instanceof Enseignant) {
            foreach ($user->getLaboratoires() as $lab) {
                $labs[] = [
                    'id' => $lab->getId(),
                    'nom' => $lab->getNom(),
                    'acronyme' => $lab->getAcronyme(),
                ];
            }
        }

        return $this->json([
            'success' => true,
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'nom' => $user instanceof Enseignant ? $user->getNom() : null,
            'prenom' => $user instanceof Enseignant ? $user->getPrenom() : null,
            'telephone' => $user instanceof Enseignant ? $user->getTelephone() : null,
            'photo' => $user instanceof Enseignant ? $user->getPhoto() : null,
            'grade' => $user instanceof Enseignant ? $user->getGrade() : null,
            'specialite' => $user instanceof Enseignant ? $user->getSpecialite() : null,
            'bureau' => $user instanceof Enseignant ? $user->getBureau() : null,
            'cvUrl' => $user instanceof Enseignant ? $user->getCvUrl() : null,
            'biographie' => $user instanceof Enseignant ? $user->getBiographie() : null,
            'laboratoires' => $labs,
        ]);
    }

    #[Route('/upload', name: 'api_common_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'No file provided'], 400);
        }

        $extension = $file->getClientOriginalExtension();
        if (!$extension) {
            $extension = $file->guessExtension();
        }
        
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'doc', 'docx'];
        if (!$extension || !in_array(strtolower($extension), $allowedExtensions)) {
            return $this->json(['error' => 'Type de fichier non valide : ' . $extension], 400);
        }

        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = uniqid() . '.' . strtolower($extension);
        $file->move($uploadDir, $filename);

        $url = $request->getSchemeAndHttpHost() . '/uploads/' . $filename;
        
        return $this->json(['url' => $url, 'filename' => $filename]);
    }

    #[Route('/dashboard/stats', name: 'api_dashboard_stats', methods: ['GET'])]
    public function getDashboardStats(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $roles = $user->getRoles();
        $isSuperAdmin = in_array('ROLE_SUPER_ADMIN', $roles);
        $isAdmin = in_array('ROLE_ADMIN', $roles);
        $isSecretaire = in_array('ROLE_SECRETAIRE', $roles);

        if (!$isSuperAdmin && !$isAdmin && !$isSecretaire) {
            return $this->json(['isProf' => true]);
        }

        $actRepo = $this->em->getRepository(\App\Entity\Actualite::class);
        $demRepo = $this->em->getRepository(\App\Entity\DemandeValidation::class);

        if ($isSuperAdmin || $isAdmin) {
            $allActs = $actRepo->findAll();
            $allDems = $demRepo->findAll();
        } else {
            $allActs = $actRepo->findBy(['auteur' => $user]);
            $allDems = $demRepo->findBy(['auteur' => $user]);
        }

        $enAttente = 0;
        $valide = 0;
        $refuse = 0;

        foreach ($allActs as $act) {
            $s = strtolower(str_replace(['_', ' '], '', $act->getStatut() ?? ''));
            if ($s === 'enattente') $enAttente++;
            elseif (in_array($s, ['publiee', 'publie', 'validee', 'valide'])) $valide++;
            elseif (in_array($s, ['refusee', 'refuse'])) $refuse++;
        }

        foreach ($allDems as $dem) {
            $s = strtolower(str_replace(['_', ' '], '', $dem->getStatut() ?? ''));
            if ($s === 'enattente') $enAttente++;
            elseif (in_array($s, ['validee', 'valide', 'publiee', 'publie'])) $valide++;
            elseif (in_array($s, ['refusee', 'refuse'])) $refuse++;
        }

        return $this->json([
            'enAttente' => $enAttente,
            'valide' => $valide,
            'refuse' => $refuse,
            'isSecretaire' => $isSecretaire && !$isAdmin && !$isSuperAdmin,
            'isAdmin' => $isAdmin || $isSuperAdmin
        ]);
    }
}
