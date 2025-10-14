-- Delete incorrect admin role
DELETE FROM user_roles WHERE user_id = '146b5edd-8ebe-49a1-a2f4-668ee4071dcb';

-- Insert correct admin role for Mohamed Bouchiba
INSERT INTO user_roles (user_id, role)
VALUES ('146b5edd-8ebe-49a1-a2f4-666ee4071dcb', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;