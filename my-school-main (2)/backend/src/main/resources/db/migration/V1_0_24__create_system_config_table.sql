CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

-- Insert default value for class capacity
INSERT INTO system_config (config_key, config_value, description, updated_by)
VALUES ('DEFAULT_CLASS_CAPACITY', '30', 'Capacité par défaut des classes créées automatiquement', 'SYSTEM');
