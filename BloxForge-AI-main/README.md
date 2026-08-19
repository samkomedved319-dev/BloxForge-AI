# BloxForge AI

**NVIDIA-powered AI coding companion for Roblox developers.**

BloxForge AI generates, debugs, and refactors Luau code using frontier language models — and ships with a free Roblox Studio connector plugin that drops generated code straight into your game.

## Features

- 🤖 **5 NVIDIA NIM models** — Qwen2.5 Coder, DeepSeek R1, Nemotron 70B, Llama 3.3 70B, Llama 3.1 405B
- 🎭 **5 AI personalities** — Swift, Thoughtful, Balanced, Flagship, Nemotron
- 📝 **5 response modes** — Normal, Concise, Explain, Refactor, Debug
- 🔌 **Roblox Studio connector** — sync selected scripts as context, insert code with one click
- 🔐 **Roblox OAuth2 sign-in** — secure app-permissions flow, no passwords stored
- 🛡️ **Beta mode** — admin approval required for new users
- 👤 **User dashboard** — stats, recent sessions, usage tracking
- ⚙️ **Admin dashboard** — manage users, approve beta access, add custom API keys
- 📖 **Full documentation** — built-in docs site at `/#docs`

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM (SQLite)
- **Auth:** NextAuth.js + Roblox OAuth2
- **AI:** NVIDIA NIM API (OpenAI-compatible) + z-ai-web-dev-sdk fallback
- **Animation:** Framer Motion

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A Roblox account
- (Optional) An NVIDIA API key from [build.nvidia.com](https://build.nvidia.com)

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values. At minimum:
- `NEXTAUTH_SECRET` — generate with `openssl rand -hex 32`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — for the initial admin account
- `ADMIN_EMAILS` — comma-separated list of admin emails

### 3. Set up the database

```bash
bun run db:push
```

### 4. Seed the admin account

```bash
bun run scripts/seed-admin.ts
```

### 5. Start the dev server

```bash
bun run dev
```

Open `http://localhost:3000` in your browser.

## Roblox OAuth2 Setup (optional but recommended)

For secure "Sign in with Roblox" using app permissions:

1. Go to [create.roblox.com/credentials](https://create.roblox.com/credentials)
2. Register a new OAuth2 application
3. Set the redirect URI to `https://your-domain.com/api/auth/roblox/oauth/callback`
4. Select scopes: `openid` and `profile`
5. Copy the Client ID and Client Secret into your `.env`:
   ```
   ROBLOX_CLIENT_ID=your_client_id
   ROBLOX_CLIENT_SECRET=your_client_secret
   ROBLOX_REDIRECT_URI=https://your-domain.com/api/auth/roblox/oauth/callback
   ```
6. Restart the server

A full step-by-step guide with copy-paste values is available in the app at `/#oauth-setup`.

Without OAuth configured, the app falls back to manual profile-code verification (users add a one-time code to their Roblox profile description).

## Roblox Studio Plugin

1. Download `BloxForgeAI.lua` from the app's Plugin page (`/#plugin`)
2. Move it to your Studio Plugins folder:
   - **Windows:** `%localappdata%\Roblox\Plugins`
   - **macOS:** `~/Documents/Roblox/Plugins`
3. Restart Roblox Studio
4. Open the BloxForge toolbar button, paste your server URL + pairing code, click Connect

See the [Studio Plugin docs](/#docs) for details.

## Custom API Keys (admins)

Admins can add any OpenAI-compatible API key (NVIDIA, OpenAI, OpenRouter, Groq, Together, etc.) in the admin dashboard → API Keys tab. The app fetches available models from the provider and lets you pick which one to use.

## Documentation

Full documentation is built into the app at `/#docs`, covering:
- Getting started guide
- Web app usage
- Studio plugin installation
- Connector architecture
- Roblox OAuth2 setup
- Admin dashboard
- Custom API keys
- API reference
- Privacy policy & terms of service
- FAQ

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (port 3000) |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run scripts/seed-admin.ts` | Create/promote admin account |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (chat, auth, admin, studio, etc.)
│   ├── page.tsx            # Main page (hash-based routing)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles + theme
├── components/
│   ├── bloxforge/          # BloxForge components
│   └── ui/                 # shadcn/ui components
└── lib/                    # Shared libraries (ai, auth, db, models, etc.)

public/
└── plugin/
    └── BloxForgeAI.lua     # Roblox Studio plugin

prisma/
└── schema.prisma           # Database schema

scripts/
└── seed-admin.ts           # Admin account seeder
```

## License

MIT — see [LICENSE](./LICENSE).

## Disclaimer

BloxForge AI is an independent project and is not affiliated with, endorsed by, or sponsored by Roblox Corporation. "Roblox" is a trademark of Roblox Corporation.
