INSERT INTO dbo.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES
(1, N'pbkdf2_sha256$demo$1', NULL, 0, N'user1', N'User', N'One', N'user1@example.com', 0, 1, SYSDATETIME()),
(2, N'pbkdf2_sha256$demo$2', NULL, 0, N'user2', N'User', N'Two', N'user2@example.com', 0, 1, SYSDATETIME()),
(3, N'pbkdf2_sha256$demo$3', NULL, 0, N'user3', N'User', N'Three', N'user3@example.com', 0, 1, SYSDATETIME()),
(4, N'pbkdf2_sha256$demo$4', NULL, 0, N'user4', N'User', N'Four', N'user4@example.com', 0, 1, SYSDATETIME()),
(5, N'pbkdf2_sha256$1000000$6YbGWWj2aKLZ25SSeGaNMC$TWXMeSH2bxvtWaPNUObWAYGpCJjo0lMBx33jT7LeD58=', NULL, 1, N'admin1', N'Admin', N'One', N'admin1@example.com', 1, 1, SYSDATETIME());
SET IDENTITY_INSERT dbo.auth_user OFF;

-- Profils
SET IDENTITY_INSERT dbo.users_userprofile ON;
INSERT INTO dbo.users_userprofile (id, user_id, role) VALUES
(1, 1, N'LECTEUR'),
(2, 2, N'LECTEUR'),
(3, 3, N'LECTEUR'),
(4, 4, N'BIBLIOTHECAIRE'),
(5, 5, N'ADMIN');
SET IDENTITY_INSERT dbo.users_userprofile OFF;

-- Adhérents
SET IDENTITY_INSERT dbo.adherents_adherent ON;
INSERT INTO dbo.adherents_adherent (id, user_id, adresse, telephone, date_inscription, cotisation) VALUES
(1, 1, N'Adresse 1', N'620000001', '2025-01-01', 0.00),
(2, 2, N'Adresse 2', N'620000002', '2025-01-02', 1000.00),
(3, 3, N'Adresse 3', N'620000003', '2025-01-03', 500.00),
(4, 4, N'Adresse 4', N'620000004', '2025-01-04', 0.00),
(5, 5, N'Adresse 5', N'620000005', '2025-01-05', 0.00);
SET IDENTITY_INSERT dbo.adherents_adherent OFF;

-- Ouvrages
SET IDENTITY_INSERT dbo.ouvrages_ouvrage ON;
INSERT INTO dbo.ouvrages_ouvrage (id, isbn, titre, auteur, editeur, annee, categorie, type_ressource, disponible, image, description_courte) VALUES
(1, N'9780000000001', N'Ouvrage 1', N'Auteur 1', N'Editeur 1', 2020, N'Roman', N'LIVRE', 1, NULL, N'Description 1'),
(2, N'9780000000002', N'Ouvrage 2', N'Auteur 2', N'Editeur 2', 2019, N'Histoire', N'LIVRE', 1, NULL, N'Description 2'),
(3, N'9780000000003', N'Ouvrage 3', N'Auteur 3', N'Editeur 3', 2021, N'Culture', N'DVD', 1, NULL, N'Description 3'),
(4, N'9780000000004', N'Ouvrage 4', N'Auteur 4', N'Editeur 4', 2018, N'Science', N'RESSOURCE_NUMERIQUE', 1, NULL, N'Description 4'),
(5, N'9780000000005', N'Ouvrage 5', N'Auteur 5', N'Editeur 5', 2022, N'Art', N'LIVRE', 1, NULL, N'Description 5');
SET IDENTITY_INSERT dbo.ouvrages_ouvrage OFF;

-- Exemplaires
SET IDENTITY_INSERT dbo.exemplaires_exemplaire ON;
INSERT INTO dbo.exemplaires_exemplaire (id, ouvrage_id, code_barre, etat) VALUES
(1, 1, N'EX-1-001', N'DISPONIBLE'),
(2, 2, N'EX-2-001', N'DISPONIBLE'),
(3, 3, N'EX-3-001', N'EMPRUNTE'),
(4, 4, N'EX-4-001', N'DISPONIBLE'),
(5, 5, N'EX-5-001', N'DISPONIBLE');
SET IDENTITY_INSERT dbo.exemplaires_exemplaire OFF;

-- Emprunts
SET IDENTITY_INSERT dbo.emprunts_emprunt ON;
INSERT INTO dbo.emprunts_emprunt (id, exemplaire_id, adherent_id, date_emprunt, date_retour_prevue, date_retour_effective, statut) VALUES
(1, 1, 1, '2025-02-01', '2025-02-15', NULL, N'EN_COURS'),
(2, 2, 2, '2025-02-02', '2025-02-16', '2025-02-10', N'RETOURNE'),
(3, 3, 3, '2025-02-03', '2025-02-17', NULL, N'EN_COURS'),
(4, 4, 4, '2025-02-04', '2025-02-18', '2025-02-18', N'RETOURNE'),
(5, 5, 5, '2025-02-05', '2025-02-19', NULL, N'EN_COURS');
SET IDENTITY_INSERT dbo.emprunts_emprunt OFF;

-- Pénalités
SET IDENTITY_INSERT dbo.emprunts_penalite ON;
INSERT INTO dbo.emprunts_penalite (id, emprunt_id, jours_retard, montant, payee, date_creation) VALUES
(1, 1, 2, 2000.00, 0, '2025-02-20'),
(2, 2, 1, 1000.00, 1, '2025-02-11'),
(3, 3, 3, 3000.00, 0, '2025-02-21'),
(4, 4, 0, 0.00, 1, '2025-02-18'),
(5, 5, 1, 1000.00, 0, '2025-02-22');
SET IDENTITY_INSERT dbo.emprunts_penalite OFF;

-- Réservations
SET IDENTITY_INSERT dbo.emprunts_reservation ON;
INSERT INTO dbo.emprunts_reservation (id, adherent_id, ouvrage_id, date_debut, date_fin, statut, montant_estime, date_creation, date_traitement) VALUES
(1, 1, 1, '2025-03-01', '2025-03-02', N'EN_ATTENTE', 1000.00, SYSDATETIME(), NULL),
(2, 2, 2, '2025-03-02', '2025-03-03', N'VALIDEE', 1000.00, SYSDATETIME(), SYSDATETIME()),
(3, 3, 3, '2025-03-03', '2025-03-04', N'REFUSEE', 1000.00, SYSDATETIME(), SYSDATETIME()),
(4, 4, 4, '2025-03-04', '2025-03-05', N'ANNULEE', 1000.00, SYSDATETIME(), SYSDATETIME()),
(5, 5, 5, '2025-03-05', '2025-03-06', N'EXPIREE', 1000.00, SYSDATETIME(), SYSDATETIME());
SET IDENTITY_INSERT dbo.emprunts_reservation OFF;

-- Paramètres système
SET IDENTITY_INSERT dbo.core_parametre ON;
INSERT INTO dbo.core_parametre (id, tarif_penalite_par_jour, tarif_reservation_par_jour, duree_emprunt_jours, quota_emprunts_actifs, updated_at) VALUES
(1, 1000.00, 1000.00, 14, 3, SYSDATETIME()),
(2, 1500.00, 1200.00, 10, 2, SYSDATETIME()),
(3, 900.00, 800.00, 21, 5, SYSDATETIME()),
(4, 2000.00, 1500.00, 7, 1, SYSDATETIME()),
(5, 1100.00, 900.00, 30, 4, SYSDATETIME());
SET IDENTITY_INSERT dbo.core_parametre OFF;

-- Journal d'activité
SET IDENTITY_INSERT dbo.core_activity ON;
INSERT INTO dbo.core_activity (id, type, message, user_id, created_at) VALUES
(1, N'USER_CREATED', N'Utilisateur cree: user1', 1, SYSDATETIME()),
(2, N'OUVRAGE_AJOUTE', N'Ouvrage ajoute: Ouvrage 1', 5, SYSDATETIME()),
(3, N'EXEMPLAIRE_AJOUTE', N'Exemplaire ajoute: EX-1-001', 5, SYSDATETIME()),
(4, N'EMPRUNT_CREE', N'Emprunt cree pour EX-1-001', 4, SYSDATETIME()),
(5, N'RETOUR_ENREGISTRE', N'Retour enregistre pour emprunt #2', 4, SYSDATETIME());
SET IDENTITY_INSERT dbo.core_activity OFF;

-- Paiements
SET IDENTITY_INSERT dbo.core_paiement ON;
INSERT INTO dbo.core_paiement (id, user_id, type, reference_objet, montant, statut, date_paiement) VALUES
(1, 1, N'RESERVATION', 1, 1000.00, N'INITIE', NULL),
(2, 2, N'RESERVATION', 2, 1000.00, N'PAYE', SYSDATETIME()),
(3, 3, N'PENALITE', 3, 3000.00, N'INITIE', NULL),
(4, 4, N'EBOOK', 1, 2000.00, N'PAYE', SYSDATETIME()),
(5, 5, N'PENALITE', 5, 1000.00, N'ANNULE', SYSDATETIME());
SET IDENTITY_INSERT dbo.core_paiement OFF;

-- Messages
SET IDENTITY_INSERT dbo.core_message ON;
INSERT INTO dbo.core_message (id, sender_id, recipient_id, contenu, created_at) VALUES
(1, 5, 1, N'Bienvenue user1', SYSDATETIME()),
(2, 5, 2, N'Bienvenue user2', SYSDATETIME()),
(3, 4, 3, N'Votre réservation a été traitée.', SYSDATETIME()),
(4, 4, 4, N'Rappel retour emprunt.', SYSDATETIME()),
(5, 1, 5, N'Merci.', SYSDATETIME());
SET IDENTITY_INSERT dbo.core_message OFF;