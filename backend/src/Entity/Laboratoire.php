<?php

namespace App\Entity;

use App\Repository\LaboratoireRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaboratoireRepository::class)]
#[ORM\Table(name: 'laboratoire')]
class Laboratoire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    private ?string $acronyme = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    /** @var Collection<int, Enseignant> */
    #[ORM\ManyToMany(targetEntity: Enseignant::class, mappedBy: 'laboratoires')]
    private Collection $enseignants;

    /** @var Collection<int, AxeRecherche> */
    #[ORM\OneToMany(targetEntity: AxeRecherche::class, mappedBy: 'laboratoire', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $axesRecherche;

    public function __construct()
    {
        $this->enseignants = new ArrayCollection();
        $this->axesRecherche = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getAcronyme(): ?string
    {
        return $this->acronyme;
    }

    public function setAcronyme(string $acronyme): static
    {
        $this->acronyme = $acronyme;

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

    /**
     * @return Collection<int, Enseignant>
     */
    public function getEnseignants(): Collection
    {
        return $this->enseignants;
    }

    public function addEnseignant(Enseignant $enseignant): static
    {
        if (!$this->enseignants->contains($enseignant)) {
            $this->enseignants->add($enseignant);
            $enseignant->addLaboratoire($this);
        }

        return $this;
    }

    public function removeEnseignant(Enseignant $enseignant): static
    {
        if ($this->enseignants->removeElement($enseignant)) {
            $enseignant->removeLaboratoire($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, AxeRecherche>
     */
    public function getAxesRecherche(): Collection
    {
        return $this->axesRecherche;
    }

    public function addAxesRecherche(AxeRecherche $axesRecherche): static
    {
        if (!$this->axesRecherche->contains($axesRecherche)) {
            $this->axesRecherche->add($axesRecherche);
            $axesRecherche->setLaboratoire($this);
        }

        return $this;
    }

    public function removeAxesRecherche(AxeRecherche $axesRecherche): static
    {
        if ($this->axesRecherche->removeElement($axesRecherche)) {
            // set the owning side to null (unless already changed)
            if ($axesRecherche->getLaboratoire() === $this) {
                $axesRecherche->setLaboratoire(null);
            }
        }

        return $this;
    }
}
