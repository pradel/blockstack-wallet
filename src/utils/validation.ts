import { c32addressDecode } from 'c32check';
import { address, networks } from 'bitcoinjs-lib';

/**
 * @description Check if the address is a valid STX address.
 * @param stacksAddress - the STX address to validate
 */
export const validateStacksAddress = (stacksAddress: string) => {
  try {
    c32addressDecode(stacksAddress);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * @description Check if the address is a valid BTC address.
 * @param bitcoinAddress - the BTC address to validate
 * @param network - the network to run the check on
 */
export const validateBitcoinAddress = (
  bitcoinAddress: string,
  network: 'mainnet' | 'testnet'
) => {
  try {
    address.toOutputScript(
      bitcoinAddress,
      network === 'mainnet' ? networks.bitcoin : networks.testnet
    );
    return true;
  } catch (e) {
    return false;
  }
};
