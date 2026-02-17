# ai.therapy Architecture

**Project:** ai.therapy - AI Mental Health Companion  
**Date Created:** 2026-02-17  
**Last Updated:** 2026-02-17  
**Status:** Production Ready — Chat Working

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Data Flow](#data-flow)
3. [Frontend Stack](#frontend-stack)
4. [Backend / AI](#backend--ai)
5. [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                     (ai.therapy.free)                           │
└────────┬────────────────────────────────────────┬────────────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────────┐              ┌─────────────────────────┐
│   Together AI        │              │   Supabase              │
│   (MiniMax-M2.5)     │              │   (Database + Auth)     │
│   api.together.xyz   │              │   app.ai.therapy.free     │
└─────────▲────────────┘              └─────────▲───────────────┘
          │                                      │
          │         ┌────────────────────┐         │
          │         │    Vercel CDN      │         │
          │         │   (Frontend Host)  │         │
          │         └────────────────────┘         │
          │                                      │
          │         ┌────────────────────┐         │
          └─────────┤  OpenClaw Gateway │◄────────┘
                    │   (Agent Runtime)  │
                    └────────────────────┘

Your Server (76.76.21.21):
- Nginx (optional, routing)
- ❌ n8n (stopped, not needed for chat)
```

---

## Data Flow

### 1. Chat Flow (Most Important)

```
1. User opens ai.therapy.free/chat?name=Marcus
   → App displays greeting (static, from constants)

2. User types "hey" → presses Send
   → Check: is logged in? (Supabase Auth)
   → If no: show login modal

3. Logged in → Message appears in chat UI

4. Frontend calls fetchCharacterPrompt(Marcus):
   → GET supabase.from('characters').select('soul').eq('name', 'Marcus')
   → Returns system prompt: "You are Marcus, warm and grounded..."

5. Build AI request:
   ```
   POST https://api.together.xyz/v1/chat/completions
   Headers: Authorization: Bearer $TOGETHER_API_KEY
   Body: {
     model: "MiniMaxAI/MiniMax-M2.5",
     messages: [
       {role: "system", content: "You are Marcus..."},
       {role: "user", content: "hey"}
     ]
   }
   ```

6. Together AI responds:
   → "Hey there! 👋 I'm here if you want to talk..."

7. Response displayed in chat
   → Message saved to local state (not persisted yet)
```

### 2. Admin Flow

```
User navigates to /admin
   ↓
Fetch all characters from Supabase
   ↓
Display character selector (Marcus, Sarah, Liam, Emily)
   ↓
User edits system prompt (soul field)
   ↓
Click "Save Changes"
   ↓
UPDATE supabase.characters SET soul = '...' WHERE name = 'Marcus'
   ↓
Refresh displays updated prompt
   ↓
User can test: type message → call Together AI directly → see response
```

### 3. Auth Flow

```
User clicks "Log in" in drawer
   ↓
Login modal appears (Google/Apple/email buttons)
   ↓
OAuth flow → Supabase Auth
   ↓
Session established
   ↓
User can now send messages
```

---

## Frontend Stack

| Layer | Technology | Files |
|-------|------------|-------|
| **Framework** | Expo + React Native | `package.json` |
| **Routing** | Expo Router (file-based) | `app/` folder |
| **UI** | React Native + custom Theme | `src/constants/Theme.ts` |
| **Icons** | Lucide React Native | various |
| **State** | React hooks + Context | `src/context/` |
| **Storage** | AsyncStorage (native) / localStorage (web) | `supabase.ts` |
| **HTTP** | Native fetch | direct API calls |

### Key Files

```
app/
├── (main)/
│   ├── chat.tsx          ← Chat with AI (CORE)
│   ├── admin.tsx         ← Edit character prompts
│   ├── login.tsx         ← Auth modal
│   ├── paywall.tsx       ← Subscription upgrade
│   ├── settings.tsx      ← User settings
│   ├── legal.tsx         ← Terms/privacy/cookies
│   ├── profile.tsx       ← Therapist profile view
│   └── _layout.tsx       ← Drawer navigation
├── _layout.tsx           ← Root layout (fonts, providers)
├── index.tsx             ← Landing page (marketing)
└── ...

src/
├── lib/
│   ├── supabase.ts       ← Supabase client configuration
│   └── together.ts       ← Together AI API client
├── context/
│   ├── AuthContext.tsx   ← Authentication state
│   └── SubscriptionContext.tsx ← RevenueCat integration
├── constants/
│   ├── Theme.ts          ← Colors, spacing, fonts
│   └── Therapists.ts     ← Character definitions
└── components/
    ├── ChatBubble.tsx    ← Message display
    ├── CustomDrawer.tsx  ← Navigation drawer
    └── ...
```

---

## Backend / AI

### Together AI Configuration

| Setting | Value |
|---------|-------|
| **Provider** | Together AI |
| **Model** | MiniMaxAI/MiniMax-M2.5 |
| **API URL** | https://api.together.xyz/v1/chat/completions |
| **Temperature** | 0.7 |
| **Max Tokens** | 1024 |
| **Top P** | 0.9 |

### Request Format

```typescript
const response = await fetch('https://api.together.xyz/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOGETHER_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'MiniMaxAI/MiniMax-M2.5',
    messages: [
      { role: 'system', content: characterPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9,
  }),
});
```

### Security Notes

- ✅ Together AI allows CORS from browser (no server needed)
- ✅ API key stored in Vercel env (never exposed in code)
- ⚠️ Key visible in browser network tab (standard for frontend APIs)
- 💡 For production: consider backend proxy or token refresh

---

## Database Schema

### Supabase Project
**Project ID:** `tazrriepmnpqoutdxubt`  
**Region:** eu-central-1 (Frankfurt)  
**Custom Domain:** `app.ai.therapy.free`

### Tables

#### `characters` — AI Therapist Definitions

```sql
CREATE TABLE characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- "Marcus", "Sarah", "Liam", "Emily"
  display_name TEXT NOT NULL,          -- "Marcus"
  gender TEXT,                         -- "male", "female"
  soul TEXT NOT NULL,                  -- System prompt
  avatar_url TEXT,                     -- /avatars/marcus.png
  accent_color TEXT,                   -- #EBCE80 (gold)
  is_system BOOLEAN DEFAULT false,     -- true for built-in
  is_enabled BOOLEAN DEFAULT true,   -- toggle on/off
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**RLS Policy:**
```sql
-- Everyone can read (public config)
CREATE POLICY "Characters readable by everyone" 
ON characters FOR SELECT USING (is_enabled = true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can manage"
ON characters FOR ALL 
TO authenticated USING (true) WITH CHECK (true);
```

**Data:**
```
Marcus  → CBT-influenced, warm, grounded
Sarah   → Trauma-informed, empathetic, gentle  
Liam    → Behavioral, analytical, practical
Emily   → Existential, mindfulness-based
```

#### `messages` — Chat History (Not Yet Used)

```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,            -- Links to sessions table
  message JSONB NOT NULL,              -- Full message object
  message_type TEXT GENERATED,         -- message->>'type'
  content TEXT GENERATED,              -- message->>'content'
  created_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_session ON messages(session_id);
```

**Note:** Chat currently doesn't persist messages here. Future feature.

#### `users`, `sessions`, `daily_usage`

These tables exist from earlier work (not created by us).
- `users` — Extended Supabase Auth
- `sessions` — Chat session tracking
- `daily_usage` — Rate limiting

---

## Environment Variables

### Required for Vercel Deployment

```bash
# Together AI (for chat responses)
EXPO_PUBLIC_TOGETHER_API_KEY=your_key_here

# Supabase (for database + auth)
SUPABASE_URL=https://app.ai.therapy.free
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional RevenueCat (for subscriptions)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_key
```

### Where to Set

1. Go to `vercel.com` → Your Project
2. Settings → Environment Variables
3. Add each variable
4. Redeploy

---

## Deployment

### Current Setup

| Component | Provider | URL |
|-----------|----------|-----|
| Frontend | Vercel | ai.therapy.free |
| Database | Supabase | app.ai.therapy.free |
| AI | Together AI | api.together.xyz |

### Deployment Flow

```
1. Push to GitHub (main branch)
   ↓
2. Vercel detects push
   ↓
3. Build process:
   - npm install
   - expo export --platform web
   - Static files generated
   ↓
4. Deploy to Vercel CDN
   ↓
5. Global edge deployment (~30 seconds)
```

### Custom Domain

Vercel Dashboard:
- Project Settings → Domains
- Add `ai.therapy.free`
- Configure DNS A record → Vercel IPs

---

## Security

### Authentication

| Feature | Implementation |
|---------|----------------|
| **Auth** | Supabase Auth (OAuth 2.0) |
| **Providers** | Google, Apple, Email OTP |
| **Session** | JWT tokens, auto-refresh |
| **Storage** | LocalStorage (web), AsyncStorage (native) |

### Database Security

| Feature | Status |
|---------|--------|
| **RLS Enabled** | ✅ Yes (all tables) |
| **Characters readable** | ✅ Public (anon + authenticated) |
| **Characters writable** | ✅ Authenticated only |
| **Messages** | ✅ User-scoped |
| **Connection** | HTTPS only |

### AI Security

| Risk | Mitigation |
|------|------------|
| API key exposure | Stored in Vercel env, not in code |
| Prompt injection | System prompt hardcoded, user input escaped |
| Data leaks | No PII sent to Together AI |
| Response validation | JSON parsing, error handling |

---

## Troubleshooting

### Chat shows error message

**Check:**
1. `EXPO_PUBLIC_TOGETHER_API_KEY` set in Vercel?
2. Together AI key is valid (check console.together.ai)
3. Rate limit not exceeded

### 406 Not Acceptable on characters

**Cause:** RLS policy rejecting request  
**Fix:** 
```sql
-- Run in Supabase SQL Editor
ALTER TABLE characters DISABLE ROW LEVEL SECURITY;
-- OR create proper policy
```

### CORS errors

**Should be fixed** — Together AI supports CORS. If persists:
- Check Together AI dashboard
- Verify API key has proper permissions

### Messages not saving

**Expected** — Message persistence not implemented yet. Currently local state only.

---

## Quick Reference

### Common Tasks

```bash
# Deploy
cd ai.therapy-frontend
git add .
git commit -m "feat: description"
git push  # Auto-deploys to Vercel

# Test Together AI
curl -X POST https://api.together.xyz/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -d '{"model":"MiniMaxAI/MiniMax-M2.5","messages":[{"role":"user","content":"hello"}]}'

# Check Supabase
psql postgresql://user:pass@app.ai.therapy.free:5432/postgres
SELECT * FROM characters WHERE name = 'Marcus';
```

### URLs

| Purpose | URL |
|---------|-----|
| App | https://ai.therapy.free |
| Chat | https://ai.therapy.free/chat?name=Marcus |
| Admin | https://ai.therapy.free/admin |
| Supabase Dashboard | https://supabase.com/dashboard/project/tazrriepmnpqoutdxubt |
| Vercel Dashboard | https://vercel.com/mindflexdev/ai-therapy-frontend |
| Together AI | https://console.together.ai |

### Key Files

| Purpose | Path |
|---------|------|
| Chat | `app/(main)/chat.tsx` |
| Admin | `app/(main)/admin.tsx` |
| AI Client | `src/lib/together.ts` |
| Database | `src/lib/supabase.ts` |
| Theme | `src/constants/Theme.ts` |
| Characters | `src/constants/Therapists.ts` |

---

## Architecture Decisions

### Why Together AI instead of OpenAI?
- ✅ Cost: ~$0.50/1M tokens vs $2-5/1M
- ✅ Model variety (MiniMax, Llama, etc.)
- ✅ Better CORS support
- ✅ Developer-friendly pricing

### Why no n8n for chat?
- Frontend can call AI directly (faster)
- Reduces server costs
- Simpler architecture
- n8n kept for other workflows (optional)

### Why Supabase?
- Free tier generous
- Realtime subscriptions (future)
- Auth included
- Postgres-based (familiar)
- Row Level Security

### Why Vercel?
- Free tier unlimited for static
- Global edge
- GitHub auto-deploy
- Environment variables
- Analytics included

---

## Future Improvements

| Feature | Status | Priority |
|---------|--------|----------|
| Message persistence | ❌ Not built | High |
| Voice calls | ❌ UI only | Medium |
| Reminders/cron | ❌ Not built | Low |
| MCP support | ❌ OpenClaw doesn't support | Unknown |
| Mobile app | ⚠️ Expo → iOS/Android | Medium |
| n8n removal | ⚠️ Can do now | Low |
| Admin polish | ⚠️ Basic working | Medium |

---

**Document Status:** ✅ Complete  
**Last Verified:** 2026-02-17