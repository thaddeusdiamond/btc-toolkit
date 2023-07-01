import { getAddress, sendBtcTransaction } from 'sats-connect';

export function defaultXVerseLogo() {
  return "https://assets.website-files.com/624b08d53d7ac60ccfc11d8d/64637a04ad4e523a3e07675c_32x32.png";
}

export async function getXVerseWalletAddress() {
  var addresses = undefined;
  const getAddressOptions = {
    payload: {
      purposes: ['ordinals'],
      message: 'Recursive Ordinals Builder will use this to receive your inscriptions',
      network: {
        type: 'Mainnet'
      },
    },
    onFinish: (response) => {
      addresses = response.addresses;
    },
    onCancel: () => {
      throw 'User declined to provide wallet access';
    }
  }

  await getAddress(getAddressOptions);
  if (!addresses) {
    throw 'Could not retrieve Ordinals wallet address';
  }
  console.log(addresses);
  return addresses[0].address;
}

export async function sendBitcoinFromXverse(amount, address) {
  var txHash = undefined;
  console.log(amount, address);
  const sendBtcOptions = {
    payload: {
      amountSats: amount.toString(),
      recipientAddress: address,
      network: {
        type: 'Mainnet'
      },
    },
    onFinish: (response) => {
      txHash = response;
    },
    onCancel: () => {
      throw 'User declined to provide wallet access';
    }
  }

  await sendBtcTransaction(sendBtcOptions);
  return txHash;
}
