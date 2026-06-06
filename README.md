# Rice Mill Management Software

A full-stack web application for managing rice mill operations, starting with the **Bank Guarantee** module. Built as a monorepo with Django backend and React frontend.

## Tech Stack

### Backend
- **Django 4.2+** — Web framework
- **Django REST Framework** — API layer
- **django-cors-headers** — Cross-origin support
- **django-filter** — Queryset filtering
- **openpyxl** — Excel import/export
- **SQLite** — Development database (swappable to PostgreSQL)

### Frontend
- **React 18** — UI framework
- **TypeScript** — Type safety (strict mode)
- **Vite** — Build tool & dev server
- **Tailwind CSS v3** — Utility-first CSS
- **Axios** — HTTP client
- **React Router v6** — Client-side routing

## Project Structure

```
RiceMillSoftware/
├── backend/
│   ├── config/             # Django settings, URLs, WSGI/ASGI
│   ├── apps/
│   │   ├── core/           # Shared base models, utilities
│   │   ├── authentication/ # Login, register, logout (token auth)
│   │   └── bank_guarantee/ # BG models, views, serializers, import/export
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client, typed API functions
│   │   ├── components/     # Shared UI components (RMInput, RMButton, etc.)
│   │   ├── context/        # React Context (Auth, BankGuarantee)
│   │   ├── layouts/        # AppLayout, Sidebar, TopBar
│   │   ├── pages/          # Auth, Dashboard, Bank Guarantee
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # formatDate, computedFields, unitConversion
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample data (creates dropdown options + 10 BG records)
python manage.py seed_bg

# Create admin superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Import/Export Excel (.xlsx, .csv) | ✅ |
| 2 | Filtering by all fields | ✅ |
| 3 | Year-based BG listing | ✅ |
| 4 | Year selector for list | ✅ |
| 5 | Expiry notification (30 days) | ✅ |
| 6 | Dropdown management (add banks, branches, etc.) | ✅ |
| 7 | Unit toggle (kg ↔ quintal) | ✅ |
| 8 | Minimal, professional theme | ✅ |
| 9 | Full detail in data table (all 17 columns) | ✅ |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create new user |
| POST | `/api/auth/login/` | Login, get token |
| POST | `/api/auth/logout/` | Invalidate token |
| GET | `/api/auth/user/` | Get current user |

### Bank Guarantee
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bank-guarantee/` | List (with filters) |
| POST | `/api/bank-guarantee/` | Create record |
| GET | `/api/bank-guarantee/<id>/` | Get record |
| PUT | `/api/bank-guarantee/<id>/` | Update record |
| DELETE | `/api/bank-guarantee/<id>/` | Delete record |
| POST | `/api/bank-guarantee/import/` | Bulk import from file |
| GET | `/api/bank-guarantee/export/` | Export to Excel |
| GET | `/api/bank-guarantee/expiring-soon/` | Records expiring in 30 days |

### Dropdown Options
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dropdowns/?category=X` | List options for category |
| POST | `/api/dropdowns/` | Add new option |
| DELETE | `/api/dropdowns/<id>/` | Remove option |

## Computed Fields

These fields are calculated automatically (never entered manually):

| Field | Formula |
|-------|---------|
| **No. of Days** | `expiry_date - issue_date` (in days) |
| **PDC** | `(2/3) × Amount of BG` (rounded to 2 decimal places) |
| **Total Amount** | `Amount of BG + PDC` |
| **Quantity** | `Total Amount ÷ 2500` (in kg; toggleable to quintal) |

## Design

- **Theme**: Minimal, professional ERP aesthetic
- **Accent**: Deep navy (`#1a2744`)
- **Fonts**: Inter (UI), JetBrains Mono (numbers/data)
- **No gradients, no glow effects** — clean and focused

## Development Notes

- CORS is configured to allow `localhost:5173` (Vite dev server)
- Authentication uses DRF Token Authentication
- All API responses are paginated (default 25 per page)
- The `year` filter defaults to the current year
- Import supports flexible header matching (e.g., "Bank Name" = "bank_name" = "BankName")

## Future Modules (Planned)

- Procurement
- Inventory
- Sales
- Accounts
- Reports

---

Built for rice mill operations management.
