'use client';

export function SimpleButton(props) {
  return (
    <button type="button" className={`${props.active ? 'bg-gray-200 text-gray-400' : 'bg-tangz-blue text-white dark:bg-tangz-blue-darker'} cursor-pointer rounded px-4 py-2 text-sm font-semibold shadow-sm hover:bg-tangs-blue-darker focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangz-blue`} disabled={props.active} onClick={props.onClick}>
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
            onClick={() => props.setValue(props.value)}
            className={`${currentBg} ${borderRounding} ${marginLeft} relative inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10`} >
      {props.label}
    </button>
  );
}
