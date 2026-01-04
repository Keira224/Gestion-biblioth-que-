SELECT *
FROM auth_user;

-- Utilisateurs (équivalent AUTH_USER Django)
CREATE TABLE dbo.auth_user (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    password NVARCHAR(128) NOT NULL,
    last_login DATETIME2 NULL,
    is_superuser BIT NOT NULL,
    username NVARCHAR(150) NOT NULL,
    first_name NVARCHAR(150) NOT NULL,
    last_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(254) NOT NULL,
    is_staff BIT NOT NULL,
    is_active BIT NOT NULL,
    date_joined DATETIME2 NOT NULL,
    CONSTRAINT UQ_auth_user_username UNIQUE (username)
);

-- Profil utilisateur (role)
CREATE TABLE dbo.users_userprofile (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role NVARCHAR(20) NOT NULL,
    CONSTRAINT UQ_users_userprofile_user UNIQUE (user_id),
    CONSTRAINT FK_users_userprofile_user FOREIGN KEY (user_id) REFERENCES dbo.auth_user(id) ON DELETE CASCADE,
    CONSTRAINT CK_users_userprofile_role CHECK (role IN ('ADMIN','BIBLIOTHECAIRE','LECTEUR'))
);

-- Adhérents (lecteurs)
CREATE TABLE dbo.adherents_adherent (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    adresse NVARCHAR(255) NOT NULL,
    telephone NVARCHAR(20) NOT NULL,
    date_inscription DATE NOT NULL,
    cotisation DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT UQ_adherents_user UNIQUE (user_id),
    CONSTRAINT FK_adherents_user FOREIGN KEY (user_id) REFERENCES dbo.auth_user(id) ON DELETE CASCADE
);


-- Ouvrages
CREATE TABLE dbo.ouvrages_ouvrage (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    isbn NVARCHAR(20) NOT NULL,
    titre NVARCHAR(255) NOT NULL,
    auteur NVARCHAR(255) NOT NULL,
    editeur NVARCHAR(255) NULL,
    annee INT NULL,
    categorie NVARCHAR(100) NOT NULL,
    type_ressource NVARCHAR(30) NOT NULL DEFAULT 'LIVRE',
    disponible BIT NOT NULL DEFAULT 1,
    image NVARCHAR(255) NULL,
    description_courte NVARCHAR(MAX) NULL,
    CONSTRAINT UQ_ouvrages_isbn UNIQUE (isbn),
    CONSTRAINT CK_ouvrages_type CHECK (type_ressource IN ('LIVRE','DVD','RESSOURCE_NUMERIQUE'))
);

-- Demandes de livres
CREATE TABLE dbo.ouvrages_demandelivre (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    adherent_id BIGINT NOT NULL,
    titre NVARCHAR(255) NOT NULL,
    auteur NVARCHAR(255) NULL,
    isbn NVARCHAR(20) NULL,
    description NVARCHAR(MAX) NULL,
    urgence NVARCHAR(50) NULL,
    statut NVARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    ouvrage_id BIGINT NULL,
    date_creation DATETIME2 NOT NULL,
    date_traitement DATETIME2 NULL,
    CONSTRAINT FK_demandes_adherent FOREIGN KEY (adherent_id) REFERENCES dbo.adherents_adherent(id) ON DELETE CASCADE,
    CONSTRAINT FK_demandes_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES dbo.ouvrages_ouvrage(id) ON DELETE SET NULL,
    CONSTRAINT CK_demandes_statut CHECK (statut IN ('EN_ATTENTE','EN_RECHERCHE','TROUVE','INDISPONIBLE','CLOTUREE'))
);

-- Ebooks
CREATE TABLE dbo.ouvrages_ebook (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ouvrage_id BIGINT NULL,
    fichier NVARCHAR(255) NULL,
    url_fichier NVARCHAR(200) NULL,
    format NVARCHAR(10) NOT NULL,
    taille INT NULL,
    nom_fichier NVARCHAR(255) NOT NULL,
    est_payant BIT NOT NULL DEFAULT 0,
    prix DECIMAL(10,2) NULL,
    date_ajout DATETIME2 NOT NULL,
    CONSTRAINT FK_ebooks_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES dbo.ouvrages_ouvrage(id) ON DELETE SET NULL,
    CONSTRAINT CK_ebooks_format CHECK (format IN ('PDF','EPUB'))
);

-- Exemplaires physiques
CREATE TABLE dbo.exemplaires_exemplaire (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ouvrage_id BIGINT NOT NULL,
    code_barre NVARCHAR(50) NOT NULL,
    etat NVARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    CONSTRAINT UQ_exemplaires_code UNIQUE (code_barre),
    CONSTRAINT FK_exemplaires_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES dbo.ouvrages_ouvrage(id) ON DELETE CASCADE,
    CONSTRAINT CK_exemplaires_etat CHECK (etat IN ('DISPONIBLE','EMPRUNTE','PERDU','ENDOMMAGE'))
);

-- Emprunts
CREATE TABLE dbo.emprunts_emprunt (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    exemplaire_id BIGINT NOT NULL,
    adherent_id BIGINT NOT NULL,
    date_emprunt DATE NOT NULL,
    date_retour_prevue DATE NOT NULL,
    date_retour_effective DATE NULL,
    statut NVARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    CONSTRAINT FK_emprunts_exemplaire FOREIGN KEY (exemplaire_id) REFERENCES dbo.exemplaires_exemplaire(id) ON DELETE NO ACTION,
    CONSTRAINT FK_emprunts_adherent FOREIGN KEY (adherent_id) REFERENCES dbo.adherents_adherent(id) ON DELETE NO ACTION,
    CONSTRAINT CK_emprunts_statut CHECK (statut IN ('EN_COURS','RETOURNE','EN_RETARD'))
);
-- Pénalités (1 pénalité par emprunt)
CREATE TABLE dbo.emprunts_penalite (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    emprunt_id BIGINT NOT NULL,
    jours_retard INT NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    payee BIT NOT NULL DEFAULT 0,
    date_creation DATE NOT NULL,
    CONSTRAINT UQ_penalite_emprunt UNIQUE (emprunt_id),
    CONSTRAINT FK_penalite_emprunt FOREIGN KEY (emprunt_id) REFERENCES dbo.emprunts_emprunt(id) ON DELETE CASCADE
);
-- Réservations
CREATE TABLE dbo.emprunts_reservation (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    adherent_id BIGINT NOT NULL,
    ouvrage_id BIGINT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut NVARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    montant_estime DECIMAL(10,2) NOT NULL,
    date_creation DATETIME2 NOT NULL,
    date_traitement DATETIME2 NULL,
    CONSTRAINT FK_reservation_adherent FOREIGN KEY (adherent_id) REFERENCES dbo.adherents_adherent(id) ON DELETE CASCADE,
    CONSTRAINT FK_reservation_ouvrage FOREIGN KEY (ouvrage_id) REFERENCES dbo.ouvrages_ouvrage(id) ON DELETE CASCADE,
    CONSTRAINT CK_reservation_statut CHECK (statut IN ('EN_ATTENTE','VALIDEE','REFUSEE','ANNULEE','EXPIREE','REMISE'))
);
CREATE UNIQUE INDEX UX_reservation_active ON dbo.emprunts_reservation (adherent_id, ouvrage_id, date_debut, date_fin)
WHERE statut = 'EN_ATTENTE';
-- Paramètres système
CREATE TABLE dbo.core_parametre (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    tarif_penalite_par_jour DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    tarif_reservation_par_jour DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    duree_emprunt_jours INT NOT NULL DEFAULT 14,
    quota_emprunts_actifs INT NOT NULL DEFAULT 3,
    updated_at DATETIME2 NOT NULL
);
-- Journal d'activité
CREATE TABLE dbo.core_activity (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    type NVARCHAR(40) NOT NULL,
    message NVARCHAR(255) NOT NULL,
    user_id BIGINT NULL,
    created_at DATETIME2 NOT NULL,
    CONSTRAINT FK_activity_user FOREIGN KEY (user_id) REFERENCES dbo.auth_user(id) ON DELETE SET NULL,
    CONSTRAINT CK_activity_type CHECK (type IN (
        'EMPRUNT_CREE','RETOUR_ENREGISTRE','PENALITE_CREE','PENALITE_PAYEE','OUVRAGE_AJOUTE',
        'EXEMPLAIRE_AJOUTE','USER_CREATED','USER_UPDATED','USER_DISABLED','PASSWORD_RESET'
    ))
);
-- Paiements
CREATE TABLE dbo.core_paiement (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type NVARCHAR(20) NOT NULL,
    reference_objet INT NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    statut NVARCHAR(20) NOT NULL DEFAULT 'INITIE',
    date_paiement DATETIME2 NULL,
    CONSTRAINT FK_paiement_user FOREIGN KEY (user_id) REFERENCES dbo.auth_user(id) ON DELETE CASCADE,
    CONSTRAINT CK_paiement_type CHECK (type IN ('EBOOK','RESERVATION','PENALITE')),
    CONSTRAINT CK_paiement_statut CHECK (statut IN ('INITIE','PAYE','ANNULE'))
);
-- Messages
CREATE TABLE dbo.core_message (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NULL,
    contenu NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL,
    CONSTRAINT FK_message_sender FOREIGN KEY (sender_id) REFERENCES dbo.auth_user(id) ON DELETE CASCADE,
    CONSTRAINT FK_message_recipient FOREIGN KEY (recipient_id) REFERENCES dbo.auth_user(id) ON DELETE SET NULL
);


