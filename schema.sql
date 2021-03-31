DROP TABLE IF EXISTS locationTable;
CREATE TABLE locationTable (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(255),
    location  VARCHAR(255),
    latitude  int,
    longitude int
)
