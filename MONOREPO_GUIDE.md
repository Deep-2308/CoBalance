# CoBalance Monorepo Setup Guide

## 🚀 Quick Start

### 1. Initial Setup (First Time Only)

Open terminal in **`C:\CoBalance_SAASapp`** (the ROOT folder):

```bash
# Install concurrently in root
npm install

# Install dependencies in both frontend and backend
npm run install:all
```

### 2. Run Development Servers

```bash
# From ROOT folder - runs both frontend and backend
npm run dev
```

**What you'll see:**

```
[backend] 🚀 CoBalance API running on port 5000
[frontend] ➜  Local:   http://localhost:5173/
```

### 3. Stop Servers

Press **`Ctrl + C`** in the terminal - this will stop BOTH servers.

---

## 📋 All Available Commands

Run these from the **ROOT** folder: `C:\CoBalance_SAASapp`

### Development

```bash
# Start both frontend and backend
npm run dev

# Start only backend (if needed)
npm run dev:backend

# Start only frontend (if needed)
npm run dev:frontend
```

### Installation

```bash
# Install dependencies in all folders (root, backend, frontend)
npm run install:all

# Install only in root
npm install

# Install only in backend
cd backend && npm install

# Install only in frontend
cd frontend && npm install
```

### Clean & Fresh Start

```bash
# Clean all node_modules folders
npm run clean

# Clean everything and reinstall (if things are broken)
npm run fresh-start
```

### Production Build

```bash
# Build both frontend and backend for production
npm run build

# Start production servers
npm run start
```

---

## 🔧 How It Works

### The Root `package.json`

Located at: `C:\CoBalance_SAASapp\package.json`

**Key Script Breakdown:**

```json
"dev": "concurrently --kill-others-on-fail ..."
```

**What each flag does:**

- `--kill-others-on-fail` - If backend crashes, frontend stops too (and vice versa)
- `--prefix "[{name}]"` - Shows which server the log is from
- `--names "backend,frontend"` - Names for the log prefixes
- `--prefix-colors "cyan,magenta"` - Color-coded logs (backend=cyan, frontend=magenta)

### Windows-Specific Commands

The clean scripts use Windows commands:

```json
"clean:backend": "cd backend && if exist node_modules rmdir /s /q node_modules"
```

- `if exist` - Check if folder exists (Windows)
- `rmdir /s /q` - Remove directory silently (/s = recursive, /q = quiet)

---

## 🐛 Troubleshooting

### Problem: `concurrently: command not found`

**Solution:**

```bash
# Make sure you're in the ROOT folder
cd C:\CoBalance_SAASapp

# Install dependencies
npm install
```

### Problem: Ports already in use

**Error:** `Port 5000 is already in use`

**Solution:**

```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Problem: Frontend builds but backend doesn't start

**Check backend logs:**

- Look for `[backend]` prefixed lines in terminal
- Common issues:
  - Missing `.env` file
  - Database connection failed
  - Port 5000 busy

### Problem: `npm run dev` does nothing

**Solution:**

```bash
# Clean and reinstall everything
npm run fresh-start

# If that doesn't work, manual cleanup:
rmdir /s /q node_modules
cd backend && rmdir /s /q node_modules && cd ..
cd frontend && rmdir /s /q node_modules && cd ..
npm run install:all
```

### Problem: Changes not reflecting

**Solution:**

```bash
# Stop servers (Ctrl+C)
# Clear cache and restart
npm run dev
```

---

## 📁 Folder Structure

```
C:\CoBalance_SAASapp\
├── package.json          ← ROOT (you just created this)
├── node_modules/         ← Only has 'concurrently'
├── backend/
│   ├── package.json      ← Backend dependencies
│   ├── node_modules/     ← Backend dependencies
│   └── src/
│       └── server.js
└── frontend/
    ├── package.json      ← Frontend dependencies
    ├── node_modules/     ← Frontend dependencies
    └── src/
        └── main.jsx
```

---

## 🎯 Best Practices

### 1. Always run from ROOT

```bash
# ✅ CORRECT - from C:\CoBalance_SAASapp
npm run dev

# ❌ WRONG - from C:\CoBalance_SAASapp\backend
npm run dev  # This won't work!
```

### 2. Adding new npm packages

```bash
# For backend packages
cd backend
npm install express-rate-limit
cd ..

# For frontend packages
cd frontend
npm install axios
cd ..

# For root (dev tools only)
npm install --save-dev eslint
```

### 3. Git Setup

Add to your `.gitignore`:

```
# Root
/node_modules

# Backend
/backend/node_modules
/backend/.env

# Frontend
/frontend/node_modules
/frontend/.env
/frontend/dist
```

---

## 🚀 Pro Tips

### Tip 1: Color-Coded Logs

The terminal output is color-coded:

- **Cyan** `[backend]` - Backend server logs
- **Magenta** `[frontend]` - Frontend dev server logs

### Tip 2: Keep One Terminal Open

You only need ONE terminal window now! Both servers run together.

### Tip 3: Debugging Specific Server

If you need to debug just one:

```bash
# Debug backend only
npm run dev:backend

# Debug frontend only
npm run dev:frontend
```

### Tip 4: Fresh Start After Errors

If things break after updating dependencies:

```bash
npm run fresh-start
```

This cleans **everything** and reinstalls from scratch.

---

## ⚙️ Advanced Configuration

### Modify Concurrently Behavior

Edit `package.json` in ROOT:

**Don't kill all servers if one fails:**

```json
"dev": "concurrently --prefix \"[{name}]\" ..."
```

(Remove `--kill-others-on-fail`)

**Add timestamps to logs:**

```json
"dev": "concurrently --timings --kill-others-on-fail ..."
```

**Run them sequentially (backend first, then frontend):**

```json
"dev": "npm run dev:backend && npm run dev:frontend"
```

---

## 📚 Reference

### Concurrently Options

| Flag                             | Purpose                     |
| -------------------------------- | --------------------------- |
| `--kill-others-on-fail`          | Stop all if one fails       |
| `--prefix "[{name}]"`            | Add prefix to logs          |
| `--names "a,b"`                  | Name each process           |
| `--prefix-colors "cyan,magenta"` | Color the prefixes          |
| `--raw`                          | Show raw output (no colors) |

### npm Scripts Cheatsheet

```bash
npm run dev           # Development (both servers)
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
npm run install:all   # Install all dependencies
npm run clean         # Remove all node_modules
npm run fresh-start   # Clean + reinstall
npm run build         # Production build
npm run start         # Production servers
```

---

## 🎓 Learning Resources

You're "vibe coding" - here's what you learned:

1. ✅ **Monorepo pattern** - One root, multiple projects
2. ✅ **Concurrently** - Run multiple npm scripts
3. ✅ **npm workspaces** (lightweight version)
4. ✅ **Windows scripting** - Conditional commands

**Next Level:**

- Learn about **npm workspaces** (more advanced monorepo)
- Try **Turborepo** or **Nx** (enterprise monorepo tools)
- Set up **Husky** (pre-commit hooks)

---

## ✅ Checklist

Before you start:

- [ ] ROOT `package.json` created at `C:\CoBalance_SAASapp\package.json`
- [ ] Ran `npm install` in ROOT folder
- [ ] Ran `npm run install:all` to install all dependencies
- [ ] Both frontend and backend have their own `package.json`
- [ ] Backend has `"dev": "node --watch src/server.js"` script
- [ ] Frontend has `"dev": "vite"` script

**You're ready!** Run `npm run dev` from ROOT. 🚀
