const TAPROOT_STANDARD = 'p2tr';

export function defaultHiroLogo() {
  return "https://assets.website-files.com/62cd53cfaed4257f165f6576/632b19335916e41bfcd20268_favicon-32x32.png";
}

export async function getHiroWalletAddress() {
  try {
    const hiroData = await window.btc?.request('getAddresses');
    if (hiroData === undefined) {
      throw 'Hiro Wallet is not installed';
    }
    
    const userAddresses = hiroData?.result?.addresses;
    if (userAddresses === undefined || userAddresses.length < 1) {
      throw 'Could not detect Hiro addresses';
    }

    for (const userAddress of userAddresses) {
      if (userAddress.type === TAPROOT_STANDARD) {
        return userAddress.address;
      }
    }

    throw `Could not retrieve any valid taproot addresses from: ${userAddresses}`;
  } catch (err) {
    throw `An error occurred with Hiro: ${err}`;
  }
}

export async function sendBitcoinFromHiro(amount, address) {
  const resp = await window.btc?.request('sendTransfer', {
    address: address,
    amount: amount
  });

  return resp.result.txid;
}
