# Tixie Frontend (React)

The frontend has been refactored from vanilla HTML/JS to React with Vite.

## Tech Stack

- **React 18** with hooks
- **React Router v6** for client-side routing
- **Vite** for build tooling
- **Bootstrap 5** for styling
- **React Quill** for rich text editing
- **Bootstrap Icons**

## Project Structure

```
frontend/
├── index.html          # Entry HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # App bootstrap
    ├── index.css       # Global styles + tree-view CSS
    ├── App.jsx         # Routes and layout
    ├── api/
    │   └── api.js      # API client
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── AdminNavbar.jsx
    │   ├── CustomerNavbar.jsx
    │   ├── RichTextEditor.jsx
    │   └── TreeSelectModal.jsx
    ├── layouts/
    │   ├── AdminLayout.jsx
    │   └── CustomerLayout.jsx
    └── pages/
        ├── Login.jsx
        ├── admin/      # Admin portal pages
        └── customer/   # Customer portal pages
```

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login (redirects to admin/customer based on role) |
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/properties` | Property library |
| `/admin/location-types` | Location types |
| `/admin/locations` | Locations |
| `/admin/configuration-item-types` | CI types |
| `/admin/configuration-items` | Configuration items |
| `/` | Customer dashboard |
| `/incidents` | My incidents |
| `/incidents/new` | New incident |
| `/incidents/:uuid` | Incident detail |
| `/profile` | User profile |

## Development

```bash
npm install
npm run dev
```

Runs at http://localhost:5173. API requests to `/api` are proxied to http://localhost:8080.

## Build

```bash
npm run build
```

Output in `dist/`. Serve with any static file server; ensure `/api` is proxied to the backend.

## Legacy HTML

The original vanilla HTML/JS frontend has been moved to `legacy/` for reference.
