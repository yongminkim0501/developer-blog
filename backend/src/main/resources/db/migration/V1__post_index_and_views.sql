CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE post_index (
    slug varchar(160) PRIMARY KEY,
    title varchar(240) NOT NULL,
    description text NOT NULL,
    category varchar(100) NOT NULL,
    tags jsonb NOT NULL,
    published_date date NOT NULL,
    series varchar(160),
    project varchar(160),
    week integer,
    source_collection varchar(16) NOT NULL,
    content_hash varchar(64) NOT NULL,
    search_text text NOT NULL,
    published boolean NOT NULL,
    indexed_at timestamptz NOT NULL
);
CREATE INDEX post_index_published_date ON post_index (published, published_date DESC);
CREATE INDEX post_index_search ON post_index USING gin (search_text gin_trgm_ops);
CREATE TABLE post_daily_views (
    slug varchar(160) NOT NULL REFERENCES post_index(slug),
    viewed_on date NOT NULL,
    views bigint NOT NULL CHECK (views >= 0),
    PRIMARY KEY (slug, viewed_on)
);
CREATE TABLE post_visits (
    slug varchar(160) NOT NULL REFERENCES post_index(slug),
    visitor_hash varchar(64) NOT NULL,
    viewed_on date NOT NULL,
    PRIMARY KEY (slug, visitor_hash, viewed_on)
);
CREATE INDEX post_visits_expiry ON post_visits (viewed_on);
CREATE INDEX daily_views_date ON post_daily_views (viewed_on);
