import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { defineSecret } from 'firebase-functions/params';
import cors from 'cors'; // Default import

admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');

const allowedOrigins = [
  'http://localhost:4200',
  'https://preview.doseninja.com',
  // TODO: Add your Firebase Hosting URL(s) here for deployed testing, e.g.,
  // 'https://your-project-id.web.app',
  // 'https://your-project-id.firebaseapp.com',
];

// Configure CORS: Use default import directly, and type parameters for origin function
const corsHandler = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin '${origin}' was not in allowedOrigins and was rejected.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 204 // Add this line
});

export const createCheckoutSession = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    cpu: 1,
    secrets: [STRIPE_SECRET_KEY],
  },
  (request, response) => {
    // Apply CORS middleware first
    corsHandler(request, response, async () => {
      // Ensure only POST requests are handled
      if (request.method !== 'POST') {
        response.status(405).json({
          error: {
            status: 'METHOD_NOT_ALLOWED',
            message: 'Method Not Allowed. Only POST requests are accepted.',
          },
        });
        return;
      }

      // Authentication Check
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
            details: (error as Error).message, // Cast to Error
          },
        });
        return;
      }

      // Extract data (compatible with httpsCallable's {data: ...} wrapper)
      const { email, billingPeriod } = request.body.data || {};

      console.log('[FUNCTIONS_LOG]', 'Invoking createCheckoutSession with data:', { email, billingPeriod });

      if (!email || !billingPeriod) {
        console.error('[FUNCTIONS_ERROR]', 'Missing email or billing period in request.body.data', { email, billingPeriod });
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

        // TODO: Replace with your actual price IDs from your Stripe account
        const priceId =
          billingPeriod === 'yearly'
            ? 'price_1RU8jmCof4voLRAtkOoBPzYa' // Yearly price ID
            : 'price_1RU8iTCof4voLRAtVCWWJugK'; // Monthly price ID

        console.log(`[STRIPE_CALL] Creating Stripe session with email: ${email}, priceId: ${priceId}`);

        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer_email: email,
          line_items: [{ price: priceId, quantity: 1 }],
          // TODO: Replace with your actual success/cancel URLs
          success_url: 'https://preview.doseninja.com/upgrade?status=success',
          cancel_url: 'https://preview.doseninja.com/upgrade?status=cancel',
        });

        console.log('[STRIPE_SUCCESS]', 'Stripe session created successfully. URL:', session.url);
        response.json({ data: { url: session.url } });
      } catch (err) {
        console.error('[STRIPE_ERROR]', 'Stripe Checkout Error:', err);
        response.status(500).json({
          error: {
            status: 'INTERNAL',
            message: 'Unable to create checkout session.',
            details: (err as Error).message, // Cast to Error
          },
        });
      }
    });
  }
);