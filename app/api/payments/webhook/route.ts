// TODO: Implement Stripe webhook handler
// Steps:
// 1. Verify stripe-signature header using stripe.webhooks.constructEvent()
// 2. Handle checkout.session.completed:
//    - Get user from session.client_reference_id or metadata
//    - Upsert entitlements via service role client
// 3. Handle customer.subscription.updated:
//    - Update entitlements plan/status
// 4. Handle customer.subscription.deleted:
//    - Set entitlements plan to 'free'

export async function POST() {
  return new Response('Stripe webhooks not implemented yet.', { status: 501 })
}
