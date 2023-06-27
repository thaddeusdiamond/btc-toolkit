import { NextResponse } from 'next/server';

import { b64encodedUrl } from '../../../utils/html.js';

import prisma from '../../../prisma/prisma.mjs';

const DEFAULT_ORDER_API = 'https://api2.ordinalsbot.com/order'
const DEFAULT_FILE_NAME = 'recursive_inscription.html';
const DEFAULT_REFERRAL_CODE = 'wildtangz'

export async function POST(req) {
  try {
    const orderRequest = await req.json();
    console.log(`Processing order: ${JSON.stringify(orderRequest)}`);
    const orderSubmissionData = {
      files: [{
        name: DEFAULT_FILE_NAME,
        size: orderRequest.ordinalsHtml.length,
        dataURL: b64encodedUrl(orderRequest.mimeType, orderRequest.ordinalsHtml)
      }],
      receiveAddress: orderRequest.walletAddr,
      fee: orderRequest.fee,
      lowPostage: false,
      rareSats: orderRequest.rareSats,
      referral: DEFAULT_REFERRAL_CODE,
      additionalFee: 1000
    }

    console.log(JSON.stringify(orderSubmissionData));
    const orderSubmissionResp = await fetch(DEFAULT_ORDER_API, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderSubmissionData)
    })
    if (orderSubmissionResp.status !== 200) {
      throw `Could not submit order (${orderSubmissionResp.status}): ${orderSubmissionResp.statusText}`;
    }

    const orderSubmission = await orderSubmissionResp.json();
    console.log(JSON.stringify(orderSubmission));
    if (orderSubmission.status === 'error') {
      throw `Could not submit order: ${orderSubmission.error}`;
    }

    const orderCreate = await prisma.order.create({
      data: {
        id: orderSubmission.charge.id,
        receive_addr: orderSubmission.receiveAddress,
        price: orderSubmission.charge.amount,
        status: orderSubmission.charge.status,
        service_fee: orderSubmission.serviceFee
      }
    })
    console.log(`Created a new order (unpaid): ${JSON.stringify(orderCreate)}`);

    return NextResponse.json(orderSubmission, {status: 200, statusText: `Successfully placed order ${orderSubmission.charge.id}`});
  } catch (err) {
    return NextResponse.json(err, {status: 500, statusText: err});
  }
}