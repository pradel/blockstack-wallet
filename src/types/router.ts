export type RootStackParamList = {
  Main: undefined;
  SendScanAddress: undefined;
  Send?: { address?: string };
  SendAmount: { address: string };
  SendConfirm: { address: string; amountInMicro: string };
  Receive: undefined;
  BackupPassphrase: undefined;
  Fingerprint: undefined;
  About: undefined;
  TransactionDetails: { txId: string };
};
