# Admin Panel Setup

This project now includes a separate admin panel application for managing tournaments.

## Architecture

The project consists of two separate applications sharing the same Supabase backend:

1. **Public Site** (`/`) - Main user-facing application where players can view and register for tournaments
2. **Admin Panel** (`/admin.html`) - Separate admin application for creating and managing tournaments

Both applications share:
- The same Supabase database
- Authentication system
- Tournament data in real-time

## Running the Applications

### Development Mode

**Public Site:**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Admin Panel:**
```bash
npm run dev:admin
```
Access at: `http://localhost:5173/admin.html`

### Production Build

Build both applications:
```bash
npm run build
```

This creates optimized builds for both:
- `dist/index.html` - Public site
- `dist/admin.html` - Admin panel

### Preview Production Build

**Public Site:**
```bash
npm run preview
```

**Admin Panel:**
```bash
npm run preview:admin
```

## Admin Panel Features

The admin panel provides full tournament management capabilities:

- **Create Tournaments** - Add new tournaments with all details
- **Edit Tournaments** - Update existing tournament information
- **Delete Tournaments** - Remove tournaments from the system
- **View All Tournaments** - See complete tournament list with status indicators
- **Real-time Sync** - Changes appear instantly on the public site

## Authentication

Both applications use the same authentication system. Admins must sign in with their credentials to access the admin panel.

## Database

All tournament data is stored in the shared Supabase database with Row Level Security (RLS) enabled:

- Public users can view all tournaments
- Authenticated users can create/edit/delete tournaments they created
- Changes sync in real-time between both applications

## Deployment

When deploying, ensure both HTML files are accessible:

- Main site: Deploy `dist/index.html` as your primary entry point
- Admin panel: Deploy `dist/admin.html` at `/admin.html` or a separate subdomain

Both applications share the same environment variables for Supabase connection.
