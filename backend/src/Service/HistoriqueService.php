<?php

namespace App\Service;

use App\Entity\HistoriqueAction;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;

class HistoriqueService
{
    public function __construct(
        private EntityManagerInterface $em
    ) {
    }

    public function log(
        Utilisateur $utilisateur,
        string $action,
        string $entiteConcernee,
        ?int $idEntite = 0,
        ?string $details = null
    ): void {
        $historique = new HistoriqueAction();
        $historique->setUtilisateur($utilisateur);
        $historique->setAction($action);
        $historique->setEntiteConcernee($entiteConcernee);
        $historique->setIdEntite($idEntite ?? 0);
        $historique->setDetailsChangement($details);

        $this->em->persist($historique);
        $this->em->flush();
    }
}
