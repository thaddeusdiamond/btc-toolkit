export function TextInput({id, label, placeholder, setValue}) {
  return (
    <div className="rounded-md px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-gray-300 dark:bg-gray-500 focus-within:ring-2 focus-within:ring-tangz-blue">
      <label htmlFor="name" className="block text-xs font-medium text-gray-900 dark:text-gray-300">{label}</label>
      <input type="text" name={id} id={id} className="block w-full border-0 p-0 text-gray-900 dark:bg-gray-500 dark:text-gray-300 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder={placeholder} onChange={(event) => setValue(event.target.value)}/>
    </div>
  )
}
