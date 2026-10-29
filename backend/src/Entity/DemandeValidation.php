<?php

namespace App\Entity;

use App\Repository\DemandeValidationRepository;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeValidationRepository::class)]
class DemandeValidation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $typeEntite = null;

    #[ORM\Column(length: 50)]
    private ?string $action = null;

    #[ORM\Column(nullable: true)]
    private ?int $entiteId = null;

    #[ORM\Column(type: 'json')]
    private array $donnees = [];

    #[ORM\Column(length: 50)]
    private ?string $statut = 'En_Attente';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $motifRefus = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $dateCreation = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $auteur = null;

    public function __construct()
    {
        $this->dateCreation = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTypeEntite(): ?string
    {
        return $this->typeEntite;
    }

    public function setTypeEntite(string $typeEntite): static
    {
        $this->typeEntite = $typeEntite;
        return $this;
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

    public function getEntiteId(): ?int
    {
        return $this->entiteId;
    }

    public function setEntiteId(?int $entiteId): static
    {
        $this->entiteId = $entiteId;
        return $this;
    }

    public function getDonnees(): array
    {
        return $this->donnees;
    }

    public function setDonnees(array $donnees): static
    {
        $this->donnees = $donnees;
        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getMotifRefus(): ?string
    {
        return $this->motifRefus;
    }

    public function setMotifRefus(?string $motifRefus): static
    {
        $this->motifRefus = $motifRefus;
        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeInterface $dateCreation): static
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }

    public function getAuteur(): ?Utilisateur
    {
        return $this->auteur;
    }

    public function setAuteur(?Utilisateur $auteur): static
    {
        $this->auteur = $auteur;
        return $this;
    }
}
