'use client';

import Image from 'next/image'

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';

import { DEFAULT_ORDER_URL, DEFAULT_REFERRAL_CODE } from '../components/ordinalsbot/config.js';
import { OrdinalsBotOrder } from '../components/ordinalsbot/order.jsx';
import { GroupedButton, SimpleButton } from '../components/widgets/buttons.jsx';
import { TextInput } from '../components/widgets/input.jsx';
import { Toggle } from '../components/widgets/toggle.jsx';
import { CodePad } from '../components/editor/codepad.jsx';

import { b64encodedUrl, getCurrentCodeFromOrder } from '../utils/html.js';
import { getHiroWalletAddress, defaultHiroLogo } from '../utils/hiro.js';
import { getXVerseWalletAddress, defaultXVerseLogo } from '../utils/xverse.js';
import { getUnisatWalletAddress, defaultUnisatLogo } from '../utils/unisat.js';

const RECURSIVE_CONTENT_REGEXP = /\/content\//g;
const RECURSIVE_CONTENT_HOST = 'https://ord-mirror.magiceden.dev'

const DEFAULT_RECURSIVE_CODE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Build Your Own Recursive Ordinal</title>
  </head>
  <body style="margin: 0px">
    <div>
      <img style="width:100%;margin:0px" src="/content/01b00167726b0187388dd9362bb1fcb986e12419b01799951628bbb428df1deei0" />
    </div>
  </body>
</html>`;
const DEFAULT_SVG_CODE = `<svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <image href="/content/01b00167726b0187388dd9362bb1fcb986e12419b01799951628bbb428df1deei0" />
</svg>`;

const DEFAULT_ORDER_DATA = new Map([
  ['ordinalsHtml', DEFAULT_RECURSIVE_CODE],
  ['ordinalsSvg', DEFAULT_SVG_CODE],
  ['mimeType', 'text/html'],
  ['rareSats', 'random'],
  ['inscriptionSpeed', 'hourFee'],
  ['paymentMethod', 'invoice'],
  ['walletAddr', '']
])

function recursiveExpandedHtmlFor(value) {
  return value.replaceAll(RECURSIVE_CONTENT_REGEXP, `${RECURSIVE_CONTENT_HOST}$&`);
}

export default function Home() {

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [orderData, setOrderData] = useState(DEFAULT_ORDER_DATA);
  const [ordinalsPreviewFrame, setOrdinalsPreviewFrame] = useState(recursiveExpandedHtmlFor(getCurrentCodeFromOrder(orderData)));
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => setDarkMode(event.matches));
  }, []);

  const updateOrder = (key, value) => setOrderData(new Map(orderData.set(key, value)));

  return (
    <div className="min-h-screen">

      <ToastContainer theme={darkMode ? "dark" : "light"}/>

      <div className="border-t border-white mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 border-opacity-20 py-5 lg:block">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-5 md:col-span-7">
            <span className="isolate inline-flex rounded-md shadow-sm">
              <GroupedButton groupKey="mimeType" value="text/html" label="HTML" type="left" currentValue={orderData.get('mimeType')} setValue={updateOrder} />
              <GroupedButton groupKey="mimeType" value="image/svg+xml" label="SVG" type="center" currentValue={orderData.get('mimeType')} setValue={updateOrder} />
              <a href={`${DEFAULT_ORDER_URL}/?ref=${DEFAULT_REFERRAL_CODE}`} target="_blank">
                <GroupedButton groupKey="mimeType" value="Other Files" label="Other Files" type="right" currentValue={false} setValue={() => undefined} />
              </a>
            </span>
          </div>
          <div className="flex justify-between col-span-7 md:col-span-5">
            <Toggle label="Auto-Refresh" toggle={autoRefresh} setToggle={setAutoRefresh} />
            <SimpleButton label="Refresh" active={!autoRefresh} onClick={() => setOrdinalsPreviewFrame(recursiveExpandedHtmlFor(getCurrentCodeFromOrder(orderData)))} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-8">
          <CodePad visible={orderData.get('mimeType') === 'text/html'} codeValue={orderData.get('ordinalsHtml')} extensions={html()} darkMode={darkMode}
                   changeFunc={(value, viewUpdate) => {
                     updateOrder('ordinalsHtml', value);
                     if (autoRefresh) {
                       setOrdinalsPreviewFrame(recursiveExpandedHtmlFor(value));
                     }
                   }} />

          <CodePad visible={orderData.get('mimeType') === 'image/svg+xml'} codeValue={orderData.get('ordinalsSvg')} extensions={xml()} darkMode={darkMode}
                  changeFunc={(value, viewUpdate) => {
                    updateOrder('ordinalsSvg', value);
                    if (autoRefresh) {
                      setOrdinalsPreviewFrame(recursiveExpandedHtmlFor(value));
                    }
                  }} />

          <div className="grid grid-cols-1 gap-4 lg:col-span-5">
            <section aria-labelledby="section-2-title">
              <h2 className="sr-only" id="section-2-title">Preview and Purchase</h2>
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
                <div className="p-6">
                  <iframe className="aspect-square h-full w-full max-w-xl border-4 border-tangz-blue-darker" sandbox="allow-scripts"
                          src={b64encodedUrl(orderData.get('mimeType'), recursiveExpandedHtmlFor(getCurrentCodeFromOrder(orderData)))} />
                  <div className="mt-4 w-full">
                    <h4 className="text-tangz-blue font-semibold mb-2 dark:text-gray-300">Rare Sats</h4>
                    <span className="grid grid-cols-5 rounded-md shadow-sm">
                      <GroupedButton groupKey="rareSats" value="2009" label="2009" type="left" currentValue={orderData.get("rareSats")} setValue={updateOrder} />
                      <GroupedButton groupKey="rareSats" value="2010" label="2010" type="center" currentValue={orderData.get("rareSats")} setValue={updateOrder} />
                      <GroupedButton groupKey="rareSats" value="2011" label="2011" type="center" currentValue={orderData.get("rareSats")} setValue={updateOrder} />
                      <GroupedButton groupKey="rareSats" value="block78" label="Block 78" type="center" currentValue={orderData.get("rareSats")} setValue={updateOrder} />
                      <GroupedButton groupKey="rareSats" value="random" label="Random" type="right" currentValue={orderData.get("rareSats")} setValue={updateOrder} />
                    </span>
                  </div>
                  <div className="mt-4 w-full">
                    <h4 className="text-tangz-blue font-semibold mb-2 dark:text-gray-300">Inscription Speed (Gas)</h4>
                    <span className="grid grid-cols-4 rounded-md shadow-sm">
                      <GroupedButton groupKey="inscriptionSpeed" value="economyFee" label="Whenever" type="left" currentValue={orderData.get("inscriptionSpeed")} setValue={updateOrder} />
                      <GroupedButton groupKey="inscriptionSpeed" value="hourFee" label="~1 Hour" type="center" currentValue={orderData.get("inscriptionSpeed")} setValue={updateOrder} />
                      <GroupedButton groupKey="inscriptionSpeed" value="halfHourFee" label="~30 Mins" type="center" currentValue={orderData.get("inscriptionSpeed")} setValue={updateOrder} />
                      <GroupedButton groupKey="inscriptionSpeed" value="fastestFee" label="~10 Mins" type="right" currentValue={orderData.get("inscriptionSpeed")} setValue={updateOrder} />
                    </span>
                  </div>
                  <div className="mt-4 w-full">
                    <h4 className="text-tangz-blue font-semibold mb-2 dark:text-gray-300">Wallet</h4>
                    <span className="grid grid-cols-4 rounded-md shadow-sm">
                      <GroupedButton groupKey="paymentMethod" value="xverse" img={defaultXVerseLogo()} label="XVerse" type="left" currentValue={orderData.get("paymentMethod")} setValue={updateOrder}
                                     onClickFunc={() => getXVerseWalletAddress().then(walletAddr => updateOrder("walletAddr", walletAddr))} />
                      <GroupedButton groupKey="paymentMethod" value="unisat" img={defaultUnisatLogo()} label="Unisat" type="center" currentValue={orderData.get("paymentMethod")} setValue={updateOrder}
                                     onClickFunc={() => getUnisatWalletAddress().then(walletAddr => updateOrder("walletAddr", walletAddr))}/>
                      <GroupedButton groupKey="paymentMethod" value="hiro" img={defaultHiroLogo()} label="Hiro" type="center" currentValue={orderData.get("paymentMethod")} setValue={updateOrder}
                                     onClickFunc={() => getHiroWalletAddress().then(walletAddr => updateOrder("walletAddr", walletAddr))}/>
                      <GroupedButton groupKey="paymentMethod" value="invoice" img={undefined} label="Invoice" type="right" currentValue={orderData.get("paymentMethod")} setValue={updateOrder}
                                     onClickFunc={() => updateOrder("walletAddr", "")}/>
                    </span>
                    <div className={`${orderData.get("paymentMethod") === 'invoice' ? 'hidden' : ''} dark:text-gray-300 mt-4 truncate text-ellipsis`}>
                      Inscriptions will be sent to <span className="font-semibold text-tangz-blue dark:text-tangz-blue-darker">{orderData.get("walletAddr")}</span>
                    </div>
                    <div className={`${orderData.get("paymentMethod") === 'invoice' ? '' : 'hidden'} mt-4`}>
                      <TextInput id="wallet-addr" label="Ordinals Wallet Address" placeholder="bc1p..." value={orderData.get("walletAddr")} setValue={value => updateOrder("walletAddr", value)} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <OrdinalsBotOrder orderData={orderData} />
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
