import { address, networks } from 'bitcoinjs-lib';

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

/**
 * @description Check if the amount passed is a valid
 * @param amount - the amount to validate
 */
const STXAmountRegex = /[1-9]\d*(\.\d+)?$/;
export const validateSTXAmount = (amount: string) => {
  const matchRegex = STXAmountRegex.test(amount);
  if (!matchRegex) {
    return false;
  }

  const [number, decimals] = amount.split('.');
  if (number.length > 10 || decimals?.length > 6) {
    return false;
  }
  return true;
};
