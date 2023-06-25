'use client';

import Image from 'next/image'
import CodeMirror from '@uiw/react-codemirror';

import { useState, useEffect } from 'react';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';

import { GroupedButton, SimpleButton } from '../components/buttons.jsx';
import { Toggle } from '../components/toggle.jsx';

const RECURSIVE_CONTENT_REGEXP = /\/content\/[a-z0-9]+/g;
const RECURSIVE_CONTENT_HOST = 'https://ord.io'

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
  html: html(),
  svg: xml()
};

function recursiveExpandedHtmlFor(value) {
  return value.replaceAll(RECURSIVE_CONTENT_REGEXP, `${RECURSIVE_CONTENT_HOST}$&`);
}

export default function Home() {

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [markupType, setMarkupType] = useState('html');
  const [rareSats, setRareSats] = useState('random');
  const [inscriptionSpeed, setInscriptionSpeed] = useState('60 mins');
  const [paymentMethod, setPaymentMethod] = useState('invoice');
  const [ordinalsHtml, setOrdinalsHtml] = useState(DEFAULT_RECURSIVE_CODE);
  const [ordinalsPreviewFrame, setOrdinalsPreviewFrame] = useState(recursiveExpandedHtmlFor(ordinalsHtml));
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => setDarkMode(event.matches));
  });

  console.log(ordinalsHtml);

  return (
    <div className="min-h-screen">
      <div className="border-t border-white mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 border-opacity-20 py-5 lg:block">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-5 md:col-span-7">
            <span className="isolate inline-flex rounded-md shadow-sm">
              <GroupedButton value="html" label="HTML" type="left" currentValue={markupType} setValue={setMarkupType} />
              <GroupedButton value="svg" label="SVG" type="right" currentValue={markupType} setValue={setMarkupType} />
            </span>
          </div>
          <div className="flex justify-between col-span-7 md:col-span-5">
            <Toggle label="Auto-Refresh" toggle={autoRefresh} setToggle={setAutoRefresh} />
            <SimpleButton label="Refresh" active={!autoRefresh} onClick={() => setOrdinalsPreviewFrame(recursiveExpandedHtmlFor(ordinalsHtml))} />
          </div>
        </div>
      </div>

      <main className="pb-8">
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
                    <div className="mt-4">
                      <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Rare Sats</h4>
                      <span className="isolate inline-flex rounded-md shadow-sm">
                        <GroupedButton value="2009" label="2009" type="left" currentValue={rareSats} setValue={setRareSats} />
                        <GroupedButton value="2010" label="2010" type="center" currentValue={rareSats} setValue={setRareSats} />
                        <GroupedButton value="2011" label="2011" type="center" currentValue={rareSats} setValue={setRareSats} />
                        <GroupedButton value="block78" label="Block 78" type="center" currentValue={rareSats} setValue={setRareSats} />
                        <GroupedButton value="random" label="Random" type="right" currentValue={rareSats} setValue={setRareSats} />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Inscription Speed (Gas)</h4>
                      <span className="isolate inline-flex rounded-md shadow-sm">
                        <GroupedButton value="whenever" label="Whenever" type="left" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                        <GroupedButton value="60 mins" label="~1 Hour" type="center" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                        <GroupedButton value="30 mins" label="~30 Mins" type="center" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                        <GroupedButton value="10 mins" label="~10 Mins" type="right" currentValue={inscriptionSpeed} setValue={setInscriptionSpeed} />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Wallet</h4>
                      <span className="isolate inline-flex rounded-md shadow-sm">
                        <GroupedButton value="xverse" label="XVerse" type="left" currentValue={paymentMethod} setValue={setPaymentMethod} />
                        <GroupedButton value="unisat" label="Unisat" type="center" currentValue={paymentMethod} setValue={setPaymentMethod} />
                        <GroupedButton value="invoice" label="Invoice" type="right" currentValue={paymentMethod} setValue={setPaymentMethod} />
                      </span>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button type="button" className="cursor-pointer bg-tangz-blue text-white rounded px-4 py-2 text-lg font-semibold shadow-sm hover:bg-tangs-blue-darker focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangz-blue dark:bg-tangz-blue-darker">
                        Inscribe
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
