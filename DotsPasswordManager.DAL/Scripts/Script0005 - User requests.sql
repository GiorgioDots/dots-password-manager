CREATE TABLE UserRequests
(
    Id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId    UUID      NOT NULL REFERENCES Users (Id) ON DELETE CASCADE,
    RequestType      text not null,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW()
);