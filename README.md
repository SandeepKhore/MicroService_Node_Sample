# MicroService Sample

A three-service Node.js system that demonstrates authentication, notification fan-out, and email delivery with MongoDB, Redis, RabbitMQ, and Docker.

## Services

| Service | Responsibilities | Ports |
| --- | --- | --- |
| `auth-service` | REST API for `/register` and `/login`, persists users in MongoDB, stores session tokens in Redis, publishes `user.registered` and `user.loggedin` events | 3001 |
| `notification-service` | Consumes user events, derives contextual notification messages, enqueues email jobs on `email.send` | 3002 |
| `email-service` | Consumes `email.send`, renders simple templates, sends email with Nodemailer | 3003 |

Shared utilities (`shared/`) provide a Winston logger and a RabbitMQ event bus wrapper with helper methods for publishing and queue consumption.

## Event Flow

```text
REST client -> auth-service -> MongoDB/Redis
                 |                         
                 +--> RabbitMQ `user.events` (user.registered/user.loggedin)
                                 |
                                 v
                      notification-service
                                 |
                                 +--> RabbitMQ queue `email.send`
                                          |
                                          v
                                   email-service -> Nodemailer/SMTP
```

## Getting Started

1. Copy `.env.example` to `.env` inside each service folder and adjust secrets (Mongo URI, Redis URL, RabbitMQ URL, SMTP credentials, etc.).
2. Install dependencies per service (optional for local development):
   ```bash
   cd auth-service && npm install
   cd ../notification-service && npm install
   cd ../email-service && npm install
   ```
3. Start everything with Docker Compose (Mongo, Redis, RabbitMQ, and the three services):
   ```bash
   docker compose up --build
   ```
4. Use the REST API exposed by `auth-service`:
   - `POST http://localhost:3001/register` ➜ `{"name":"Ada","email":"ada@example.com","password":"Secret123"}`
   - `POST http://localhost:3001/login` ➜ `{"email":"ada@example.com","password":"Secret123"}`

Both endpoints return sanitized user info, a Redis-backed session token, and a JWT. Successful requests emit RabbitMQ events that cascade through the notification and email services.

### Health Checks

Each service exposes `GET /health` for readiness probes.

## Configuration Summary

Key environment variables per service (see `.env.example` files for defaults):

- `auth-service`: `PORT`, `MONGO_URI`, `REDIS_URL`, `RABBITMQ_URL`, `JWT_SECRET`, `SESSION_TTL_SECONDS`
- `notification-service`: `PORT`, `RABBITMQ_URL`, `EMAIL_QUEUE`, `USER_EXCHANGE`, `NOTIFICATION_QUEUE`
- `email-service`: `PORT`, `RABBITMQ_URL`, `EMAIL_QUEUE`, `SMTP_*`, `FROM_EMAIL`

## Folder Structure

```
shared/                 # Logger + EventBus utilities
auth-service/
  src/
    clients/            # Mongo and Redis clients
    models/             # Mongoose models
    routes/             # Express routes
    services/           # Domain logic
notification-service/
  src/workers/          # RabbitMQ consumer -> email.jobs
email-service/
  src/workers/          # Email queue consumer
```

## Testing the Flow

1. Register a user via the auth API.
2. Observe `user.registered` on RabbitMQ and the resulting `email.send` job (RabbitMQ management UI on `http://localhost:15672`).
3. Login with the same user and confirm a `user.loggedin` driven email job.

This scaffold is ready for extension with additional events, richer templates, or further microservices.
