export type RootStackParamList = {
  Main: undefined;
  Send: undefined;
  SendAmount: { address: string };
  SendConfirm: { address: string; amount: string };
  Receive: undefined;
  BackupPassphrase: undefined;
  Fingerprint: undefined;
};
