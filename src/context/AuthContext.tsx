import React, { createContext, useState, useMemo } from 'react';

const AuthContext = createContext<{
  address: string;
  signIn: (address: string) => void;
  signOut: () => void;
}>({} as any);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [address, setAddress] = useState<string>();

  const authContext = useMemo(
    () => ({
      signIn: async (newAddress: string) => {
        setAddress(newAddress);
      },
      signOut: () => {
        setAddress(undefined);
      },
    }),
    []
  );

  return (
    <AuthContext.Provider
      value={{
        address: address!,
        signIn: authContext.signIn,
        signOut: authContext.signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
