<?php

namespace App\Repository;

use App\Entity\AxeRecherche;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AxeRecherche>
 */
class AxeRechercheRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AxeRecherche::class);
    }

    /**
     * @return AxeRecherche[]
     */
    public function findByLaboratoire(int $laboratoireId): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.laboratoire = :laboratoireId')
            ->setParameter('laboratoireId', $laboratoireId)
            ->orderBy('a.titre', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
