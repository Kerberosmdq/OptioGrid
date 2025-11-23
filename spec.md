# OptioGrid - Technical Specification

## 1. Overview
OptioGrid is a web application designed to help users compare products by creating customizable templates. It extracts metadata from URLs, presents items in a visual grid, and uses AI to provide recommendations and comparative analysis.

## 2. Architecture
The system follows a modern client-server architecture using a lightweight backend for proxying requests and handling AI logic, and a robust frontend for the interactive UI.

```mermaid
graph TD
    User[User] -->|HTTPS| Frontend[Frontend (React/Vite)]
    Frontend -->|Auth & Data| Supabase[Supabase (Auth & DB)]
    Frontend -->|Metadata & AI| Backend[Backend (Node.js/Express)]
    
    Backend -->|Scraping| TargetSites[Target Websites (MercadoLibre, etc.)]
    Backend -->|Inference| LLM[LLM API (OpenAI/DeepSeek)]
    
    subgraph "Data Layer"
        Supabase -->|PostgreSQL| DB[(Database)]
        Supabase -->|Storage| Storage[Image Storage]
    end
```

## 3. Database Schema (Supabase / PostgreSQL)

```sql
-- Users are handled by Supabase Auth (auth.users)
-- We create a public profile table if needed, but for MVP we link directly

create table public.templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users not null,
  name text not null,
  category text, -- 'vehicle', 'real_estate', 'electronics', 'other'
  fields jsonb default '[]'::jsonb, -- Custom fields definition
  is_archived boolean default false
);

create table public.items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  template_id uuid references public.templates not null,
  url text not null,
  title text,
  price numeric,
  currency text default 'USD',
  image_url text,
  description text,
  metadata jsonb default '{}'::jsonb, -- Extracted extra data (km, year, model)
  user_notes text
);

create table public.collaborators (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.templates not null,
  user_email text not null,
  role text check (role in ('editor', 'viewer')),
  unique(template_id, user_email)
);
```

## 4. API Specification (Backend)

### `POST /api/extract`
Extracts Open Graph and meta tags from a given URL.
**Request:**
```json
{ "url": "https://articulo.mercadolibre.com.ar/..." }
```
**Response:**
```json
{
  "title": "Toyota Hilux 2020",
  "price": 45000,
  "currency": "USD",
  "image": "https://...",
  "description": "...",
  "meta": { "year": "2020", "km": "50000" }
}
```

### `POST /api/recommend`
Analyzes a list of items and provides a recommendation.
**Request:**
```json
{
  "items": [
    { "id": "1", "title": "Item A", "price": 100, "metadata": {...} },
    { "id": "2", "title": "Item B", "price": 120, "metadata": {...} }
  ],
  "criteria": "Best value for money"
}
```
**Response:**
```json
{
  "recommendation_id": "1",
  "reasoning": "Item A offers better value...",
  "scores": { "1": 95, "2": 80 },
  "pros_cons": {
    "1": { "pros": ["Cheap"], "cons": ["Older model"] }
  }
}
```

## 5. Frontend Implementation
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State**: React Query (for server state) + Context API (for UI state)
- **Routing**: React Router DOM
- **Key Components**:
    - `GridCard`: Displays item image, title, price.
    - `ComparisonTable`: Renders selected items side-by-side.
    - `AddLinkModal`: Input for URL with preview.

## 6. Security & Deployment
- **Auth**: Supabase Auth (Google OAuth).
- **RLS**: Row Level Security enabled on all tables.
- **Deployment**:
    - Frontend -> Vercel
    - Backend -> Render / Vercel Serverless Functions
    - Database -> Supabase Free Tier
