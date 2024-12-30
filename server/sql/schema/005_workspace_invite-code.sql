-- +goose Up
ALTER TABLE workspaces ADD COLUMN invite_code VARCHAR(64) UNIQUE NOT NULL DEFAULT (
    encode(sha256(random()::text::bytea), 'hex')
);

-- +goose Down
ALTER TABLE workspaces DROP COLUMN invite_code;