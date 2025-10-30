# Saudi Legal Assistant - Complete API Documentation

**Version:** 1.0.0  
**Last Updated:** October 29, 2025  
**Base URL:** `http://localhost:3001/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Document Endpoints](#document-endpoints)
4. [Chat Endpoints](#chat-endpoints)
5. [Legal Services](#legal-services)
6. [Error Handling](#error-handling)
7. [Frontend Integration Examples](#frontend-integration-examples)

---

## Overview

The Saudi Legal Assistant API provides AI-powered legal consultation, document analysis, and legal services specifically designed for Saudi Arabian law. The API supports both authenticated users and anonymous sessions.

### Key Features
- 🔐 JWT-based authentication with optional anonymous access
- 📄 Document upload, analysis, and management
- 💬 AI-powered legal chat consultations
- 🔍 Document history with filtering and sorting
- 📥 Document viewing and downloading
- 🌐 Full CORS support for all origins
- 🌍 Arabic and English language support

### Base URLs
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

---

## Authentication

### Methods

#### 1. JWT Token (Authenticated Users)
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

#### 2. Anonymous Access
Some endpoints support anonymous access without authentication.

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6789abcdef0",
      "email": "ahmed@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "fullName": "Ahmed Ali",
      "preferences": {
        "language": "en",
        "theme": "auto",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6789abcdef0",
      "email": "ahmed@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "fullName": "Ahmed Ali",
      "preferences": {
        "language": "en",
        "theme": "auto"
      },
      "isVerified": false,
      "stats": {
        "totalChats": 0,
        "totalDocuments": 0,
        "totalQueries": 0
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

---

## Document Endpoints

All document endpoints require authentication via JWT token.

### 1. Get Document History

Retrieve paginated list of user documents with filtering and sorting.

**GET** `/api/documents/history`

**Authentication:** Optional (returns user-specific documents when authenticated)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max: 50) |
| sortBy | string | lastUsed | Sort field: `lastUsed`, `createdAt`, `originalName`, `totalInteractions` |
| sortOrder | string | desc | Sort order: `asc` or `desc` |
| documentType | string | - | Filter by document type |
| tags | string | - | Comma-separated tags |
| favorites | boolean | false | Show only favorites |

**Example Request:**
```javascript
const response = await fetch('/api/documents/history?page=1&limit=20&sortBy=lastUsed&sortOrder=desc', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef0",
        "originalName": "employment_contract.pdf",
        "displayName": "Employment Contract",
        "documentType": "contract",
        "analysis": {
          "summary": "Employment contract between...",
          "legalCategory": "Employment Law"
        },
        "usage": {
          "chatCount": 5,
          "questionCount": 12,
          "lastUsed": "2025-10-29T10:30:00.000Z",
          "viewCount": 8,
          "totalInteractions": 25
        },
        "tags": ["contract", "employment"],
        "isFavorite": true,
        "color": "#6366f1",
        "createdAt": "2025-10-20T14:22:00.000Z",
        "url": "http://localhost:3001/uploads/file.pdf"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 2. Get Recent Documents

Get most recently accessed documents.

**GET** `/api/documents/recent`

**Query Parameters:**
- `limit` (integer, optional): Number of documents (default: 10, max: 20)

**Example:**
```javascript
const response = await fetch('/api/documents/recent?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 3. Get Frequently Used Documents

Get documents sorted by usage frequency.

**GET** `/api/documents/frequent`

**Query Parameters:**
- `limit` (integer, optional): Number of documents (default: 10, max: 20)

---

### 4. Get Document Details

Get detailed information about a specific document.

**GET** `/api/documents/:documentId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "65a1b2c3d4e5f6789abcdef0",
      "originalName": "contract.pdf",
      "filename": "1234567890-contract.pdf",
      "mimetype": "application/pdf",
      "size": 245678,
      "analysis": {
        "status": "completed",
        "language": "en",
        "documentType": "contract",
        "summary": "Contract summary...",
        "keyPoints": ["Point 1", "Point 2"],
        "risks": [
          {
            "level": "medium",
            "category": "compliance",
            "description": "Risk description",
            "recommendation": "Recommendation"
          }
        ]
      },
      "usage": {
        "chatCount": 5,
        "viewCount": 10,
        "totalInteractions": 15
      }
    }
  }
}
```

---

### 5. Open Document (View in Browser)

View document inline in browser.

**GET** `/api/documents/:documentId/open`

**Authentication:** Required

**Response:** Document file buffer with headers:
- `Content-Type`: Document mimetype
- `Content-Disposition`: inline
- `Content-Length`: File size

**Frontend Example:**
```javascript
const openDocument = (documentId) => {
  const token = localStorage.getItem('token');
  const url = `/api/documents/${documentId}/open`;
  
  // Simple: Open in new tab
  window.open(url, '_blank');
};
```

**React Example with Iframe:**
```jsx
const DocumentViewer = ({ documentId }) => {
  return (
    <iframe
      src={`/api/documents/${documentId}/open`}
      style={{ width: '100%', height: '600px', border: 'none' }}
      title="Document Viewer"
    />
  );
};
```

---

### 6. Download Document

Download document to user's device.

**GET** `/api/documents/:documentId/download`

**Authentication:** Required

**Response:** Document file buffer with attachment headers

**Frontend Example:**
```javascript
const downloadDocument = async (documentId, filename) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/documents/${documentId}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('تم تحميل المستند بنجاح');
  } catch (error) {
    console.error('فشل التحميل:', error);
    alert('فشل تحميل المستند');
  }
};
```

---

### 7. Get Document Chat History

Get all chat sessions related to a specific document.

**GET** `/api/documents/:documentId/chats`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "65a1b2c3d4e5f6789abcdef0",
      "originalName": "contract.pdf",
      "url": "http://localhost:3001/uploads/contract.pdf"
    },
    "chats": [
      {
        "id": "65a1b2c3d4e5f6789abcdef2",
        "title": "Questions about Contract",
        "messages": [
          {
            "id": "msg1",
            "type": "user",
            "content": "What is the notice period?",
            "files": []
          },
          {
            "id": "msg2",
            "type": "bot",
            "content": "The notice period is 30 days...",
            "files": [
              {
                "originalName": "clause.pdf",
                "url": "http://localhost:3001/uploads/clause.pdf",
                "mimetype": "application/pdf"
              }
            ]
          }
        ],
        "stats": {
          "messageCount": 10,
          "userMessages": 5,
          "botMessages": 5
        }
      }
    ]
  }
}
```

---

### 8. Create Chat for Document

Create a new chat session for a specific document.

**POST** `/api/documents/:documentId/chat`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "65a1b2c3d4e5f6789abcdef3",
    "message": "Chat session created successfully"
  }
}
```

---

### 9. Toggle Favorite

Add or remove document from favorites.

**PATCH** `/api/documents/:documentId/favorite`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true,
    "message": "Document added to favorites"
  }
}
```

---

### 10. Manage Tags

Add or remove tags from a document.

**PATCH** `/api/documents/:documentId/tags`

**Authentication:** Required

**Request Body:**
```json
{
  "tags": ["contract", "employment", "important"],
  "action": "add"
}
```

**Actions:** `add` or `remove`

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": ["contract", "employment", "important"],
    "message": "Tags added to document"
  }
}
```

---

## Chat Endpoints

### Send Message

Send a message to the AI assistant. Automatically creates a new chat session or continues an existing one.

**POST** `/api/chat/message`

**Authentication:** Optional (anonymous supported)

**Request Body:**
```json
{
  "message": "What are the key points in this contract?",
  "chatId": "65a1b2c3d4e5f6789abcdef0",
  "documentId": "65a1b2c3d4e5f6789abcdef1",
  "language": "en"
}
```

**Parameters:**
- `message` (string, required): The user's message
- `chatId` (string, optional): Existing chat ID to continue conversation
- `documentId` (string, optional): Document ID to analyze
- `language` (string, optional): Response language (`en` or `ar`)

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "65a1b2c3d4e5f6789abcdef0",
    "userMessage": {
      "role": "user",
      "content": "What are the key points in this contract?",
      "timestamp": "2025-10-29T10:00:00.000Z"
    },
    "botMessage": {
      "role": "assistant",
      "content": "Based on the document, here are the key points...",
      "timestamp": "2025-10-29T10:00:03.000Z"
    }
  }
}
```

---

### Get Chat History

Get all chat sessions for the authenticated user.

**GET** `/api/chat/history`

**Authentication:** Optional (returns user-specific chats when authenticated)

**Response:**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef0",
        "title": "Employment Contract Discussion",
        "messages": [
          {
            "role": "user",
            "content": "What are the key points?",
            "timestamp": "2025-10-29T10:00:00.000Z"
          },
          {
            "role": "assistant",
            "content": "The key points are...",
            "timestamp": "2025-10-29T10:00:03.000Z"
          }
        ],
        "createdAt": "2025-10-29T10:00:00.000Z",
        "updatedAt": "2025-10-29T10:05:00.000Z"
      }
    ]
  }
}
```

---

### Get Specific Chat

Retrieve a specific chat session by ID.

**GET** `/api/chat/:id`

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": {
      "_id": "65a1b2c3d4e5f6789abcdef0",
      "title": "Employment Contract Discussion",
      "messages": [
        {
          "role": "user",
          "content": "What are the key points?",
          "timestamp": "2025-10-29T10:00:00.000Z"
        },
        {
          "role": "assistant",
          "content": "The key points are...",
          "timestamp": "2025-10-29T10:00:03.000Z"
        }
      ],
      "createdAt": "2025-10-29T10:00:00.000Z",
      "updatedAt": "2025-10-29T10:05:00.000Z"
    }
  }
}
```

---

## Legal Services

### Analyze Document

**POST** `/api/legal/analyze-document`

**Authentication:** Optional

**Request (Multipart Form Data):**
```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('language', 'en');
formData.append('analysisType', 'detailed');

const response = await fetch('/api/legal/analyze-document', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "65a1b2c3d4e5f6789abcdef0",
      "originalName": "contract.pdf",
      "analysis": {
        "status": "completed",
        "documentType": "contract",
        "summary": "This is an employment contract...",
        "keyPoints": [
          "Employment duration: 2 years",
          "Salary: 10,000 SAR per month"
        ],
        "risks": [
          {
            "level": "medium",
            "category": "termination",
            "description": "Termination clause may need review"
          }
        ],
        "compliance": {
          "saudiLaw": {
            "compliant": true,
            "recommendations": ["Add arbitration clause"]
          }
        }
      }
    }
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Common Errors

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Document not found"
}
```

#### 400 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Page must be a positive integer",
      "param": "page",
      "location": "query"
    }
  ]
}
```

---

## Frontend Integration Examples

### Complete React Component

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Add auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DocumentHistoryPage = () => {
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'lastUsed',
    sortOrder: 'desc',
    favorites: false
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents/history', { params: filters });
      setDocuments(response.data.data.documents);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const openDocument = (documentId) => {
    const url = `http://localhost:3001/api/documents/${documentId}/open`;
    window.open(url, '_blank');
  };

  const downloadDocument = async (documentId, filename) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('تم التحميل بنجاح');
    } catch (error) {
      console.error('Download error:', error);
      alert('فشل التحميل');
    }
  };

  const toggleFavorite = async (documentId) => {
    try {
      await api.patch(`/documents/${documentId}/favorite`);
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  return (
    <div className="document-history">
      <h1>Document History</h1>
      
      <div className="filters">
        <button onClick={() => setFilters({...filters, favorites: !filters.favorites})}>
          {filters.favorites ? 'Show All' : 'Favorites Only'}
        </button>
        
        <select onChange={(e) => setFilters({...filters, sortBy: e.target.value})}>
          <option value="lastUsed">Last Used</option>
          <option value="createdAt">Date Created</option>
          <option value="originalName">Name</option>
          <option value="totalInteractions">Most Used</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="documents-grid">
            {documents.map(doc => (
              <div key={doc._id} className="document-card">
                <div className="doc-icon" style={{ backgroundColor: doc.color }}>
                  📄
                </div>
                <h3>{doc.displayName || doc.originalName}</h3>
                <p>{doc.analysis?.summary}</p>
                
                <div className="stats">
                  <span>💬 {doc.usage.chatCount} chats</span>
                  <span>👁️ {doc.usage.viewCount} views</span>
                </div>
                
                <div className="actions">
                  <button onClick={() => openDocument(doc._id)}>
                    📄 Open
                  </button>
                  <button onClick={() => downloadDocument(doc._id, doc.originalName)}>
                    ⬇️ Download
                  </button>
                  <button onClick={() => toggleFavorite(doc._id)}>
                    {doc.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <div className="pagination">
              <button 
                disabled={!pagination.hasPrev}
                onClick={() => setFilters({...filters, page: filters.page - 1})}
              >
                Previous
              </button>
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button 
                disabled={!pagination.hasNext}
                onClick={() => setFilters({...filters, page: filters.page + 1})}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentHistoryPage;
```

### Redux Integration

```javascript
// store/documentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

export const fetchDocumentHistory = createAsyncThunk(
  'documents/fetchHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/documents/history', {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const downloadDocument = createAsyncThunk(
  'documents/download',
  async ({ documentId, originalName }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      a.click();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    history: [],
    pagination: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.documents;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDocumentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default documentSlice.reducer;
```

### Authentication Helper

```javascript
// utils/auth.js
export const authService = {
  // Login
  async login(email, password) {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Register
  async register(userData) {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
};
```

---

## User Endpoints

All user endpoints require authentication (JWT token in Authorization header).

### 1. Get User Profile

Get the current user's profile information.

**GET** `/api/user/profile`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6789abcdef0",
      "email": "ahmed@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "fullName": "Ahmed Ali",
      "preferences": {
        "language": "en",
        "theme": "auto",
        "notifications": {
          "email": true,
          "push": true
        }
      },
      "isVerified": false,
      "isActive": true,
      "stats": {
        "totalChats": 15,
        "totalDocuments": 8,
        "totalQueries": 42
      },
      "createdAt": "2025-10-20T14:22:00.000Z",
      "updatedAt": "2025-10-29T10:30:00.000Z"
    }
  }
}
```

---

### 2. Update User Profile

Update user's first name and last name.

**PATCH** `/api/user/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "Mohammed",
  "lastName": "Hassan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6789abcdef0",
      "firstName": "Mohammed",
      "lastName": "Hassan",
      "fullName": "Mohammed Hassan"
    }
  }
}
```

---

### 3. Update User Preferences

Update user preferences (language, theme, notifications).

**PATCH** `/api/user/preferences`

**Authentication:** Required

**Request Body:**
```json
{
  "language": "ar",
  "theme": "dark",
  "notifications": {
    "email": false,
    "push": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {
      "language": "ar",
      "theme": "dark",
      "notifications": {
        "email": false,
        "push": true
      }
    }
  }
}
```

---

### 4. Change Password

Change user's password.

**POST** `/api/user/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 5. Get Dashboard Statistics

Get comprehensive dashboard statistics including recent activity, document stats, and chat analytics.

**GET** `/api/user/dashboard`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalDocuments": 8,
      "totalChats": 15,
      "totalQueries": 42
    },
    "recentDocuments": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef0",
        "originalName": "contract.pdf",
        "lastUsed": "2025-10-29T10:30:00.000Z"
      }
    ],
    "recentChats": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef1",
        "title": "Employment Discussion",
        "updatedAt": "2025-10-29T10:00:00.000Z"
      }
    ],
    "documentsByType": [
      { "_id": "contract", "count": 3 },
      { "_id": "agreement", "count": 2 }
    ],
    "activityByDay": [
      { "_id": "2025-10-29", "count": 5 },
      { "_id": "2025-10-28", "count": 3 }
    ]
  }
}
```

---

### 6. Get User Documents

Get documents created by the current user (paginated).

**GET** `/api/user/documents`

**Authentication:** Required

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef0",
        "originalName": "contract.pdf",
        "displayName": "Employment Contract",
        "documentType": "contract",
        "createdAt": "2025-10-20T14:22:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 7. Delete Account

Permanently delete the user account and all associated data.

**DELETE** `/api/user/account`

**Authentication:** Required

**Request Body:**
```json
{
  "password": "userPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### 8. Export User Data

Export all user data in JSON format.

**GET** `/api/user/export`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "User data exported successfully",
  "data": {
    "user": {
      "email": "ahmed@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali"
    },
    "documents": [...],
    "chats": [...],
    "exportDate": "2025-10-29T10:30:00.000Z"
  }
}
```

---

## Document Types

Valid document types for filtering:

- `contract` - Legal contracts and agreements
- `agreement` - Business agreements
- `court_filing` - Court documents
- `legal_memo` - Legal memorandums
- `regulation` - Government regulations
- `law` - Legal statutes
- `decree` - Official decrees
- `judgment` - Court judgments
- `evidence` - Legal evidence
- `power_of_attorney` - Power of attorney
- `certificate` - Certificates
- `license` - Licenses
- `permit` - Permits
- `other` - Other types

---

## Best Practices

### 1. Token Management
```javascript
// Store token securely
localStorage.setItem('token', token);

// Include in all API requests
const token = localStorage.getItem('token');
headers: { 'Authorization': `Bearer ${token}` }
```

### 2. Error Handling
```javascript
try {
  const response = await api.get('/documents/history');
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else {
    // Show error message
    alert('An error occurred');
  }
}
```

### 3. File Downloads
```javascript
// Always use responseType: 'blob' for file downloads
const response = await axios.get('/documents/:id/download', {
  responseType: 'blob'
});
```

### 4. Pagination
```javascript
// Implement pagination properly
const [page, setPage] = useState(1);
const loadMore = () => setPage(prev => prev + 1);
```

---

## Testing

### Test with cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get document history
curl http://localhost:3001/api/documents/history?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Download document
curl http://localhost:3001/api/documents/DOC_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.pdf
```

### Test in Browser Console

```javascript
// Test login
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.data.token);
  console.log('Logged in:', data);
});

// Test get documents
fetch('http://localhost:3001/api/documents/history', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Documents:', data));
```

---

## Support & Contact

For API issues, feature requests, or questions:
- **Email:** support@saudilegalassistant.com
- **GitHub:** https://github.com/salekelfahim/SaudiAgent
- **Documentation:** https://docs.saudilegalassistant.com

---

**Last Updated:** October 29, 2025  
**API Version:** 1.0.0  
**Maintained by:** Backend Development Team
