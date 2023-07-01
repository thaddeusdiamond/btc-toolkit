'use client';

import { validate as btc_validate } from 'bitcoin-address-validation';
import { useState, useEffect } from 'react';

import { getCurrentCodeFromOrder } from '../../utils/html.js';
import { getFeesFor } from '../../utils/mempool.js';
import { CancelButton, SimpleButton } from '../../components/widgets/buttons.jsx';
import { UNPAID, PAID } from '../../components/ordinalsbot/config.js';

const SATOSHI_TO_BTC = 100000000.0;
const RETRY_INTERVAL = 15000;

async function findOrderStatus(id, callbackFunction) {
  const ordinalsOrderReq = await fetch(`/api/order?id=${id}`);
  if (ordinalsOrderReq.status !== 200) {
    return;
  }
  const ordinalsOrder = await ordinalsOrderReq.json();
  callbackFunction(ordinalsOrder.status);
}

async function placeOrderFor(orderData) {
  console.log(orderData);
  const walletAddr = orderData.get('walletAddr');
  if (!btc_validate(walletAddr, 'mainnet')) {
    throw `Invalid BTC address provided: ${walletAddr}`;
  }

  const inscriptionSpeed = orderData.get('inscriptionSpeed');
  const fee = await getFeesFor(inscriptionSpeed);

  const orderSubmissionData = {
    codeValue: getCurrentCodeFromOrder(orderData),
    mimeType: orderData.get('mimeType'),
    rareSats: orderData.get('rareSats'),
    walletAddr: walletAddr,
    fee: fee
  }
  const ordinalsOrder = await fetch('/api/order', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderSubmissionData)
  });
  console.log(JSON.stringify(ordinalsOrder));

  if (ordinalsOrder.status !== 200) {
    throw `An error occurred submitting your order: ${await ordinalsOrder.text()}`
  }

  const ordinalsOrderResult = await ordinalsOrder.json();
  return ordinalsOrderResult.charge;
}

function normalizedErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && 'message' in error) {
    return error.message;
  }
  return JSON.stringify(error);
}

function OrdinalsBotReceipt({ orderData, visible, closable, closeFunc, receiptDetails, orderStatus }) {
  return (
    <div className={`${visible ? '' : 'hidden'} relative z-10`} role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-start md:justify-center p-0 md:p-4 text-start sm:items-center">
          <div className="lg:col-start-3 lg:row-end-1">
            <h2 className="sr-only">Summary</h2>
            <div className="w-screen lg:max-w-3xl rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-900/5">
              <div className={`${receiptDetails.get('status') === 'error' ? '' : 'hidden'} rounded-md bg-red-50 p-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">There were errors with your inscription</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul role="list" className="list-disc space-y-1 pl-5">
                        <li>{normalizedErrorMessage(receiptDetails.get('err'))}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <dl className="flex flex-wrap">
                <div className="flex-auto pl-6 pt-6">
                  <dt className="text-sm font-semibold leading-6">Amount</dt>
                  <dd className="mt-1 text-base font-semibold leading-6">
                    {receiptDetails.has('amount') ? (receiptDetails.get('amount') / SATOSHI_TO_BTC) : '0.XXX'} {receiptDetails.get('currency')} (${receiptDetails.get('fiat_value')?.toFixed(2)})
                  </dd>
                </div>
                <div className="flex-none self-end px-6 pt-4">
                  <dt className="sr-only">Status</dt>
                  <dd className={`${(orderStatus === UNPAID) ? "bg-red-200 text-red-700 ring-red-600" : ((orderStatus === PAID) ? "font-medium bg-green-200 text-green-700 ring-green-600" : "ring-tangz-blue")} inline-flex items-center rounded-md px-2 py-1 text-xs ring-1 ring-inset`}>
                    {orderStatus}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pt-6 border-t border-gray-900/5 ">
                  <dt className="flex-none">
                    <span className="sr-only">Address</span>
                    <svg className="h-6 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                    </svg>
                  </dt>
                  <dd className="text-sm font-medium leading-6 break-all">
                    Send to {receiptDetails.has('address') ? receiptDetails.get('address') : '(order address will populate here)'}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Due Date</span>
                    <svg className="h-6 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z" />
                      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                    </svg>
                  </dt>
                  <dd className="text-sm leading-6 break-all">
                    Complete by {receiptDetails.has('created_at') ? new Date((receiptDetails.get('created_at') + receiptDetails.get('ttl')) *  1000).toLocaleString() : '(expiration will populate here)'}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Order ID</span>
                    <svg className="h-6 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                    </svg>
                  </dt>
                  <dd className="text-sm leading-6 text-gray-400 break-all">
                    Order ID: {receiptDetails.has('id') ? receiptDetails.get('id') : '(order ID will populate here)'}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Receive Address</span>
                    <svg className="h-6 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 2a.75.75 0 01.75.75v5.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0L6.2 7.26a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z" />
                      <path d="M5.273 4.5a1.25 1.25 0 00-1.205.918l-1.523 5.52c-.006.02-.01.041-.015.062H6a1 1 0 01.894.553l.448.894a1 1 0 00.894.553h3.438a1 1 0 00.86-.49l.606-1.02A1 1 0 0114 11h3.47a1.318 1.318 0 00-.015-.062l-1.523-5.52a1.25 1.25 0 00-1.205-.918h-.977a.75.75 0 010-1.5h.977a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h.977a.75.75 0 010 1.5h-.977z" />
                    </svg>
                  </dt>
                  <dd className="text-sm leading-6 text-gray-400 break-all">
                    You will receive the inscription at: {orderData.get('walletAddr')}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Rare Sats</span>
                    <svg className="h-6 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
                    </svg>
                  </dt>
                  <dd className="text-sm leading-6 text-gray-400 break-all">
                    Rare/Common Sat Selection: {orderData.get('rareSats')}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex justify-between border-t border-gray-900/5 px-6 py-6">
                <CancelButton label="Close" active={closable} onClick={closeFunc} />
                <a href={receiptDetails.has('hosted_checkout_url') ? receiptDetails.get('hosted_checkout_url') : '#'} target="_blank">
                  <SimpleButton label="Checkout on OpenNode" active={closable} onClick={null} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdinalsBotSubmit({ orderData, setReceiptVisible, setTransactionSent, orderCallback, statusCallback }) {

  const [inscribeActive, setInscribeActive] = useState(true);
  const [orderStatusChecker, setOrderStatusChecker] = useState(-1);

  return (
    <SimpleButton label="Inscribe" active={inscribeActive} onClick={async () => {
        if (orderStatusChecker != -1) {
          clearInterval(orderStatusChecker);
        }
        statusCallback('loading...');
        setTransactionSent(false);
        orderCallback({});
        setReceiptVisible(true);
        setInscribeActive(false);
        try {
          const orderInformation = await placeOrderFor(orderData);
          orderCallback(orderInformation);
          findOrderStatus(orderInformation.id, statusCallback);
          setOrderStatusChecker(setInterval(() => findOrderStatus(orderInformation.id, statusCallback), RETRY_INTERVAL));
        } catch (err) {
          console.log(err);
          orderCallback({status: 'error', err: err});
        } finally {
          setInscribeActive(true);
          setTransactionSent(true);
        }
      }} />
  )
}

export function OrdinalsBotOrder({ orderData }) {

  const [receiptVisible, setReceiptVisible] = useState(false);
  const [transactionSent, setTransactionSent] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(new Map());
  const [orderStatus, setOrderStatus] = useState('loading...');

  const setReceipt = (receiptDetails) => {
    setReceiptDetails(new Map(Object.entries(receiptDetails)));
  }

  return (
    <div>
      <OrdinalsBotReceipt orderData={orderData} visible={receiptVisible} closable={transactionSent} closeFunc={() => setReceiptVisible(false)} receiptDetails={receiptDetails} orderStatus={orderStatus} />
      <OrdinalsBotSubmit orderData={orderData} setReceiptVisible={setReceiptVisible} setTransactionSent={setTransactionSent} orderCallback={setReceipt} statusCallback={setOrderStatus}/>
    </div>
  );
}
