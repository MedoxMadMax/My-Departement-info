<?php

namespace App\Controller;

use App\Entity\DepartementInfo;
use App\Repository\ActualiteRepository;
use App\Repository\EnseignantRepository;
use App\Repository\FiliereRepository;
use App\Repository\LaboratoireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/public')]
class PublicController extends AbstractController
{
    public function __construct(
        private FiliereRepository $filiereRepository,
        private EnseignantRepository $enseignantRepository,
        private LaboratoireRepository $laboratoireRepository,
        private ActualiteRepository $actualiteRepository,
        private EntityManagerInterface $em
    ) {
    }

    #[Route('/departement', name: 'api_public_departement_info', methods: ['GET'])]
    public function getDepartementInfo(): JsonResponse
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

    #[Route('/filieres', name: 'api_public_filieres_list', methods: ['GET'])]
    public function listFilieres(): JsonResponse
    {
        $filieres = $this->filiereRepository->findAllActive();
        $result = [];

        foreach ($filieres as $filiere) {
            $enseignantsList = [];
            foreach ($filiere->getEnseignants() as $ens) {
                if ($ens->getIsActive()) {
                    $enseignantsList[] = [
                        'id' => $ens->getId(),
                        'nom' => $ens->getNom(),
                        'prenom' => $ens->getPrenom(),
                        'grade' => $ens->getGrade(),
                    ];
                }
            }

            $result[] = [
                'id' => $filiere->getId(),
                'nom' => $filiere->getNom(),
                'slug' => $filiere->getSlug(),
                'type' => $filiere->getType(),
                'description' => $filiere->getDescription(),
                'objectifs' => $filiere->getObjectifs(),
                'isActive' => $filiere->getIsActive(),
                'enseignants' => $enseignantsList,
                'lienProgramme' => $filiere->getLienProgramme(),
                'duree' => $filiere->getDuree(),
            ];
        }

        return $this->json($result);
    }

    #[Route('/filieres/{slug}', name: 'api_public_filieres_show', methods: ['GET'])]
    public function showFiliere(string $slug): JsonResponse
    {
        $filiere = $this->filiereRepository->findBySlug($slug);

        if (!$filiere || !$filiere->getIsActive()) {
            return $this->json(['error' => 'Filiere not found'], 404);
        }

        $enseignantsList = [];
        foreach ($filiere->getEnseignants() as $ens) {
            if ($ens->getIsActive()) {
                $enseignantsList[] = [
                    'id' => $ens->getId(),
                    'nom' => $ens->getNom(),
                    'prenom' => $ens->getPrenom(),
                    'grade' => $ens->getGrade(),
                ];
            }
        }

        return $this->json([
            'id' => $filiere->getId(),
            'nom' => $filiere->getNom(),
            'slug' => $filiere->getSlug(),
            'type' => $filiere->getType(),
            'description' => $filiere->getDescription(),
            'objectifs' => $filiere->getObjectifs(),
            'isActive' => $filiere->getIsActive(),
            'enseignants' => $enseignantsList,
            'lienProgramme' => $filiere->getLienProgramme(),
            'duree' => $filiere->getDuree(),
        ]);
    }

    #[Route('/enseignants', name: 'api_public_enseignants_list', methods: ['GET'])]
    public function listEnseignants(): JsonResponse
    {
        $enseignants = $this->enseignantRepository->findAllActive();
        $result = [];

        foreach ($enseignants as $ens) {
            $filieres = [];
            foreach ($ens->getFilieres() as $f) {
                if ($f->getIsActive()) {
                    $filieres[] = [
                        'id' => $f->getId(),
                        'nom' => $f->getNom(),
                    ];
                }
            }

            $laboratoires = [];
            foreach ($ens->getLaboratoires() as $lab) {
                $laboratoires[] = [
                    'id' => $lab->getId(),
                    'nom' => $lab->getNom(),
                    'acronyme' => $lab->getAcronyme(),
                ];
            }

            $result[] = [
                'id' => $ens->getId(),
                'nom' => $ens->getNom(),
                'prenom' => $ens->getPrenom(),
                'email' => $ens->getEmail(),
                'telephone' => $ens->getTelephone(),
                'photo' => $ens->getPhoto(),
                'grade' => $ens->getGrade(),
                'specialite' => $ens->getSpecialite(),
                'bureau' => $ens->getBureau(),
                'cvUrl' => $ens->getCvUrl(),
                'biographie' => $ens->getBiographie(),
                'filieres' => $filieres,
                'laboratoires' => $laboratoires,
            ];
        }

        return $this->json($result);
    }

    #[Route('/enseignants/{id}', name: 'api_public_enseignants_show', methods: ['GET'])]
    public function showEnseignant(int $id): JsonResponse
    {
        $ens = $this->enseignantRepository->find($id);

        if (!$ens || !$ens->getIsActive()) {
            return $this->json(['error' => 'Enseignant non trouvé'], 404);
        }

        $filieres = [];
        foreach ($ens->getFilieres() as $f) {
            if ($f->getIsActive()) {
                $filieres[] = [
                    'id' => $f->getId(),
                    'nom' => $f->getNom(),
                    'type' => $f->getType(),
                ];
            }
        }

        $laboratoires = [];
        foreach ($ens->getLaboratoires() as $lab) {
            $axes = [];
            foreach ($lab->getAxesRecherche() as $axe) {
                $axes[] = $axe->getTitre();
            }
            $laboratoires[] = [
                'id' => $lab->getId(),
                'nom' => $lab->getNom(),
                'acronyme' => $lab->getAcronyme(),
                'description' => $lab->getDescription(),
                'axes' => $axes,
            ];
        }

        return $this->json([
            'id' => $ens->getId(),
            'nom' => $ens->getNom(),
            'prenom' => $ens->getPrenom(),
            'email' => $ens->getEmail(),
            'telephone' => $ens->getTelephone(),
            'photo' => $ens->getPhoto(),
            'grade' => $ens->getGrade(),
            'specialite' => $ens->getSpecialite(),
            'bureau' => $ens->getBureau(),
            'cvUrl' => $ens->getCvUrl(),
            'biographie' => $ens->getBiographie(),
            'filieres' => $filieres,
            'laboratoires' => $laboratoires,
        ]);
    }

    #[Route('/laboratoires', name: 'api_public_laboratoires_list', methods: ['GET'])]
    public function listLaboratoires(): JsonResponse
    {
        $laboratoires = $this->laboratoireRepository->findAllWithAxes();
        $result = [];

        foreach ($laboratoires as $lab) {
            $axes = [];
            foreach ($lab->getAxesRecherche() as $axe) {
                $axes[] = [
                    'id' => $axe->getId(),
                    'titre' => $axe->getTitre(),
                    'description' => $axe->getDescription(),
                ];
            }

            $enseignants = [];
            foreach ($lab->getEnseignants() as $ens) {
                if ($ens->getIsActive()) {
                    $enseignants[] = [
                        'id' => $ens->getId(),
                        'nom' => $ens->getNom(),
                        'prenom' => $ens->getPrenom(),
                    ];
                }
            }

            $result[] = [
                'id' => $lab->getId(),
                'nom' => $lab->getNom(),
                'acronyme' => $lab->getAcronyme(),
                'description' => $lab->getDescription(),
                'axesRecherche' => $axes,
                'enseignants' => $enseignants,
            ];
        }

        return $this->json($result);
    }

    #[Route('/actualites', name: 'api_public_actualites_list', methods: ['GET'])]
    public function listActualites(Request $request): JsonResponse
    {
        $keyword = $request->query->get('keyword');
        $year = $request->query->get('year');
        $yearInt = $year ? (int) $year : null;
        $type = $request->query->get('type');

        $actualites = $this->actualiteRepository->findPublished($keyword, $yearInt, $type);
        $result = [];

        foreach ($actualites as $act) {
            $auteur = $act->getAuteur();
            $result[] = [
                'id' => $act->getId(),
                'titre' => $act->getTitre(),
                'slug' => $act->getSlug(),
                'contenu' => $act->getContenu(),
                'type' => $act->getType(),
                'dateEvenement' => $act->getDateEvenement() ? $act->getDateEvenement()->format('Y-m-d H:i:s') : null,
                'imageCoverUrl' => $act->getImageCoverUrl(),
                'dateCreation' => $act->getDateCreation()->format('Y-m-d H:i:s'),
                'auteur' => $auteur ? [
                    'id' => $auteur->getId(),
                    'email' => $auteur->getEmail(),
                ] : null,
            ];
        }

        return $this->json($result);
    }

    #[Route('/actualites/{slug}', name: 'api_public_actualites_show', methods: ['GET'])]
    public function showActualite(string $slug): JsonResponse
    {
        $act = $this->actualiteRepository->findBySlugPublished($slug);

        if (!$act) {
            return $this->json(['error' => 'Actualite not found'], 404);
        }

        $auteur = $act->getAuteur();
        return $this->json([
            'id' => $act->getId(),
            'titre' => $act->getTitre(),
            'slug' => $act->getSlug(),
            'contenu' => $act->getContenu(),
            'type' => $act->getType(),
            'dateEvenement' => $act->getDateEvenement() ? $act->getDateEvenement()->format('Y-m-d H:i:s') : null,
            'imageCoverUrl' => $act->getImageCoverUrl(),
            'dateCreation' => $act->getDateCreation()->format('Y-m-d H:i:s'),
            'auteur' => $auteur ? [
                'id' => $auteur->getId(),
                'email' => $auteur->getEmail(),
            ] : null,
        ]);
    }
}
