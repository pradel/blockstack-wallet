import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Random from 'expo-random';
import { entropyToMnemonic, mnemonicToSeed } from 'bip39';
import { bip32 } from 'bitcoinjs-lib';

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
