<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260825221612 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE demande_validation (id INT AUTO_INCREMENT NOT NULL, type_entite VARCHAR(255) NOT NULL, action VARCHAR(50) NOT NULL, entite_id INT DEFAULT NULL, donnees JSON NOT NULL, statut VARCHAR(50) NOT NULL, motif_refus LONGTEXT DEFAULT NULL, date_creation DATETIME NOT NULL, auteur_id INT NOT NULL, INDEX IDX_E06051CF60BB6FE6 (auteur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE demande_validation ADD CONSTRAINT FK_E06051CF60BB6FE6 FOREIGN KEY (auteur_id) REFERENCES utilisateur (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE demande_validation DROP FOREIGN KEY FK_E06051CF60BB6FE6');
        $this->addSql('DROP TABLE demande_validation');
    }
}
