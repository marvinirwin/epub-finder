// const stripe = require("stripe")(process.env.STRIPE_SKEY);
import StripeConstructor, {Stripe} from 'stripe';
const stripe = new StripeConstructor(process.env.STRIPE_SKEY, {
    apiVersion: '2020-08-27'
});

export const createSubscription = async (req, res, next) => {
    const customer = await stripe.customers.create({
        source: req.body.stripeToken,
        email: req.body.customerEmail
    });
    const sub = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
            {
                plan: req.planId
            }
        ]
    });
}

// Fetch the Checkout Session to display the JSON result on the success page
// checkout-session
export const checkoutSession = async (req, res) => {
    const {sessionId} = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send(session);
}
// create-checkout-session
export const createCheckoutSession = async (req, res) => {
    const domainURL = process.env.DOMAIN;
    const {priceId} = req.body;

    /**
     * Create new Checkout Session for the order
     * Other optional params include:
     * [billing_address_collection] - to display billing address details on the page
     * [customer] - if you have an existing Stripe Customer ID
     * [customer_email] - lets you prefill the email input in the form
     * For full details see https://stripe.com/docs/api/checkout/sessions/create
     */
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
            success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainURL}/canceled.html`,
        });

        res.send({
            sessionId: session.id,
        });
    } catch (e) {
        res.status(400);
        return res.send({
            error: {
                message: e.message,
            }
        });
    }
}

export const webHook = async (req, res) => {
    let signature = req.headers["stripe-signature"];
    try {
        const event: Stripe.Event = stripe.webhooks.constructEvent(
            req.rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        switch(event.type) {
            // Do I care about this  event?  Maybe it will also send me a suscription updated event
            case "payment_succeeded":
                 const checkoutComplete: Stripe.Invoice = event.data as Stripe.Invoice;
                 // Add a payment record
                break;

            case 'customer.subscription.updated':
                const subscription = event.data as Stripe.Subscription;

                break;
        }
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
    }

    res.sendStatus(200);
}
