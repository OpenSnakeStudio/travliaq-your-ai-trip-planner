-- Ajouter les villes manquantes (Pau et les grandes villes d'Angleterre, États-Unis, Allemagne)

-- France - seule Pau manque parmi les grandes villes
INSERT INTO cities (name, country, country_code) VALUES ('Pau', 'France', '🇫🇷');

-- Angleterre (et Royaume-Uni) - villes principales
INSERT INTO cities (name, country, country_code) VALUES
('London', 'United Kingdom', '🇬🇧'),
('Birmingham', 'United Kingdom', '🇬🇧'),
('Manchester', 'United Kingdom', '🇬🇧'),
('Leeds', 'United Kingdom', '🇬🇧'),
('Liverpool', 'United Kingdom', '🇬🇧'),
('Newcastle', 'United Kingdom', '🇬🇧'),
('Sheffield', 'United Kingdom', '🇬🇧'),
('Bristol', 'United Kingdom', '🇬🇧'),
('Leicester', 'United Kingdom', '🇬🇧'),
('Nottingham', 'United Kingdom', '🇬🇧'),
('Edinburgh', 'United Kingdom', '🇬🇧'),
('Glasgow', 'United Kingdom', '🇬🇧'),
('Cardiff', 'United Kingdom', '🇬🇧'),
('Belfast', 'United Kingdom', '🇬🇧');

-- États-Unis - grandes villes
INSERT INTO cities (name, country, country_code) VALUES
('New York', 'United States', '🇺🇸'),
('Los Angeles', 'United States', '🇺🇸'),
('Chicago', 'United States', '🇺🇸'),
('Houston', 'United States', '🇺🇸'),
('Phoenix', 'United States', '🇺🇸'),
('Philadelphia', 'United States', '🇺🇸'),
('San Antonio', 'United States', '🇺🇸'),
('San Diego', 'United States', '🇺🇸'),
('Dallas', 'United States', '🇺🇸'),
('San Jose', 'United States', '🇺🇸'),
('Austin', 'United States', '🇺🇸'),
('Jacksonville', 'United States', '🇺🇸'),
('San Francisco', 'United States', '🇺🇸'),
('Columbus', 'United States', '🇺🇸'),
('Indianapolis', 'United States', '🇺🇸'),
('Seattle', 'United States', '🇺🇸'),
('Denver', 'United States', '🇺🇸'),
('Washington', 'United States', '🇺🇸'),
('Boston', 'United States', '🇺🇸'),
('Las Vegas', 'United States', '🇺🇸'),
('Miami', 'United States', '🇺🇸'),
('Orlando', 'United States', '🇺🇸');

-- Allemagne - grandes villes
INSERT INTO cities (name, country, country_code) VALUES
('Berlin', 'Germany', '🇩🇪'),
('Munich', 'Germany', '🇩🇪'),
('Hamburg', 'Germany', '🇩🇪'),
('Cologne', 'Germany', '🇩🇪'),
('Frankfurt', 'Germany', '🇩🇪'),
('Stuttgart', 'Germany', '🇩🇪'),
('Düsseldorf', 'Germany', '🇩🇪'),
('Dortmund', 'Germany', '🇩🇪'),
('Essen', 'Germany', '🇩🇪'),
('Leipzig', 'Germany', '🇩🇪'),
('Bremen', 'Germany', '🇩🇪'),
('Dresden', 'Germany', '🇩🇪'),
('Hanover', 'Germany', '🇩🇪'),
('Nuremberg', 'Germany', '🇩🇪');