'use server';

import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from "tiny-secp256k1";

import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';

import { getByteCount } from "../../../../utils/btc_fees.js";
import { getFeesFor } from "../../../../utils/mempool.js";

const DEFAULT_FEE_RATE = 'fastestFee';
const LOCKED_SATS = 10000;

const DEVELOPER_ADDRESS = 'ENTER_DEV_ADDR_HERE';
const DEVELOPER_FEE = 5000;

function addDeveloperFeesToPsbt(psbt, numNfts) {
  psbt.addOutput({
    address: DEVELOPER_ADDRESS,
    value: DEVELOPER_FEE * numNfts
  })
}

async function calculateTxFees(satsPerVByte) {
  // TODO: Compute bytecount from an actual txn
  const byteCount = getByteCount({'P2WPKH': 1}, {'P2WPKH': 1});
  const fee = byteCount * satsPerVByte;
  console.log(satsPerVByte, byteCount, fee);
}

function buildTaprootAddress(script) {
  const taprootAddr = bitcoin.payments.p2tr({ pubkey: script.slice(2) });
  return taprootAddr.toString();
}

function mergeIntoPsbt(psbt, marketPsbt, toSignInputs, paymentAddress, receiveAddress) {
  for (var inputIdx = 0; inputIdx < marketPsbt.inputCount; inputIdx++) {
    if (toSignInputs.includes(inputIdx)) {
      continue;
    }
    const marketInput = marketPsbt.txInputs[inputIdx];
    const marketWitnesses = marketPsbt.data.inputs[inputIdx];
    const txHash = marketInput.hash.reverse().toString('hex');
    console.log(`Adding input from ${txHash}#${marketInput.index} to transaction`);
    psbt.addInput({
      hash: txHash,
      index: marketInput.index,
      witnessUtxo: marketWitnesses.witnessUtxo,
      nonWitnessUtxo: marketWitnesses.nonWitnessUtxo
    });
  }

  for (const output of marketPsbt.txOutputs) {
    if (output.address === paymentAddress || output.address === receiveAddress) {
      continue;
    }
    const address = output.address ? output.address : buildTaprootAddress(output.script);
    console.log(`Adding payment of ${output.value} sats to ${address}`);
    psbt.addOutput({
      address: address,
      value: output.value
    });
  }

  psbt.addOutput({
    script: bitcoin.address.toOutputScript(receiveAddress),
    value: LOCKED_SATS
  })
}

function initializeRequest() {
  bitcoin.initEccLib(ecc);
}

export async function POST(req) {
  try {
    const sweepRequest = await req.json();
    const paymentAddress = sweepRequest.paymentAddress;
    const receiveAddress = sweepRequest.receiveAddress;
    const buyingData = sweepRequest.buyingData;
    if (!paymentAddress || !receiveAddress || !buyingData) {
      throw 'Payment address, receive address, and inscriptions are required fields';
    }

    initializeRequest();

    const feeRate = sweepRequest.feeRate ? sweepRequest.feeRate : DEFAULT_FEE_RATE
    const satsPerVByte = await getFeesFor(feeRate);
    const psbt = new bitcoin.Psbt();
    for (const buyingDatum of buyingData) {
      const marketPsbt = bitcoin.Psbt.fromBase64(buyingDatum.unsignedBuyingPSBTBase64);
      mergeIntoPsbt(psbt, marketPsbt, buyingDatum.toSignInputs, paymentAddress, receiveAddress);
      console.log(JSON.stringify(psbt));
    }

    addDeveloperFeesToPsbt(psbt, buyingData.length);

    // TODO: Get the UTXOs to pay for and add to PSBT
    // TODO: Get the fees (chain - need a helper func to determine i/o utxo types)
    // TODO: Add the final balance UTxO as output

    return NextResponse.json({"psbt": psbt.toHex()}, {status: 200, statusText: "ok"});
  } catch (err) {
    console.log(err);
    return NextResponse.json(err, {status: 500, statusText: "an error occurred"});
  }
}
