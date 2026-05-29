# MariaDB Test Stack

Local MariaDB for testing.

## Stack

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| mariadb | `mariadb:11` | `3306` | Database |

## Credentials

| Field | Value |
|-------|-------|
| Host | `127.0.0.1` (or `mariadb` from inside container) |
| Port | `3306` |
| Database | `testdb` |
| User | `testuser` |
| Password | `testpass` |
| Root password | `rootpass` |

> Override via env vars in `docker-compose.yml`. Do **not** use these in production.

## Start / Stop

```bash
# Start (detached)
docker compose up -d

# Status
docker compose ps

# Logs
docker compose logs -f mariadb

# Stop (keep data)
docker compose stop

# Stop + remove containers (keep volume)
docker compose down

# Stop + wipe data
docker compose down -v
```

## Connect

### 1. mysql CLI (host)

```bash
mysql -h 127.0.0.1 -P 3306 -u testuser -ptestpass testdb
```

Root:
```bash
mysql -h 127.0.0.1 -P 3306 -u root -prootpass
```

### 2. mysql CLI (inside container)

```bash
docker compose exec mariadb mariadb -u testuser -ptestpass testdb
```

## Health

```bash
docker compose ps         # STATUS column shows "healthy"
docker inspect --format='{{.State.Health.Status}}' mariadb-test
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3306 in use | Change host port: `"3307:3306"` |
| Cannot connect from host | Wait for `healthy` status |
| Forgot password | `docker compose down -v` (wipes data) |
