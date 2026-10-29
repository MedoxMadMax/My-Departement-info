<?php

namespace App\Entity;

use App\Repository\HistoriqueActionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HistoriqueActionRepository::class)]
#[ORM\Table(name: 'historique_action')]
#[ORM\HasLifecycleCallbacks]
class HistoriqueAction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $action = null;

    #[ORM\Column(length: 100)]
    private ?string $entiteConcernee = null;

    #[ORM\Column(nullable: true)]
    private ?int $idEntite = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $detailsChangement = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $dateAction = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class, inversedBy: 'historiques')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $utilisateur = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;

        return $this;
    }

    public function getEntiteConcernee(): ?string
    {
        return $this->entiteConcernee;
    }

    public function setEntiteConcernee(string $entiteConcernee): static
    {
        $this->entiteConcernee = $entiteConcernee;

        return $this;
    }

    public function getIdEntite(): ?int
    {
        return $this->idEntite;
    }

    public function setIdEntite(int $idEntite): static
    {
        $this->idEntite = $idEntite;

        return $this;
    }

    public function getDetailsChangement(): ?string
    {
        return $this->detailsChangement;
    }

    public function setDetailsChangement(?string $detailsChangement): static
    {
        $this->detailsChangement = $detailsChangement;

        return $this;
    }

    public function getDateAction(): ?\DateTimeInterface
    {
        return $this->dateAction;
    }

    public function setDateAction(\DateTimeInterface $dateAction): static
    {
        $this->dateAction = $dateAction;

        return $this;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }

    #[ORM\PrePersist]
    public function setDateActionValue(): void
    {
        if ($this->dateAction === null) {
            $this->dateAction = new \DateTime();
        }
    }
}
