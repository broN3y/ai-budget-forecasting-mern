# AI Budget Forecasting Tool - API Documentation

## Overview

This document provides comprehensive documentation for the AI Budget Forecasting Tool API. The API is built using Node.js, Express.js, and MongoDB, with AI/ML capabilities powered by TensorFlow.js.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details (development only)
  }
}
```

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "PMO",
  "role": "analyst"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "analyst",
      "department": "PMO"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /auth/login

Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /auth/me

Get current user profile (requires authentication).

### PUT /auth/profile

Update user profile (requires authentication).

### POST /auth/logout

Logout user (requires authentication).

### POST /auth/refresh-token

Refresh authentication token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

## Project Endpoints

### GET /projects

Get all projects for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by project status
- `category` (optional): Filter by project category
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

### POST /projects

Create a new project (requires authentication).

**Request Body:**
```json
{
  "name": "AI Implementation Project",
  "description": "Implementing AI chatbot for customer service",
  "code": "AI-2024-001",
  "category": "AI/ML",
  "priority": "high",
  "timeline": {
    "startDate": "2024-01-01",
    "endDate": "2024-06-30"
  },
  "budget": {
    "allocated": 500000,
    "currency": "INR"
  }
}
```

### GET /projects/:id

Get project details by ID (requires project access).

### PUT /projects/:id

Update project (requires manager role and project access).

### DELETE /projects/:id

Delete project (requires manager role and project access).

### PUT /projects/:id/team/add

Add team member to project.

**Request Body:**
```json
{
  "userId": "user_id",
  "role": "member"
}
```

### PUT /projects/:id/status

Update project status.

**Request Body:**
```json
{
  "status": "active"
}
```

## Budget Endpoints

### GET /budgets/project/:projectId

Get all budgets for a project.

### POST /budgets/project/:projectId

Create a new budget for a project.

**Request Body:**
```json
{
  "name": "Q1 2024 Budget",
  "description": "First quarter budget allocation",
  "totalAmount": 500000,
  "currency": "INR",
  "categories": [
    {
      "name": "Personnel",
      "allocated": 300000,
      "description": "Team salaries and benefits"
    },
    {
      "name": "Technology",
      "allocated": 150000,
      "description": "Software licenses and infrastructure"
    }
  ]
}
```

### GET /budgets/:id

Get budget details by ID.

### PUT /budgets/:id

Update budget.

### POST /budgets/:id/expenses

Add expense to budget.

**Request Body:**
```json
{
  "description": "Software license renewal",
  "amount": 25000,
  "category": "Technology",
  "date": "2024-01-15",
  "vendor": "Microsoft"
}
```

## Forecast Endpoints

### POST /forecasts/generate/:projectId

Generate AI-powered budget forecast for a project.

**Request Body:**
```json
{
  "periods": 12,
  "includeSeasonality": true,
  "confidenceLevel": 95
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forecasts": [
      {
        "period": 1,
        "predictedValue": 45000,
        "lowerBound": 38000,
        "upperBound": 52000,
        "confidence": 87.5
      }
    ],
    "metadata": {
      "algorithm": "Linear Regression with Time Series Analysis",
      "dataPoints": 24,
      "trend": "increasing",
      "seasonality": true,
      "accuracy": 89.2
    }
  }
}
```

### GET /forecasts/project/:projectId

Get all forecasts for a project.

### GET /forecasts/:id/accuracy

Get forecast accuracy metrics.

### GET /forecasts/project/:projectId/anomalies

Detect spending anomalies using AI.

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "expense_id",
        "date": "2024-01-15",
        "amount": 75000,
        "category": "Technology",
        "zScore": 2.8,
        "severity": "medium",
        "type": "overspending",
        "recommendation": "Review expense for accuracy and business justification"
      }
    ],
    "summary": {
      "totalAnomalies": 3,
      "highSeverity": 1,
      "mediumSeverity": 2
    }
  }
}
```

## Analytics Endpoints

### GET /analytics/dashboard

Get dashboard analytics data.

### GET /analytics/projects/:id/risk

Get AI-powered risk assessment for a project.

**Response:**
```json
{
  "success": true,
  "data": {
    "riskScore": 65,
    "riskLevel": "medium",
    "factors": [
      "High budget utilization (>90%)",
      "Behind schedule"
    ],
    "recommendations": [
      "Monitor closely",
      "Review project timeline and budget"
    ],
    "calculatedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are rate-limited to 100 requests per 15-minute window per IP address.

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## AI/ML Features

### Budget Forecasting

The AI service uses multiple algorithms:
- **ARIMA Model**: Time series forecasting
- **Linear Regression**: Trend analysis
- **Neural Networks**: Complex pattern recognition
- **Ensemble Methods**: Combined predictions

### Anomaly Detection

Statistical methods to identify unusual spending patterns:
- Z-score based detection
- Configurable sensitivity thresholds
- Automated recommendations

### Risk Assessment

Multi-factor risk scoring:
- Budget utilization analysis
- Timeline adherence
- Team size considerations
- Historical risk patterns

## Security

- HTTPS encryption in production
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb://localhost:27017/ai-budget-forecasting

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# AI/ML
TENSORFLOW_MODEL_PATH=./models/
FORECAST_ACCURACY_THRESHOLD=0.85
ANOMALY_DETECTION_SENSITIVITY=0.1
```

## Support

For API support and questions:
- GitHub Issues: [Repository Issues](https://github.com/broN3y/ai-budget-forecasting-mern/issues)
- Documentation: [API Docs](https://github.com/broN3y/ai-budget-forecasting-mern/blob/main/docs/API.md)
- Email: [Your Email]