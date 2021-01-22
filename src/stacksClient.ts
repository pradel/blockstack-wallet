import {
  Configuration,
  InfoApi,
  AccountsApi,
  TransactionsApi,
  FaucetsApi,
} from '@stacks/blockchain-api-client';
import { config } from './config';

const apiConfig = new Configuration({
  // TODO make this dynamic based on the current network
  basePath: config.stacksTestnetApiUrl,
});

export const stacksClientInfo = new InfoApi(apiConfig);

export const stacksClientAccounts = new AccountsApi(apiConfig);

export const stacksClientTransactions = new TransactionsApi(apiConfig);

export const stacksClientFaucet = new FaucetsApi(
  // We force basePath to be testnet as the faucet is not working on mainnet
  new Configuration({ basePath: config.stacksTestnetApiUrl })
);
