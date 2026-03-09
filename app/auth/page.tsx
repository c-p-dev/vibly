'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Mode = 'signin' | 'signup' | 'magic'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  function resetForm() {
    setError('')
    setPassword('')
    setMagicSent(false)
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (err) { setError(err.message); setGoogleLoading(false) }
    // On success, Supabase redirects to Google — no need to setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    if (mode === 'magic') {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setLoading(false)
      if (err) setError(err.message)
      else setMagicSent(true)
      return
    }

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setLoading(false)
      if (err) { setError(err.message); return }
      // Auto sign-in after signup
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInErr) { setError(signInErr.message); return }
      router.push('/player')
      return
    }

    // mode === 'signin'
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/player')
  }

  const isMagic = mode === 'magic'
  const isSignUp = mode === 'signup'

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-surface-border bg-surface-raised p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-white text-xl">
              <span>🎵</span>
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                Vibly
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              {isSignUp ? 'Create an account' : 'Sign in to your account'}
            </p>
          </div>

          {magicSent ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 border border-brand-600/30">
                  <svg className="h-7 w-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="font-semibold text-white text-lg">Check your email</h2>
              <p className="mt-2 text-sm text-gray-400">
                We sent a magic link to <span className="text-white">{email}</span>.
              </p>
              <button
                onClick={() => { setMagicSent(false); setMode('signin') }}
                className="mt-6 text-sm text-brand-400 hover:text-brand-300"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-surface-border bg-surface px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-surface-raised disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-border" />
                <span className="text-xs text-gray-600">or</span>
                <div className="h-px flex-1 bg-surface-border" />
              </div>

              {/* Mode tabs */}
              {!isMagic && (
                <div className="mb-6 flex rounded-lg border border-surface-border p-1">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); resetForm() }}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${mode === 'signin' ? 'bg-surface-hover text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); resetForm() }}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-surface-hover text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Sign up
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {!isMagic && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                      required
                      minLength={6}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  disabled={loading || !email.trim() || (!isMagic && !password)}
                >
                  {loading
                    ? 'Please wait…'
                    : isMagic
                    ? 'Send magic link'
                    : isSignUp
                    ? 'Create account'
                    : 'Sign in'}
                </Button>

                {/* Magic link toggle */}
                <div className="text-center">
                  {isMagic ? (
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); resetForm() }}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Back to password sign in
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setMode('magic'); resetForm() }}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Sign in with magic link instead
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-gray-500 hover:text-gray-300">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="text-gray-500 hover:text-gray-300">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
