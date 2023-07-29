import { NextResponse } from 'next/server';

import prisma from '../../../../prisma/prisma.mjs';

import { DEFAULT_ORDER_API, UNPAID } from '../../../../components/ordinalsbot/config.js';

const TWO_DAY_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  try {
    const oldestTime = new Date(new Date().getTime() - ONE_DAY_MS);
    console.log(`Retrieving unpaid orders since ${oldestTime}`);

    const unpaidOrders = await prisma.order.findMany({
      where: {
        status: UNPAID,
        createdAt: { gt: oldestTime }
      }
    });

    var updatedOrders = 0;
    for (const unpaidOrder of unpaidOrders) {
      console.log(`Retrieving status for "${unpaidOrder.id}"`);
      const unpaidOrderStatusReq = await fetch(`${DEFAULT_ORDER_API}?id=${unpaidOrder.id}`);
      if (unpaidOrderStatusReq.status !== 200) {
        console.error(`Could not retrieve order status for order "${unpaidOrder.id}" (${unpaidOrderStatusReq.status}): ${unpaidOrderStatusReq.statusText}`);
        continue;
      }
      const unpaidOrderStatus = await unpaidOrderStatusReq.json();
      const newOrderStatus = unpaidOrderStatus.charge.status;
      if (newOrderStatus !== UNPAID) {
        const updatedOrders = await prisma.order.update({
          where: { id: unpaidOrder.id },
          data: { status: unpaidOrderStatus.charge.status }
        });
        if (updatedOrders !== 1) {
          console.error(`Could not update order status for order "${unpaidOrder.id}"`);
        }
        updatedOrderStatus++;
        console.log(`Updated status of order "${unpaidOrder.id}" from "${UNPAID}" to "${newOrderStatus}"`);
      }
    }

    console.log(`Successfully updated ${updatedOrders} orders`);
    return NextResponse.json({updatedOrders: updatedOrders}, {status: 200, statusText: `Successfully updated ${updatedOrders} orders`});
  } catch (err) {
    console.error(err);
    return NextResponse.json(err, {status: 500, statusText: err});
  }
}
