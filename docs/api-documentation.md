# MenuMitra API Documentation

## Base URL
```
https://men4u.xyz/v2
```

## Authentication
All API requests require authentication using a token in the header:
```http
Authorization: <token>
Content-Type: application/json
```

## Endpoints

### Outlets

#### View Outlet Details
Get detailed information about a specific outlet.

**Endpoint:** `POST /common/view_outlet`

**Request Body:**
```json
{
  "outlet_id": "string",
  "user_id": "string",
  "app_source": "admin_app"
}
```

**Success Response:**
```json
{
  "detail": "Successfully retrieved outlet details",
  "data": {
    "name": "string",
    "mobile": "string",
    "address": "string",
    "whatsapp": "string",
    "outlet_type": "string",
    "veg_nonveg": "string",
    "service_charges": "number",
    "gst": "number",
    "opening_time": "string",
    "closing_time": "string",
    "fssainumber": "string",
    "gstnumber": "string",
    "upi_id": "string",
    "waiter_count": "number",
    "chef_count": "number",
    "captain_count": "number",
    "manager_count": "number",
    "total_menu": "number",
    "total_category": "number",
    "section_count": "number",
    "orders_count": "number",
    "table_count": "number"
  }
}
```

#### Delete Outlet
Delete an outlet from the system.

**Endpoint:** `DELETE /admin/delete_outlet`

**Request Headers:**
```http
Authorization: <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "outlet_id": "string",
  "user_id": "string"
}
```

**Success Response:**
```json
{
  "detail": "Outlet deleted successfully"
}
```

**Error Response:**
```json
{
  "code": "400",
  "message": "Bad Request"
}
```

## Common Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Internal Server Error |

## Data Models

### Outlet Object

| Field | Type | Description |
|-------|------|-------------|
| name | string | Name of the outlet |
| mobile | string | Contact number |
| address | string | Physical address |
| whatsapp | string | WhatsApp contact number |
| outlet_type | string | Type of outlet |
| veg_nonveg | string | Food type category |
| service_charges | number | Service charges percentage |
| gst | number | GST percentage |
| opening_time | string | Opening hours |
| closing_time | string | Closing hours |
| fssainumber | string | FSSAI license number |
| gstnumber | string | GST registration number |
| upi_id | string | UPI payment ID |

## Notes
- All timestamps are returned in ISO 8601 format
- All monetary values are in INR
- API versioning is handled through the URL path (/v2)

---
*Last Updated: 2024*
*Version: 1.0* 