# Saudi Legal Assistant - Development Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001 (should be running separately)

## Project Architecture

### State Management (Redux Toolkit)

#### Auth Slice
- **State**: user, token, isAuthenticated, loading, error
- **Actions**: loginUser, registerUser, logout, getUserProfile
- **Use**: User authentication and session management

#### Chat Slice
- **State**: currentChat, messages, chatHistory, sendingMessage
- **Actions**: sendMessage, getChatHistory, getChat, clearCurrentChat
- **Use**: Chat functionality and message history

#### Document Slice
- **State**: documents, currentDocument, filters, uploading
- **Actions**: getDocumentHistory, uploadDocument, toggleFavorite, downloadDocument
- **Use**: Document management and file operations

#### UI Slice
- **State**: theme, language, sidebarOpen, mobileMenuOpen
- **Actions**: toggleTheme, setLanguage, toggleSidebar
- **Use**: UI preferences and settings

### Component Structure

#### Layout Components
- **MainLayout**: Main wrapper with Sidebar, Header, and Outlet
- **Sidebar**: Navigation menu with collapsible functionality
- **Header**: Top bar with theme/language toggles

#### Pages
- **Home**: Landing page with features and CTAs
- **Login/Register**: Authentication forms
- **Chat**: Main chat interface with document upload
- **Documents**: Document library with filters
- **Dashboard**: User statistics and quick actions

### Routing

```javascript
/ - Home (public)
/login - Login page
/register - Registration page
/chat - Chat interface (public, but auth recommended)
/documents - Document library (protected)
/dashboard - User dashboard (protected)
```

## Styling Guide

### Theme Colors

```javascript
// Primary (Saudi Green)
bg-primary-600  // #16a34a
hover:bg-primary-700
text-primary-600

// Accent (Gold)
bg-accent-600  // #d97706
text-accent-500

// Gradients
.gradient-saudi  // Green gradient
.gradient-gold   // Gold gradient
.text-gradient   // Mixed gradient text
```

### Custom Components

```javascript
// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Inputs
<input className="input" />

// Cards
<div className="card">...</div>

// Links
<a className="link">Link</a>
```

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## API Integration

### Making API Calls

```javascript
// Using Redux actions
const result = await dispatch(loginUser({ email, password }));
if (loginUser.fulfilled.match(result)) {
  // Success
}

// Direct axios call
const response = await axios.get(`${API_URL}/endpoint`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Authentication Flow

1. User logs in → JWT token received
2. Token stored in localStorage
3. Token automatically added to API requests
4. Protected routes check authentication status

## Internationalization

### Using Translations

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('nav.home')}</h1>;
};
```

### Adding New Translations

1. Add to `src/locales/en.js`:
```javascript
export const en = {
  mySection: {
    title: 'My Title'
  }
};
```

2. Add Arabic translation in `src/locales/ar.js`:
```javascript
export const ar = {
  mySection: {
    title: 'عنواني'
  }
};
```

3. Use in components:
```javascript
{t('mySection.title')}
```

## Best Practices

### Component Structure
```javascript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

const MyComponent = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.slice);

  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

### Redux Actions
```javascript
// Async thunk
export const myAction = createAsyncThunk(
  'slice/myAction',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.call(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Usage
const result = await dispatch(myAction(params));
if (myAction.fulfilled.match(result)) {
  // Success handling
}
```

### Error Handling
```javascript
try {
  const result = await dispatch(someAction(data));
  if (someAction.fulfilled.match(result)) {
    toast.success(t('common.success'));
  } else {
    toast.error(result.payload || t('common.error'));
  }
} catch (error) {
  toast.error(error.message);
}
```

## Testing

### Component Testing (Future)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### E2E Testing (Future)
```bash
npm install --save-dev cypress
```

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set in production:
- `VITE_API_URL`: Production API URL

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

## Troubleshooting

### Issue: API requests failing
- Check backend is running on http://localhost:3001
- Verify CORS is enabled on backend
- Check network tab in browser DevTools

### Issue: Translations not working
- Verify language files are imported in `i18n.js`
- Check translation keys exist in both en.js and ar.js
- Clear browser cache

### Issue: Dark mode not working
- Check localStorage for 'theme' value
- Verify Tailwind dark: classes are applied
- Check `tailwind.config.js` for darkMode: 'class'

### Issue: Protected routes not working
- Verify token exists in localStorage
- Check Redux auth state
- Ensure ProtectedRoute component is wrapping the route

## Performance Optimization

### Code Splitting
```javascript
// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Memoization
```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

For questions or issues, contact the development team.
