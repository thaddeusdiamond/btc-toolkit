'use client';

import Image from 'next/image'

import { useState, useEffect, useRef } from 'react';
import { Resizable } from 'react-resizable';
import { ToastContainer, toast } from 'react-toastify';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';

import { DEFAULT_ORDER_URL, DEFAULT_REFERRAL_CODE } from '../components/ordinalsbot/config.js';
import { OrdinalsBotOrder } from '../components/ordinalsbot/order.jsx';
import { GroupedButton, SimpleButton } from '../components/widgets/buttons.jsx';
import { TextInput } from '../components/widgets/input.jsx';
import { Toggle } from '../components/widgets/toggle.jsx';
import { Compressor } from '../components/editor/compressor.jsx';
import { CodePad } from '../components/editor/codepad.jsx';

import { b64encodedUrl, getCurrentCodeFromOrder, getHtmlPageFor, HTML_TYPE, JSON_TYPE, SVG_TYPE, P5_TYPE, COLLECTION_TYPE } from '../utils/html.js';
import { getHiroWalletAddress, defaultHiroLogo } from '../utils/hiro.js';
import { getXVerseWalletAddress, defaultXVerseLogo } from '../utils/xverse.js';
import { getUnisatWalletAddress, defaultUnisatLogo } from '../utils/unisat.js';

import './resizable.css';

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
const DEFAULT_P5JS_CODE = `let img;
function preload() {
  img = loadImage('/content/01b00167726b0187388dd9362bb1fcb986e12419b01799951628bbb428df1deei0');
}
function setup() {
  createCanvas(420, 420);
  image(img, 0, 0, 420, 420);
}`

const DEFAULT_JSON_CODE = `{
  attributes: {
    foo: true,
    bar: 12345
  }
}`

const DEFAULT_ORDER_DATA = new Map([
  ['ordinalsHtml', DEFAULT_RECURSIVE_CODE],
  ['ordinalsSvg', DEFAULT_SVG_CODE],
  ['ordinalsJson', DEFAULT_JSON_CODE],
  ['ordinalsP5', DEFAULT_P5JS_CODE],
  ['contentType', COLLECTION_TYPE],
  ['rareSats', 'random'],
  ['inscriptionSpeed', 'hourFee'],
  ['paymentMethod', 'invoice'],
  ['walletAddr', '']
])

const MIN_CODEPAD_WIDTH = 400;
const SMALL_TRANSITION_WIDTH = 640;
const CODEPAD_PERCENTAGE = 0.58;

function recursiveExpandedHtmlFor(value) {
  return value.replaceAll(RECURSIVE_CONTENT_REGEXP, `${RECURSIVE_CONTENT_HOST}$&`);
}

export default function Home() {

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [orderData, setOrderData] = useState(DEFAULT_ORDER_DATA);
  const [ordinalsPreviewFrame, setOrdinalsPreviewFrame] = useState(getCurrentCodeFromOrder(orderData));
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => setDarkMode(event.matches));

    initializeWindow();
    window.addEventListener('resize', initializeWindow);
  }, []);

  const updateOrder = (key, value) => setOrderData(new Map(orderData.set(key, value)));

  const containerRef = useRef();
  const [previewWidth, setPreviewWidth] = useState(0);
  const [codepadWidth, setCodepadWidth] = useState(0);
  const onResize = (event, {node, size, handle}) => {
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth < SMALL_TRANSITION_WIDTH) {
      return;
    }
    const codepadWidth = Math.max(containerWidth - size.width, MIN_CODEPAD_WIDTH);
    setCodepadWidth(codepadWidth);
    setPreviewWidth(containerWidth - codepadWidth);
  }
  const initializeWindow = () => {
    const containerWidth = containerRef.current.offsetWidth;
    setPreviewWidth(containerWidth < SMALL_TRANSITION_WIDTH ? containerWidth : (containerWidth * (1 - CODEPAD_PERCENTAGE)));
    setCodepadWidth(containerWidth < SMALL_TRANSITION_WIDTH ? containerWidth : (containerWidth * CODEPAD_PERCENTAGE));
  }

  return (
    <div className="min-h-screen">

      <ToastContainer theme={darkMode ? "dark" : "light"}/>

      <div className="border-t border-white mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 border-opacity-20 py-5 lg:block">
        <div className="flex flex-wrap md:grid md:flex-nowrap justify-center md:grid-cols-12 items-center gap-8">
          <div className="w-full mx-auto inline-flex justify-center md:justify-start md:col-span-7">
            <GroupedButton groupKey="contentType" value={COLLECTION_TYPE} label="Collection" type="left" currentValue={orderData.get('contentType')} setValue={updateOrder}
                           onClickFunc={() => undefined} />
            <GroupedButton groupKey="contentType" value={HTML_TYPE} label="HTML" type="center" currentValue={orderData.get('contentType')} setValue={updateOrder}
                           onClickFunc={() => setOrdinalsPreviewFrame(getCurrentCodeFromOrder(orderData))} />
            <GroupedButton groupKey="contentType" value={SVG_TYPE} label="SVG" type="center" currentValue={orderData.get('contentType')} setValue={updateOrder}
                           onClickFunc={() => setOrdinalsPreviewFrame(getCurrentCodeFromOrder(orderData))} />
            <GroupedButton groupKey="contentType" value={JSON_TYPE} label="JSON" type="center" currentValue={orderData.get('contentType')} setValue={updateOrder}
                           onClickFunc={() => setOrdinalsPreviewFrame(getCurrentCodeFromOrder(orderData))} />
            <GroupedButton groupKey="contentType" value={P5_TYPE} label="P5.js" type="center" currentValue={orderData.get('contentType')} setValue={updateOrder}
                           onClickFunc={() => setOrdinalsPreviewFrame(getCurrentCodeFromOrder(orderData))} />
            <a href={`${DEFAULT_ORDER_URL}/?ref=${DEFAULT_REFERRAL_CODE}`} target="_blank">
              <GroupedButton groupKey="contentType" value="Other Files" label="Other Files" type="right" currentValue={false} setValue={() => undefined} />
            </a>
          </div>
          <div className="flex justify-between w-full md:col-span-5">
            <Toggle label="Auto-Refresh" toggle={autoRefresh} setToggle={setAutoRefresh} />
            <SimpleButton label="Refresh" active={!autoRefresh} onClick={() => setOrdinalsPreviewFrame(getCurrentCodeFromOrder(orderData))} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex flex-wrap sm:flex-nowrap items-start gap-6" ref={containerRef}>
          <div className="relative" style={{width: codepadWidth}}>
            <Compressor visible={orderData.get('contentType') === COLLECTION_TYPE} changeFunc={updateOrder} darkMode={darkMode} />

            <CodePad visible={orderData.get('contentType') === HTML_TYPE} codeValue={orderData.get('ordinalsHtml')} extensions={html()} darkMode={darkMode}
                     changeFunc={(value, viewUpdate) => {
                       updateOrder('ordinalsHtml', value);
                       if (autoRefresh) {
                         setOrdinalsPreviewFrame(value);
                       }
                     }} />

            <CodePad visible={orderData.get('contentType') === SVG_TYPE} codeValue={orderData.get('ordinalsSvg')} extensions={xml()} darkMode={darkMode}
                    changeFunc={(value, viewUpdate) => {
                      updateOrder('ordinalsSvg', value);
                      if (autoRefresh) {
                        setOrdinalsPreviewFrame(value);
                      }
                    }} />

           <CodePad visible={orderData.get('contentType') === JSON_TYPE} codeValue={orderData.get('ordinalsJson')} extensions={json()} darkMode={darkMode}
                   changeFunc={(value, viewUpdate) => {
                     updateOrder('ordinalsJson', value);
                     if (autoRefresh) {
                       setOrdinalsPreviewFrame(value);
                     }
                   }} />

           <CodePad visible={orderData.get('contentType') === P5_TYPE} codeValue={orderData.get('ordinalsP5')} extensions={javascript()} darkMode={darkMode}
                   changeFunc={(value, viewUpdate) => {
                     updateOrder('ordinalsP5', value);
                     if (autoRefresh) {
                       setOrdinalsPreviewFrame(value);
                     }
                   }} />
          </div>

          <Resizable className="relative" width={previewWidth} minConstraints={[360, 360]} resizeHandles={["sw"]} onResize={onResize}>
            <div className="w-full">
              <h2 className="sr-only" id="section-2-title">Preview and Purchase</h2>
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
                <div className="p-6">
                  <iframe id="recursivePreviewFrame" className="aspect-square h-full w-full border-4 border-tangz-blue-darker" sandbox="allow-scripts"
                          src={b64encodedUrl(orderData.get('contentType'), recursiveExpandedHtmlFor(getHtmlPageFor(orderData.get('contentType'), ordinalsPreviewFrame)))} />
                  <div className="mt-2 w-full flex justify-center">
                    <SimpleButton label="Preview in Full Screen" active={true} onClick={() => document.getElementById('recursivePreviewFrame').requestFullscreen()} />
                  </div>
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
                    <div className={`${orderData.get("paymentMethod") === 'invoice' ? 'hidden' : ''} dark:text-gray-300 mt-4 whitespace-wrap w-full`}>
                      Inscriptions will be sent to <span className="font-semibold text-tangz-blue dark:text-tangz-blue-darker break-all">{orderData.get("walletAddr")}</span>
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
            </div>
          </Resizable>
        </div>
      </div>
    </div>
  )
}
