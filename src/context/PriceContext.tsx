import React, { createContext } from 'react';
import useSWR from 'swr';
import { fetcher } from '../utils';

const PriceContext = createContext<{
  price?: number;
}>({});

interface PriceProviderProps {
  children: React.ReactNode;
}

interface CoingeckoPrice {
  current_price: number;
}

export const PriceProvider = ({ children }: PriceProviderProps) => {
  const { data: priceData } = useSWR<CoingeckoPrice[]>(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=blockstack`,
    fetcher,
    // Refetch price every 1 min
    { refreshInterval: 60000 }
  );

  return (
    <PriceContext.Provider
      value={{
        price: priceData?.[0]?.current_price,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => React.useContext(PriceContext);
