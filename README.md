# IO Card Platform

Monorepo con dos servicios NestJS:

- `card-issuer`: API principal para recibir y orquestar solicitudes.
- `card-processor`: servicio separado para procesamiento posterior del flujo.

## Requisitos

- Node.js 20+
- npm 10+
- Docker
- Docker Compose

## Levantar El Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el archivo de entorno

```bash
cp .env.example .env
```

Variables principales:

- `ISSUER_PORT`: puerto de `card-issuer`. Default `3000`.
- `PROCESSOR_PORT`: puerto de `card-processor`. Default `3001`.
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: conexión a PostgreSQL.
- `DB_SYNCHRONIZE`: sincronización automática de entidades.

### 3. Levantar PostgreSQL

```bash
docker compose up -d
```

Verifica el estado si hace falta:

```bash
docker compose ps
docker compose logs -f postgres
```

### 4. Correr las migraciones y levantar ambas aplicaciones

Correr las migraciones

```bash
npm run migration:run
```

Levantar ambas aplicaciones

```bash
npm run dev
```

Esto inicia:

- `card-issuer` en `http://localhost:3000`
- `card-processor` en `http://localhost:3001`

### 5. Validar que ambos servicios estén arriba

```bash
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-03-26T00:00:00.000Z"
}
```

## Comandos Útiles

```bash
# desarrollo
npm run dev

# solo issuer
npm run start:dev

# solo processor
npm run start:processor:dev

# compilación
npm run build
npm run build:issuer
npm run build:processor

# tests
npm run test
npm run test:e2e
```

## Infraestructura Local

La base de datos se levanta con [`docker-compose.yml`](/Users/stanlycalle/Desktop/io-card-issuer/docker-compose.yml) usando PostgreSQL 16.

Comandos frecuentes:

```bash
docker compose up -d
docker compose logs -f postgres
docker compose down
```

## Estructura

```text
apps/
  card-issuer/
  card-processor/
libs/
  shared/
```

- `apps/card-issuer`: servicio HTTP principal.
- `apps/card-processor`: servicio desacoplado para procesamiento.
- `libs/shared`: configuración, health checks, base de datos y piezas reutilizables.

## Decisiones De Diseño

Se optó por separar `issuer` y `processor` desde el inicio para mantener responsabilidades claras y permitir que cada flujo evolucione sin mezclar entrada de requests, reglas de orquestación y procesamiento posterior en una sola aplicación.

El monorepo permite compartir configuración, utilidades y módulos transversales sin duplicación, manteniendo al mismo tiempo fronteras explícitas entre servicios. Esto hace más simple el desarrollo local y deja una base cómoda para crecer en módulos, contratos y automatización.

PostgreSQL con Docker Compose se eligió para que el entorno sea reproducible, fácil de levantar y suficientemente cercano a un escenario real. Además, deja el terreno listo para trabajar con restricciones, persistencia consistente e idempotencia cuando empiece a modelarse el dominio.
