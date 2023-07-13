import { getHiroWalletAddress, getHiroPaymentAddress } from "./hiro.js";
import { getUnisatWalletAddress } from "./unisat.js";
import { getXVerseWalletAddress } from "./xverse.js";

export const HIRO_WALLET = 'hiro';
export const UNISAT_WALLET = 'unisat';
export const XVERSE_WALLET = 'xverse';

export const PAYMENT_TYPE = 'payment';
export const ORDINALS_TYPE = 'ordinals';

export async function getWalletAddress(walletProvider, walletType) {
  switch (walletProvider) {
    case HIRO_WALLET:
      if (walletType === PAYMENT_TYPE) {
        return await getHiroPaymentAddress();
      } else if (walletType === ORDINALS_TYPE) {
        return await getHiroWalletAddress();
      }
    case UNISAT_WALLET:
      return await getUnisatWalletAddress();
    case XVERSE_WALLET:
      // TODO: This IS NOT the same for ordinals and payment
      return await getXVerseWalletAddress();
    default:
      return '';
  }
}

export async function signPsbt(walletProvider, psbtHex) {
  switch (walletProvider) {
    case HIRO_WALLET:
      return await window.btc?.request('signPsbt', { hex: psbtHex });
    case UNISAT_WALLET:
      return await window.unisat?.signPsbt(psbtHex);
    case XVERSE_WALLET:
      // TODO: This IS NOT the same for ordinals and payment
      return await getXVerseWalletAddress();
    default:
      return '';
  }
}
