import Link from 'next/link'

const FEATURE_CARDS = [
  {
    icon: '⚡',
    title: 'Stacks',
    description: 'Save your perfect setup — main track, layers, volumes — as one reusable stack. Load it in one click.',
  },
  {
    icon: '⏱',
    title: 'Sessions',
    description: 'Run timed sessions with 15, 30, 45, or 60-minute countdowns. Auto-fade at the end.',
  },
  {
    icon: '🎚',
    title: 'Smart Volumes',
    description: 'Control the main track and all subliminal layers independently. Group or individual control.',
  },
  {
    icon: '🔗',
    title: 'Share',
    description: 'Share your stack with anyone via a single link — no account required for free shares.',
  },
]

const SOCIAL_CHIPS = ['Focus', 'Sleep', 'Gym', 'Confidence', 'Creativity', 'Calm']

const FAQ = [
  {
    q: "Why can't I hear the video?",
    a: "Browsers block autoplay with sound by default. Click \"Start Session\" after the page loads, and make sure your volume sliders are above zero.",
  },
  {
    q: 'Why does my video show an error?',
    a: "Some YouTube videos don't allow embedding on third-party sites. If you see a playback error, the video owner has disabled this. Try a different video URL.",
  },
  {
    q: 'Are subliminals medical advice?',
    a: 'No. Vibly is an audio layering tool. Nothing on this platform constitutes medical, psychological, or therapeutic advice. Use responsibly.',
  },
  {
    q: 'How do local stacks work?',
    a: 'Local stacks are saved in your browser storage — no account needed. They stay on your device until you clear browser data. Sign up for cloud sync.',
  },
]

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
        {/* Animated blur blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-purple-700/20 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-3xl animate-fade-in">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-600/30 bg-brand-600/10 px-4 py-1.5 text-sm text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            Now in early access
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Play the vibe.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Layer the message.
            </span>
          </h1>

          <p className="mb-10 text-lg text-gray-400 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Vibly lets you keep your favorite YouTube music as the main track while running subliminal or ambient layers quietly underneath — saved as one-click sessions.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/player"
              className="rounded-xl bg-brand-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-600 transition-colors"
            >
              Start a session →
            </Link>
            <Link
              href="/auth"
              className="rounded-xl border border-surface-border bg-surface-raised px-7 py-3.5 text-base font-medium text-white hover:bg-surface-hover transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Social proof chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {SOCIAL_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-surface-border bg-surface-raised px-3 py-1 text-sm text-gray-400"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Everything you need to build your vibe
          </h2>
          <p className="mt-3 text-gray-400">Designed for focus, sleep, and subliminal routines.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-surface-border bg-surface-raised p-6 hover:border-brand-600/40 transition-colors"
            >
              <div className="mb-4 text-3xl">{card.icon}</div>
              <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-t border-surface-border bg-surface-raised py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-12 text-2xl font-bold text-white sm:text-3xl">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '1', title: 'Paste your main track', desc: 'Drop any YouTube URL as your main music or audio.' },
              { step: '2', title: 'Add your layers', desc: 'Stack subliminals, rain sounds, or any YouTube audio underneath at any volume.' },
              { step: '3', title: 'Start your session', desc: 'Hit play, set a timer, and lock in. Save as a Stack to reuse anytime.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-white">Common questions</h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-surface-border bg-surface-raised"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium text-white marker:hidden list-none">
                {item.q}
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="border-t border-surface-border py-20 text-center">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Ready to layer your vibe?</h2>
          <p className="mb-8 text-gray-400">Free to use. No account required to start.</p>
          <Link
            href="/player"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Open the Player →
          </Link>
        </div>
      </section>
    </div>
  )
}
