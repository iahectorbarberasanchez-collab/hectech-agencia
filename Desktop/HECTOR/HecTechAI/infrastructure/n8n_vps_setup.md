# HecTechAi n8n Production Manifest

## docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://${N8N_HOST}/
      - GENERIC_TIMEZONE=Europe/Madrid
    volumes:
      - n8n_data:/home/node/.n8n
    # Optional: Connect a database like Postgres for higher reliability
    # environment:
    #   - DB_TYPE=postgresdb
    #   - DB_POSTGRESDB_HOST=postgres
    #   - DB_POSTGRESDB_PORT=5432
    #   - DB_POSTGRESDB_DATABASE=n8n
    #   - DB_POSTGRESDB_USER=n8n
    #   - DB_POSTGRESDB_PASSWORD=YOUR_PASSWORD

volumes:
  n8n_data:
```

```env
N8N_HOST=n8n.hectechai.com
```

## 🌐 Configuración DNS (Cloudflare)

Para que todo funcione, añade estos registros en tu panel de **Cloudflare** para `hectechai.com`:

| Tipo | Name (Host) | Content (Valor) | Proxy status | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `n8n` | `46.224.232.91` | **DNS Only** (Gris) | Acceso a tu n8n propio |
| **A** | `@` | `46.224.232.91` | **Proxied** (Naranja) | Tu Web Principal |
| **CNAME** | `www` | `hectechai.com` | **Proxied** (Naranja) | Redirección estándar |

> **Nota:** Para `n8n`, es recomendable usar "DNS Only" inicialmente para evitar conflictos con los certificados SSL automáticos que genera n8n (o configurar Cloudflare en modo "Full" SSL).

## Manual VPS Setup Commands

```bash
# 1. Update and install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Create directory
mkdir n8n && cd n8n

# 3. Create the files above (docker-compose.yml and .env)

# 4. Start n8n
sudo docker compose up -d
```
