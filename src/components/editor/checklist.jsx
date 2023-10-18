export function CheckList({ visible, codeValue, changeFunc }) {
  const ordersDict = JSON.parse(codeValue);
  var formContent = [];
  for(const [order, selected] of Object.entries(ordersDict)) {
    formContent.push(<input type="radio" id={order} name={order} value={order} 
                            checked={selected} onChange={changeFunc}></input>);
    formContent.push(<label className="p-6" for={order}>{order}</label>);
    formContent.push(<br></br>);
  }
  return (
    <div className={`${visible ? '' : 'hidden'}`}>
      <section aria-labelledby="section-1-title">
        <h2 className="sr-only" id="section-1-title">Recursive Inscription Code</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="p-6 w-fulls" style={{"font-size": "0.5rem"}}>
            <form action={changeFunc}>
              { formContent }
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export function getOrderFromEvent(event) {
  return event.target.name;
}

export function getCheckedFromEvent(event) {
  return event.target.checked
}