<?php

namespace App\Service;

use App\Entity\DemandeValidation;
use App\Entity\Laboratoire;
use App\Entity\Actualite;
use Symfony\Component\String\Slugger\AsciiSlugger;
use App\Entity\Enseignant;
use App\Entity\Filiere;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ValidationExecutionService
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function executeDemande(DemandeValidation $demande): void
    {
        $type = $demande->getTypeEntite();
        $action = $demande->getAction();
        $donnees = $demande->getDonnees();
        $entiteId = $demande->getEntiteId();

        switch ($type) {
            case 'Actualite':
                $this->executeActualite($action, $donnees, $entiteId, $demande->getAuteur());
                break;
            case 'Laboratoire':
                $this->executeLaboratoire($action, $donnees, $entiteId);
                break;
            case 'Filiere':
                $this->executeFiliere($action, $donnees, $entiteId);
                break;
            case 'Enseignant':
                $this->executeEnseignant($action, $donnees, $entiteId);
                break;
            case 'Utilisateur':
                $this->executeUtilisateur($action, $donnees, $entiteId);
                break;
            case 'Departement':
                $this->executeDepartement($action, $donnees, $entiteId);
                break;
            default:
                throw new \Exception("Type d'entité inconnu: " . $type);
        }
    }

        private function executeActualite(string $action, array $donnees, ?int $id, Utilisateur $auteur): void
    {
        if ($action === 'DELETE' && $id) {
            $act = $this->em->getRepository(Actualite::class)->find($id);
            if ($act) {
                $this->em->remove($act);
                $this->em->flush();
            }
            return;
        }

        $act = ($action === 'UPDATE' && $id) 
            ? $this->em->getRepository(Actualite::class)->find($id) 
            : new Actualite();
            
        if (!$act) throw new \Exception("Actualite non trouvée");

        $slugger = new AsciiSlugger();

        if (isset($donnees['titre'])) {
            $act->setTitre($donnees['titre']);
            $act->setSlug(strtolower($slugger->slug($donnees['titre'])->toString() . '-' . uniqid()));
        }
        if (isset($donnees['contenu'])) $act->setContenu($donnees['contenu']);
        if (isset($donnees['type'])) $act->setType($donnees['type']);
        if (isset($donnees['dateEvenement']) && $donnees['dateEvenement']) {
            $act->setDateEvenement(new \DateTime($donnees['dateEvenement']));
        }
        if (isset($donnees['imageCoverUrl'])) $act->setImageCoverUrl($donnees['imageCoverUrl']);
        if (isset($donnees['statut'])) $act->setStatut($donnees['statut']);
        
        if ($action === 'CREATE') {
            $act->setAuteur($auteur);
            $this->em->persist($act);
        }
        $this->em->flush();
    }

    private function executeLaboratoire(string $action, array $donnees, ?int $id): void
    {
        if ($action === 'DELETE' && $id) {
            $lab = $this->em->getRepository(Laboratoire::class)->find($id);
            if ($lab) {
                $this->em->remove($lab);
                $this->em->flush();
            }
            return;
        }

        $lab = ($action === 'UPDATE' && $id) 
            ? $this->em->getRepository(Laboratoire::class)->find($id) 
            : new Laboratoire();
            
        if (!$lab) throw new \Exception("Laboratoire non trouvé");

        if (isset($donnees['nom'])) $lab->setNom($donnees['nom']);
        if (isset($donnees['description'])) $lab->setDescription($donnees['description']);
        
        if ($action === 'CREATE') $this->em->persist($lab);
        $this->em->flush();
    }

    private function executeFiliere(string $action, array $donnees, ?int $id): void
    {
        if ($action === 'DELETE' && $id) {
            $fil = $this->em->getRepository(Filiere::class)->find($id);
            if ($fil) {
                $this->em->remove($fil);
                $this->em->flush();
            }
            return;
        }

        $fil = ($action === 'UPDATE' && $id) 
            ? $this->em->getRepository(Filiere::class)->find($id) 
            : new Filiere();
            
        if (!$fil) throw new \Exception("Filiere non trouvée");

        $slugger = new AsciiSlugger();

        if (isset($donnees['nom'])) {
            $fil->setNom($donnees['nom']);
            if ($action === 'CREATE') {
                $fil->setSlug(strtolower($slugger->slug($donnees['nom'])->toString() . '-' . uniqid()));
            }
        }
        if (isset($donnees['description'])) $fil->setDescription($donnees['description']);
        if (isset($donnees['type'])) $fil->setType($donnees['type']);
        if (isset($donnees['objectifs'])) $fil->setObjectifs($donnees['objectifs']);
        if (isset($donnees['isActive'])) $fil->setIsActive($donnees['isActive']);
        if (isset($donnees['lienProgramme'])) $fil->setLienProgramme($donnees['lienProgramme']);
        if (isset($donnees['duree'])) $fil->setDuree((int) $donnees['duree']);
        
        if ($action === 'CREATE') $this->em->persist($fil);
        $this->em->flush();
    }

    private function executeEnseignant(string $action, array $donnees, ?int $id): void
    {
        if ($action === 'DELETE' && $id) {
            $ens = $this->em->getRepository(Enseignant::class)->find($id);
            if ($ens) {
                $this->em->remove($ens);
                $this->em->flush();
            }
            return;
        }

        $ens = ($action === 'UPDATE' && $id) 
            ? $this->em->getRepository(Enseignant::class)->find($id) 
            : new Enseignant();
            
        if (!$ens) throw new \Exception("Enseignant non trouvé");

        if (isset($donnees['nom'])) $ens->setNom($donnees['nom']);
        if (isset($donnees['prenom'])) $ens->setPrenom($donnees['prenom']);
        if (isset($donnees['email'])) $ens->setEmail($donnees['email']);
        if (isset($donnees['grade'])) $ens->setGrade($donnees['grade']);
        if (isset($donnees['specialite'])) $ens->setSpecialite($donnees['specialite']);
        if (isset($donnees['bureau'])) $ens->setBureau($donnees['bureau']);
        if (isset($donnees['telephone'])) $ens->setTelephone($donnees['telephone']);
        if (isset($donnees['photo'])) $ens->setPhoto($donnees['photo']);
        if (isset($donnees['photoUrl'])) $ens->setPhoto($donnees['photoUrl']);
        if (isset($donnees['cvUrl'])) $ens->setCvUrl($donnees['cvUrl']);
        if (isset($donnees['biographie'])) $ens->setBiographie($donnees['biographie']);
        if (!empty($donnees['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($ens, $donnees['password']);
            $ens->setPassword($hashedPassword);
        }

        // Attach / update Laboratoire(s)
        if (isset($donnees['laboratoireIds']) && is_array($donnees['laboratoireIds'])) {
            foreach ($ens->getLaboratoires() as $lab) {
                $ens->removeLaboratoire($lab);
            }
            foreach ($donnees['laboratoireIds'] as $labId) {
                $lab = $this->em->getRepository(Laboratoire::class)->find($labId);
                if ($lab) $ens->addLaboratoire($lab);
            }
        } elseif (isset($donnees['laboratoireId'])) {
            foreach ($ens->getLaboratoires() as $lab) {
                $ens->removeLaboratoire($lab);
            }
            if (!empty($donnees['laboratoireId'])) {
                $lab = $this->em->getRepository(Laboratoire::class)->find($donnees['laboratoireId']);
                if ($lab) $ens->addLaboratoire($lab);
            }
        }
        
        if ($action === 'CREATE') {
            $ens->setRoles(['ROLE_PROF']);
            $ens->setIsActive(true);
            $this->em->persist($ens);
        }
        $this->em->flush();
    }

    private function executeUtilisateur(string $action, array $donnees, ?int $id): void
    {
        if ($action === 'DELETE' && $id) {
            $u = $this->em->getRepository(Utilisateur::class)->find($id);
            if ($u) {
                $this->em->remove($u);
                $this->em->flush();
            }
            return;
        }

        $u = ($action === 'UPDATE' && $id) 
            ? $this->em->getRepository(Utilisateur::class)->find($id) 
            : new Utilisateur();
            
        if (!$u) throw new \Exception("Utilisateur non trouvé");

        if (isset($donnees['email'])) $u->setEmail($donnees['email']);
        if (isset($donnees['roles'])) $u->setRoles($donnees['roles']);
        if (isset($donnees['isActive'])) $u->setIsActive($donnees['isActive']);
        
        if (!empty($donnees['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($u, $donnees['password']);
            $u->setPassword($hashedPassword);
        }
        
        if ($action === 'CREATE') {
            $u->setDateCreation(new \DateTime());
            $this->em->persist($u);
        }
        $this->em->flush();
    }

    private function executeDepartement(string $action, array $donnees, ?int $id): void
    {
        $info = $this->em->getRepository(\App\Entity\DepartementInfo::class)->findOneBy([]);
        if (!$info) {
            $info = new \App\Entity\DepartementInfo();
            $this->em->persist($info);
        }

        if (isset($donnees['titre'])) $info->setTitre($donnees['titre']);
        if (isset($donnees['sousTitre'])) $info->setSousTitre($donnees['sousTitre']);
        if (isset($donnees['motDirecteur'])) $info->setMotDirecteur($donnees['motDirecteur']);
        if (isset($donnees['nomDirecteur'])) $info->setNomDirecteur($donnees['nomDirecteur']);
        if (isset($donnees['titreDirecteur'])) $info->setTitreDirecteur($donnees['titreDirecteur']);
        if (isset($donnees['photoDirecteur'])) $info->setPhotoDirecteur($donnees['photoDirecteur']);
        if (isset($donnees['imageCover'])) $info->setImageCover($donnees['imageCover']);
        if (isset($donnees['histoire'])) $info->setHistoire($donnees['histoire']);
        if (isset($donnees['valeurs'])) $info->setValeurs($donnees['valeurs']);
        if (isset($donnees['adresse'])) $info->setAdresse($donnees['adresse']);
        if (isset($donnees['telephone'])) $info->setTelephone($donnees['telephone']);
        if (isset($donnees['email'])) $info->setEmail($donnees['email']);
        if (isset($donnees['horaires'])) $info->setHoraires($donnees['horaires']);
        if (isset($donnees['chiffresCles']) && is_array($donnees['chiffresCles'])) {
            $info->setChiffresCles($donnees['chiffresCles']);
        }

        $this->em->flush();
    }
}
