CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  position INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  position INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  position INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  position INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS sync_logs (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  position INTEGER NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS calendar_events_date_idx
  ON calendar_events (json_extract(payload, '$.date'));

CREATE INDEX IF NOT EXISTS activities_date_idx
  ON activities (json_extract(payload, '$.date'));

CREATE INDEX IF NOT EXISTS meetings_date_idx
  ON meetings (json_extract(payload, '$.date'));
