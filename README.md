# VeriBuild - AI-Powered Construction Management

## Environment Setup

### Supabase Configuration

1. Copy `.env.local.example` to `.env`:
   ```bash
   cp .env.local.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_USE_MOCK_API=false
   ```

3. The application will automatically rebuild and use Supabase

### Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
- `VITE_USE_MOCK_API` - Set to `false` to use real Supabase, `true` for mock data

**Note**: In the Leap environment, use `.env` (not `.env.local`) for environment variables as they are committed and used during the build process.

## Development

The app uses Supabase for:
- Authentication (email/password and OAuth)
- PostgreSQL database with Row Level Security
- File storage for drawings, documents, and receipts
- Real-time subscriptions (optional)

See `/docs` for detailed documentation on:
- `SUPABASE_AUTH.md` - Authentication setup
- `SUPABASE_LIVE_CRUD.md` - Database operations and API usage
