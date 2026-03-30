# IO Card Platform

Monorepo con dos servicios NestJS:

- `card-issuer`: API principal para recibir y orquestar solicitudes.
- `card-processor`: servicio separado para procesamiento posterior del flujo.

## Requisitos

- Node.js 20.x LTS recomendado
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

Nota:
Con `kafkajs@2.2.4` pueden aparecer warnings ruidosos al iniciar usando Node 24.x. Para desarrollo local de este reto se recomienda usar Node 20 LTS.

### 3. Levantar PostgreSQL y Kafka

```bash
docker compose up -d
```

Verifica el estado si hace falta:

```bash
docker compose ps
docker compose logs -f postgres
docker compose logs -f kafka
```

Es recomendable esperar a que Kafka termine de iniciar antes de levantar las aplicaciones.

### 4. Correr las migraciones y levantar ambas aplicaciones

Correr las migraciones

```bash
npm run migration:run
```

Para que el flujo completo funcione, deben estar arriba al mismo tiempo:

- PostgreSQL y Kafka con `docker compose`
- `card-issuer`
- `card-processor`

Levantar ambas aplicaciones en desarrollo

```bash
npm run start:dev
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

### 6. Probar el API de issue card

Ejemplo para crear una solicitud de emisión de tarjeta en `card-issuer`:

```bash
curl --request POST 'http://localhost:3000/api/cards/issue' \
  --header 'Content-Type: application/json' \
  --header 'Idempotency-Key: 8d6a6e3d-4b9d-4c2c-9d66-1f0d7f6b8c10' \
  --data '{
    "customer": {
      "documentType": "DNI",
      "documentNumber": "12345678",
      "fullName": "Juan Perez",
      "age": 29,
      "email": "juan.perez@example.com"
    },
    "product": {
      "type": "VISA",
      "currency": "PEN"
    },
    "forceError": false
  }'
```

Respuesta esperada:

```json
{
  "requestId": "2c1d2f4b-7f7c-4b97-b0d3-c5f4e9c8f1a2",
  "status": "pending"
}
```

## Comandos Útiles

```bash
# ambas apps en desarrollo
npm run start:dev

# ambas apps en runtime local
npm run start

# ambas apps desde dist
npm run start:prod

# solo issuer
npm run start:issuer
npm run start:issuer:dev
npm run start:issuer:debug
npm run start:issuer:prod

# solo processor
npm run start:processor
npm run start:processor:dev
npm run start:processor:prod

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
Kafka también se levanta desde el mismo [`docker-compose.yml`](/Users/stanlycalle/Desktop/io-card-issuer/docker-compose.yml).

Comandos frecuentes:

```bash
docker compose up -d
docker compose logs -f postgres
docker compose logs -f kafka
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

## Interpretaciones Aplicadas

Para esta implementación se asumió que un cliente solo puede tener una solicitud de tarjeta por documento, independientemente del estado final de esa solicitud. Eso significa que, si una solicitud previa quedó en `rejected`, una nueva petición con el mismo documento y una `idempotencyKey` distinta también será rechazada.

La `idempotencyKey` se usa únicamente para devolver la misma respuesta cuando el cliente reintenta exactamente la misma operación. Si la intención es iniciar una solicitud nueva, debe cambiar la `idempotencyKey`; aun así, con la interpretación aplicada en este reto, el documento sigue siendo único dentro del sistema.
