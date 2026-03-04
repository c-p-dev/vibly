You are a senior full-stack engineer. Build a production-ready MVP for “Vibly”, a modern web app that lets users play one main YouTube track (lofi/music) and layer multiple YouTube videos underneath at lower volume (subliminals/ambience). Users can save these as reusable “Stacks” and run timed “Sessions”.

IMPORTANT: Payments must be MOCKED FIRST (no Stripe integration initially). Implement a complete paywall architecture with mock entitlements and a clean switch to real Stripe later, so development can proceed in parallel with payment setup.

TECH STACK
- Next.js 14+ App Router, TypeScript
- Tailwind CSS
- Zustand (or Redux Toolkit) for client state
- Supabase (Auth + Postgres + RLS) for user accounts and cloud stacks
- YouTube IFrame Player API for playback control
- Payment system: MOCKED in MVP, later Stripe Checkout + webhooks

CORE PRODUCT POSITIONING
- Value prop: “Play the vibe you love. Layer subliminals underneath.”
- Product is a workflow tool (stacks, sessions, routines) — NOT a “pay to watch embedded YouTube videos” product.

MVP REQUIREMENTS

1) LANDING PAGE (catchy, modern)
Create a high-quality landing page at / with:
- Hero section:
  - Headline (big): “Play the vibe. Layer the message.”
  - Subheadline: “Vibly lets you keep your favorite YouTube music as the main track while running subliminal/ambient layers quietly underneath—saved as one-click sessions.”
  - Primary CTA: “Start a session” -> /player
  - Secondary CTA: “Sign in” -> /auth
- Social proof placeholders (chips): “Focus”, “Sleep”, “Gym”, “Confidence”
- Feature cards (3–4):
  - “Stacks” (save your setup)
  - “Sessions” (timers + fade out)
  - “Smart volumes” (main vs layers)
  - “Share” (share a stack link)
- Animated/modern feel using subtle gradients, blur blobs, and tasteful motion (CSS-only or lightweight).
- FAQ section: autoplay restrictions, “not medical advice”, embedding limitations.
- Footer with links: Privacy, Terms (placeholder), Contact (placeholder).
Make it modern, minimal, premium. Mobile-first.

2) PLAYER (/player)
- Users paste a Main YouTube URL and multiple Layer URLs.
- Extract videoId from each URL robustly.
- Embed each player using YouTube IFrame Player API.
- Controls:
  - Start/Pause/Stop All
  - Per-layer volume slider
  - Mute/solo per layer
  - Group volume sliders: Main + Layers
  - Timer: 15/30/45/60 + custom minutes
  - Fade out (available to paid tiers only)
- Important autoplay rule: only start playback after user clicks “Start Session”.
- Handle embed failures gracefully per-video (some videos can’t be embedded).

3) STACKS (local + cloud)
A Stack config includes: name, main videoId + volume, layers array with id/videoId/volume/muted, group volumes, timer settings.
- Local stacks: stored in localStorage for all users.
- Cloud stacks: stored in Supabase for signed-in users with paid entitlement.
- Share links:
  - Local share link: encode compressed JSON stack config into URL query (no backend required).
  - Pro share page: /s/[slug] stores stack in DB + short slug (paywalled feature).

4) SUPABASE
Auth:
- Email magic link (simple).
Database tables:
- profiles(id uuid pk -> auth.users, display_name, created_at)
- entitlements(user_id uuid pk -> auth.users, plan text, status text, current_period_end timestamptz, updated_at)
- stacks(id uuid pk, user_id uuid, name text, description text, is_public boolean, public_slug text unique, config jsonb, created_at, updated_at)

RLS POLICIES
- profiles: user can select/update own row
- entitlements: user can read own row; NO client writes (only server/admin)
- stacks: owner can CRUD own stacks; anyone can read stacks where is_public=true

Deliver:
- Provide Supabase SQL migrations for tables + RLS policies (copy/paste-ready).
- Provide .env.example with required env vars.
- Provide a small Supabase client wrapper.

5) PAYWALL + MOCK PAYMENTS FIRST
Do NOT integrate Stripe in MVP. Instead implement:
- A PaywallModal component that appears when user tries Pro-only features.
- A mock billing page /account/billing:
  - Buttons: “Activate Starter (Mock)”, “Activate Pro (Mock)”, “Reset to Free (Mock)”
  - These should update entitlement state in a way that mimics real production:
    - In development, allow local override (localStorage) AND optionally write to Supabase entitlements (if user is signed in) via a protected server route.
- A feature gating utility:
  - canUseCloudStacks(plan)
  - canUseFadeOut(plan)
  - canUsePublicShare(plan)
- Implementation detail:
  - Create a unified hook: useEntitlements()
  - Priority: local override (dev only) -> Supabase entitlements -> default free.
  - Add env flag NEXT_PUBLIC_PAYMENTS_MODE = "mock" | "stripe".
  - In mock mode, all upgrade actions are local and do not require Stripe.
  - In stripe mode, the same UI should call real checkout endpoints (which can be stubbed with TODOs).

Mock tiers:
- Free: player + limited local stacks (e.g. 5)
- Starter: unlimited local stacks + fade-out timer
- Pro: cloud stacks + public share pages + routines placeholders

6) STRIPE INTEGRATION STUBS (for later)
Create empty/stubbed endpoints with clear TODOs but do not implement fully:
- /api/payments/checkout (returns 501 in mock mode or a fake URL)
- /api/payments/webhook (TODO)
- /api/payments/portal (TODO)
The UI should already be wired to call these endpoints when NEXT_PUBLIC_PAYMENTS_MODE="stripe".

7) ROUTES / PAGES
- / (Landing)
- /player (Main player)
- /stacks (local stacks + cloud stacks list; cloud section paywalled)
- /s/[slug] public stack page (paywalled creation; viewing allowed if public)
- /auth (sign in)
- /account (profile + link to billing)
- /account/billing (mock upgrades + later Stripe integration)

8) QUALITY REQUIREMENTS
- Responsive UI, modern aesthetic, good typography spacing, smooth interactions.
- Strong empty states (no stacks yet, invalid URL, embed blocked).
- Accessibility basics: labels, keyboard focus, aria for sliders where reasonable.
- Use a clean folder structure:
  - app/ routes
  - components/
  - lib/ (youtube, supabase, entitlements, share encoding)
- Include tests only if lightweight; focus on shipping MVP.

DELIVERABLES
- Full code for the Next.js app
- Supabase SQL migrations for schema + RLS
- Documentation:
  - Setup steps
  - How mock payments work
  - How to switch to Stripe mode later
  - Known limitations (autoplay restrictions, embed restrictions)

Focus on correctness and a shippable MVP. Build the paywall architecture so Stripe can be added later with minimal changes.