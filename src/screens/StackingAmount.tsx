import React, { useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  HelperText,
  TextInput,
  Caption,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Big from 'bn.js';
import {
  CoreNodePoxResponse,
  AddressBalanceResponse,
} from '@stacks/blockchain-api-client';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { microToStacks, stacksToMicro } from '../utils';
import { stacksClientInfo, stacksClientAccounts } from '../stacksClient';
import { RootStackParamList } from '../types/router';
import { useAuth } from '../context/AuthContext';
import { validateSTXAmount } from '../utils/validation';

type StackingAmountScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StackingAmount'
>;

export const StackingAmountScreen = () => {
  const navigation = useNavigation<StackingAmountScreenNavigationProp>();
  const auth = useAuth();
  const [stacksInfo, setStacksInfo] = useState<{
    poxInfo: CoreNodePoxResponse;
    accountBalance: AddressBalanceResponse;
  }>();

  const stackingAmountSchema = yup
    .object({
      amountInStacks: yup
        .string()
        .defined()
        .label('Amount')
        .test('is-valid', 'Invalid amount', (value) => {
          return value ? validateSTXAmount(value) : false;
        })
        .test('is-more-than-balance', 'Insufficient founds', (value) => {
          if (!value || !stacksInfo || !validateSTXAmount(value)) {
            return false;
          }
          const accountSTXBalance = new Big(
            stacksInfo.accountBalance.stx.balance,
            10
          );
          const amountSTX = new Big(stacksToMicro(value), 10);
          return amountSTX.lte(accountSTXBalance);
        }),
    })
    .defined();

  type StackingAmountSchema = yup.InferType<typeof stackingAmountSchema>;

  const formik = useFormik<StackingAmountSchema>({
    initialValues: {
      amountInStacks: '',
    },
    validationSchema: stackingAmountSchema,
    validateOnMount: true,
    onSubmit: (values, { setSubmitting }) => {
      navigation.navigate('StackingAddress', {
        amountInMicro: stacksToMicro(values.amountInStacks).toString(),
      });

      setSubmitting(false);
    },
  });

  // Is the user allowed to participate in stacking
  // We check that the balance has enough founds compared to the minimum required
  const canParticipate = useMemo(() => {
    if (!stacksInfo) return false;
    const accountSTXBalance = new Big(
      stacksInfo.accountBalance.stx.balance,
      10
    );
    const minAmountSTX = new Big(stacksInfo.poxInfo.min_amount_ustx, 10);
    return accountSTXBalance.cmp(minAmountSTX) >= 0;
  }, [stacksInfo]);

  // Has the user selected an amount bigger than the minimum to start stacking
  const minimumStackingReached = useMemo(() => {
    if (!stacksInfo || !validateSTXAmount(formik.values.amountInStacks)) {
      return false;
    }
    let amountSTX = new Big(stacksToMicro(formik.values.amountInStacks));
    const minAmountSTX = new Big(stacksInfo.poxInfo.min_amount_ustx, 10);
    return amountSTX.cmp(minAmountSTX) >= 0;
  }, [stacksInfo, formik.values.amountInStacks]);

  useEffect(() => {
    const fetchPoxInfo = async () => {
      try {
        const poxInfo = await stacksClientInfo.getPoxInfo();
        const accountBalance = await stacksClientAccounts.getAccountBalance({
          principal: auth.address,
        });
        setStacksInfo({ poxInfo, accountBalance });
      } catch (error) {
        // TODO show error to the user
      }
    };

    fetchPoxInfo();
  }, [setStacksInfo]);

  // TODO use max button in the input that will set the current balance

  const canContinue =
    canParticipate &&
    minimumStackingReached &&
    formik.isValid &&
    !formik.isSubmitting;

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarHeader>
          <AppbarContent
            title="Stacking amount"
            subtitle="How many Stacks would you like to stack?"
          />
        </AppbarHeader>

        {!stacksInfo ? (
          <View>
            <ActivityIndicator animating={true} />
          </View>
        ) : null}

        {stacksInfo ? (
          <View style={styles.inputContainer}>
            <HelperText type="info">
              A minimum of{' '}
              {microToStacks(stacksInfo.poxInfo.min_amount_ustx.toString())} STX
              is required.
            </HelperText>
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
        ) : null}

        <View style={styles.buttonsContainer}>
          {stacksInfo ? (
            <Caption style={styles.balanceText}>
              Balance: {microToStacks(stacksInfo.accountBalance.stx.balance)}{' '}
              STX
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
