'use client';

import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import { useState, useRef, useEffect } from 'react';

const FilerobotImageEditor = dynamic(() => import('react-filerobot-image-editor'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export function ImageEditor({ visible, prefix, saveFunc, darkMode }) {
  const [inscriptionId, setInscriptionId] = useState('01b00167726b0187388dd9362bb1fcb986e12419b01799951628bbb428df1deei0');
  const inscriptionInput = useRef();

  const tangzTheme = {
    palette: {
      'bg-primary': (darkMode ? '#111827' : '#f3f4f6'),
      'bg-secondary': (darkMode ? '#374151' : '#fff'),
      'txt-primary': (darkMode ? '#d1d5db' : '#000'),
      'txt-secondary': (darkMode ? '#d1d5db' : '#000'),
      'icons-primary': (darkMode ? '#d1d5db' : '#000'),
      'accent-primary': (darkMode ? '#002070' : '#3f69c9'),
      'accent-primary-hover': (darkMode ? '#001035' : '#002070'),
      'bg-primary-active': (darkMode ? '#002070' : '#3f69c9'),
      'accent-primary-active': '#fff',
    },
    typography: {
      fontFamily: inter.style.fontFamily
    }
  };

  return (
    <div className={`${visible ? '' : 'hidden'}`}>
      <section aria-labelledby="section-1-title">
        <h2 className="sr-only" id="section-1-title">Recursive Image Editor</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="p-6 last:h-[70vh] last:mb-24">
            <div className="mb-8">
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Enter Inscription ID Here...</label>
              <div className="mt-2 flex gap-2">
                <input ref={inscriptionInput} type="text" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tangz-blue sm:text-sm sm:leading-6 dark:bg-gray-600 dark:text-gray-300 dark:ring-gray-900" placeholder="xxx...i0" />
                <button type="button" className="rounded-md bg-tangz-blue px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-tangz-blue-darker focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangz-blue dark:bg-tangz-blue-darker dark:hover:bg-tangz-blue-darkest"
                        onClick={() => setInscriptionId(inscriptionInput.current.value)}>
                  Load
                </button>
              </div>
            </div>
            <FilerobotImageEditor
              source={`${prefix}/content/${inscriptionId}`}
              onSave={(editedImageObject, designState) => saveFunc(editedImageObject, designState)}
              annotationsCommon={{ fill: '#ff0000' }}
              theme={tangzTheme}
              defaultTabId="Annotate"
              defaultToolId="Text"
              Text={{ text: 'Enter Text Here...' }}
              Rotate={{ angle: 90, componentType: 'slider' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
