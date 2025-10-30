# Saudi Legal Assistant - AI-Powered Legal Consultation

A modern, responsive web application providing AI-powered legal consultation and document analysis specialized in Saudi Arabian law.

## 🚀 Features

### Core Features
- **AI-Powered Legal Chat**: Interactive chat with an AI assistant specialized in Saudi law
- **Document Analysis**: Upload and analyze legal documents with detailed insights
- **Multi-language Support**: Full support for Arabic (RTL) and English
- **Dark/Light Mode**: Automatic theme switching with manual override
- **User Authentication**: Secure JWT-based authentication with optional anonymous access
- **Document Management**: Upload, view, download, and organize legal documents
- **Dashboard**: Overview of user activity and statistics

### Technical Features
- ✅ **Redux Toolkit**: Complete state management with slices for auth, chat, documents, and UI
- ✅ **React Router v6**: Client-side routing with protected routes
- ✅ **i18next**: Internationalization with Arabic and English translations
- ✅ **Tailwind CSS v4**: Modern styling with Saudi-themed colors (green, white, gold)
- ✅ **Framer Motion**: Smooth animations and transitions
- ✅ **Axios**: HTTP client with interceptors for API calls
- ✅ **React Hot Toast**: Beautiful toast notifications
- ✅ **Lucide React**: Modern icon library
- ✅ **Responsive Design**: Mobile-first approach, works on all devices

## 🎨 Design

### Color Palette (Saudi Arabia Theme)
- **Primary (Saudi Green)**: `#16a34a` to `#052e16`
- **Accent (Gold)**: `#f59e0b` to `#451a03`
- **Background**: White/Gray (light mode), Dark Gray/Black (dark mode)

### Key UI Components
- Collapsible sidebar with navigation
- Responsive header with theme and language toggles
- Chat interface with message history
- Document cards with filters and sorting
- Dashboard with statistics and quick actions

## 📁 Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Header.jsx          # Top navigation bar
│       ├── Sidebar.jsx         # Side navigation menu
│       └── MainLayout.jsx      # Main layout wrapper
├── pages/
│   ├── Home.jsx               # Landing page
│   ├── Login.jsx              # Login page
│   ├── Register.jsx           # Registration page
│   ├── Chat.jsx               # Chat interface
│   ├── Documents.jsx          # Document management
│   └── Dashboard.jsx          # User dashboard
├── store/
│   ├── index.js               # Redux store configuration
│   └── slices/
│       ├── authSlice.js       # Authentication state
│       ├── chatSlice.js       # Chat state
│       ├── documentSlice.js   # Document state
│       └── uiSlice.js         # UI settings (theme, language)
├── locales/
│   ├── i18n.js                # i18next configuration
│   ├── en.js                  # English translations
│   └── ar.js                  # Arabic translations
├── App.jsx                     # Main app component with routes
├── main.jsx                    # App entry point
└── index.css                   # Global styles with Tailwind
```

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3001`

### Setup

1. **Clone the repository**
```bash
cd c:\Users\AbdeslamHannouni\Desktop\chat_bot_saudi\newfrontsaudiagent
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables (optional)**
Create a `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 API Integration

The app integrates with the Saudi Legal Assistant backend API. See `backenddocs.md` for complete API documentation.

### Key Endpoints Used
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Chat**: `/api/chat/message`, `/api/chat/history`
- **Documents**: `/api/documents/history`, `/api/documents/:id`
- **Legal**: `/api/legal/analyze-document`

### API Configuration
The API base URL is configured in each slice:
```javascript
const API_URL = 'http://localhost:3001/api';
```

## 🌍 Multi-Language Support

The app supports:
- **English** (en): Default language
- **Arabic** (ar): RTL layout with full translation

### Switching Languages
- Click the globe icon (🌐) in the header
- Language preference is saved to localStorage
- RTL layout automatically applied for Arabic

### Adding Translations
Edit `src/locales/en.js` and `src/locales/ar.js`:
```javascript
export const en = {
  nav: {
    home: 'Home',
    // ... more translations
  }
};
```

## 🎯 Usage

### For Users

1. **Home Page**: Learn about the service
2. **Chat**: Start a conversation, upload documents for analysis
3. **Register/Login**: Create an account for personalized features
4. **Dashboard**: View your activity and statistics
5. **Documents**: Manage your uploaded documents

### For Developers

#### Redux State Management
```javascript
// Dispatch actions
dispatch(loginUser({ email, password }));
dispatch(sendMessage({ message, chatId, documentId }));
dispatch(getDocumentHistory(filters));

// Access state
const { user, isAuthenticated } = useSelector((state) => state.auth);
const { messages, sendingMessage } = useSelector((state) => state.chat);
```

#### Theme Switching
```javascript
const { theme } = useSelector((state) => state.ui);
dispatch(toggleTheme());
```

#### Protected Routes
```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: < 768px - Stacked layout, mobile menu
- **Tablet**: 768px - 1024px - Adjusted layout
- **Desktop**: > 1024px - Full sidebar and multi-column layout

## 🎨 Styling

### Tailwind CSS Utilities
Custom classes defined in `index.css`:
- `.gradient-saudi` - Saudi green gradient
- `.gradient-gold` - Gold gradient
- `.text-gradient` - Gradient text
- `.glass` - Glassmorphism effect
- `.card` - Card component
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.input` - Input field

### Dark Mode
Automatically switches based on system preference, with manual override:
```javascript
// Toggle theme
dispatch(toggleTheme());

// Set specific theme
dispatch(setTheme('dark'));
```

## 🔒 Security

- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes requiring authentication
- CORS enabled on backend
- File upload validation (size, type)

## 🚧 Future Enhancements

- [ ] Real-time chat with WebSockets
- [ ] Document collaboration features
- [ ] Advanced document search and filtering
- [ ] Export chat history as PDF
- [ ] Voice input for chat
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] Multi-file upload
- [ ] Document version control

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Contributors

- Development Team

## 📞 Support

For support, please contact:
- Email: support@saudilegalassistant.com
- GitHub: [Project Repository]

---

**Built with ❤️ for Saudi Arabia 🇸🇦**


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
