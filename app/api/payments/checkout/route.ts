import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 50000,  // PHP 500.00 in centavos
  pro: 100000,     // PHP 1,000.00 in centavos
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Vibly Starter',
  pro: 'Vibly Pro',
}

export async function POST(request: Request) {
  const mode = process.env.NEXT_PUBLIC_PAYMENTS_MODE ?? 'mock'

  if (mode === 'mock') {
    return NextResponse.json(
      { error: 'Payments are in mock mode. Use the billing page at /account/billing to simulate upgrades.' },
      { status: 501 }
    )
  }

  if (mode === 'stripe') {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 })
  }

  if (mode === 'paymongo') {
    // Require authentication — we need user_id for the webhook to activate the plan
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

    const { plan } = await request.json() as { plan: 'starter' | 'pro' }
    if (!plan || !PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const auth = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const response = await fetch('https://api.paymongo.com/v1/links', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: PLAN_AMOUNTS[plan],
            currency: 'PHP',
            description: PLAN_LABELS[plan],
            remarks: `plan:${plan},user_id:${user.id}`,
            redirect: {
              success: `${appUrl}/account/billing?upgraded=${plan}`,
              failed: `${appUrl}/account/billing?error=payment_failed`,
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('PayMongo error:', err)
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
    }

    const data = await response.json()
    const checkoutUrl = data.data?.attributes?.checkout_url
    if (!checkoutUrl) return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })

    return NextResponse.json({ url: checkoutUrl })
  }

  return NextResponse.json({ error: 'Payment provider not configured' }, { status: 501 })
}
