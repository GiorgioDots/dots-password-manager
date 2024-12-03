CREATE TABLE Users
(
    Id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email         VARCHAR(255) NOT NULL UNIQUE,
    Username      VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash TEXT         NOT NULL,
    CreatedAt    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE RefreshTokens
(
    Id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId    UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    Token      TEXT      NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    RevokedAt TIMESTAMP
);

CREATE TABLE SavedPasswords
(
    Id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId       UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    Login         VARCHAR(255) NOT NULL,
    SecondLogin  VARCHAR(255),
    PasswordHash TEXT         NOT NULL,
    Url           TEXT,
    Notes         TEXT,
    Tags          TEXT[],
    CreatedAt    TIMESTAMP DEFAULT NOW(),
    UpdatedAt    TIMESTAMP DEFAULT NOW()
);