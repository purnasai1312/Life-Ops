# LifeOps

LifeOps is an Expo React Native wellness app.

## Running locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
npx expo start --clear
```

## Supabase

Set these environment variables in `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the SQL in `supabase/migrations` in your Supabase SQL Editor before testing auth and onboarding.
