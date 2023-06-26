'use client';

import { useState, useEffect } from 'react';

import { SimpleButton } from '../components/buttons.jsx';

function isValid(acknowledgement, expiration) {
  const currentTime = new Date().getTime();
  return (acknowledgement != null) && ((currentTime - acknowledgement) < expiration);
}

function updateAcknowledgement(id, setAcknowledgement) {
  if (typeof window !== "undefined") {
    const currentTime = new Date().getTime();
    window.localStorage.setItem(id, currentTime);
  }
  setAcknowledgement(currentTime);
}

function savedAcknowledgementValue(id) {
  if (typeof window !== "undefined") {
    return window.localStorage?.getItem(id)
  }
  return 0;
}

export function InformationalBox(props) {

  const [acknowledgement, setAcknowledgement] = useState(savedAcknowledgementValue(props.id));

  return (
    <div className={`${isValid(acknowledgement, props.expiration) ? 'hidden' : ''} relative z-10`} aria-labelledby={props.id} role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900" id={props.id}>{props.header}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-justify">{props.children}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <SimpleButton label={props.confirmation} active={true} onClick={() => updateAcknowledgement(props.id, setAcknowledgement)} extraClasses="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
