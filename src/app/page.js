'use client';

import Image from 'next/image'
import CodeMirror from '@uiw/react-codemirror';

import { validate as btc_validate } from 'bitcoin-address-validation';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { getAddress } from 'sats-connect';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';

import { GroupedButton, SimpleButton } from '../components/buttons.jsx';
import { TextInput } from '../components/inputs.jsx';
import { Toggle } from '../components/toggle.jsx';

const RECURSIVE_CONTENT_REGEXP = /\/content\/[a-z0-9]+/g;
const RECURSIVE_CONTENT_HOST = 'https://ord.io'

const DEFAULT_FEES_API = 'https://mempool.space/api/v1/fees/recommended';

const DEFAULT_ORDER_API = 'https://api2.ordinalsbot.com/order'
const DEFAULT_FILE_NAME = 'recursive_inscription.html';
const DEFAULT_REFERRAL_CODE = 'abcdef'

const DEFAULT_BTC_NETWORK = 'Mainnet';
const DEFAULT_PAYMENT_TYPE = 'invoice';

const DEFAULT_RECURSIVE_CODE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Build Your Own Recursive Ordinal</title>
  </head>
  <body style="width:100%;margin:0px">
    <div>
      <img src="/content/01b00167726b0187388dd9362bb1fcb986e12419b01799951628bbb428df1deei0" />
    </div>
  </body>
</html>
`;
const MARKUP_MAPPINGS = {
  'text/html': html(),
  'image/svg+xml': xml()
};

async function getOrderInfoFor(fee, ordinalsHtml, markupType, rareSats, walletAddr) {
  console.log( btoa(ordinalsHtml));
  const orderSubmissionData = {
    files: [{
      name: DEFAULT_FILE_NAME,
      size: ordinalsHtml.length,
      dataURL: `data:${markupType};base64,${btoa(ordinalsHtml)}`
    }],
    receiveAddress: walletAddr,
    fee: fee,
    lowPostage: false,
    rareSats: rareSats,
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
  if (orderSubmission.status === 'error') {
    throw `Could not submit order: ${orderSubmission.error}`;
  }

  return orderSubmission.charge;
}

async function getFeesFor(inscriptionSpeed) {
  const feesApi = await fetch(DEFAULT_FEES_API);
  if (feesApi.status !== 200) {
    throw 'Could not retrieve fees, please try again soon.';
  }

  const fees = await feesApi.json();
  if (!(inscriptionSpeed in fees)) {
    throw `Could not find matching fee for "${inscriptionSpeed}"`;
  }

  return fees[inscriptionSpeed];
}

async function getXVerseWalletAddress() {
  var addresses = undefined;
  const getAddressOptions = {
    payload: {
      purposes: ['ordinals'],
      message: 'Recursive Ordinals Builder will use this to receive your inscriptions',
      network: {
        type: DEFAULT_BTC_NETWORK
      },
    },
    onFinish: (response) => {
      addresses = response.addresses;
    },
    onCancel: () => {
      throw 'User declined to provide wallet access';
    }
  }

  await getAddress(getAddressOptions);
  if (!addresses) {
    throw 'Could not retrieve Ordinals wallet address';
  }
  console.log(addresses);
  return addresses[0].address;
}

async function getUnisatWalletAddress() {
  if (typeof window.unisat === 'undefined') {
    throw 'UniSat Wallet is not installed';
  }
  try {
    const accounts = await window.unisat.requestAccounts();
    if (accounts.length !== 1) {
      throw `Invalid number of accounts detected (${accounts.length})`;
    }
    return accounts[0];
  } catch (err) {
    throw 'User did not grant access to Unisat';
  }
}

async function placeOrderFor(ordinalsHtml, markupType, rareSats, inscriptionSpeed, paymentMethod, walletAddr) {
  try {
    const fee = await getFeesFor(inscriptionSpeed);
    console.log(fee, ordinalsHtml, rareSats, inscriptionSpeed, paymentMethod, walletAddr);

    if (!btc_validate(walletAddr, DEFAULT_BTC_NETWORK.toLowerCase())) {
      throw `Invalid BTC address provided: ${walletAddr}`;
    }

    const ordinalsOrder = await getOrderInfoFor(fee, ordinalsHtml, markupType, rareSats, walletAddr);
    console.log(JSON.stringify(ordinalsOrder));
  } catch (err) {
    console.log(err);
    toast.error(err);
  }
}

function recursiveExpandedHtmlFor(value) {
  return value.replaceAll(RECURSIVE_CONTENT_REGEXP, `${RECURSIVE_CONTENT_HOST}$&`);
}

export default function Home() {

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [markupType, setMarkupType] = useState('text/html');

  const [rareSats, setRareSats] = useState('random');
  const [inscriptionSpeed, setInscriptionSpeed] = useState('hourFee');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_TYPE);
  const [walletAddr, setWalletAddr] = useState('');
  const [ordinalsHtml, setOrdinalsHtml] = useState(DEFAULT_RECURSIVE_CODE);

  const [ordinalsPreviewFrame, setOrdinalsPreviewFrame] = useState(recursiveExpandedHtmlFor(ordinalsHtml));
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => setDarkMode(event.matches));
  }, []);

  return (
    <div className="min-h-screen">

      <ToastContainer theme={darkMode ? "dark" : "light"}/>

      <div className="border-t border-white mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 border-opacity-20 py-5 lg:block">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-5 md:col-span-7">
            <span className="isolate inline-flex rounded-md shadow-sm">
              <GroupedButton value="text/html" label="HTML" type="left" currentValue={markupType} setValue={setMarkupType} />
              <GroupedButton value="image/svg+xml" label="SVG" type="right" currentValue={markupType} setValue={setMarkupType} />
            </span>
          </div>
          <div className="flex justify-between col-span-7 md:col-span-5">
            <Toggle label="Auto-Refresh" toggle={autoRefresh} setToggle={setAutoRefresh} />
            <SimpleButton label="Refresh" active={!autoRefresh} onClick={() => setOrdinalsPreviewFrame(recursiveExpandedHtmlFor(ordinalsHtml))} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="sr-only">Page title</h1>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-8">
          <div className="grid grid-cols-1 gap-4 lg:col-span-7">
            <section aria-labelledby="section-1-title">
              <h2 className="sr-only" id="section-1-title">Recursive Inscription Code</h2>
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-500">
                <div className="p-6">
                  <CodeMirror
                      value={ordinalsHtml}
                      height="600px"
                      theme={darkMode ? 'dark' : 'light'}
                      onChange={(value, viewUpdate) => {
                        setOrdinalsHtml(value);
                        if (autoRefresh) {
                          setOrdinalsPreviewFrame(recursiveExpandedHtmlFor(value));
                        }
                      }}
                      extensions={[MARKUP_MAPPINGS[markupType]]}
                    />
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:col-span-5">
            <section aria-labelledby="section-2-title">
              <h2 className="sr-only" id="section-2-title">Preview and Purchase</h2>
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-500">
                <div className="p-6">
                  <frame className="mt-4 aspect-square h-full w-full max-w-xl" dangerouslySetInnerHTML={{__html: ordinalsPreviewFrame}} />
                  <div className="mt-4 w-full">
                    <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Rare Sats</h4>
                    <span className="grid grid-cols-5 rounded-md shadow-sm">
                      <GroupedButton value="2009" label="2009" type="left" currentValue={rareSats} setValue={setRareSats} />
                      <GroupedButton value="2010" label="2010" type="center" currentValue={rareSats} setValue={setRareSats} />
                      <GroupedButton value="2011" label="2011" type="center" currentValue={rareSats} setValue={setRareSats} />
                      <GroupedButton value="block78" label="Block 78" type="center" currentValue={rareSats} setValue={setRareSats} />
                      <GroupedButton value="random" label="Random" type="right" currentValue={rareSats} setValue={setRareSats} />
                    </span>
                  </div>
                  <div className="mt-4 w-full">
                    <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Inscription Speed (Gas)</h4>
                    <span className="grid grid-cols-4 rounded-md shadow-sm">
                      <GroupedButton value="economyFee" label="Whenever" type="left" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                      <GroupedButton value="hourFee" label="~1 Hour" type="center" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                      <GroupedButton value="halfHourFee" label="~30 Mins" type="center" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                      <GroupedButton value="fastestFee" label="~10 Mins" type="right" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                    </span>
                  </div>
                  <div className="mt-4 w-full">
                    <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Wallet</h4>
                    <span className="grid grid-cols-3 rounded-md shadow-sm">
                      <GroupedButton value="xverse" img="https://assets.website-files.com/624b08d53d7ac60ccfc11d8d/64637a04ad4e523a3e07675c_32x32.png" label="XVerse" type="left" currentValue={paymentMethod} setValue={setPaymentMethod}
                                     onClickFunc={() => getXVerseWalletAddress().then(setWalletAddr)} />
                      <GroupedButton value="unisat" img="https://unisat.io/img/favicon.ico" label="Unisat" type="center" currentValue={paymentMethod} setValue={setPaymentMethod}
                                     onClickFunc={() => getUnisatWalletAddress().then(setWalletAddr)}/>
                      <GroupedButton value="invoice" img={undefined} label="Invoice" type="right" currentValue={paymentMethod} setValue={setPaymentMethod} />
                    </span>
                    <div className={`${paymentMethod === 'invoice' ? 'hidden' : ''} mt-4 truncate text-ellipsis`}>
                      Inscriptions will be sent to <span className="font-semibold text-tangz-blue">{walletAddr}</span>
                    </div>
                    <div className={`${paymentMethod === 'invoice' ? '' : 'hidden'} mt-4`}>
                      <TextInput id="wallet-addr" label="Ordinals Wallet Address" placeholder="bc1p..." setValue={setWalletAddr} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <SimpleButton label="Inscribe" active={true} onClick={(async) => placeOrderFor(ordinalsHtml, markupType, rareSats, inscriptionSpeed, paymentMethod, walletAddr)} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
