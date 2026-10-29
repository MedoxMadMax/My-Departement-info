<?php

namespace App\Entity;

use App\Repository\EnseignantRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EnseignantRepository::class)]
class Enseignant extends Utilisateur
{
    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $prenom = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $photo = null;

    #[ORM\Column(length: 100)]
    private ?string $grade = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $specialite = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $bureau = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $cvUrl = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $biographie = null;

    /** @var Collection<int, Filiere> */
    #[ORM\ManyToMany(targetEntity: Filiere::class, inversedBy: 'enseignants')]
    #[ORM\JoinTable(name: 'enseignant_filiere')]
    private Collection $filieres;

    /** @var Collection<int, Laboratoire> */
    #[ORM\ManyToMany(targetEntity: Laboratoire::class, inversedBy: 'enseignants')]
    #[ORM\JoinTable(name: 'enseignant_laboratoire')]
    private Collection $laboratoires;

    public function __construct()
    {
        parent::__construct();
        $this->filieres = new ArrayCollection();
        $this->laboratoires = new ArrayCollection();
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

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): static
    {
        $this->photo = $photo;

        return $this;
    }

    public function getGrade(): ?string
    {
        return $this->grade;
    }

    public function setGrade(string $grade): static
    {
        $this->grade = $grade;

        return $this;
    }

    public function getSpecialite(): ?string
    {
        return $this->specialite;
    }

    public function setSpecialite(?string $specialite): static
    {
        $this->specialite = $specialite;

        return $this;
    }

    public function getBureau(): ?string
    {
        return $this->bureau;
    }

    public function setBureau(?string $bureau): static
    {
        $this->bureau = $bureau;

        return $this;
    }

    /**
     * @return Collection<int, Filiere>
     */
    public function getFilieres(): Collection
    {
        return $this->filieres;
    }

    public function addFiliere(Filiere $filiere): static
    {
        if (!$this->filieres->contains($filiere)) {
            $this->filieres->add($filiere);
        }

        return $this;
    }

    public function removeFiliere(Filiere $filiere): static
    {
        $this->filieres->removeElement($filiere);

        return $this;
    }

    /**
     * @return Collection<int, Laboratoire>
     */
    public function getLaboratoires(): Collection
    {
        return $this->laboratoires;
    }

    public function addLaboratoire(Laboratoire $laboratoire): static
    {
        if (!$this->laboratoires->contains($laboratoire)) {
            $this->laboratoires->add($laboratoire);
        }

        return $this;
    }

    public function removeLaboratoire(Laboratoire $laboratoire): static
    {
        $this->laboratoires->removeElement($laboratoire);

        return $this;
    }

    public function getCvUrl(): ?string
    {
        return $this->cvUrl;
    }

    public function setCvUrl(?string $cvUrl): static
    {
        $this->cvUrl = $cvUrl;

        return $this;
    }

    public function getBiographie(): ?string
    {
        return $this->biographie;
    }

    public function setBiographie(?string $biographie): static
    {
        $this->biographie = $biographie;

        return $this;
    }
}
