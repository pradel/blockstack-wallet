import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { Appbar, Paragraph, TextInput, Title } from 'react-native-paper';
import { AppbarHeader } from '../../components/AppbarHeader';
import { Button } from '../../components/Button';
import { AppbarContent } from '../../components/AppBarContent';

export const ImportWalletScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>
      <View style={styles.contentContainer}>
        <View>
          <Title style={styles.title}>Enter seed phrase</Title>
          <Paragraph style={styles.paragraph}>
            Enter your seed phrase in order to restore your wallet.
          </Paragraph>
          <TextInput
            placeholder="Seed phrase"
            mode="outlined"
            autoFocus={true}
            style={styles.textInput}
            // value={formik.values.amountInStacks}
            // onChangeText={(event) => {
            //   formik.setFieldTouched('amountInStacks');
            //   formik.handleChange('amountInStacks')(event);
            // }}
          />
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            // onPress={handleCreateNewWallet}
            // disabled={!mnemonic}
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
  },
  title: {
    fontSize: 26,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  paragraph: {
    paddingHorizontal: 16,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  buttonsContainer: {
    padding: 16,
  },
});
