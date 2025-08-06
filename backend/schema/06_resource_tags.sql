CREATE TABLE resource_tags (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER,
  tag VARCHAR,
  FOREIGN KEY (resource_id) REFERENCES resources (id)
); 