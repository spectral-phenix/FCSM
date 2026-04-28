-- Base de données FCSM Covoiturage
CREATE DATABASE IF NOT EXISTS FCSM CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE FCSM;

-- Table lieu
CREATE TABLE IF NOT EXISTS lieu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    ville VARCHAR(100),
    type VARCHAR(50) COMMENT 'domicile, universite, loisir, courses',
    code_postal VARCHAR(10),
    longitude DECIMAL(11,8),
    latitude DECIMAL(10,8)
);

-- Table etudiant
CREATE TABLE IF NOT EXISTS etudiant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    groupe VARCHAR(20) COMMENT 'ex: Groupe A, Groupe B'
);

-- Table domicile
CREATE TABLE IF NOT EXISTS domicile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('principale','secondaire') DEFAULT 'principale',
    id_etudiant INT NOT NULL,
    id_lieu INT NOT NULL,
    FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE,
    FOREIGN KEY (id_lieu) REFERENCES lieu(id) ON DELETE CASCADE
);

-- Table vehicule
CREATE TABLE IF NOT EXISTS vehicule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    immatriculation VARCHAR(20) UNIQUE NOT NULL,
    nb_places INT NOT NULL DEFAULT 5,
    id_etudiant INT NOT NULL,
    marque VARCHAR(100),
    modele VARCHAR(100),
    date_ct DATE COMMENT 'Date validité contrôle technique',
    date_assurance DATE COMMENT 'Date échéance assurance',
    FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE
);

-- Table horaire
CREATE TABLE IF NOT EXISTS horaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jour_semaine ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi') NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    id_etudiant INT NOT NULL,
    id_lieu INT NOT NULL,
    type VARCHAR(50) COMMENT 'travail, loisir, courses',
    FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE,
    FOREIGN KEY (id_lieu) REFERENCES lieu(id) ON DELETE CASCADE
);

-- Table trajet
CREATE TABLE IF NOT EXISTS trajet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_trajet DATE NOT NULL,
    heure_depart TIME NOT NULL,
    heure_arrivee_estimee TIME,
    type ENUM('aller','retour','aller-retour') DEFAULT 'aller',
    estPlein boolean DEFAULT 0,
    id_createur INT NOT NULL,
    id_lieu_depart INT NOT NULL,
    id_lieu_arrivee INT NOT NULL,
    id_vehicule INT,
    participation VARCHAR(100) COMMENT 'ex: 1€/trajet ou libre',
    remarques TEXT,
    FOREIGN KEY (id_createur) REFERENCES etudiant(id) ON DELETE CASCADE,
    FOREIGN KEY (id_lieu_depart) REFERENCES lieu(id),
    FOREIGN KEY (id_lieu_arrivee) REFERENCES lieu(id),
    FOREIGN KEY (id_vehicule) REFERENCES vehicule(id) ON DELETE SET NULL
);

-- Table membre_equipage
CREATE TABLE IF NOT EXISTS membre_equipage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trajet INT NOT NULL,
    id_etudiant INT NOT NULL,
    role ENUM('conducteur','passager') DEFAULT 'passager',
    valide_aller TINYINT(1) DEFAULT 0,
    valide_retour TINYINT(1) DEFAULT 0,
    FOREIGN KEY (id_trajet) REFERENCES trajet(id) ON DELETE CASCADE,
    FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membre (id_trajet, id_etudiant)
);

-- Données de base : lieux fixes
INSERT INTO lieu (nom, adresse, ville, type, code_postal, longitude, latitude) VALUES
('Dpt R&T Montbéliard', 'Rue Engel-Gros', 'Montbéliard', 'universite', '25200', 6.79826000, 47.50558000),
('Stade Bonal (FCSM)', 'Route de Besançon', 'Montbéliard', 'loisir', '25200', 6.79590000, 47.49600000);

-- Étudiant statique (Lucas Martin) — mot de passe: "password" en clair pour test
INSERT INTO etudiant (nom, prenom, email, password, groupe) VALUES
('Martin', 'Lucas', 'lucas.martin@univ-fcomte.fr', 'password', 'Groupe A');
