<?php

namespace App\Repository;

use App\Entity\HistoriqueAction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<HistoriqueAction>
 */
class HistoriqueActionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, HistoriqueAction::class);
    }

    /**
     * @return HistoriqueAction[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('h')
            ->orderBy('h.dateAction', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return HistoriqueAction[]
     */
    public function findByEntite(string $entiteConcernee, int $idEntite): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.entiteConcernee = :entiteConcernee')
            ->andWhere('h.idEntite = :idEntite')
            ->setParameter('entiteConcernee', $entiteConcernee)
            ->setParameter('idEntite', $idEntite)
            ->orderBy('h.dateAction', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
