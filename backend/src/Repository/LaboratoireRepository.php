<?php

namespace App\Repository;

use App\Entity\Laboratoire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Laboratoire>
 */
class LaboratoireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Laboratoire::class);
    }

    /**
     * @return Laboratoire[]
     */
    public function findAllWithAxes(): array
    {
        return $this->createQueryBuilder('l')
            ->leftJoin('l.axesRecherche', 'a')
            ->addSelect('a')
            ->orderBy('l.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
