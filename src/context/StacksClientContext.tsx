import React, { createContext, useMemo } from 'react';
import {
  Configuration,
  InfoApi,
  AccountsApi,
  TransactionsApi,
  FaucetsApi,
} from '@stacks/blockchain-api-client';
import { useAppConfig } from './AppConfigContext';
import { config } from '../config';

const StacksClientContext = createContext<{
  stacksClientInfo: InfoApi;
  stacksClientAccounts: AccountsApi;
  stacksClientTransactions: TransactionsApi;
  stacksClientFaucet: FaucetsApi;
}>({} as any);

interface StacksClientProviderProps {
  children: React.ReactNode;
}

export const StacksClientProvider = ({
  children,
}: StacksClientProviderProps) => {
  const { appConfig } = useAppConfig();

  const stacksClientContext = useMemo(() => {
    const apiConfig = new Configuration({
      basePath:
        appConfig.network === 'mainnet'
          ? config.stacksMainnetApiUrl
          : config.stacksTestnetApiUrl,
    });

    const stacksClientInfo = new InfoApi(apiConfig);

    const stacksClientAccounts = new AccountsApi(apiConfig);

    const stacksClientTransactions = new TransactionsApi(apiConfig);

    const stacksClientFaucet = new FaucetsApi(
      // We force basePath to be testnet as the faucet is not working on mainnet
      new Configuration({ basePath: config.stacksTestnetApiUrl })
    );

    return {
      stacksClientInfo,
      stacksClientAccounts,
      stacksClientTransactions,
      stacksClientFaucet,
    };
  }, [appConfig.network]);

  return (
    <StacksClientContext.Provider
      value={{
        stacksClientInfo: stacksClientContext.stacksClientInfo,
        stacksClientAccounts: stacksClientContext.stacksClientAccounts,
        stacksClientTransactions: stacksClientContext.stacksClientTransactions,
        stacksClientFaucet: stacksClientContext.stacksClientFaucet,
      }}
    >
      {children}
    </StacksClientContext.Provider>
  );
};

export const useStacksClient = () => React.useContext(StacksClientContext);
