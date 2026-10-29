<?php

namespace App\Service;

use App\Entity\Actualite;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;

class ActualiteWorkflowService
{
    public function __construct(
        private EntityManagerInterface $em,
        private HistoriqueService $historiqueService
    ) {
    }

    public function valider(Actualite $actualite, Utilisateur $utilisateur): void
    {
        $actualite->setStatut('Publiee');
        $actualite->setMotifRefus(null);
        $this->em->flush();

        $this->historiqueService->log(
            $utilisateur,
            'Validation',
            'Actualite',
            $actualite->getId(),
            json_encode(['titre' => $actualite->getTitre(), 'nouveau_statut' => 'Publiee'])
        );
    }

    public function refuser(Actualite $actualite, Utilisateur $utilisateur, string $motifRefus): void
    {
        $actualite->setStatut('Refusee');
        $actualite->setMotifRefus($motifRefus);
        $this->em->flush();

        $this->historiqueService->log(
            $utilisateur,
            'Refus',
            'Actualite',
            $actualite->getId(),
            json_encode(['titre' => $actualite->getTitre(), 'nouveau_statut' => 'Refusee', 'motif' => $motifRefus])
        );
    }
}
