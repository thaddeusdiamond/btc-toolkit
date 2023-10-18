export function getOrdersWrappedHtml(ordersJSON) {
  const orders = JSON.parse(ordersJSON);
  return (
    `<div>
        ${ Object.keys(orders).map((order) =>
          orders[order] ? `<img style="width:100%;margin:0px" src="/content/${order}" />` : ''
        ).join()
        }
     </div>`
  );
}
