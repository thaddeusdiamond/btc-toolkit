'use client';

import * as bitcoin from 'bitcoinjs-lib';

import { UNISAT_WALLET, HIRO_WALLET, XVERSE_WALLET, ORDINALS_TYPE, PAYMENT_TYPE, getWalletAddress, signPsbt } from "../../utils/wallets.js";

const API_BASE = 'https://api-mainnet.magiceden.io/v2';
const ORD_BUYING_PATH = 'ord/btc/psbt/buying';

const INSCRIPTIONS = [
]

async function getBuyingDataFromME(paymentAddress, receiveAddress, inscription) {
  const buyingUrlParameters = {
    buyerAddress: paymentAddress,
    buyerTokenReceiveAddress: receiveAddress,
    tokenId: inscription.split(':')[0],
    price: inscription.split(':')[1],
  };
  const buyingUrlParametersStr = new URLSearchParams(buyingUrlParameters).toString();
  console.log(`${API_BASE}/${ORD_BUYING_PATH}?${buyingUrlParametersStr}`);
  const buyingResp = await fetch(`${API_BASE}/${ORD_BUYING_PATH}?${buyingUrlParametersStr}`);
  console.log(buyingResp);
  if (buyingResp.status !== 200) {
    throw buyingResp.statusText;
  }

  const buyingData = await buyingResp.json();
  return buyingData;
}

async function sendForTxn(walletProvider, inscriptions) {
  try {
    const paymentAddress = await getWalletAddress(walletProvider, PAYMENT_TYPE);
    const ordinalsAddress = await getWalletAddress(walletProvider, ORDINALS_TYPE);

    const buyingData = [];
    for (const inscription of inscriptions) {
      const inscriptionBuyingData = await getBuyingDataFromME(paymentAddress, ordinalsAddress, inscription);
      const marketPsbt = bitcoin.Psbt.fromBase64(inscriptionBuyingData.unsignedBuyingPSBTBase64);
      buyingData.push(inscriptionBuyingData);
    }

    const psbtReq = await fetch(`/api/sweep/magiceden`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentAddress: paymentAddress,
        receiveAddress: ordinalsAddress,
        buyingData: buyingData
      })
    });
    if (psbtReq.status !== 200) {
      throw psbtReq.statusText;
    }

    const psbtData = await psbtReq.json();
    console.log(JSON.stringify(psbtData));

    const txResult = await signPsbt(walletProvider, psbtData.psbt);
    console.log('PSBT Signed:');
    console.log(txResult.toUpperCase());

    const txId = await window.unisat.pushPsbt(txResult);
    console.log(`TX ID: ${txId}`);
  } catch (err) {
    // TODO: Not enough funds comes back from ME here
    console.log(err);
  }
}

export default function Sweep() {

  return (
    <div>
      <a onClick={() => sendForTxn(UNISAT_WALLET, INSCRIPTIONS)}>
        Unisat
      </a>
      <a onClick={() => sendForTxn(HIRO_WALLET, INSCRIPTIONS)}>
        Hiro
      </a>
    </div>
  )

}
