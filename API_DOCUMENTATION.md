# TLS Contact API Documentation

This document provides details about the TLS Contact API endpoints used by the booking bot.

## Base URL

```
https://visas-be.tlscontact.com
```

## Endpoints

### 1. Check Available Slots

**Endpoint:** `/services/customerservice/api/tls/appointment/dz/dzALG2be/table`

**Method:** GET

**Query Parameters:**
- `client`: Client identifier (e.g., 'be' for Belgium)
- `formGroupId`: Form group ID from the appointment URL
- `appointmentType`: Type of appointment (e.g., 'Loisirs', 'Affaires', 'Famille', 'Etudes')
- `appointmentStage`: Stage of appointment (usually 'appointment')

**Example Request:**
```
GET /services/customerservice/api/tls/appointment/dz/dzALG2be/table?client=be&formGroupId=1645832&appointmentType=Loisirs&appointmentStage=appointment
```

**Response:**
```json
{
  "2025-01-15": {
    "09:00": 2,
    "10:30": 1,
    "14:00": 0
  },
  "2025-01-16": {
    "09:00": 0,
    "11:00": 3
  }
}
```

The numbers represent available slots for each date and time.

---

### 2. Reserve a Slot

**Endpoint:** `/services/customerservice/api/tls/appointment/reserve`

**Method:** POST

**Headers:**
```
Content-Type: application/json
Cookie: [session cookies]
```

**Body:**
```json
{
  "formGroupId": "1645832",
  "date": "2025-01-15",
  "time": "09:00",
  "client": "be",
  "appointmentType": "Loisirs"
}
```

**Response:**
```json
{
  "success": true,
  "reservationId": "xxx123",
  "expiresAt": "2025-01-14T10:15:00Z"
}
```

---

### 3. Book Appointment

**Endpoint:** `/services/customerservice/api/tls/appointment/book`

**Method:** POST

**Headers:**
```
Content-Type: application/json
Cookie: [session cookies]
```

**Body:**
```json
{
  "formGroupId": "1645832",
  "date": "2025-01-15",
  "time": "09:00",
  "appointmentType": "Loisirs",
  "client": "be",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+213XXXXXXXXX",
  "passportNumber": "XXXXXXXXX",
  "dateOfBirth": "1990-01-01",
  "nationality": "DZ"
}
```

**Response:**
```json
{
  "success": true,
  "confirmationNumber": "ABC123",
  "appointmentDetails": {
    "date": "2025-01-15",
    "time": "09:00",
    "location": "TLS Contact Algiers",
    "address": "..."
  }
}
```

---

### 4. Login (If Required)

**Endpoint:** `/services/customerservice/api/login`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## Session Management

The TLS Contact website uses cookies for session management. The bot automatically handles:

1. **Session Cookies**: Stored and sent with each request
2. **CSRF Tokens**: Extracted from responses and included in POST requests
3. **Cookie Expiration**: Sessions are maintained throughout the booking process

## Rate Limiting

To avoid being rate-limited:

- **Recommended check interval**: 30-60 seconds minimum
- **Respect 429 responses**: Back off if rate limited
- **User-Agent header**: Always include a valid browser User-Agent

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 200 | Success | Continue |
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Login required |
| 404 | Not Found | Check endpoint URL |
| 409 | Conflict | Slot already taken |
| 429 | Too Many Requests | Reduce check frequency |
| 500 | Server Error | Retry later |

## Best Practices

1. **Always initialize session first** by visiting the appointment page
2. **Store and reuse cookies** throughout the booking flow
3. **Handle slot reservation timeout** (usually 10-15 minutes)
4. **Implement retry logic** for transient failures
5. **Use exponential backoff** for rate limiting
6. **Log all API interactions** for debugging

## Common Issues

### Slot Reservation Expires

Reservations typically expire after 10-15 minutes. Complete the booking quickly after reserving.

### Concurrent Bookings

Multiple users may try to book the same slot. The first successful booking wins.

### Session Expiration

Sessions may expire after inactivity. Re-initialize if you get 401 errors.

### CAPTCHA Protection

Some endpoints may require CAPTCHA verification during high traffic. This is not handled by the bot.

## Example Flow

```
1. Initialize Session
   GET /appointment/dz/dzALG2be/1645832
   
2. Check Slots
   GET /api/tls/appointment/dz/dzALG2be/table?...
   
3. Login (if required)
   POST /api/login
   
4. Reserve Slot
   POST /api/tls/appointment/reserve
   
5. Book Appointment
   POST /api/tls/appointment/book
   
6. Confirmation
   Receive booking confirmation
```

## Testing

Use tools like `curl` or Postman to test endpoints:

```bash
# Check slots
curl "https://visas-be.tlscontact.com/services/customerservice/api/tls/appointment/dz/dzALG2be/table?client=be&formGroupId=1645832&appointmentType=Loisirs&appointmentStage=appointment"
```

---

**Note:** This documentation is based on reverse engineering and may change. Always verify endpoints and parameters for your specific use case.
