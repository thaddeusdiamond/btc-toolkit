'use client';

import Image from 'next/image'

export function SimpleButton(props) {
  return (
    <button type="button" className={`${props.active ? 'bg-tangz-blue text-white dark:bg-tangz-blue-darker' : 'bg-gray-200 text-gray-400'} cursor-pointer rounded px-4 py-2 text-sm text-center font-semibold shadow-sm hover:bg-tangs-blue-darker focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangz-blue ${props.extraClasses}`}
            disabled={!props.active} onClick={props.onClick}>
      {props.label}
    </button>
  );
}

export function GroupedButton(props) {
  const currentBg = (props.currentValue === props.value) ? 'bg-tangz-blue text-white dark:bg-tangz-blue-darker dark:text-white dark:hover:text-tangz-blue-darker' : 'bg-white text-gray-900 hover:bg-gray-50';
  const borderRounding = (props.type === 'left') ? 'rounded-l-md' : ((props.type === 'right') ? 'rounded-r-md' : '')
  const marginLeft = (props.type === 'left') ? '' : '-ml-px';
  return (
    <button type="button"
            onClick={() => {
              props.setValue(props.value);
              props.onClickFunc && props.onClickFunc();
            }}
            className={`${currentBg} ${borderRounding} ${marginLeft} flex items-center justify-center gap-2 px-3 py-3 text-sm text-center font-semibold ring-1 ring-inset ring-gray-300 focus:z-10`} >
      {(props.img !== undefined) ? <Image className="h-4 w-4" width={20} height={20} src={props.img} alt={props.label} /> : undefined}
      {props.label}
    </button>
  );
}
