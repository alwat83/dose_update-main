import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';

admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');

export const createCheckoutSession = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    cpu: 1,
    secrets: [STRIPE_SECRET_KEY], // ✅ must be included here
  },
  async (request) => {
    const { email, billingPeriod } = request.data;
    console.log('createCheckoutSession invoked with:', { email, billingPeriod });

    if (!email || !billingPeriod) {
      throw new Error('Missing email or billing period');
    }

    // ✅ move this INSIDE the function
    const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
      apiVersion: '2022-11-15' as any,
    });

    const priceId =
      billingPeriod === 'yearly'
        ? 'price_1RU8jmCof4voLRAtkOoBPzYa'
        : 'price_1RU8iTCof4voLRAtVCWWJugK';

    try {
      console.log('Calling stripe.checkout.sessions.create with:', { email, priceId });
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: 'https://preview.doseninja.com/upgrade?status=success',
        cancel_url: 'https://preview.doseninja.com/upgrade?status=cancel',
      });

      console.log('Stripe session created successfully:', session.url);
      return { url: session.url };
    } catch (err) {
      console.error('Stripe Checkout Error:', err);
      throw new Error('Unable to create checkout session.');
    }
  }
);
