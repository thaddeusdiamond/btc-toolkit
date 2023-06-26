'use client';

import Image from 'next/image'

export function SimpleButton({active, onClick, label, extraClasses}) {
  return (
    <button type="button" className={`${active ? 'bg-tangz-blue text-white dark:bg-tangz-blue-darker' : 'bg-gray-200 text-gray-400'} cursor-pointer rounded px-4 py-2 text-sm text-center font-semibold shadow-sm hover:bg-tangz-blue-darker focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangz-blue ${extraClasses}`}
            disabled={!active} onClick={onClick}>
      {label}
    </button>
  );
}

export function CancelButton({active, onClick, label, extraClasses}) {
  return (
    <button type="button" className={`${active ? 'bg-red-600 text-white dark:bg-red-700' : 'bg-gray-200 text-gray-400'} cursor-pointer rounded px-4 py-2 text-sm text-center font-semibold shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${extraClasses}`}
            disabled={!active} onClick={onClick}>
      {label}
    </button>
  );
}

export function GroupedButton({ groupKey, value, currentValue, type, setValue, onClickFunc, img, label }) {
  const currentBg = (currentValue === value) ? 'bg-tangz-blue text-white dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker' : 'bg-white text-gray-900 hover:bg-gray-50';
  const borderRounding = (type === 'left') ? 'rounded-l-md' : ((type === 'right') ? 'rounded-r-md' : '')
  const marginLeft = (type === 'left') ? '' : '-ml-px';
  return (
    <button type="button"
            onClick={() => {
              setValue(groupKey, value);
              onClickFunc && onClickFunc();
            }}
            className={`${currentBg} ${borderRounding} ${marginLeft} flex items-center justify-center gap-2 px-3 py-3 text-sm text-center font-semibold ring-1 ring-inset ring-gray-300 focus:z-10`} >
      {(img !== undefined) ? <Image className="h-4 w-4" width={20} height={20} src={img} alt={label} /> : undefined}
      {label}
    </button>
  );
}
