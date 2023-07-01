export function defaultUnisatLogo() {
  return "https://unisat.io/img/favicon.ico";
}

export async function getUnisatWalletAddress() {
  if (typeof window.unisat === 'undefined') {
    throw 'UniSat Wallet is not installed';
  }
  try {
    const accounts = await window.unisat.requestAccounts();
    if (accounts.length !== 1) {
      throw `Invalid number of accounts detected (${accounts.length})`;
    }
    return accounts[0];
  } catch (err) {
    throw 'User did not grant access to Unisat';
  }
}

export async function sendBitcoinFromUnisat(amount, address) {
  const txid = await window.unisat?.sendBitcoin(address, amount);
  return txid;
}
