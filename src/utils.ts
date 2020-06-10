import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Random from "expo-random";
import { ec as EC } from "elliptic";
import { createStacksPrivateKey } from "@blockstack/stacks-transactions";
import { c32addressDecode } from "c32check";

export const fetcher = (...args: any) =>
  // @ts-ignore
  fetch(...args).then((res: any) => res.json());

/**
 * @description Generate a random private key
 */
export const makeRandomPrivKey = async () => {
  const ec = new EC("secp256k1");
  const randomBytes = await Random.getRandomBytesAsync(32);
  const options = { entropy: randomBytes };
  const keyPair = ec.genKeyPair(options);
  const privateKey = keyPair.getPrivate().toString("hex", 32);
  return createStacksPrivateKey(privateKey);
};

/**
 * @description Return the secure storage key used to store the private key.
 */
export const getStorageKeyPk = () => {
  const key = "blockstack-private-key";
  // On android we use the android id added to the key as it is unique per app installation
  if (Platform.OS === "android") {
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
