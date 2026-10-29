<?php

namespace App\Repository;

use App\Entity\Filiere;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Filiere>
 */
class FiliereRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Filiere::class);
    }

    /**
     * @return Filiere[]
     */
    public function findAllActive(): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.isActive = true')
            ->orderBy('f.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Filiere[]
     */
    public function findByType(string $type): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.type = :type')
            ->andWhere('f.isActive = true')
            ->setParameter('type', $type)
            ->orderBy('f.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findBySlug(string $slug): ?Filiere
    {
        return $this->findOneBy(['slug' => $slug]);
    }
}
