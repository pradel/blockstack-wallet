import React, { createContext, useState, useMemo } from 'react';

const AuthContext = createContext<{
  address: string;
  publicKey: string;
  signIn: (data: { address: string; publicKey: string }) => void;
  signOut: () => void;
}>({} as any);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [data, setData] = useState<{ address: string; publicKey: string }>();

  const authContext = useMemo(
    () => ({
      signIn: async ({
        address,
        publicKey,
      }: {
        address: string;
        publicKey: string;
      }) => {
        setData({ address, publicKey });
      },
      signOut: () => {
        setData(undefined);
      },
    }),
    []
  );

  return (
    <AuthContext.Provider
      value={{
        address: data?.address!,
        publicKey: data?.publicKey!,
        signIn: authContext.signIn,
        signOut: authContext.signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
