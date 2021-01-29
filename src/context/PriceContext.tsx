import React, { createContext } from 'react';
import { useQuery } from 'react-query';

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
  const { data: priceData } = useQuery<CoingeckoPrice[]>(
    'price',
    () =>
      fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=blockstack',
        {
          method: 'get',
        }
      ).then((res) => res.json()),
    {
      // Refetch price every 1 min
      refetchInterval: 60000,
    }
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
