import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
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
import { tr } from 'date-fns/locale';

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

  const formik = useFormik<yup.InferType<typeof importWalletSchema>>({
    initialValues: {
      plaintextMnemonic: '',
    },
    validationSchema: importWalletSchema,
    onSubmit: (values, { setSubmitting }) => {
      // TODO save in protected storage
      // TODO login and go to dashboard

      setSubmitting(false);
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
          <Button mode="contained" onPress={formik.handleSubmit}>
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
