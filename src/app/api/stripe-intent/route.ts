import { NextResponse } from "next/server";
import Stripe from "stripe";

const {STRIPE_SECRET_KEY} = process.env;

export async function POST(req:Request) {
    if(!STRIPE_SECRET_KEY){
        throw new Error('Stripe secrect key not found')
    }

    const {buyerWalletAddress} = await req.json();
    if(!buyerWalletAddress) throw new Error('Buyer wallet address not found');

    const stripe = new Stripe(
        process.env.STRIPE_SECRET_KEY as string,
        {
            apiVersion: "2024-04-10"
        }
    );

    const paymentIntent = await stripe.paymentIntents.create({
        amount: 10_00,
        currency: "usd",
        description: "Example NFT delivered with thirweb engine",
        payment_method_types: ["card"],
        metadata: {buyerWalletAddress},
    });

    return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
    })
}