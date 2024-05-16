'use client';

import { ConnectButton, ConnectEmbed, MediaRenderer, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { chain } from "./chain";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../utils/contracts";
import { useState } from "react";

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
      </div>
    </div>
  );
}
