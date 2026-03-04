import { NextResponse } from 'next/server'

export async function POST() {
  if (process.env.NEXT_PUBLIC_PAYMENTS_MODE !== 'stripe') {
    return NextResponse.json(
      {
        error:
          'Payments are in mock mode. Use the billing page at /account/billing to simulate upgrades.',
      },
      { status: 501 }
    )
  }

  // TODO: Implement Stripe Checkout
  // const { priceId } = await request.json()
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   mode: 'subscription',
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?success=true`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
  // })
  // return NextResponse.json({ url: session.url })

  return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 })
}
