import {useState, useEffect} from 'react';

const NUM_ROWS = 3;

export function OrdersTable({ orderData }) {
  const [pages, setPages] = useState({});
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [orders, setOrders] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);

  function updatePages(pageNumber, pageContent) {
    pages[`${pageNumber}`] = pageContent;
    setPages({...pages});
  }

  function initialLoadPage(address) {
    fetch(`/api/orders?address=${address}&cursor=null&take=${NUM_ROWS}&getCount=true`)
      .then(resp => resp.json())
      .then(responseJSON => {
        const initialPage = responseJSON['orders'];
        setOrdersCount(responseJSON['count']);
        updatePages(currentPage, initialPage);
        setOrders(initialPage);
      });
  }

  useEffect(() => {
    initialLoadPage(orderData.get("walletAddr"))
  }, [orderData]);

  async function loadNextPage() {
    if ((currentPage + 1) * NUM_ROWS >= ordersCount) {
      return;
    }
    const includeCount = false
    var cursor, nextPage;
    cursor = orders.slice(-1)[0]['id'];
    if (`${currentPage + 1}` in pages) {
      nextPage = pages[`${currentPage+1}`];
    } else {
      const apiCall = `/api/orders?address=${address}&cursor=${cursor}&take=${NUM_ROWS}&getCount=${includeCount}`
      const apiResponse = await fetch(apiCall);
      const responseJSON = await apiResponse.json();
      nextPage = responseJSON['orders'];
      updatePages(currentPage+1, nextPage);
    }
    setCurrentPage(currentPage+1);
    setOrders(nextPage);
  }

  function loadPreviousPage() {
    if (currentPage == 0)  {
      return;
    }
    setOrders(pages[`${currentPage-1}`]);
    setCurrentPage(currentPage - 1);
  }

  return (
    <div>
      <table class="min-w-full divide-y gray-300">
        <thead>
          <tr class="bg-tangz-blue-darker">
            <th scope="col" class="px-3 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white">Order ID</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Cost (sats)</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Created At</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700 dark:divide-gray-300">
          {orders != null ? orders.map( (order) => (
            <tr key={order}>
              <td class="whitespace-nowrap px-3 py-4 pl-4 pr-3 text-sm font-medium text-gray-700 dark:text-white">{order['id']}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-white">{order['price']}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-white">{order['status']}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-white">{order['createdAt']}</td>
            </tr>
          )): ""}
        </tbody>
      </table>
      <div class="flex items-center justify-between border-t border-gray-700 dark:border-gray-300 px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <a href="#" class="relative inline-flex items-center rounded-md border dark:border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-50">Previous</a>
          <a href="#" class="relative ml-3 inline-flex items-center rounded-md border dark:border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-50">Next</a>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-white">
              Showing
              <span class="font-medium"> {ordersCount ? (currentPage * NUM_ROWS) + 1 : 0} </span>
              to
              <span class="font-medium"> {Math.min((currentPage + 1) * NUM_ROWS, ordersCount)} </span>
              of
              <span class="font-medium"> {ordersCount} </span>
              results
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm text-gray-700 dark:text-white" aria-label="Pagination">
              <a onClick={loadPreviousPage} class="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-tangz-blue-darker hover:text-white focus:z-20 focus:outline-offset-0">
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </a>
              <a class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">{currentPage+1}</a>
              <a onClick={loadNextPage} class="relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-tangz-blue-darker hover:text-white focus:z-20 focus:outline-offset-0">
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
