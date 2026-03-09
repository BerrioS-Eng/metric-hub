# Metric Hub

Financial management dashboard for tracking income and expenses, visualizing trends, and generating reports.

## Features

- **Transaction management** — register income and expense transactions per user
- **Financial reports** — KPI summary cards, monthly bar chart, daily trend line, and top expense concepts donut chart
- **Dynamic period filter** — view data for the last 7, 14, 30, or 60 days
- **CSV export** — download transactions for the selected period
- **Role-based access** — `ADMIN` users see all transactions; `USER` sees only their own
- **Session auth** — email/password authentication via better-auth

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | better-auth |
| Charts | Recharts |
| Data fetching | SWR |

## Prerequisites

- Node.js >= 18
- PostgreSQL instance (local or remote)

## Local Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/BerrioS-Eng/metric-hub.git
cd metric-hub
npm install
```

### 2. Configure environment variables

Create a `.env` file at the project root:

```env
# PostgreSQL connection string
DATABASE_URL=

# better-auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Github provider
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET
```

### 3. Set up the database

```bash
# Apply migrations and generate the Prisma client
npx prisma migrate dev
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run commit` | Interactive conventional commit prompt |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── reports/       # Aggregated financial data endpoint
│   │   └── transactions/  # CRUD transactions endpoint
│   └── dashboard/         # Main dashboard page
├── components/
│   └── dashboard/
│       ├── reports/       # Reports module (charts, summary cards)
│       └── ...            # Transaction management components
├── lib/
│   ├── auth.ts            # better-auth configuration
│   ├── prisma.ts          # Prisma client instance
│   └── format.ts          # Shared formatters (currency, date)
└── generated/
    └── prisma/            # Auto-generated Prisma client
```

## Data Model

- **User** — name, email, role (`ADMIN` | `USER`)
- **Transaction** — concept, amount, date, type (`income` | `expense`), linked to a user
- **Session / Account / Verification** — managed by better-auth
