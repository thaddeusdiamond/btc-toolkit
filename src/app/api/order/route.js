'use server';

import * as fflate from 'fflate';

import { NextResponse } from 'next/server';
import { minify } from 'html-minifier-terser';

import { recursiveViewerFor } from '../../../utils/collections.js';
import { b64encodedUrl, getHtmlPageFor, COLLECTION_TYPE, GZIP_ENCODING } from '../../../utils/html.js';
import { DEFAULT_ORDER_URL, DEFAULT_ORDER_API, DEFAULT_REFERRAL_CODE } from '../../../components/ordinalsbot/config.js';

import prisma from '../../../prisma/prisma.mjs';

const DEFAULT_FILE_NAME = 'recursive_inscription.html';
const DEFAULT_GZIP_NAME = 'recursive_inscription.gz';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const orderRequest = JSON.parse(formData.get('metadata'));
    console.log(`Processing order: ${JSON.stringify(orderRequest)}`);

    const files = [];
    const contentType = orderRequest.contentType;
    let finalPrice;
    if (contentType === COLLECTION_TYPE) {
      const additionalFiles = formData.getAll('additionalFiles[]');
      for (let idx = 0; idx < additionalFiles.length; idx++) {
        const additionalFile = additionalFiles[idx];
        const fileData = await additionalFile.arrayBuffer();
        const compressedString = fflate.strFromU8(fflate.gzipSync(new Uint8Array(fileData)), true);
        const dataURL = b64encodedUrl(GZIP_ENCODING, compressedString);
        files.push({
          name: `${DEFAULT_GZIP_NAME}_${idx}`,
          size: compressedString.length,
          dataURL: dataURL
        });
      }
    } else {
      const rawHtml = getHtmlPageFor(contentType, orderRequest.codeValue);
      const dataURL = b64encodedUrl(contentType, rawHtml);
      files.push({
        name: DEFAULT_FILE_NAME,
        size: rawHtml.length,
        dataURL: dataURL
      });
      finalPrice = 4000;
    }

    const orderSubmissionData = {
      files: files,
      receiveAddress: orderRequest.walletAddr,
      fee: orderRequest.fee,
      lowPostage: true,
      rareSats: orderRequest.rareSats,
      referral: DEFAULT_REFERRAL_CODE,
      additionalFee: finalPrice
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
    console.error(err);
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
