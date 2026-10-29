<?php

namespace App\Controller;

use App\Entity\Actualite;
use App\Entity\Enseignant;
use App\Service\HistoriqueService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/enseignant')]
#[IsGranted('ROLE_PROF')]
class EnseignantController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private HistoriqueService $historiqueService,
        private SluggerInterface $slugger,
        private \Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface $passwordHasher
    ) {
    }

    #[Route('/profile', name: 'api_enseignant_profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof Enseignant) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $filieres = [];
        foreach ($user->getFilieres() as $f) {
            $filieres[] = [
                'id' => $f->getId(),
                'nom' => $f->getNom(),
            ];
        }

        $laboratoires = [];
        foreach ($user->getLaboratoires() as $lab) {
            $laboratoires[] = [
                'id' => $lab->getId(),
                'nom' => $lab->getNom(),
            ];
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'telephone' => $user->getTelephone(),
            'photo' => $user->getPhoto(),
            'grade' => $user->getGrade(),
            'specialite' => $user->getSpecialite(),
            'bureau' => $user->getBureau(),
            'cvUrl' => $user->getCvUrl(),
            'biographie' => $user->getBiographie(),
            'filieres' => $filieres,
            'laboratoires' => $laboratoires,
        ]);
    }

    #[Route('/profile', name: 'api_enseignant_profile_update', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof Enseignant) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        if (isset($data['nom'])) {
            $user->setNom($data['nom']);
        }
        if (isset($data['prenom'])) {
            $user->setPrenom($data['prenom']);
        }
        if (isset($data['telephone'])) {
            $user->setTelephone($data['telephone']);
        }
        if (isset($data['photo'])) {
            $user->setPhoto($data['photo']);
        }
        if (isset($data['grade'])) {
            $user->setGrade($data['grade']);
        }
        if (isset($data['specialite'])) {
            $user->setSpecialite($data['specialite']);
        }
        if (isset($data['bureau'])) {
            $user->setBureau($data['bureau']);
        }
        if (isset($data['cvUrl'])) {
            $user->setCvUrl($data['cvUrl']);
        }
        if (isset($data['biographie'])) {
            $user->setBiographie($data['biographie']);
        }
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
        if (!empty($data['password'])) {
            $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        }

        $this->em->flush();

        $this->historiqueService->log(
            $user,
            'Modification Profil',
            'Enseignant',
            $user->getId(),
            'Mise à jour immédiate des informations personnelles et académiques'
        );

        return $this->profile();
    }

    #[Route('/upload', name: 'api_enseignant_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'No file uploaded'], 400);
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

    #[Route('/publications', name: 'api_enseignant_publications_create', methods: ['POST'])]
    public function createPublication(Request $request): JsonResponse
    {
        /** @var Enseignant $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        if (!isset($data['titre']) || !isset($data['contenu'])) {
            return $this->json(['error' => 'titre and contenu are required'], 400);
        }

        $actualite = new Actualite();
        $actualite->setTitre($data['titre']);
        $actualite->setContenu($data['contenu']);
        $actualite->setSlug(strtolower($this->slugger->slug($data['titre'])->toString() . '-' . uniqid()));
        $actualite->setType('Publication');
        $actualite->setStatut('En_Attente');
        $actualite->setAuteur($user);

        if (isset($data['imageCoverUrl'])) {
            $actualite->setImageCoverUrl($data['imageCoverUrl']);
        }

        $this->em->persist($actualite);
        $this->em->flush();

        $this->historiqueService->log(
            $user,
            'Creation',
            'Actualite',
            $actualite->getId(),
            json_encode(['titre' => $actualite->getTitre(), 'type' => 'Publication'])
        );

        return $this->json([
            'id' => $actualite->getId(),
            'titre' => $actualite->getTitre(),
            'statut' => $actualite->getStatut(),
        ], 201);
    }
}
