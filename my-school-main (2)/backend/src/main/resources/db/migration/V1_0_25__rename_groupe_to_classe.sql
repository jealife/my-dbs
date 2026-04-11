-- Renommer les classes existantes : "- Groupe " -> "- Classe "
UPDATE classes
SET name = REPLACE(name, '- Groupe ', '- Classe ')
WHERE name LIKE '%- Groupe %';
