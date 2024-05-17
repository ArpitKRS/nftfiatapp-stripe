import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY as string,
    {
        apiVersion: "2024-04-10"
    }
);

const {
    WEBHOOK_SECRECT_KEY,
    ENGINE_URL,
    ENGINE_ACCESS_TOKEN,
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    BACKEND_WALLET_ADDRESS,
    CHAIN_ID
} = process.env;

export async function POST(req:NextRequest) {
    if(!WEBHOOK_SECRECT_KEY) throw 'Did you forgot to add a ".env.local" file?';

    const body = await req.text();
    const sig = headers().get("stripe-signature") as string;
    if(!sig) throw 'No signature provided';
    const event = stripe.webhooks.constructEvent(
        body,
        sig,
        WEBHOOK_SECRECT_KEY
    );
    switch(event.type){
        case "charge.succeeded":
            await handleChargeSucceeded(event.data.object as Stripe.Charge);
            break;
    }
    return NextResponse.json({message: "success"});
}

const handleChargeSucceeded = async (charge: Stripe.Charge) => {
    if(
        !ENGINE_URL ||
        !ENGINE_ACCESS_TOKEN ||
        !NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
        !BACKEND_WALLET_ADDRESS
    ) throw 'Server misconfigured. Did you forget to add a ".env.local" file?';

    const {buyerWalletAddress} = charge.metadata;
    if(!buyerWalletAddress) throw 'No buyer wallet address found';
    try {
        const tx = await fetch(
            `${ENGINE_URL}/contract/${CHAIN_ID}/${NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}/erc721/mint-to`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${ENGINE_ACCESS_TOKEN}`,
                    "x-backend-wallet-address": BACKEND_WALLET_ADDRESS,
                },
                body: JSON.stringify({
                    "receiver": buyerWalletAddress,
                    "metadata": {
                        "name": "Hirotaka Nifuji",
                        "description": "Main Lead",
                        "image": "ipfs://QmciR3WLJsf2BgzTSjbG5zCxsrEQ8PqsHK7WGWsDSNo46/nft.png", //Paste your own NFT URL
                    }
                }),
            }
        )
        if (!tx.ok) throw 'Failed to mint the NFT';
    } catch (error) {
        console.error(error)
    }
}