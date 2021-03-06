export type RootStackParamList = {
  Main: undefined;
  Stacking: undefined;
  Settings: undefined;
  SendScanAddress: undefined;
  Send?: { address?: string };
  SendAmount: { address: string };
  SendConfirm: { address: string; amountInMicro: string };
  Receive: undefined;
  BackupPassphrase: undefined;
  Fingerprint: undefined;
  About: undefined;
  TransactionDetails: { txId: string };
  StackingDashboard: {
    lockingAt: string;
    unlockingAt: string;
    numberOfCycles: number;
    amountInMicro: string;
  };
  StackingAmount: undefined;
  StackingAddress: { amountInMicro: string; bitcoinAddress?: string };
  StackingScanAddress: { amountInMicro: string };
  StackingConfirm: { amountInMicro: string; bitcoinAddress: string };
};
