import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Random from 'expo-random';
import { c32addressDecode } from 'c32check';
import { entropyToMnemonic, mnemonicToSeed } from 'bip39';
import { bip32, address, networks } from 'bitcoinjs-lib';

export const fetcher = (...args: any) =>
  // @ts-ignore
  fetch(...args).then((res: any) => res.json());

/**
 * @description Generate a random mnemonic phrase
 */
export const generateMnemonicRootKeychain = async () => {
  const randomBytes = await Random.getRandomBytesAsync(32);
  const plaintextMnemonic = entropyToMnemonic(randomBytes as any);
  const seedBuffer = await mnemonicToSeed(plaintextMnemonic);
  const rootNode = bip32.fromSeed(seedBuffer);
  return {
    rootNode,
    plaintextMnemonic,
  };
};

/**
 * @description Return the secure storage key used to store the private key.
 */
export const getStorageKeyPk = () => {
  const key = 'blockstack-private-key';
  // On android we use the android id added to the key as it is unique per app installation
  if (Platform.OS === 'android') {
    return `${key}-${Application.androidId}`;
  }
  return key;
};

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

/**
 * @description Convert micro to stacks.
 * @param amountInMicroStacks - the amount of microStacks to convert
 */
export const microToStacks = (amountInMicroStacks: string) =>
  Number(amountInMicroStacks) / Math.pow(10, 6);

/**
 * @description Convert stacks to micro.
 * @param amountInStacks - the amount of stacks to convert
 */
export const stacksToMicro = (amountInStacks: string) =>
  Number(amountInStacks) * Math.pow(10, 6);

/**
 * @description Return a transaction memo as a readable string
 * @param string - the memo transaction
 */
export const getMemoString = (string: string): string | null =>
  string
    ? global.Buffer.from(string.replace('0x', ''), 'hex').toString('utf8')
    : null;
