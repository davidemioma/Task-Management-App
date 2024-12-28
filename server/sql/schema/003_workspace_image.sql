-- +goose Up
ALTER TABLE workspaces ADD COLUMN image_url TEXT;

-- +goose Down
ALTER TABLE workspaces DROP COLUMN image_url;