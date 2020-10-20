import {
  InfoApi,
  AccountsApi,
  SmartContractsApi,
  Configuration,
  TransactionsApi,
} from '@stacks/blockchain-api-client';

const apiConfig = new Configuration({
  basePath: 'https://stacks-node-api.blockstack.org',
});

export const stacksClientInfo = new InfoApi(apiConfig);

export const stacksClientAccounts = new AccountsApi(apiConfig);
