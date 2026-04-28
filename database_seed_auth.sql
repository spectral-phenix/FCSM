DROP DATABASE IF EXISTS FCSM;
CREATE DATABASE FCSM CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE FCSM;

CREATE TABLE etudiant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(80) NOT NULL,
  prenom VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  groupe ENUM('GB1','GB2','LK1','LK2') NOT NULL
);

CREATE TABLE lieu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  adresse VARCHAR(255),
  ville VARCHAR(100) NOT NULL,
  type ENUM('etude','loisir','courses','domicile') NOT NULL,
  code_postal VARCHAR(10),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7)
);

CREATE TABLE domicile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('principale','secondaire') NOT NULL DEFAULT 'principale',
  id_etudiant INT NOT NULL,
  id_lieu INT NOT NULL,
  CONSTRAINT fk_domicile_etudiant FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE,
  CONSTRAINT fk_domicile_lieu FOREIGN KEY (id_lieu) REFERENCES lieu(id) ON DELETE CASCADE
);

CREATE TABLE vehicule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  immatriculation VARCHAR(20) NOT NULL UNIQUE,
  nb_places INT NOT NULL DEFAULT 5,
  id_etudiant INT NOT NULL,
  marque VARCHAR(80),
  modele VARCHAR(80),
  date_ct DATE,
  date_assurance DATE,
  CONSTRAINT fk_vehicule_etudiant FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE
);

CREATE TABLE horaire (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jour_semaine ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi') NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  id_etudiant INT NOT NULL,
  id_lieu INT NOT NULL,
  type ENUM('cours','loisir','courses','autre') NOT NULL DEFAULT 'cours',
  CONSTRAINT fk_horaire_etudiant FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE,
  CONSTRAINT fk_horaire_lieu FOREIGN KEY (id_lieu) REFERENCES lieu(id) ON DELETE CASCADE
);

CREATE TABLE trajet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date_trajet DATE NOT NULL,
  heure_depart TIME NOT NULL,
  heure_arrivee_estimee TIME,
  type ENUM('aller','retour','aller-retour') NOT NULL DEFAULT 'aller',
  statut ENUM('ouvert','complet','annule') NOT NULL DEFAULT 'ouvert',
  estPlein boolean NOT NULL DEFAULT 0,
  id_createur INT NOT NULL,
  id_lieu_depart INT NOT NULL,
  id_lieu_arrivee INT NOT NULL,
  id_vehicule INT,
  participation VARCHAR(80),
  remarques TEXT,
  CONSTRAINT fk_trajet_createur FOREIGN KEY (id_createur) REFERENCES etudiant(id) ON DELETE CASCADE,
  CONSTRAINT fk_trajet_depart FOREIGN KEY (id_lieu_depart) REFERENCES lieu(id),
  CONSTRAINT fk_trajet_arrivee FOREIGN KEY (id_lieu_arrivee) REFERENCES lieu(id),
  CONSTRAINT fk_trajet_vehicule FOREIGN KEY (id_vehicule) REFERENCES vehicule(id) ON DELETE SET NULL
);

CREATE TABLE membre_equipage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_trajet INT NOT NULL,
  id_etudiant INT NOT NULL,
  role ENUM('conducteur','passager') NOT NULL DEFAULT 'passager',
  statut ENUM('accepte','quitte') NOT NULL DEFAULT 'accepte',
  CONSTRAINT fk_membre_trajet FOREIGN KEY (id_trajet) REFERENCES trajet(id) ON DELETE CASCADE,
  CONSTRAINT fk_membre_etudiant FOREIGN KEY (id_etudiant) REFERENCES etudiant(id) ON DELETE CASCADE,
  UNIQUE KEY uq_membre_trajet_etudiant (id_trajet, id_etudiant)
);

INSERT INTO etudiant (id, nom, prenom, email, password, groupe) VALUES
(1, 'Martin', 'Lucas', 'lucas.martin@ufc', 'butrt', 'GB1'),
(2, 'Bernard', 'Emma', 'emma.bernard@ufc', 'butrt', 'GB1'),
(3, 'Petit', 'Hugo', 'hugo.petit@ufc', 'butrt', 'GB2'),
(4, 'Robert', 'Ines', 'ines.robert@ufc', 'butrt', 'GB2'),
(5, 'Richard', 'Nathan', 'nathan.richard@ufc', 'butrt', 'LK1'),
(6, 'Durand', 'Lea', 'lea.durand@ufc', 'butrt', 'LK1'),
(7, 'Moreau', 'Tom', 'tom.moreau@ufc', 'butrt', 'LK2'),
(8, 'Simon', 'Chloe', 'chloe.simon@ufc', 'butrt', 'LK2');

INSERT INTO lieu (id, nom, adresse, ville, type, code_postal, latitude, longitude) VALUES
(1, 'Département R&T Montbéliard', '4 place Tharradin', 'Montbéliard', 'etude', '25200', 47.5100000, 6.8010000),
(2, 'Stade Auguste Bonal - FCSM', 'Impasse de la Forge', 'Montbéliard', 'loisir', '25200', 47.5125000, 6.8115000),
(3, 'E.Leclerc Montbéliard', 'Rue Jacques Foillet', 'Montbéliard', 'courses', '25200', 47.5182000, 6.7934000),
(4, 'Carrefour Audincourt', 'Rue de Seloncourt', 'Audincourt', 'courses', '25400', 47.4828000, 6.8421000),
(5, 'Domicile Lucas Martin', '12 rue des Lilas', 'Montbéliard', 'domicile', '25200', 47.5068000, 6.7924000),
(6, 'Domicile Emma Bernard', '8 rue des Prés', 'Montbéliard', 'domicile', '25200', 47.5075000, 6.7950000),
(7, 'Domicile Hugo Petit', '3 avenue du Général Leclerc', 'Sochaux', 'domicile', '25600', 47.5148000, 6.8272000),
(8, 'Domicile Ines Robert', '22 rue de Belfort', 'Bethoncourt', 'domicile', '25200', 47.5355000, 6.8040000),
(9, 'Domicile Nathan Richard', '5 rue du Jura', 'Audincourt', 'domicile', '25400', 47.4837000, 6.8398000),
(10, 'Domicile Lea Durand', '14 rue Pasteur', 'Valentigney', 'domicile', '25700', 47.4634000, 6.8311000),
(11, 'Domicile Tom Moreau', '19 rue Victor Hugo', 'Exincourt', 'domicile', '25400', 47.4954000, 6.8333000),
(12, 'Domicile Chloe Simon', '7 rue de la Paix', 'Montbéliard', 'domicile', '25200', 47.5122000, 6.7968000);


INSERT INTO domicile (type, id_etudiant, id_lieu) VALUES
('principale', 1, 5), ('principale', 2, 6), ('principale', 3, 7), ('principale', 4, 8),
('principale', 5, 9), ('principale', 6, 10), ('principale', 7, 11), ('principale', 8, 12);

INSERT INTO vehicule (id, immatriculation, nb_places, id_etudiant, marque, modele, date_ct, date_assurance) VALUES
(1, 'AA-123-AA', 4, 1, 'Renault', 'Clio', '2026-06-15', '2026-01-10'),
(2, 'BB-456-BB', 5, 3, 'Peugeot', '208', '2026-03-20', '2026-02-05'),
(3, 'CC-789-CC', 4, 5, 'Toyota', 'Yaris', '2026-08-01', '2026-04-12'),
(4, 'DD-321-DD', 5, 7, 'Citroën', 'C3', '2026-05-30', '2026-03-22');

INSERT INTO horaire (jour_semaine, heure_debut, heure_fin, id_etudiant, id_lieu, type) VALUES
('lundi', '08:00:00', '17:00:00', 1, 1, 'cours'),
('mardi', '09:00:00', '16:00:00', 1, 1, 'cours'),
('mercredi', '08:00:00', '12:00:00', 1, 1, 'cours'),
('lundi', '08:05:00', '17:00:00', 2, 1, 'cours'),
('mardi', '09:00:00', '16:15:00', 2, 1, 'cours'),
('mercredi', '08:00:00', '12:00:00', 2, 1, 'cours'),
('lundi', '08:10:00', '17:15:00', 3, 1, 'cours'),
('mardi', '10:00:00', '16:00:00', 3, 1, 'cours'),
('jeudi', '08:00:00', '15:00:00', 3, 1, 'cours'),
('lundi', '08:00:00', '16:45:00', 4, 1, 'cours'),
('vendredi', '09:00:00', '17:00:00', 4, 1, 'cours'),
('mardi', '09:05:00', '16:00:00', 5, 1, 'cours'),
('jeudi', '08:00:00', '15:00:00', 5, 1, 'cours'),
('mardi', '09:00:00', '16:00:00', 6, 1, 'cours'),
('vendredi', '09:00:00', '17:00:00', 6, 1, 'cours'),
('mercredi', '08:00:00', '12:00:00', 7, 1, 'cours'),
('jeudi', '08:00:00', '15:00:00', 7, 1, 'cours'),
('lundi', '08:00:00', '17:00:00', 8, 1, 'cours'),
('vendredi', '09:15:00', '17:00:00', 8, 1, 'cours');

INSERT INTO trajet (id, date_trajet, heure_depart, heure_arrivee_estimee, type, statut, estPlein, id_createur, id_lieu_depart, id_lieu_arrivee, id_vehicule, participation, remarques) VALUES
(1, '2026-05-04', '07:30:00', '07:50:00', 'aller', 'ouvert', 0, 1, 5, 1, 1, '1€', 'Départ proche centre-ville.'),
(2, '2026-05-04', '17:15:00', '17:35:00', 'retour', 'ouvert', 0, 1, 1, 5, 1, '1€', 'Retour après les cours.'),
(3, '2026-05-05', '08:20:00', '08:50:00', 'aller', 'ouvert', 0, 3, 7, 1, 2, 'Libre', 'Possibilité de passer par Montbéliard.'),
(4, '2026-05-05', '17:30:00', '17:50:00', 'retour', 'ouvert', 0, 5, 1, 9, 3, '2€', 'Retour vers Audincourt.'),
(5, '2026-05-06', '18:30:00', '18:45:00', 'aller', 'ouvert', 0, 7, 1, 2, 4, 'Gratuit', 'Trajet vers le FCSM.'),
(6, '2026-05-07', '12:30:00', '12:45:00', 'aller', 'ouvert', 0, 3, 1, 3, 2, 'Gratuit', 'Passage courses après les cours.');

INSERT INTO membre_equipage (id_trajet, id_etudiant, role, statut) VALUES
(1, 1, 'conducteur', 'accepte'),
(1, 2, 'passager', 'accepte'),
(2, 1, 'conducteur', 'accepte'),
(3, 3, 'conducteur', 'accepte'),
(3, 4, 'passager', 'accepte'),
(4, 5, 'conducteur', 'accepte'),
(5, 7, 'conducteur', 'accepte'),
(6, 3, 'conducteur', 'accepte');
