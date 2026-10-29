<?php

namespace App\Entity;

use App\Repository\AxeRechercheRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AxeRechercheRepository::class)]
#[ORM\Table(name: 'axe_recherche')]
class AxeRecherche
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $titre = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\ManyToOne(targetEntity: Laboratoire::class, inversedBy: 'axesRecherche')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Laboratoire $laboratoire = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): static
    {
        $this->titre = $titre;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getLaboratoire(): ?Laboratoire
    {
        return $this->laboratoire;
    }

    public function setLaboratoire(?Laboratoire $laboratoire): static
    {
        $this->laboratoire = $laboratoire;

        return $this;
    }
}
