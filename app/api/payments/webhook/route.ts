// PayMongo webhook handler
// Docs: https://developers.paymongo.com/docs/webhooks
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase-server'

/**
 * PayMongo signature format:
 *   Paymongo-Signature: t=<timestamp>,te=<test_sig>,li=<live_sig>
 * Signature = HMAC-SHA256(secret, "<timestamp>.<raw_body>")
 */
function verifyPayMongoSignature(payload: string, sigHeader: string, secret: string): boolean {
  const parts = Object.fromEntries(
    sigHeader.split(',').map((p) => p.split('=') as [string, string])
  )
  const timestamp = parts['t']
  // PayMongo sends 'te' for test keys and 'li' for live keys
  const receivedSig = parts['li'] ?? parts['te']
  if (!timestamp || !receivedSig) return false

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(receivedSig, 'hex'))
  } catch {
    return false
  }
}

/** Parse "plan:starter,user_id:abc123" from the remarks field */
function parseRemarks(remarks: string): { plan?: string; userId?: string } {
  const map = Object.fromEntries(
    remarks.split(',').map((kv) => kv.split(':') as [string, string])
  )
  return { plan: map['plan'], userId: map['user_id'] }
}

export async function POST(req: Request) {
  const mode = process.env.NEXT_PUBLIC_PAYMENTS_MODE
  if (!mode || mode === 'mock') return new Response(null, { status: 200 })

  const payload = await req.text()
  const sigHeader = req.headers.get('paymongo-signature') ?? ''
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET ?? ''

  if (!verifyPayMongoSignature(payload, sigHeader, secret)) {
    console.error('PayMongo webhook: invalid signature')
    return new Response('Invalid signature', { status: 400 })
  }

  let event: { type: string; data: { attributes: Record<string, unknown> } }
  try {
    event = JSON.parse(payload)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // link.payment.paid fires when a payment link is fully paid
  if (event.type === 'link.payment.paid' || event.type === 'payment.paid') {
    const attrs = event.data.attributes
    const remarks = (attrs.remarks as string) ?? ''
    const { plan, userId } = parseRemarks(remarks)

    if (userId && (plan === 'starter' || plan === 'pro')) {
      const service = createServiceRoleClient()
      await service.from('entitlements').upsert({
        user_id: userId,
        plan,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
    } else {
      console.warn('PayMongo webhook: could not extract user_id or plan from remarks:', remarks)
    }
  }

  return new Response(null, { status: 200 })
}
