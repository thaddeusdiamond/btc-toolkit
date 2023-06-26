const DEFAULT_FEES_API = 'https://mempool.space/api/v1/fees/recommended';

export async function getFeesFor(inscriptionSpeed) {
  const feesApi = await fetch(DEFAULT_FEES_API);
  if (feesApi.status !== 200) {
    throw 'Could not retrieve fees, please try again soon.';
  }

  const fees = await feesApi.json();
  if (!(inscriptionSpeed in fees)) {
    throw `Could not find matching fee for "${inscriptionSpeed}"`;
  }

  return fees[inscriptionSpeed];
}
