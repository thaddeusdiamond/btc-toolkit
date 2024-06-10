const COLLECTION_DISCOUNTS = process.env.COLLECTION_DISCOUNTS ? JSON.parse(process.env.COLLECTION_DISCOUNTS) : [];

export const DEFAULT_PRICE = 10000;
export const BTC_TO_SATS = 100000000;

function getCollectionUrl(symbol, owner) {
  return `https://api-mainnet.magiceden.dev/v2/ord/btc/tokens?collectionSymbol=${symbol}&ownerAddress=${owner}&showAll=true&sortBy=priceAsc&limit=100`;
}

export async function getFee(buyerAddress) {
  try {
    let existingDiscount = 0.0;
    for (const collectionDiscount of COLLECTION_DISCOUNTS) {
      const discountHeaders = {};
      for (const header in collectionDiscount.headers) {
        discountHeaders[header] = collectionDiscount.headers[header];
      }
      const discountResult = await fetch(getCollectionUrl(collectionDiscount.symbol, buyerAddress), {
        headers: discountHeaders
      }).then(res => res.json());
      const collectionDiscountResult = collectionDiscount.pct * discountResult.tokens.length;
      if (collectionDiscountResult === NaN) {
        console.error(`ME API IS RETURNING BOGUS DATA, CHECK FOR A CHANGE: ${discountResult}`);
      }
      console.log(`${buyerAddress} has a discount of ${collectionDiscountResult * 100}% from "${collectionDiscount.symbol}" holdings`);
      existingDiscount += collectionDiscountResult;
    }
    return Math.max(DEFAULT_PRICE * (1 - existingDiscount), 0);
  } catch (err) {
    console.error(err);
    return DEFAULT_PRICE;
  }
}
