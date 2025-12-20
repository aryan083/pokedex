# PokéDex API Documentation

## Base URL

```
http://localhost:3000/api
```

## Pokémon Endpoints

### GET `/pokemon`

Search and filter Pokémon with pagination support.

#### Query Parameters

| Parameter    | Type   | Description                          | Example        |
|--------------|--------|--------------------------------------|----------------|
| page         | number | Page number (default: 1)             | 1              |
| limit        | number | Items per page (default: 20)         | 10             |
| search       | string | Search term (name, type, or semantic)| pikachu, fast  |
| type         | string | Filter by Pokémon type               | fire           |
| generation   | number | Filter by generation                 | 1              |
| minHp        | number | Minimum HP                           | 80             |
| minAttack    | number | Minimum Attack                       | 100            |
| minDefense   | number | Minimum Defense                      | 70             |
| minSpeed     | number | Minimum Speed                        | 90             |
| sortBy       | string | Field to sort by                     | attack         |
| sortOrder    | string | Sort order (ASC or DESC)             | DESC           |

#### Semantic Search Terms

- `fast`: Speed > 100
- `tank`: HP + Defense > 200
- `glass`: Attack > 100 AND Defense < 70

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "pokemonId": 25,
      "name": "pikachu",
      "generation": 1,
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "speed": 90,
      "types": ["electric"],
      "searchText": "pikachu electric",
      "createdAt": "2025-12-20T10:00:00.000Z",
      "updatedAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 151,
    "totalPages": 8
  }
}
```

#### Examples

```bash
# Get first 10 Pokémon
GET /pokemon?page=1&limit=10

# Search for Fire-type Pokémon
GET /pokemon?type=fire

# Find fast Pokémon (speed > 100)
GET /pokemon?search=fast

# Find Glass Cannon Pokémon (high attack, low defense)
GET /pokemon?search=glass

# Find Tank Pokémon (high HP + Defense)
GET /pokemon?search=tank

# Sort by attack in descending order
GET /pokemon?sortBy=attack&sortOrder=DESC
```

### POST `/pokemon/compare`

Compare 2-3 Pokémon by name or ID.

#### Request Body

```json
{
  "pokemon": ["pikachu", "charizard"]
}
```

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "pokemonId": 25,
      "name": "pikachu",
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "speed": 90
    },
    {
      "pokemonId": 6,
      "name": "charizard",
      "hp": 78,
      "attack": 84,
      "defense": 78,
      "speed": 100
    }
  ]
}
```

#### Examples

```bash
# Compare two Pokémon by name
POST /pokemon/compare
{
  "pokemon": ["pikachu", "charizard"]
}

# Compare three Pokémon by ID
POST /pokemon/compare
{
  "pokemon": ["25", "6", "9"]
}
```

### GET `/pokemon/health`

Health check endpoint.

#### Response Format

```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-12-20T10:00:00.000Z"
  },
  "message": "Service is healthy"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Internal server error
- `SEARCH_ERROR`: Search operation failed
- `COMPARISON_ERROR`: Comparison operation failed

## Rate Limiting

Currently, there is no rate limiting implemented. In production, you should implement appropriate rate limiting.

## Authentication

Currently, there is no authentication required. In production, you should implement proper authentication and authorization.

## Caching

Responses are cached in Redis with the following TTL:

- Search results: 5 minutes
- Comparison results: 1 hour