export function TextInput({id, label, placeholder, setValue}) {
  return (
    <div class="rounded-md px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-tangz-blue">
      <label htmlFor="name" class="block text-xs font-medium text-gray-900">{label}</label>
      <input type="text" name={id} id={id} class="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder={placeholder} onChange={(event) => setValue(event.target.value)}/>
    </div>
  )
}
