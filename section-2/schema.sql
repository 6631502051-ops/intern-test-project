CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(250) NOT NULL,
  assigned_to BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'Done')),
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tasks_title_not_blank CHECK (length(btrim(title)) > 0)
);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned_status ON tasks (assigned_to, status);
-- รองรับหน้า employee: WHERE assigned_to = $1 และกรอง status
CREATE INDEX idx_tasks_project ON tasks (project_id);
-- รองรับรายการ task ของ project: WHERE project_id = $1
CREATE INDEX idx_audit_log_task_created ON audit_log (task_id, created_at DESC);
-- รองรับ audit history ของ task เรียงจากล่าสุด
