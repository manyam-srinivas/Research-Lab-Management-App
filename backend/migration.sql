-- ============================================================
-- RLMS Database Migration
-- Run these statements against your existing MySQL database
-- AFTER deploying the updated backend code.
-- ============================================================

-- 1) Link budgets to projects (faculty requirement: project-level finance)
ALTER TABLE budgets
  ADD COLUMN project_id INT NULL AFTER department_id;

ALTER TABLE budgets
  ADD CONSTRAINT fk_budgets_project
  FOREIGN KEY (project_id) REFERENCES projects(id);

-- Allow budgets to exist without a department (project-level budgets)
ALTER TABLE budgets
  MODIFY COLUMN department_id INT NULL;

-- 1b) Direct department link on projects (project budgets are validated
--     against the department's available budget)
ALTER TABLE projects
  ADD COLUMN department_id INT NULL AFTER research_group_id;

ALTER TABLE projects
  ADD CONSTRAINT fk_projects_department
  FOREIGN KEY (department_id) REFERENCES departments(id);

-- 2) Link expenses to projects
ALTER TABLE expenses
  ADD COLUMN project_id INT NULL AFTER budget_id;

ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_project
  FOREIGN KEY (project_id) REFERENCES projects(id);

-- 3) Link procurement requests to projects
ALTER TABLE procurement_requests
  ADD COLUMN project_id INT NULL AFTER requested_by;

ALTER TABLE procurement_requests
  ADD CONSTRAINT fk_procurement_project
  FOREIGN KEY (project_id) REFERENCES projects(id);

-- 4) Email verification columns on users
ALTER TABLE users
  ADD COLUMN email_verification_token VARCHAR(255) NULL AFTER email_verified;

ALTER TABLE users
  ADD COLUMN email_verified_at DATETIME NULL AFTER email_verification_token;

-- ============================================================
-- NOTE: If you are setting up a fresh database (no existing data),
-- simply delete the database and let the app recreate it with
-- db.create_all(), or run this migration before first use.
-- ============================================================
