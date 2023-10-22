import { NextResponse } from 'next/server';

import prisma from '../../../prisma/prisma.mjs';


export async function GET({nextUrl: {searchParams}}) {
  try {
    const start = 'start' in searchParams ? searchParams.get('start') : 0
    const end = 'end' in searchParams ? searchParams.get('end') : 10
    const orders = await prisma.order.findMany({
      'skip': start,
      'take': end-start
    });
    return NextResponse.json(orders, {status: 200, statusText: `Found order ${start} - ${end}`});
  } catch (err) {
    console.log(err)
    return NextResponse.json(err, {status: 500, statusText: err});
  }
}