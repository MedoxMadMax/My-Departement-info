<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'departement_info')]
class DepartementInfo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $titre = 'LE DÉPARTEMENT';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $sousTitre = "À la pointe de l'innovation technologique et de l'excellence académique, le Département Informatique s'engage à former les leaders de demain.";

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $motDirecteur = '"Notre mission est de préparer nos étudiants à devenir non seulement des experts techniques de haut niveau, mais aussi des acteurs innovants conscients des enjeux scientifiques, éthiques et sociétaux liés au numérique."';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $nomDirecteur = 'Pr. Directeur du Département';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $titreDirecteur = 'Chef du Département Informatique';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $photoDirecteur = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imageCover = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $histoire = "<p>Fondé pour répondre aux défis croissants des technologies de l'information, le Département Informatique de la Faculté des Sciences d'Oujda constitue un pôle d'excellence en formation et en recherche scientifique.</p><p>De l'avènement des architectures réseaux modernes à l'ère de l'Intelligence Artificielle et du Cloud, nos programmes évoluent continuellement en synergie étroite avec les laboratoires de recherche et le tissu socio-économique.</p>";

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $valeurs = "Excellence Scientifique, Innovation Ouverte, Rigueur Académique, Responsabilité Sociétale";

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $adresse = 'Faculté des Sciences, BV Mohammed VI - BP 717, 60000 Oujda, Maroc';

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $telephone = '+212 536 50 06 01';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $email = 'informatique@fso.ump.ma';

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $horaires = 'Lundi - Vendredi : 08h30 - 18h00';

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $chiffresCles = [
        ['valeur' => '1200+', 'label' => 'Étudiants Formés'],
        ['valeur' => '45+', 'label' => 'Enseignants-Chercheurs'],
        ['valeur' => '5', 'label' => 'Filières d\'Excellence'],
        ['valeur' => '2', 'label' => 'Laboratoires de Recherche'],
    ];

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

    public function getSousTitre(): ?string
    {
        return $this->sousTitre;
    }

    public function setSousTitre(?string $sousTitre): static
    {
        $this->sousTitre = $sousTitre;
        return $this;
    }

    public function getMotDirecteur(): ?string
    {
        return $this->motDirecteur;
    }

    public function setMotDirecteur(?string $motDirecteur): static
    {
        $this->motDirecteur = $motDirecteur;
        return $this;
    }

    public function getNomDirecteur(): ?string
    {
        return $this->nomDirecteur;
    }

    public function setNomDirecteur(?string $nomDirecteur): static
    {
        $this->nomDirecteur = $nomDirecteur;
        return $this;
    }

    public function getTitreDirecteur(): ?string
    {
        return $this->titreDirecteur;
    }

    public function setTitreDirecteur(?string $titreDirecteur): static
    {
        $this->titreDirecteur = $titreDirecteur;
        return $this;
    }

    public function getPhotoDirecteur(): ?string
    {
        return $this->photoDirecteur;
    }

    public function setPhotoDirecteur(?string $photoDirecteur): static
    {
        $this->photoDirecteur = $photoDirecteur;
        return $this;
    }

    public function getImageCover(): ?string
    {
        return $this->imageCover;
    }

    public function setImageCover(?string $imageCover): static
    {
        $this->imageCover = $imageCover;
        return $this;
    }

    public function getHistoire(): ?string
    {
        return $this->histoire;
    }

    public function setHistoire(?string $histoire): static
    {
        $this->histoire = $histoire;
        return $this;
    }

    public function getValeurs(): ?string
    {
        return $this->valeurs;
    }

    public function setValeurs(?string $valeurs): static
    {
        $this->valeurs = $valeurs;
        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getHoraires(): ?string
    {
        return $this->horaires;
    }

    public function setHoraires(?string $horaires): static
    {
        $this->horaires = $horaires;
        return $this;
    }

    public function getChiffresCles(): ?array
    {
        return $this->chiffresCles;
    }

    public function setChiffresCles(?array $chiffresCles): static
    {
        $this->chiffresCles = $chiffresCles;
        return $this;
    }
}
