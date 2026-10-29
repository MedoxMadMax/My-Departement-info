<?php

namespace App\Repository;

use App\Entity\Actualite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Actualite>
 */
class ActualiteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Actualite::class);
    }

    /**
     * @return Actualite[]
     */
    public function findPublished(?string $keyword = null, ?int $year = null, ?string $type = null): array
    {
        $qb = $this->createQueryBuilder('a')
            ->andWhere('a.statut = :statut')
            ->setParameter('statut', 'Publiee')
            ->orderBy('a.dateCreation', 'DESC');

        if ($keyword) {
            $qb->andWhere('a.titre LIKE :keyword OR a.contenu LIKE :keyword')
               ->setParameter('keyword', '%' . $keyword . '%');
        }

        if ($year) {
            $qb->andWhere('YEAR(a.dateCreation) = :year')
               ->setParameter('year', $year);
        }

        if ($type) {
            $qb->andWhere('a.type = :type')
               ->setParameter('type', $type);
        }

        return $qb->getQuery()->getResult();
    }

    public function findBySlugPublished(string $slug): ?Actualite
    {
        return $this->findOneBy(['slug' => $slug, 'statut' => 'Publiee']);
    }

    /**
     * @return Actualite[]
     */
    public function findByStatut(string $statut): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.statut = :statut')
            ->setParameter('statut', $statut)
            ->orderBy('a.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Actualite[]
     */
    public function findPending(): array
    {
        return $this->findByStatut('En_Attente');
    }

    /**
     * @return Actualite[]
     */
    public function findByAuteur(int $auteurId): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.auteur = :auteurId')
            ->setParameter('auteurId', $auteurId)
            ->orderBy('a.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
