export type RootStackParamList = {
  Main: undefined;
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
  StackingAddress: { amount: string; address?: string };
  StackingScanAddress: { amount: string };
};
