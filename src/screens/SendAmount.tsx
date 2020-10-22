import React from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, HelperText, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Big from 'bn.js';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { RootStackParamList } from '../types/router';
import { Button } from '../components/Button';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { stacksToMicro } from '../utils';

type SendAmountNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendAmount'
>;
type SendAmountScreenRouteProp = RouteProp<RootStackParamList, 'SendAmount'>;

const sendAmountSchema = yup
  .object({
    amountInStacks: yup
      .string()
      .defined()
      .test('is-valid-stacks', 'Amount is invalid', (value) => {
        console.log('value', value);
        if (value) {
          try {
            const micro = stacksToMicro(value);
            if (isNaN(micro)) {
              return false;
            }
            new Big(micro);
            console.log('valid big');
            return true;
          } catch (error) {
            console.log('Error');
            // Do nothing, invalid
          }
        }
        return false;
      })
      .label('Amount'),
  })
  .defined();

type SendAmountSchema = yup.InferType<typeof sendAmountSchema>;

export const SendAmountScreen = () => {
  const navigation = useNavigation<SendAmountNavigationProp>();
  const route = useRoute<SendAmountScreenRouteProp>();

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
  // TODO allow user to adjust fees
  // TODO verify that amount is valid, for now I can continue with "-"

  // console.log('formik.touched', formik.touched);
  // console.log('formik.errors', formik.errors);

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
});
