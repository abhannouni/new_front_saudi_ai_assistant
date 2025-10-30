# Authentication System Documentation

## Overview

This application uses a comprehensive authentication system built with Redux Toolkit, featuring token-based authentication with automatic refresh capabilities.

## Features

- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Automatic token refresh on expiry
- ✅ Server-side logout
- ✅ Token verification
- ✅ Persistent authentication (localStorage)
- ✅ Protected routes
- ✅ Custom useAuth hook
- ✅ Axios interceptors for automatic token injection

## Architecture

### Authentication Slice (`src/store/slices/authSlice.js`)

The auth slice manages all authentication state and async operations.

#### State Structure

```javascript
{
  user: Object | null,           // User profile data
  token: string | null,          // Access token
  refreshToken: string | null,   // Refresh token
  isAuthenticated: boolean,      // Authentication status
  isLoading: boolean,            // Loading state
  error: string | null,          // Error messages
  isAuthModalOpen: boolean       // Auth modal state
}
```

#### Async Thunks

1. **loginUser(credentials)**
   - POST `/api/auth/login`
   - Accepts: `{ email, password }`
   - Returns: `{ token, refreshToken, user }`

2. **registerUser(userData)**
   - POST `/api/auth/register`
   - Accepts: `{ firstName, lastName, email, password, language }`
   - Returns: `{ token, refreshToken, user }`

3. **logoutUser()**
   - POST `/api/auth/logout`
   - Clears tokens and user data
   - Calls server to invalidate tokens

4. **verifyToken()**
   - GET `/api/auth/verify`
   - Validates current token
   - Updates user data if valid

5. **refreshToken(refreshTokenValue?)**
   - POST `/api/auth/refresh`
   - Accepts: `{ refreshToken }`
   - Returns: `{ token, refreshToken }`
   - Automatically called on 401 responses

6. **getUserProfile()**
   - GET `/api/user/profile`
   - Fetches latest user profile data

#### Reducers

- `logout()` - Clear auth state (local only)
- `clearError()` - Clear error messages
- `setAuthModalOpen(isOpen)` - Toggle auth modal
- `loadUserFromStorage()` - Load auth data from localStorage
- `clearAuth()` - Complete auth state reset
- `updateUser(userData)` - Update user profile data

### Custom Hook (`src/hooks/useAuth.js`)

Provides easy access to authentication state and actions:

```javascript
const {
  // State
  user,
  token,
  refreshToken,
  isAuthenticated,
  isLoading,
  error,
  isAuthModalOpen,
  
  // Actions
  login,
  register,
  logout,
  verifyToken,
  refreshToken,
  getProfile,
  clearError,
  setAuthModalOpen,
  clearAuth,
} = useAuth();
```

#### Auto-initialization

The hook automatically:
- Loads user data from localStorage on mount
- Verifies token if exists but user data is missing

### API Client Configuration

The auth slice includes a configured Axios instance with interceptors:

#### Request Interceptor
- Automatically adds `Authorization: Bearer {token}` header to all requests

#### Response Interceptor
- Intercepts 401 (Unauthorized) responses
- Automatically attempts token refresh
- Retries original request with new token
- Redirects to login if refresh fails

## Usage Examples

### 1. Login Page

```javascript
import { useAuth } from '@/hooks/useAuth';

function Login() {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.type.endsWith('/fulfilled')) {
      // Login successful
      navigate('/dashboard');
    }
  };
}
```

### 2. Register Page

```javascript
import { useAuth } from '@/hooks/useAuth';

function Register() {
  const { register, isLoading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({
      firstName,
      lastName,
      email,
      password,
      language: 'en'
    });
    if (result.type.endsWith('/fulfilled')) {
      navigate('/dashboard');
    }
  };
}
```

### 3. Logout

```javascript
import { useAuth } from '@/hooks/useAuth';

function Sidebar() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
}
```

### 4. Protected Routes

```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

### 5. Access User Data

```javascript
function Profile() {
  const { user, getProfile } = useAuth();
  
  useEffect(() => {
    if (!user) {
      getProfile(); // Fetch if not loaded
    }
  }, [user, getProfile]);
  
  return <div>Welcome, {user?.firstName}!</div>;
}
```

### 6. Check Authentication Status

```javascript
function Header() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <nav>
      {isAuthenticated ? (
        <span>Hello, {user?.firstName}</span>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
```

## API Endpoints Expected

### Authentication Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ success, data: { token, refreshToken, user } }` |
| POST | `/api/auth/register` | `{ firstName, lastName, email, password, language }` | `{ success, data: { token, refreshToken, user } }` |
| POST | `/api/auth/logout` | - | `{ success, message }` |
| GET | `/api/auth/verify` | - | `{ success, data: { user } }` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `{ success, data: { token, refreshToken? } }` |
| GET | `/api/user/profile` | - | `{ success, data: { user } }` |

### Expected Response Format

```javascript
// Success
{
  success: true,
  data: {
    token: "jwt.token.here",
    refreshToken: "refresh.token.here",
    user: {
      id: "user_id",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      language: "en",
      // ... other fields
    }
  },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable error message",
    details: "Additional error details"
  }
}
```

## Token Flow

### Initial Authentication
1. User submits credentials
2. `loginUser()` or `registerUser()` called
3. Tokens and user data stored in localStorage
4. Redux state updated
5. User redirected to dashboard

### Automatic Token Refresh
1. API request receives 401 response
2. Response interceptor catches error
3. `refreshToken()` automatically called
4. New token stored
5. Original request retried with new token
6. If refresh fails, user redirected to login

### Token Verification
1. App loads
2. `useAuth` hook checks for existing token
3. If token exists, `verifyToken()` called
4. Token validated with server
5. User data updated if valid
6. If invalid, tokens cleared

## Security Features

### Token Storage
- Tokens stored in localStorage (consider httpOnly cookies for production)
- User data encrypted before storage (recommended)

### Automatic Cleanup
- Tokens removed on logout
- Tokens removed on verification failure
- Tokens removed on refresh failure

### Protected Routes
- Routes check authentication status
- Unauthorized users redirected to login
- Loading states prevent flashing

### Error Handling
- Comprehensive error messages
- User-friendly error display
- Automatic error clearing
- Fallback to login on critical errors

## Environment Configuration

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Testing

### Test Login
```javascript
const { login } = useAuth();
await login({ 
  email: 'test@example.com', 
  password: 'password123' 
});
```

### Test Token Refresh
```javascript
// Manually expire token or wait for expiry
// Make any API request
// Observe automatic refresh and retry
```

### Test Logout
```javascript
const { logout } = useAuth();
await logout();
// Verify tokens cleared
// Verify redirect to login
```

## Troubleshooting

### Issue: Infinite Redirect Loop
- Check if `verifyToken()` is failing
- Ensure token format is correct
- Verify API endpoint is accessible

### Issue: Token Not Refreshing
- Check refresh token validity
- Verify `/api/auth/refresh` endpoint
- Check localStorage for refreshToken

### Issue: 401 After Login
- Verify token format in Authorization header
- Check if backend expects `Bearer` prefix
- Ensure token is being stored correctly

### Issue: User Data Not Persisting
- Check localStorage in DevTools
- Verify `loadUserFromStorage()` is called
- Check for localStorage quota issues

## Best Practices

1. **Always use the useAuth hook** instead of directly accessing Redux state
2. **Handle loading states** to prevent premature rendering
3. **Clear errors** after displaying to users
4. **Implement token expiry handling** on the backend
5. **Use HTTPS** in production for secure token transmission
6. **Consider httpOnly cookies** instead of localStorage for enhanced security
7. **Implement rate limiting** on authentication endpoints
8. **Log authentication events** for security monitoring

## Future Enhancements

- [ ] Add biometric authentication
- [ ] Implement remember me functionality
- [ ] Add social login (Google, Facebook)
- [ ] Implement two-factor authentication
- [ ] Add password reset flow
- [ ] Implement email verification
- [ ] Add session management
- [ ] Implement device management
- [ ] Add login history
- [ ] Implement account lockout after failed attempts

## Support

For issues or questions, please check:
1. Browser console for errors
2. Network tab for API responses
3. Redux DevTools for state changes
4. This documentation for usage examples
