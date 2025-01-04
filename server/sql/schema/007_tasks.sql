-- +goose Up
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    due_date TIMESTAMP,
    status TEXT DEFAULT 'BACKLOG' CHECK (status IN ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- +goose Down
DROP TABLE tasks;