CREATE TABLE site_daily_visitors (
    visited_on date PRIMARY KEY,
    visitors bigint NOT NULL CHECK (visitors >= 0)
);
CREATE TABLE site_visits (
    visitor_hash varchar(64) NOT NULL,
    visited_on date NOT NULL,
    PRIMARY KEY (visitor_hash, visited_on)
);
CREATE INDEX site_visits_expiry ON site_visits (visited_on);
