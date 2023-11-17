import { NextResponse } from 'next/server';

import prisma from '../../../prisma/prisma.mjs';

const DEFAULT_TAKE = 10;

export async function GET({nextUrl: {searchParams}}) {
  var response = {}
  try {
    const address = searchParams.get('address');
    if (searchParams.has('getCount') && searchParams.get('getCount') == 'true') {
      response['count'] = await prisma.order.count({
        'where': {'receive_addr': address}
      });
    }
    const cursor = searchParams.has('cursor') ? searchParams.get('cursor') : 'null';
    const take = searchParams.has('take') ? parseInt(searchParams.get('take')) : DEFAULT_TAKE;
    var orders;
    if (cursor != 'null') {
      orders = await prisma.order.findMany({
        'take': take,
        'skip': 1,
        'cursor': {'id': cursor},
        'where': {'receive_addr': address}
      });
    } else {
      orders = await prisma.order.findMany({
        'take': take,
        'where': {'receive_addr': address}
      });
    }
    response['orders'] = orders;
    return NextResponse.json(response, {status: 200, statusText: `Found ${take} orders starting at ${cursor != 'null' ? cursor: 'the beginning'}`});
  } catch (err) {
    console.log(err)
    return NextResponse.json(err, {status: 500, statusText: err});
  }
}
