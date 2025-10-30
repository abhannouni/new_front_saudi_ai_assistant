# 🚀 Quick Start Guide - Saudi Legal Assistant

## Instant Setup (3 Steps)

### 1️⃣ Ensure Backend is Running
```bash
# Backend should be running on http://localhost:3001
```

### 2️⃣ Start Frontend
```bash
cd c:\Users\AbdeslamHannouni\Desktop\chat_bot_saudi\newfrontsaudiagent
npm run dev
```

### 3️⃣ Open Browser
```
http://localhost:5173
```

## 🎯 Quick Tour

### Try These Features First:

1. **Home Page** (`/`)
   - Click on the landing page
   - See the features
   - Click "New Chat" button

2. **Chat Interface** (`/chat`)
   - Type a legal question in Arabic or English
   - Upload a document using the 📎 button
   - Watch AI analyze and respond

3. **Register** (`/register`)
   - Create an account
   - Get access to dashboard and documents

4. **Dashboard** (`/dashboard`) 🔒
   - View your statistics
   - Quick access to features

5. **Documents** (`/documents`) 🔒
   - View all uploaded documents
   - Toggle favorites with ⭐
   - Download with ⬇️ button

## ⚙️ Quick Settings

### Change Language
- Click the 🌐 globe icon in header
- Switches between English and Arabic
- Layout automatically adjusts to RTL for Arabic

### Toggle Theme
- Click the 🌙/☀️ icon in header
- Switches between dark and light mode
- Preference saved automatically

### Collapse Sidebar
- Click the ☰ menu icon
- Sidebar slides in/out
- More screen space for content

## 🔑 Test Accounts

Use these for testing (if backend has seed data):
```
Email: test@example.com
Password: password123
```

Or register a new account via `/register`

## 📱 Mobile Testing

### View on Phone
1. Get your computer's IP address
2. Start with: `npm run dev -- --host`
3. Open: `http://YOUR_IP:5173` on phone

## 🎨 UI Components Quick Reference

### Buttons
```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
```

### Cards
```jsx
<div className="card p-6">Card Content</div>
```

### Inputs
```jsx
<input className="input" placeholder="Enter text..." />
```

### Gradients
```jsx
<div className="gradient-saudi">Saudi Green Gradient</div>
<div className="gradient-gold">Gold Gradient</div>
<h1 className="text-gradient">Gradient Text</h1>
```

## 🐛 Quick Troubleshooting

### Issue: Blank page
**Solution**: Check browser console (F12) for errors

### Issue: API errors
**Solution**: Ensure backend is running on port 3001

### Issue: Translations not showing
**Solution**: Refresh page, clear browser cache

### Issue: Dark mode not working
**Solution**: Check if 'dark' class is on `<html>` element

### Issue: Login not working
**Solution**: Check network tab, verify backend URL

## 📋 Common Tasks

### Add New Translation
1. Edit `src/locales/en.js`
2. Edit `src/locales/ar.js`
3. Use: `{t('your.new.key')}`

### Add New Route
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `Sidebar.jsx`

### Add New Redux Action
1. Edit appropriate slice in `src/store/slices/`
2. Create async thunk with `createAsyncThunk`
3. Add reducer case
4. Use with `dispatch(yourAction())`

## 🎓 Learn More

- **Full Documentation**: See `README.md`
- **API Reference**: See `backenddocs.md`
- **Development Guide**: See `DEVELOPMENT.md`
- **Project Status**: See `COMPLETION.md`

## 💡 Pro Tips

1. **Use DevTools**: 
   - Redux DevTools Extension for state debugging
   - React DevTools for component inspection

2. **Hot Reload**: 
   - Save files to see instant changes
   - No need to refresh browser

3. **Network Tab**: 
   - Monitor API calls in browser DevTools
   - Check request/response data

4. **Console Logs**: 
   - Check browser console for errors
   - Redux actions are logged

5. **Mobile Testing**: 
   - Chrome DevTools has device emulation
   - Test responsive design easily

## 🚀 Deploy Checklist

Before deploying to production:
- [ ] Update API URL in environment variables
- [ ] Build production bundle: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Verify all features work
- [ ] Check mobile responsiveness
- [ ] Test in multiple browsers
- [ ] Configure CORS on backend
- [ ] Set up SSL/HTTPS
- [ ] Add error tracking (Sentry, etc.)
- [ ] Enable analytics (optional)

## 📞 Get Help

- Check documentation files in project root
- Review code comments in components
- Check browser console for errors
- Verify backend API is responding

---

**Happy Coding! 🎉**

The application is fully functional and ready to use.
For detailed information, see the complete documentation files.
