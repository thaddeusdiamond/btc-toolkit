'use client';

import Image from 'next/image'
import CodeMirror from '@uiw/react-codemirror';

import { useState, useEffect } from 'react';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';

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

function recursiveExpandedHtmlFor(value) {
  return value.replaceAll(RECURSIVE_CONTENT_REGEXP, `${RECURSIVE_CONTENT_HOST}$&`);
}

function onCodeMirrorChange(value, viewUpdate, htmlUpdateFunc) {
  htmlUpdateFunc(recursiveExpandedHtmlFor(value));
}

export default function Home() {

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isHtml, setIsHtml] = useState(true);
  const [ordinalsHtml, setOrdinalsHtml] = useState(DEFAULT_RECURSIVE_CODE);
  const [ordinalsPreviewFrame, setOrdinalsPreviewFrame] = useState(recursiveExpandedHtmlFor(DEFAULT_RECURSIVE_CODE));
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => setDarkMode(event.matches));
  });

  return (
    <div className="min-h-screen">
      <header className="bg-tangz-blue dark:bg-tangz-blue-darker py-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="relative flex items-center justify-start md:justify-center py-5 gap-4 lg:justify-between">
            <div className="left-0 flex-shrink-0 lg:static">
              <a href="https://wildtangz.com">
                <span className="sr-only">Wild Tangz</span>
                <img className="h-8 w-auto rounded-lg" src="/logo.jpg" alt="Wild Tangz" />
              </a>
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-2xl text-white">Recursive Ordinals Builder</h1>
            </div>
            <div className="flex-shrink-0">
            </div>
          </div>
        </div>
      </header>

      <div className="border-t border-white mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 border-opacity-20 py-5 lg:block">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-5 md:col-span-7">
            <span className="isolate inline-flex rounded-md shadow-sm">
              <button type="button" onClick={() => setIsHtml(!isHtml)} className={`${isHtml ? 'bg-tangz-blue text-white dark:bg-tangz-blue-darker dark:text-white' : 'bg-white text-gray-900 hover:bg-gray-50'} relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10`}>HTML</button>
              <button type="button" onClick={() => setIsHtml(!isHtml)} className={`${isHtml ? 'bg-white text-gray-900 hover:bg-gray-50' : 'bg-tangz-blue text-white dark:bg-tangz-blue-darker dark:text-white'} relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10`}>SVG</button>
            </span>
          </div>
          <div className="flex justify-between col-span-7 md:col-span-5">
            <div className="flex items-center">
              <button type="button" className={`${autoRefresh ? 'bg-tangz-blue dark:bg-tangz-blue-darker' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-tangz-blue focus:ring-offset-2`} role="switch" aria-checked={autoRefresh} aria-labelledby="auto-refresh-label"
                      onClick={() => setAutoRefresh(!autoRefresh)} checked={autoRefresh}>
                <span aria-hidden="true" className={`${autoRefresh ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
              </button>
              <span className="ml-3 text-sm" id="auto-refresh-label">
                <span className="font-medium text-tangz-blue dark:text-white">Auto-Refresh</span>
              </span>
            </div>
            <button type="button" className={`${autoRefresh ? 'bg-gray-200 text-gray-400' : 'bg-tangz-blue text-white dark:bg-tangz-blue-darker'} cursor-pointer rounded px-4 py-2 text-sm font-semibold shadow-sm hover:bg-tangs-blue-darker focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangz-blue`} disabled={autoRefresh}
                    onClick={() => onCodeMirrorChange(ordinalsHtml, undefined, setOrdinalsPreviewFrame)}>
              Refresh
            </button>
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
                          if (autoRefresh) {
                            onCodeMirrorChange(value, viewUpdate, setOrdinalsPreviewFrame)
                          }
                        }}
                        extensions={[isHtml ? html() : xml()]}
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
                    <frame src="javascript:'';" className="mt-4 aspect-square h-full w-full max-w-xl" dangerouslySetInnerHTML={{__html: ordinalsPreviewFrame}} />
                    <div className="mt-4">
                      <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Rare Sats</h4>
                      <span className="isolate inline-flex rounded-md shadow-sm">
                        <button type="button" className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">2009</button>
                        <button type="button" className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">2010</button>
                        <button type="button" className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">2011</button>
                        <button type="button" className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">Block 78</button>
                        <button type="button" className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">Random</button>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Inscription Speed (Gas)</h4>
                      <span className="isolate inline-flex rounded-md shadow-sm">
                        <button type="button" className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">Whenever</button>
                        <button type="button" className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">~1 Hour</button>
                        <button type="button" className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">~30 Minutes</button>
                        <button type="button" className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">~10 Minutes</button>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-tangz-blue font-semibold mb-2 dark:text-white">Wallet</h4>
                      <span className="isolate inline-flex rounded-md shadow-sm">
                        <button type="button" className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">XVerse</button>
                        <button type="button" className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">Unisat</button>
                        <button type="button" className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker">Invoice</button>
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

      <footer>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 sm:text-left">
            <span className="block sm:inline">&copy; 2023 Wild Tangz</span> <span className="block sm:inline">All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
