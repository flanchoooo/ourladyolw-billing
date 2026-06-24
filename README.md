    # Parish Membership, Billing and Receipting System

Spring Boot 4 backend for parish membership capture, monthly/yearly/once-off billing, payment allocation, receipt lookup, member statements, contribution summaries, reports and dashboard metrics.

## Stack

- Java 25
- Spring Boot 4.1
- Spring Web, Spring Data JPA, Spring Security
- JWT stateless authentication
- MySQL
- Flyway migrations
- Lombok
- Bean Validation
- OpenAPI/Swagger

## Run Locally

Create a MySQL database:

```sql
CREATE DATABASE parish_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set environment variables as needed:

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=parish_system
export DB_USERNAME=root
export DB_PASSWORD=password
export JWT_SECRET='change-me-change-me-change-me-change-me-change-me-change-me'
```

The API accepts browser requests from any origin. For HTTPS frontends, run the backend over HTTPS too; browsers block HTTPS pages from calling plain HTTP APIs as mixed content.

Optional backend HTTPS settings:

```bash
export SERVER_SSL_ENABLED=true
export SERVER_SSL_KEY_STORE=/absolute/path/to/backend.p12
export SERVER_SSL_KEY_STORE_PASSWORD='change-me'
export SERVER_SSL_KEY_STORE_TYPE=PKCS12
export SERVER_SSL_KEY_ALIAS=backend
```

Start the API:

```bash
mvn spring-boot:run
```

The app listens on `http://localhost:8080`. Swagger is available at:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON is available at:

```text
http://localhost:8080/v3/api-docs
```

In Swagger UI, click `Authorize` and paste the `accessToken` returned by `/api/auth/login` to call secured endpoints.

## Build and Run with Docker

Build the backend image from the project root:

```bash
docker build -t parish-system .
```

Run the container with automatic restart enabled:

```bash
docker run -d \
  --name parish-system-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=parish_system \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  -e JWT_SECRET='change-me-change-me-change-me-change-me-change-me-change-me' \
  parish-system
```

Use `host.docker.internal` when MySQL is running on your host machine. If MySQL is running in another Docker container or on another server, replace `DB_HOST` with that container name or server host.

Check the container:

```bash
docker ps
docker logs -f parish-system-api
```

Restart it manually when needed:

```bash
docker restart parish-system-api
```

Rebuild and redeploy after code changes:

```bash
docker stop parish-system-api
docker rm parish-system-api
docker build -t parish-system .
docker run -d \
  --name parish-system-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=parish_system \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  -e JWT_SECRET='change-me-change-me-change-me-change-me-change-me-change-me' \
  parish-system
```

## Seed Login

The app seeds roles, a super admin user, and the default monthly contribution item:

```json
{
  "username": "admin",
  "password": "Admin@12345"
}
```

## Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin@12345"}'
```

Use the returned token on secured endpoints:

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Sample Flow

1. Login and export the access token.
2. Create a zone.
3. Create a member in that zone.
4. Use the seeded billing item or create a new one.
5. Run billing for a month.
6. Capture payment and allocations.
7. View the receipt.
8. View the member contribution summary.

```bash
curl -X POST http://localhost:8080/api/zones \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Zone A","leaderName":"Mary Leader","leaderPhone":"+263700000000"}'

curl -X POST http://localhost:8080/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "zoneId": 1,
    "surname": "Moyo",
    "firstNames": "Tariro",
    "cell": "+263711111111",
    "emailAddress": "tariro@example.com"
  }'

curl -X POST http://localhost:8080/api/billing/run \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"billingItemId":1,"year":2026,"month":"JAN"}'

curl -X POST http://localhost:8080/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "memberId": 1,
    "amount": 5.00,
    "currency": "USD",
    "paymentMethod": "CASH",
    "paymentDate": "2026-06-13",
    "notes": "January contribution",
    "allocations": [
      {"memberBillId": 1, "amountAllocated": 5.00}
    ]
  }'

curl http://localhost:8080/api/payments/receipt/RCP-20260613-000001 \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:8080/api/members/1/contributions/2026 \
  -H "Authorization: Bearer $TOKEN"
```

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `GET /api/auth/me`
- `CRUD /api/users`
- `CRUD /api/members`
- `GET /api/members/search?keyword=`
- `GET /api/members/by-zone/{zoneId}`
- `CRUD /api/zones`
- `CRUD /api/sections`
- `CRUD /api/mass-centres`
- `CRUD /api/ministries`
- `CRUD /api/guilds`
- `POST /api/members/{memberId}/ministries/{ministryId}`
- `POST /api/members/{memberId}/guilds/{guildId}`
- `CRUD /api/billing-items`
- `POST /api/billing/run`
- `GET /api/member-bills`
- `GET /api/member-bills/outstanding`
- `POST /api/payments`
- `POST /api/payments/{paymentId}/reverse`
- `GET /api/members/{memberId}/statement`
- `GET /api/members/{memberId}/contributions/{year}`
- `GET /api/reports/*`
- `GET /api/dashboard/summary`

All normal responses use:

```json
{
  "success": true,
  "message": "Message",
  "data": {}
}
```
