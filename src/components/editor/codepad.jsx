import CodeMirror from '@uiw/react-codemirror';

export function CodePad({ visible, codeValue, changeFunc, extensions, darkMode }) {
  return (
    <div className={`${visible ? '' : 'hidden'} grid grid-cols-1 gap-4 lg:col-span-7`}>
      <section aria-labelledby="section-1-title">
        <h2 className="sr-only" id="section-1-title">Recursive Inscription Code</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="p-6">
            <CodeMirror
                value={codeValue}
                height="600px"
                theme={darkMode ? 'dark' : 'light'}
                onChange={changeFunc}
                extensions={[extensions]}
              />
          </div>
        </div>
      </section>
    </div>
  );
}
