'use client';

export function Toggle(props) {
  return (
    <div className="flex items-center">
      <button type="button" className={`${props.toggle ? 'bg-tangz-blue dark:bg-tangz-blue-darker' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-tangz-blue focus:ring-offset-2`} role="switch" aria-checked={props.toggle} aria-labelledby={`toggle-${props.label}-label`}
              onClick={() => props.setToggle(!props.toggle)} checked={props.toggle}>
        <span aria-hidden="true" className={`${props.toggle ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
      </button>
      <span className="ml-3 text-sm" id={`toggle-${props.label}-label`}>
        <span className="font-medium text-tangz-blue dark:text-white">{props.label}</span>
      </span>
    </div>
  )
}
