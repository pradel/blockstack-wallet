import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Paragraph } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { config } from '../config';
import { RootStackParamList } from '../types/router';

type AboutNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

export const AboutScreen = () => {
  const navigation = useNavigation<AboutNavigationProp>();

  const handleClickGithub = () => {
    Linking.canOpenURL(config.githubUrl).then((supported) => {
      if (supported) {
        Linking.openURL(config.githubUrl);
      }
    });
  };

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarContent title="About" />

        <Paragraph style={styles.paragraph}>
          blockstack-wallet is an open source mobile wallet enabling STX holders
          to send, receive and stack their tokens.
        </Paragraph>

        <TouchableOpacity onPress={handleClickGithub}>
          <Paragraph style={[styles.paragraph, styles.paragraphLink]}>
            Github repository
          </Paragraph>
        </TouchableOpacity>
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
  },
  paragraph: {
    padding: 16,
  },
  paragraphLink: {
    textDecorationLine: 'underline',
  },
});
