import {useState} from 'react';

export function OrdersTable() {
  const [tableStart, setTableStart] = useState(0);
  const [orders, setOrders] = useState(null);

  async function getOrders(start) {
    if (orders == null || tableStart != start) {
      const apiResponse = await fetch(`/api/orders?start=0&end=10`);
      const newOrders = await apiResponse.json();
      setOrders(newOrders);
      setTableStart(start);
    } 
    return orders;
  }
  const myOrders = getOrders(0); // TODO: Add pagination
  return (
    <table class="min-w-full divide-y gray-300">
      <thead>
        <tr class="bg-tangz-blue-darker">
          <th scope="col" class="px-3 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white">Order ID</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Receive Address</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Price</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Service Fee</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
          <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Created At</th>
          <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
            <span class="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-800">
        {console.log(typeof orders)}
        {orders != null ? orders.map( (order) => (
          <tr class="bg-gray-700">
          <td class="whitespace-nowrap px-3 py-4 pl-4 pr-3 text-sm font-medium text-white">{order['id']}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{order['receive_addr']}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{order['price']}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{order['service_fee']}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{order['status']}</td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{order['createdAt']}</td>
          <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
          </td>
        </tr>
        )): ""}
        {/* <!-- More orders... --> */}
      </tbody>
    </table>

  );
}