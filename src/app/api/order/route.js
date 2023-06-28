import { NextResponse } from 'next/server';

import { b64encodedUrl } from '../../../utils/html.js';
import { DEFAULT_ORDER_URL, DEFAULT_ORDER_API, DEFAULT_REFERRAL_CODE } from '../../../components/ordinalsbot/config.js';

import prisma from '../../../prisma/prisma.mjs';

const DEFAULT_FILE_NAME = 'recursive_inscription.html';

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

export async function GET({ nextUrl: { searchParams }}) {
  try {
    const orderRequestId = searchParams.get('id');
    if (orderRequestId === undefined) {
      throw `No identifier found in request: ${JSON.stringify(orderRequest)}`;
    }

    console.log(`Retrieving order "${orderRequestId}"`);
    const order = await prisma.order.findUnique({
      where: {
        id: orderRequestId
      }
    });

    console.log(`Found order "${JSON.stringify(order)}"`);
    if (order === undefined) {
      throw `No order found for identifier "${orderRequestId}"`;
    }

    return NextResponse.json(order, {status: 200, statusText: `Found order ${orderRequestId}`});
  } catch (err) {
    return NextResponse.json(err, {status: 500, statusText: err});
  }
}
