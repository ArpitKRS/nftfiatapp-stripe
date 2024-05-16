'use client';

import { ConnectButton, ConnectEmbed, MediaRenderer, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { chain } from "./chain";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../utils/contracts";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function Home() {
  const account = useActiveAccount();

  const [clientSecret, setClientSecret] = useState<string>("")

  const {data: contractMetadata} = useReadContract(
    getContractMetadata,
    {
      contract: contract
    }
  );

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY){
    throw 'Did you forgot to add a ".env.local" file';
  }

  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

  if(!account){
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}>
        <h1 style={{marginBottom: "20px"}}>Stripe + Engine</h1>
        <ConnectEmbed client={client} chain={chain}/>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        border: "1px solid #333",
        borderRadius: "8px",
      }}>
        <ConnectButton client={client} chain={chain}/>
        {contractMetadata && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            marginTop: "20px",
          }}>
            <MediaRenderer client={client} src={contractMetadata.image} style={{borderRadius: "8px"}}/>
          </div>
        )}
        {!clientSecret ? (
          <button
            style={{
              marginTop: "20px",
              padding: "1rem 2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "royalblue",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Buy With Credit Card
          </button>
        ) : (
          <Elements
            options={{
              clientSecret: clientSecret,
              appearance: {theme: "night"}
            }}
            stripe={stripe}
          >
            <CreditCardForm/>
          </Elements>
        )}
      </div>
    </div>
  );
}

const CreditCardForm = () => {
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false)

  return (
    <>
      <PaymentElement/>
      <button
        disabled={isLoading || isComplete || !stripe || !elements}
        style={{
          marginTop: "20px",
          padding: "1rem 2rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "royalblue",
          width: "100%",
          cursor: "pointer",
        }}
      >
        {
          isComplete
          ? "Payment Complete"
          : isLoading
          ? "Payment processing..."
          : "Pay Now"
        }
      </button>
    </>
  )
};