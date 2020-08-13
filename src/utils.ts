import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Random from 'expo-random';
import { c32addressDecode } from 'c32check';
import { entropyToMnemonic, mnemonicToSeed } from 'bip39';
import { bip32, BIP32Interface, ECPair } from 'bitcoinjs-lib';
import { ecPairToHexString } from 'blockstack';
import {
  getAddressFromPrivateKey,
  TransactionVersion,
  ChainID,
} from '@blockstack/stacks-transactions';
import { getDerivationPath } from '@blockstack/keychain';

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

export const getRootKeychainFromMnemonic = async (mnemonic: string) => {
  const seedBuffer = await mnemonicToSeed(mnemonic);
  const rootNode = bip32.fromSeed(seedBuffer);
  return rootNode;
};

// Remove this once https://github.com/blockstack/ux/issues/468 is fixed
export function deriveStxAddressChain(chain: ChainID) {
  return (rootNode: BIP32Interface) => {
    const childKey = rootNode.derivePath(getDerivationPath(chain));
    if (!childKey.privateKey) {
      throw new Error(
        'Unable to derive private key from `rootNode`, bip32 master keychain'
      );
    }
    const ecPair = ECPair.fromPrivateKey(childKey.privateKey);
    const privateKey = ecPairToHexString(ecPair);
    return {
      childKey,
      address: getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet),
      privateKey,
    };
  };
}

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
