# 🔧 Fixing localStorage Data Persistence

## Problem: Data disappears when browser closes

If your data is not persisting after closing the browser, here are the solutions:

## ✅ Solution 1: Use a Local Server (RECOMMENDED)

**The `file://` protocol can cause localStorage issues in some browsers.**

### Option A: Using Python (Easiest)
```bash
# Navigate to your project folder
cd /Users/youssefbenmoussa/Desktop/javaScript_Projet

# Python 3
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000` in your browser

### Option B: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run server
cd /Users/youssefbenmoussa/Desktop/javaScript_Projet
http-server -p 8000
```

Then open: `http://localhost:8000` in your browser

### Option C: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## ✅ Solution 2: Check Browser Settings

Some browsers clear localStorage on close. Check:

1. **Chrome/Edge:**
   - Settings → Privacy and Security → Site Settings → Cookies and site data
   - Make sure "Clear cookies and site data when you quit" is OFF

2. **Firefox:**
   - Settings → Privacy & Security → History
   - Make sure "Clear history when Firefox closes" doesn't include "Site Preferences"

3. **Safari:**
   - Preferences → Privacy
   - Make sure "Prevent cross-site tracking" doesn't block localStorage

## ✅ Solution 3: Verify localStorage is Working

Open browser console (F12) and run:

```javascript
// Test if localStorage works
localStorage.setItem('test', 'hello');
console.log('Test value:', localStorage.getItem('test'));

// Check all your data
console.log('Students:', localStorage.getItem('students'));
console.log('Modules:', localStorage.getItem('modules'));
console.log('Grades:', localStorage.getItem('grades'));
console.log('Absences:', localStorage.getItem('absences'));
console.log('Users:', localStorage.getItem('users'));
```

## ✅ Solution 4: Check Storage Quota

If storage is full, data won't save:

```javascript
// Check storage usage
function getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return (total / 1024).toFixed(2) + ' KB';
}
console.log('Storage used:', getStorageSize());
```

## 🐛 Debugging

If data still doesn't persist:

1. **Open Browser DevTools (F12)**
2. **Go to Application/Storage tab**
3. **Check Local Storage**
4. **Look for your domain** (should be `localhost:8000` or `file://`)
5. **Verify data is there after saving**

## 📝 Notes

- localStorage is **per-domain**, so `file://` and `localhost` are different
- localStorage has a **5-10MB limit** per domain
- Some browsers block localStorage in **private/incognito mode**
- **Always use a local server** for development (recommended)

