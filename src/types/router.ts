export type RootStackParamList = {
  Main: undefined;
  Stacking: undefined;
  Settings: undefined;
  SendScanAddress: undefined;
  Send?: { address?: string };
  SendAmount: { address: string };
  SendConfirm: { address: string; amount: string };
  Receive: undefined;
  BackupPassphrase: undefined;
  Fingerprint: undefined;
  About: undefined;
  TransactionDetails: { txId: string };
  StackingAmount: undefined;
  StackingAddress: { amountInMicro: string; bitcoinAddress?: string };
  StackingScanAddress: { amountInMicro: string };
  StackingConfirm: { amountInMicro: string; bitcoinAddress: string };
};
