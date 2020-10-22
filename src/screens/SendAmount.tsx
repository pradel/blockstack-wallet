import React from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, HelperText, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { RootStackParamList } from '../types/router';
import { Button } from '../components/Button';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';

type SendAmountNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendAmount'
>;
type SendAmountScreenRouteProp = RouteProp<RootStackParamList, 'SendAmount'>;

const sendAmountSchema = yup
  .object({
    amount: yup.string().defined(),
  })
  .defined();

type SendAmountSchema = yup.InferType<typeof sendAmountSchema>;

export const SendAmountScreen = () => {
  const navigation = useNavigation<SendAmountNavigationProp>();
  const route = useRoute<SendAmountScreenRouteProp>();

  const formik = useFormik<SendAmountSchema>({
    initialValues: {
      amount: '',
    },
    validationSchema: sendAmountSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));

      navigation.navigate('SendConfirm', {
        address: route.params.address,
        amount: values.amount,
      });
    },
  });

  // TODO display available balance near by the button
  // TODO next button active only if amount lower than balance
  // TODO allow user to adjust fees
  // TODO verify that amount is valid, for now I can continue with "-"

  console.log('formik.touched', formik.touched);
  console.log('formik.errors', formik.errors);

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarContent
          title="Enter Amount"
          subtitle="How many stacks would you like to send?"
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Amount"
            mode="outlined"
            keyboardType="number-pad"
            autoFocus={true}
            value={formik.values.amount}
            onChangeText={formik.handleChange('amount')}
            onBlur={formik.handleBlur('amount')}
            right={<TextInput.Affix text="STX" />}
          />
          <HelperText
            type="error"
            visible={Boolean(formik.touched.amount && formik.errors.amount)}
          >
            {formik.errors.amount}
          </HelperText>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={formik.handleSubmit}
            disabled={!formik.isValid || formik.isSubmitting}
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
