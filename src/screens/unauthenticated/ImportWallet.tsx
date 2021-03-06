import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  Appbar,
  HelperText,
  Paragraph,
  TextInput,
  Title,
} from 'react-native-paper';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { validateMnemonic } from 'bip39';
import { AppbarHeader } from '../../components/AppbarHeader';
import { Button } from '../../components/Button';
import { getStorageKeyPk } from '../../utils';
import {
  deriveRootKeychainFromMnemonic,
  deriveStxAddressChain,
} from '@stacks/keychain';
import { ChainID } from '@blockstack/stacks-transactions';
import { useAuth } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';

const importWalletSchema = yup
  .object({
    plaintextMnemonic: yup
      .string()
      .defined()
      .label('Seed phrase')
      .test('is-valid', 'Invalid seed phrase', (value) => {
        return value ? validateMnemonic(value) : false;
      }),
  })
  .defined();

export const ImportWalletScreen = () => {
  const navigation = useNavigation();
  const { appConfig } = useAppConfig();
  const auth = useAuth();

  const formik = useFormik<yup.InferType<typeof importWalletSchema>>({
    initialValues: {
      plaintextMnemonic: '',
    },
    validationSchema: importWalletSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) {
        setSubmitting(false);
        return;
      }

      await SecureStore.setItemAsync(
        getStorageKeyPk(),
        values.plaintextMnemonic
      );

      const rootNode = await deriveRootKeychainFromMnemonic(
        values.plaintextMnemonic
      );
      const result = deriveStxAddressChain(
        appConfig.network === 'mainnet' ? ChainID.Mainnet : ChainID.Testnet
      )(rootNode);
      auth.signIn({
        address: result.address,
        publicKey: result.childKey.publicKey.toString('hex'),
      });
    },
  });

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>
      <View style={styles.contentContainer}>
        <View>
          <Title style={styles.title}>Enter seed phrase</Title>
          <Paragraph>
            Enter your seed phrase in order to restore your wallet.
          </Paragraph>
          <TextInput
            placeholder="Seed phrase"
            mode="outlined"
            autoFocus={true}
            multiline={true}
            numberOfLines={3}
            style={styles.textInput}
            value={formik.values.plaintextMnemonic}
            onChangeText={formik.handleChange('plaintextMnemonic')}
          />
          <HelperText
            type="error"
            visible={Boolean(formik.errors.plaintextMnemonic)}
          >
            {formik.errors.plaintextMnemonic}
          </HelperText>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            Import wallet
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    marginTop: 16,
  },
  textInput: {
    paddingTop: 32,
  },
  buttonsContainer: {
    paddingVertical: 16,
  },
});
