import React from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Caption, HelperText, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Big from 'bn.js';
import { useFormik } from 'formik';
import * as yup from 'yup';
import useSWR from 'swr';
import { RootStackParamList } from '../types/router';
import { Button } from '../components/Button';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { microToStacks, stacksToMicro } from '../utils';
import { stacksClientAccounts } from '../stacksClient';
import { useAuth } from '../context/AuthContext';
import { validateSTXAmount } from '../utils/validation';

type SendAmountNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendAmount'
>;
type SendAmountScreenRouteProp = RouteProp<RootStackParamList, 'SendAmount'>;

export const SendAmountScreen = () => {
  const navigation = useNavigation<SendAmountNavigationProp>();
  const route = useRoute<SendAmountScreenRouteProp>();
  const auth = useAuth();
  const { data: accountBalanceData } = useSWR('user-balance', () => {
    return stacksClientAccounts.getAccountBalance({
      principal: auth.address,
    });
  });

  const sendAmountSchema = yup
    .object({
      amountInStacks: yup
        .string()
        .defined()
        .label('Amount')
        .test('is-valid', 'Invalid amount', (value) => {
          return value ? validateSTXAmount(value) : false;
        })
        .test('is-lower-than-balance', 'Insufficient founds', (value) => {
          if (!value || !accountBalanceData || !validateSTXAmount(value)) {
            return false;
          }
          const accountSTXBalance = new Big(accountBalanceData.stx.balance, 10);
          const amountSTX = new Big(stacksToMicro(value), 10);
          return amountSTX.lte(accountSTXBalance);
        }),
    })
    .defined();

  type SendAmountSchema = yup.InferType<typeof sendAmountSchema>;

  const formik = useFormik<SendAmountSchema>({
    initialValues: {
      amountInStacks: '',
    },
    validationSchema: sendAmountSchema,
    validateOnMount: true,
    onSubmit: (values, { setSubmitting }) => {
      navigation.navigate('SendConfirm', {
        address: route.params.address,
        amountInMicro: stacksToMicro(values.amountInStacks).toString(),
      });

      setSubmitting(false);
    },
  });

  // TODO display available balance near by the button
  // TODO next button active only if amount lower than balance

  const canContinue = formik.isValid && !formik.isSubmitting;

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarContent
          title="Enter Amount"
          subtitle="How many Stacks would you like to send?"
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Amount"
            mode="outlined"
            keyboardType="number-pad"
            autoFocus={true}
            value={formik.values.amountInStacks}
            onChangeText={(event) => {
              formik.setFieldTouched('amountInStacks');
              formik.handleChange('amountInStacks')(event);
            }}
            right={<TextInput.Affix text="STX" />}
          />
          <HelperText
            type="error"
            visible={Boolean(
              formik.touched.amountInStacks && formik.errors.amountInStacks
            )}
          >
            {formik.errors.amountInStacks}
          </HelperText>
        </View>

        <View style={styles.buttonsContainer}>
          {accountBalanceData ? (
            <Caption style={styles.balanceText}>
              Balance: {microToStacks(accountBalanceData.stx.balance)} STX
            </Caption>
          ) : null}
          <Button
            mode="contained"
            onPress={formik.handleSubmit}
            disabled={!canContinue}
          >
            Next
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
  },
  inputContainer: {
    padding: 16,
  },
  buttonsContainer: {
    padding: 16,
  },
  balanceText: {
    textAlign: 'center',
    marginBottom: 16,
  },
});
