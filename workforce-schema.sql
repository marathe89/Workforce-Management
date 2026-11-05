-- Workforce Intelligence Portal Database Schema

-- Users table with role-based access
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'manager', 'hr_admin', 'executive')),
  department VARCHAR(255),
  manager_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee profiles with key workforce metrics
CREATE TABLE employee_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title VARCHAR(255),
  employment_status VARCHAR(50) CHECK (employment_status IN ('active', 'on_leave', 'contract', 'departed')),
  hire_date DATE,
  performance_rating DECIMAL(3, 2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
  utilization_rate DECIMAL(5, 2) CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
  last_review_date DATE,
  risk_flag VARCHAR(50) CHECK (risk_flag IN ('low', 'medium', 'high', 'none')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills inventory
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  skill_name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee skills with proficiency levels
CREATE TABLE employee_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  last_used_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_id)
);

-- Projects with resource requirements
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('planning', 'active', 'on_hold', 'completed')),
  start_date DATE,
  end_date DATE,
  required_headcount INTEGER,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project skill requirements
CREATE TABLE project_skill_requirements (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  required_proficiency VARCHAR(50),
  headcount_needed INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project assignments
CREATE TABLE project_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  allocation_percentage DECIMAL(5, 2) CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  start_date DATE,
  end_date DATE,
  assignment_status VARCHAR(50) CHECK (assignment_status IN ('proposed', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id)
);

-- Performance reviews
CREATE TABLE performance_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  review_date DATE NOT NULL,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  comments TEXT,
  skill_gaps TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Headcount planning forecasts
CREATE TABLE headcount_forecasts (
  id SERIAL PRIMARY KEY,
  department VARCHAR(255),
  forecast_month DATE,
  planned_hires INTEGER,
  planned_departures INTEGER,
  projected_total INTEGER,
  confidence_level DECIMAL(3, 2),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for sensitive operations
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id INTEGER,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_employee_profiles_user ON employee_profiles(user_id);
CREATE INDEX idx_employee_profiles_status ON employee_profiles(employment_status);
CREATE INDEX idx_employee_profiles_risk ON employee_profiles(risk_flag);
CREATE INDEX idx_employee_skills_user ON employee_skills(user_id);
CREATE INDEX idx_employee_skills_skill ON employee_skills(skill_id);
CREATE INDEX idx_project_assignments_user ON project_assignments(user_id);
CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_performance_reviews_user ON performance_reviews(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
