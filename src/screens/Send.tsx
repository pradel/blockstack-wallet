import React, { useState } from "react";
import { StyleSheet, TouchableHighlight } from "react-native";
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
  Text,
  Button,
  Input,
} from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Clipboard from "@react-native-community/clipboard";
import { RootStackParamList } from "../types/router";
import { validateStacksAddress } from "../utils";

type SendNavigationProp = StackNavigationProp<RootStackParamList, "Send">;

export const SendScreen = () => {
  const navigation = useNavigation<SendNavigationProp>();
  const [address, setAddress] = useState("");

  // TODO Scan qr code and go to next step

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setAddress(text);
  };

  const handleConfirm = () => {
    navigation.navigate("SendAmount", { address });
  };

  const isAddressValid = address && validateStacksAddress(address);

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Send STX"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-back" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />
      <Divider />

      <Layout style={styles.contentContainer}>
        <Layout style={styles.inputContainer}>
          <Text category="h1">Recipient address</Text>
        </Layout>

        <Layout style={styles.inputContainer}>
          <Input
            placeholder="Address"
            size="large"
            value={address}
            onChangeText={(nextValue) => setAddress(nextValue)}
            accessoryRight={() => (
              <TouchableHighlight onPress={handlePaste}>
                <Text>Paste</Text>
              </TouchableHighlight>
            )}
          />
        </Layout>

        <Layout style={styles.buttonsContainer}>
          <Button onPress={handleConfirm} disabled={!isAddressValid}>
            Next
          </Button>
        </Layout>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  inputContainer: {
    padding: 16,
  },
  buttonsContainer: {
    padding: 16,
  },
});
