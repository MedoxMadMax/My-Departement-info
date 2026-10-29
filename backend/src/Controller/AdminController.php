<?php

namespace App\Controller;

use App\Entity\Actualite;
use App\Entity\AxeRecherche;
use App\Entity\DepartementInfo;
use App\Entity\Enseignant;
use App\Entity\Filiere;
use App\Entity\Laboratoire;
use App\Repository\ActualiteRepository;
use App\Repository\AxeRechercheRepository;
use App\Repository\EnseignantRepository;
use App\Repository\FiliereRepository;
use App\Repository\HistoriqueActionRepository;
use App\Repository\LaboratoireRepository;
use App\Service\HistoriqueService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private FiliereRepository $filiereRepository,
        private EnseignantRepository $enseignantRepository,
        private LaboratoireRepository $laboratoireRepository,
        private AxeRechercheRepository $axeRechercheRepository,
        private ActualiteRepository $actualiteRepository,
        private HistoriqueActionRepository $historiqueRepository,
        private HistoriqueService $historiqueService,
        private SluggerInterface $slugger,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    // --- FILIERES ---
    #[Route('/filieres', name: 'api_admin_filieres_list', methods: ['GET'])]
    public function listFilieres(): JsonResponse
    {
        $filieres = $this->filiereRepository->findAll();
        $result = [];
        foreach ($filieres as $filiere) {
            $result[] = [
                'id' => $filiere->getId(),
                'nom' => $filiere->getNom(),
                'type' => $filiere->getType(),
                'isActive' => $filiere->getIsActive(),
                'slug' => $filiere->getSlug(),
                'description' => $filiere->getDescription(),
                'objectifs' => $filiere->getObjectifs(),
                'lienProgramme' => $filiere->getLienProgramme(),
                'duree' => $filiere->getDuree(),
            ];
        }
        return $this->json($result);
    }

    #[Route('/filieres', name: 'api_admin_filieres_create', methods: ['POST'])]
    public function createFiliere(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $filiere = new Filiere();
        $filiere->setNom($data['nom'] ?? '');
        $filiere->setSlug(strtolower($this->slugger->slug($data['nom'] ?? '')->toString() . '-' . uniqid()));
        $filiere->setType($data['type'] ?? 'Licence');
        $filiere->setDescription($data['description'] ?? '');
        $filiere->setObjectifs($data['objectifs'] ?? null);
        $filiere->setIsActive($data['isActive'] ?? true);
        if (isset($data['lienProgramme'])) {
            $filiere->setLienProgramme($data['lienProgramme']);
        }
        if (isset($data['duree'])) {
            $filiere->setDuree((int) $data['duree']);
        }

        $this->em->persist($filiere);
        $this->em->flush();

        $this->historiqueService->log($this->getUser(), 'Creation', 'Filiere', $filiere->getId(), $filiere->getNom());
        return $this->json(['id' => $filiere->getId()], 201);
    }

    #[Route('/filieres/{id}', name: 'api_admin_filieres_update', methods: ['PUT'])]
    public function updateFiliere(int $id, Request $request): JsonResponse
    {
        $filiere = $this->filiereRepository->find($id);
        if (!$filiere) return $this->json(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        if (isset($data['nom'])) {
            $filiere->setNom($data['nom']);
            $filiere->setSlug(strtolower($this->slugger->slug($data['nom'])->toString() . '-' . uniqid()));
        }
        if (isset($data['type'])) $filiere->setType($data['type']);
        if (isset($data['description'])) $filiere->setDescription($data['description']);
        if (isset($data['objectifs'])) $filiere->setObjectifs($data['objectifs']);
        if (isset($data['isActive'])) $filiere->setIsActive($data['isActive']);
        if (array_key_exists('lienProgramme', $data)) $filiere->setLienProgramme($data['lienProgramme']);
        if (isset($data['duree'])) $filiere->setDuree((int) $data['duree']);

        $this->em->flush();
        $this->historiqueService->log($this->getUser(), 'Modification', 'Filiere', $filiere->getId());
        return $this->json(['success' => true]);
    }

    #[Route('/filieres/{id}', name: 'api_admin_filieres_delete', methods: ['DELETE'])]
    public function deleteFiliere(int $id): JsonResponse
    {
        $filiere = $this->filiereRepository->find($id);
        if ($filiere) {
            $this->em->remove($filiere);
            $this->em->flush();
            $this->historiqueService->log($this->getUser(), 'Suppression', 'Filiere', $id);
        }
        return $this->json(['success' => true]);
    }

    // --- ENSEIGNANTS ---
    #[Route('/enseignants', name: 'api_admin_enseignants_list', methods: ['GET'])]
    public function listEnseignants(): JsonResponse
    {
        $enseignants = $this->enseignantRepository->findAll();
        $result = [];
        foreach ($enseignants as $ens) {
            $labs = [];
            foreach ($ens->getLaboratoires() as $lab) {
                $labs[] = [
                    'id' => $lab->getId(),
                    'nom' => $lab->getNom(),
                    'acronyme' => $lab->getAcronyme(),
                ];
            }
            $result[] = [
                'id' => $ens->getId(),
                'email' => $ens->getEmail(),
                'nom' => $ens->getNom(),
                'prenom' => $ens->getPrenom(),
                'grade' => $ens->getGrade(),
                'specialite' => $ens->getSpecialite(),
                'bureau' => $ens->getBureau(),
                'photo' => $ens->getPhoto(),
                'telephone' => $ens->getTelephone(),
                'isActive' => $ens->getIsActive(),
                'laboratoires' => $labs,
            ];
        }
        return $this->json($result);
    }

    #[Route('/enseignants', name: 'api_admin_enseignants_create', methods: ['POST'])]
    public function createEnseignant(Request $request): JsonResponse
    {
        $contentType = $request->headers->get('Content-Type', '');
        if (str_starts_with($contentType, 'application/json')) {
            $data = json_decode($request->getContent(), true);
        } else {
            $data = $request->request->all();
        }

        $ens = new Enseignant();
        $ens->setEmail($data['email']);
        $ens->setPassword($this->passwordHasher->hashPassword($ens, $data['password']));
        $ens->setNom($data['nom']);
        $ens->setPrenom($data['prenom']);
        $ens->setGrade($data['grade']);
        $ens->setSpecialite($data['specialite'] ?? null);
        $ens->setBureau($data['bureau'] ?? null);
        $ens->setTelephone($data['telephone'] ?? null);

        // Attach Laboratoire(s)
        if (isset($data['laboratoireIds']) && is_array($data['laboratoireIds'])) {
            foreach ($data['laboratoireIds'] as $labId) {
                $lab = $this->laboratoireRepository->find($labId);
                if ($lab) $ens->addLaboratoire($lab);
            }
        } elseif (!empty($data['laboratoireId'])) {
            $lab = $this->laboratoireRepository->find($data['laboratoireId']);
            if ($lab) $ens->addLaboratoire($lab);
        }

        // Handle Photo Upload
        $photoFile = $request->files->get('photoFile');
        if ($photoFile) {
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/photos';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $newFilename = uniqid().'.'.$photoFile->getClientOriginalExtension();
            $photoFile->move($uploadDir, $newFilename);
            $ens->setPhoto('/uploads/photos/'.$newFilename);
        } else if (isset($data['photo']) && !empty($data['photo'])) {
            $ens->setPhoto($data['photo']);
        }

        $ens->setRoles(['ROLE_PROF']);
        $ens->setIsActive(true);

        $this->em->persist($ens);
        $this->em->flush();

        $this->historiqueService->log($this->getUser(), 'Creation', 'Enseignant', $ens->getId(), $ens->getEmail());
        return $this->json(['id' => $ens->getId()], 201);
    }

    #[Route('/enseignants/{id}', name: 'api_admin_enseignants_update', methods: ['PUT', 'POST'])]
    public function updateEnseignant(int $id, Request $request): JsonResponse
    {
        $ens = $this->enseignantRepository->find($id);
        if (!$ens) return $this->json(['error' => 'Not found'], 404);

        $contentType = $request->headers->get('Content-Type', '');
        if (str_starts_with($contentType, 'application/json')) {
            $data = json_decode($request->getContent(), true);
        } else {
            $data = $request->request->all();
        }

        if (isset($data['email'])) $ens->setEmail($data['email']);
        if (isset($data['nom'])) $ens->setNom($data['nom']);
        if (isset($data['prenom'])) $ens->setPrenom($data['prenom']);
        if (isset($data['grade'])) $ens->setGrade($data['grade']);
        if (isset($data['specialite'])) $ens->setSpecialite($data['specialite']);
        if (isset($data['bureau'])) $ens->setBureau($data['bureau']);
        if (isset($data['telephone'])) $ens->setTelephone($data['telephone']);
        if (isset($data['biographie'])) $ens->setBiographie($data['biographie']);
        if (isset($data['cvUrl'])) $ens->setCvUrl($data['cvUrl']);
        if (!empty($data['password'])) {
            $ens->setPassword($this->passwordHasher->hashPassword($ens, $data['password']));
        }
        
        // Update Laboratoires
        if (isset($data['laboratoireIds']) && is_array($data['laboratoireIds'])) {
            foreach ($ens->getLaboratoires() as $lab) {
                $ens->removeLaboratoire($lab);
            }
            foreach ($data['laboratoireIds'] as $labId) {
                $lab = $this->laboratoireRepository->find($labId);
                if ($lab) $ens->addLaboratoire($lab);
            }
        } elseif (isset($data['laboratoireId'])) {
            foreach ($ens->getLaboratoires() as $lab) {
                $ens->removeLaboratoire($lab);
            }
            if (!empty($data['laboratoireId'])) {
                $lab = $this->laboratoireRepository->find($data['laboratoireId']);
                if ($lab) $ens->addLaboratoire($lab);
            }
        }

        // Handle Photo Upload
        $photoFile = $request->files->get('photoFile');
        if ($photoFile) {
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/photos';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $newFilename = uniqid().'.'.$photoFile->getClientOriginalExtension();
            $photoFile->move($uploadDir, $newFilename);
            $ens->setPhoto('/uploads/photos/'.$newFilename);
        } else if (isset($data['photo'])) {
            $ens->setPhoto($data['photo']);
        }

        $this->em->flush();
        $this->historiqueService->log($this->getUser(), 'Modification', 'Enseignant', $ens->getId(), $ens->getNom() . ' ' . $ens->getPrenom());
        return $this->json(['success' => true]);
    }

    #[Route('/enseignants/{id}', name: 'api_admin_enseignants_delete', methods: ['DELETE'])]
    public function deleteEnseignant(int $id): JsonResponse
    {
        $ens = $this->enseignantRepository->find($id);
        if ($ens) {
            $this->em->remove($ens);
            $this->em->flush();
            $this->historiqueService->log($this->getUser(), 'Suppression', 'Enseignant', $id);
        }
        return $this->json(['success' => true]);
    }

    // --- LABORATOIRES ---
    #[Route('/laboratoires', name: 'api_admin_laboratoires_list', methods: ['GET'])]
    public function listLaboratoires(): JsonResponse
    {
        $laboratoires = $this->laboratoireRepository->findAll();
        $result = [];
        foreach ($laboratoires as $lab) {
            $axesList = [];
            foreach ($lab->getAxesRecherche() as $axe) {
                $axesList[] = $axe->getTitre();
            }
            
            $enseignantsList = [];
            $enseignantsIds = [];
            foreach ($lab->getEnseignants() as $ens) {
                $enseignantsList[] = $ens->getNom() . ' ' . $ens->getPrenom();
                $enseignantsIds[] = $ens->getId();
            }

            $result[] = [
                'id' => $lab->getId(),
                'nom' => $lab->getNom(),
                'acronyme' => $lab->getAcronyme(),
                'description' => $lab->getDescription(),
                'axesCount' => count($axesList),
                'axes' => $axesList,
                'enseignants' => $enseignantsList,
                'enseignantIds' => $enseignantsIds,
            ];
        }
        return $this->json($result);
    }

    #[Route('/laboratoires', name: 'api_admin_laboratoires_create', methods: ['POST'])]
    public function createLaboratoire(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $lab = new Laboratoire();
        $lab->setNom($data['nom']);
        $lab->setAcronyme($data['acronyme']);
        $lab->setDescription($data['description'] ?? '');

        if (isset($data['enseignantIds']) && is_array($data['enseignantIds'])) {
            foreach ($data['enseignantIds'] as $ensId) {
                $enseignant = $this->enseignantRepository->find($ensId);
                if ($enseignant) {
                    $lab->addEnseignant($enseignant);
                }
            }
        }

        $this->em->persist($lab);
        $this->em->flush();

        $this->historiqueService->log($this->getUser(), 'Creation', 'Laboratoire', $lab->getId(), $lab->getNom());
        return $this->json(['id' => $lab->getId()], 201);
    }

    #[Route('/laboratoires/{id}', name: 'api_admin_laboratoires_update', methods: ['PUT'])]
    public function updateLaboratoire(int $id, Request $request): JsonResponse
    {
        $lab = $this->laboratoireRepository->find($id);
        if (!$lab) return $this->json(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        if (isset($data['nom'])) $lab->setNom($data['nom']);
        if (isset($data['acronyme'])) $lab->setAcronyme($data['acronyme']);
        if (isset($data['description'])) $lab->setDescription($data['description']);

        if (isset($data['enseignantIds']) && is_array($data['enseignantIds'])) {
            // Remove existing
            foreach ($lab->getEnseignants() as $ens) {
                $lab->removeEnseignant($ens);
            }
            // Add new
            foreach ($data['enseignantIds'] as $ensId) {
                $enseignant = $this->enseignantRepository->find($ensId);
                if ($enseignant) {
                    $lab->addEnseignant($enseignant);
                }
            }
        }

        $this->em->flush();
        $this->historiqueService->log($this->getUser(), 'Modification', 'Laboratoire', $lab->getId());
        return $this->json(['success' => true]);
    }

    #[Route('/laboratoires/{id}', name: 'api_admin_laboratoires_delete', methods: ['DELETE'])]
    public function deleteLaboratoire(int $id): JsonResponse
    {
        $lab = $this->laboratoireRepository->find($id);
        if ($lab) {
            $this->em->remove($lab);
            $this->em->flush();
            $this->historiqueService->log($this->getUser(), 'Suppression', 'Laboratoire', $id);
        }
        return $this->json(['success' => true]);
    }

    // --- AXES ---
    #[Route('/laboratoires/{labId}/axes', name: 'api_admin_axes_create', methods: ['POST'])]
    public function createAxe(int $labId, Request $request): JsonResponse
    {
        $lab = $this->laboratoireRepository->find($labId);
        if (!$lab) return $this->json(['error' => 'Laboratoire not found'], 404);

        $data = json_decode($request->getContent(), true);
        $axe = new AxeRecherche();
        $axe->setTitre($data['titre']);
        $axe->setDescription($data['description']);
        $axe->setLaboratoire($lab);

        $this->em->persist($axe);
        $this->em->flush();

        $this->historiqueService->log($this->getUser(), 'Creation', 'AxeRecherche', $axe->getId(), $axe->getTitre());
        return $this->json(['id' => $axe->getId()], 201);
    }

    #[Route('/axes/{id}', name: 'api_admin_axes_update', methods: ['PUT'])]
    public function updateAxe(int $id, Request $request): JsonResponse
    {
        $axe = $this->axeRechercheRepository->find($id);
        if (!$axe) return $this->json(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        if (isset($data['titre'])) $axe->setTitre($data['titre']);
        if (isset($data['description'])) $axe->setDescription($data['description']);

        $this->em->flush();
        $this->historiqueService->log($this->getUser(), 'Modification', 'AxeRecherche', $axe->getId());
        return $this->json(['success' => true]);
    }

    #[Route('/axes/{id}', name: 'api_admin_axes_delete', methods: ['DELETE'])]
    public function deleteAxe(int $id): JsonResponse
    {
        $axe = $this->axeRechercheRepository->find($id);
        if ($axe) {
            $this->em->remove($axe);
            $this->em->flush();
            $this->historiqueService->log($this->getUser(), 'Suppression', 'AxeRecherche', $id);
        }
        return $this->json(['success' => true]);
    }

    // --- ACTUALITES ---
    #[Route('/actualites', name: 'api_admin_actualites_list', methods: ['GET'])]
    public function listActualites(): JsonResponse
    {
        $actualites = $this->actualiteRepository->findAll();
        $result = [];
        foreach ($actualites as $act) {
            $result[] = [
                'id' => $act->getId(),
                'titre' => $act->getTitre(),
                'slug' => $act->getSlug(),
                'contenu' => $act->getContenu(),
                'statut' => $act->getStatut(),
                'motifRefus' => $act->getMotifRefus(),
                'type' => $act->getType(),
                'imageCoverUrl' => $act->getImageCoverUrl(),
                'dateEvenement' => $act->getDateEvenement() ? $act->getDateEvenement()->format('Y-m-d\TH:i') : null,
                'dateCreation' => $act->getDateCreation()->format('Y-m-d H:i:s'),
                'auteur' => $act->getAuteur() ? $act->getAuteur()->getEmail() : null,
            ];
        }
        return $this->json($result);
    }

    #[Route('/actualites', name: 'api_admin_actualites_create', methods: ['POST'])]
    public function createActualite(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $act = new Actualite();
        $act->setTitre($data['titre']);
        $act->setContenu($data['contenu']);
        $act->setType($data['type']);
        if (isset($data['dateEvenement'])) $act->setDateEvenement(new \DateTime($data['dateEvenement']));
        if (isset($data['imageCoverUrl'])) $act->setImageCoverUrl($data['imageCoverUrl']);
        $act->setSlug(strtolower($this->slugger->slug($data['titre'])->toString() . '-' . uniqid()));
        $act->setStatut('Publiee'); // direct publish
        $act->setAuteur($this->getUser());

        $this->em->persist($act);
        $this->em->flush();

        $this->historiqueService->log($this->getUser(), 'Creation (Direct)', 'Actualite', $act->getId(), $act->getTitre());
        return $this->json(['id' => $act->getId()], 201);
    }

    #[Route('/actualites/{id}', name: 'api_admin_actualites_update', methods: ['PUT'])]
    public function updateActualite(int $id, Request $request): JsonResponse
    {
        $act = $this->actualiteRepository->find($id);
        if (!$act) return $this->json(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        if (isset($data['titre'])) {
            $act->setTitre($data['titre']);
            $act->setSlug(strtolower($this->slugger->slug($data['titre'])->toString() . '-' . uniqid()));
        }
        if (isset($data['contenu'])) $act->setContenu($data['contenu']);
        if (isset($data['type'])) $act->setType($data['type']);
        if (isset($data['statut'])) $act->setStatut($data['statut']);
        if (isset($data['dateEvenement'])) $act->setDateEvenement($data['dateEvenement'] ? new \DateTime($data['dateEvenement']) : null);
        if (isset($data['imageCoverUrl'])) $act->setImageCoverUrl($data['imageCoverUrl']);

        $this->em->flush();
        $this->historiqueService->log($this->getUser(), 'Modification', 'Actualite', $act->getId());
        return $this->json(['success' => true]);
    }

    #[Route('/actualites/{id}', name: 'api_admin_actualites_delete', methods: ['DELETE'])]
    public function deleteActualite(int $id): JsonResponse
    {
        $act = $this->actualiteRepository->find($id);
        if ($act) {
            $this->em->remove($act);
            $this->em->flush();
            $this->historiqueService->log($this->getUser(), 'Suppression', 'Actualite', $id);
        }
        return $this->json(['success' => true]);
    }

    // --- HISTORIQUE ---
    #[Route('/historique', name: 'api_admin_historique', methods: ['GET'])]
    public function listHistorique(): JsonResponse
    {
        $logs = $this->historiqueRepository->findAllOrdered();
        $result = [];
        foreach ($logs as $log) {
            $result[] = [
                'id' => $log->getId(),
                'action' => $log->getAction(),
                'entite' => $log->getEntiteConcernee(),
                'entiteId' => $log->getIdEntite(),
                'details' => $log->getDetailsChangement(),
                'date' => $log->getDateAction()->format('Y-m-d H:i:s'),
                'utilisateur' => $log->getUtilisateur()->getEmail(),
            ];
        }
        return $this->json($result);
    }

    // --- DEPARTEMENT INFO ---
    #[Route('/departement', name: 'api_admin_departement_get', methods: ['GET'])]
    public function getDepartement(): JsonResponse
    {
        $info = $this->em->getRepository(DepartementInfo::class)->findOneBy([]);
        if (!$info) {
            $info = new DepartementInfo();
            $this->em->persist($info);
            $this->em->flush();
        }

        return $this->json([
            'id' => $info->getId(),
            'titre' => $info->getTitre(),
            'sousTitre' => $info->getSousTitre(),
            'motDirecteur' => $info->getMotDirecteur(),
            'nomDirecteur' => $info->getNomDirecteur(),
            'titreDirecteur' => $info->getTitreDirecteur(),
            'photoDirecteur' => $info->getPhotoDirecteur(),
            'imageCover' => $info->getImageCover(),
            'histoire' => $info->getHistoire(),
            'valeurs' => $info->getValeurs(),
            'adresse' => $info->getAdresse(),
            'telephone' => $info->getTelephone(),
            'email' => $info->getEmail(),
            'horaires' => $info->getHoraires(),
            'chiffresCles' => $info->getChiffresCles() ?: [],
        ]);
    }

    #[Route('/departement', name: 'api_admin_departement_update', methods: ['PUT', 'POST'])]
    public function updateDepartement(Request $request): JsonResponse
    {
        $info = $this->em->getRepository(DepartementInfo::class)->findOneBy([]);
        if (!$info) {
            $info = new DepartementInfo();
            $this->em->persist($info);
        }

        $data = json_decode($request->getContent(), true) ?: $request->request->all();

        if (isset($data['titre'])) $info->setTitre($data['titre']);
        if (isset($data['sousTitre'])) $info->setSousTitre($data['sousTitre']);
        if (isset($data['motDirecteur'])) $info->setMotDirecteur($data['motDirecteur']);
        if (isset($data['nomDirecteur'])) $info->setNomDirecteur($data['nomDirecteur']);
        if (isset($data['titreDirecteur'])) $info->setTitreDirecteur($data['titreDirecteur']);
        if (isset($data['photoDirecteur'])) $info->setPhotoDirecteur($data['photoDirecteur']);
        if (isset($data['imageCover'])) $info->setImageCover($data['imageCover']);
        if (isset($data['histoire'])) $info->setHistoire($data['histoire']);
        if (isset($data['valeurs'])) $info->setValeurs($data['valeurs']);
        if (isset($data['adresse'])) $info->setAdresse($data['adresse']);
        if (isset($data['telephone'])) $info->setTelephone($data['telephone']);
        if (isset($data['email'])) $info->setEmail($data['email']);
        if (isset($data['horaires'])) $info->setHoraires($data['horaires']);
        if (isset($data['chiffresCles']) && is_array($data['chiffresCles'])) {
            $info->setChiffresCles($data['chiffresCles']);
        }

        $this->em->flush();

        $this->historiqueService->log(
            $this->getUser(),
            'Modification',
            'Departement',
            $info->getId(),
            'Mise à jour des informations et visuels du Département'
        );

        return $this->json([
            'success' => true,
            'id' => $info->getId(),
            'message' => 'Informations du département mises à jour avec succès',
        ]);
    }

    // --- UPLOAD FILES ---
    #[Route('/upload', name: 'api_admin_upload', methods: ['POST'])]
    public function uploadFile(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'No file provided'], 400);
        }

        // Only allow certain image extensions
        $extension = $file->getClientOriginalExtension();
        if (!$extension) {
            $extension = $file->guessExtension();
        }
        
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!$extension || !in_array(strtolower($extension), $allowedExtensions)) {
            return $this->json(['error' => 'Type de fichier non valide : ' . $extension], 400);
        }

        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = uniqid() . '.' . $extension;
        $file->move($uploadDir, $filename);

        $url = $request->getSchemeAndHttpHost() . '/uploads/' . $filename;
        
        return $this->json(['url' => $url]);
    }
}
