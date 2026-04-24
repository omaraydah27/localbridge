import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_PRICES = {
    Starter: 1200,
    Pro: 1900,
    Premium: 4900,
};

router.post('/create-subscription-checkout', async (req, res) => {
    try {
        const { planName, userId, userEmail } = req.body;

        if (!PLAN_PRICES[planName]) {
            return res.status(400).json({ error: 'Invalid plan selected.' });
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            mode: 'subscription',
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        recurring: {
                            interval: 'month',
                        },
                        product_data: {
                            name: `${planName} Plan`,
                            description: 'Bridge subscription plan',
                        },
                        unit_amount: PLAN_PRICES[planName],
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: 'subscription',
                userId,
                planName,
            },
            return_url: `${process.env.CLIENT_URL}/pricing?session_id={CHECKOUT_SESSION_ID}`,
        });

        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Subscription checkout error:', error);
        res.status(500).json({ error: 'Could not create subscription checkout.' });
    }
});

router.post('/create-booking-checkout', async (req, res) => {
    try {
        const {
            userId,
            userEmail,
            mentorId,
            mentorName,
            sessionType,
            scheduledDate,
            sessionPrice,
        } = req.body;

        const safePrice = Number(sessionPrice);

        if (!safePrice || safePrice <= 0) {
            return res.status(400).json({ error: 'Invalid mentor session price.' });
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            mode: 'payment',
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Session with ${mentorName}`,
                            description: `${sessionType} mentor booking`,
                        },
                        unit_amount: Math.round(safePrice * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: 'mentor_booking',
                userId,
                mentorId,
                mentorName,
                sessionType,
                scheduledDate,
                sessionPrice: String(safePrice),
            },
            return_url: `${process.env.CLIENT_URL}/mentors/${mentorId}?session_id={CHECKOUT_SESSION_ID}`,
        });

        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Booking checkout error:', error);
        res.status(500).json({ error: 'Could not create booking checkout.' });
    }
});

export default router;