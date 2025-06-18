import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';
import cors from 'cors';

admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');

const allowedOrigins = [
  'http://localhost:4200',
  'https://preview.doseninja.com',
  'https://dose-ninja-final.web.app', // Replace with your Firebase Hosting URL
  'https://dose-ninja-final.firebaseapp.com', // Replace with your Firebase Hosting URL
];

const corsHandler = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin '${origin}' was not in allowedOrigins and was rejected.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 204,
});

export const createCheckoutSession = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    cpu: 1,
    secrets: [STRIPE_SECRET_KEY],
  },
  (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== 'POST') {
        response.status(405).json({
          error: {
            status: 'METHOD_NOT_ALLOWED',
            message: 'Method Not Allowed. Only POST requests are accepted.',
          },
        });
        return;
      }

      if (!request.headers.authorization || !request.headers.authorization.startsWith('Bearer ')) {
        console.error('[AUTH_ERROR]', 'No Firebase ID token was passed as a Bearer token.');
        response.status(401).json({
          error: {
            status: 'UNAUTHENTICATED',
            message: 'No Firebase ID token was passed as a Bearer token in the Authorization header.',
          },
        });
        return;
      }

      const idToken = request.headers.authorization.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('[AUTH_SUCCESS]', 'Successfully authenticated user:', decodedToken.uid);
      } catch (error) {
        console.error('[AUTH_ERROR]', 'Error verifying Firebase ID token:', error);
        response.status(401).json({
          error: {
            status: 'UNAUTHENTICATED',
            message: 'Error verifying Firebase ID token.',
            details: (error as Error).message,
          },
        });
        return;
      }

      const { email, billingPeriod } = request.body.data || {};

      if (!email || !billingPeriod) {
        response.status(400).json({
          error: {
            status: 'INVALID_ARGUMENT',
            message: 'Missing email or billing period in request.body.data',
          },
        });
        return;
      }

      try {
        const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
          apiVersion: '2022-11-15' as any,
        });

        const priceId =
          billingPeriod === 'yearly'
            ? 'price_1RU8jmCof4voLRAtkOoBPzYa'
            : 'price_1RU8iTCof4voLRAtVCWWJugK';

        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer_email: email,
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: 'https://preview.doseninja.com/upgrade-success', // Replace with your Firebase Hosting URL
          cancel_url: 'https://preview.doseninja.com/upgrade-cancel', // Replace with your Firebase Hosting URL
        });

        response.json({ data: { url: session.url } });
      } catch (err) {
        response.status(500).json({
          error: {
            status: 'INTERNAL',
            message: 'Unable to create checkout session.',
            details: (err as Error).message,
          },
        });
      }
    });
  }
);