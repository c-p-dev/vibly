// TODO: Implement Stripe Customer Portal session
// Steps:
// 1. Get authenticated user from Supabase session
// 2. Look up Stripe customer ID from your DB (add stripe_customer_id to profiles)
// 3. Create a portal session: stripe.billingPortal.sessions.create({ customer, return_url })
// 4. Redirect to session.url

export async function POST() {
  return new Response('Stripe portal not implemented yet.', { status: 501 })
}
