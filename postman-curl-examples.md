# Curl Examples

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin@12345"}' | jq -r '.data.accessToken')
```

```bash
curl http://localhost:8080/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl http://localhost:8080/api/reports/outstanding-balances \
  -H "Authorization: Bearer $TOKEN"
```
