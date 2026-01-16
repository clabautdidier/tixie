-- Create incidents table for customer incident management
CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    customer_id BIGINT NOT NULL,
    assigned_to_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incident_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_incident_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Create index for faster queries by customer
CREATE INDEX idx_incidents_customer_id ON incidents(customer_id);

-- Create index for faster queries by assigned_to
CREATE INDEX idx_incidents_assigned_to_id ON incidents(assigned_to_id);

-- Create index for faster queries by status
CREATE INDEX idx_incidents_status ON incidents(status);

-- Create composite index for customer queries with status filter
CREATE INDEX idx_incidents_customer_status ON incidents(customer_id, status);

-- Create composite index for customer queries sorted by creation date
CREATE INDEX idx_incidents_customer_created ON incidents(customer_id, created_at DESC);
