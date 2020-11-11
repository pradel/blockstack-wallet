import React from 'react';
import { Linking, StyleSheet, Image, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Paragraph } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { config } from '../config';
import { RootStackParamList } from '../types/router';
import StacksInMetaverse from '../../assets/StacksInMetaverse.png';

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

        <View style={styles.logoContainer}>
          <Image source={StacksInMetaverse} style={styles.logoImage} />
        </View>

        <Paragraph style={styles.paragraph}>
          blockstack-wallet is an open source mobile wallet enabling STX holders
          to send, receive and stack their tokens.
        </Paragraph>

        <Paragraph style={styles.paragraph}>
          Did you find an issue or would you like to suggest a new feature or
          improvement? Feel free to open an issue in the{' '}
          <Paragraph style={styles.paragraphLink} onPress={handleClickGithub}>
            GitHub repository
          </Paragraph>
          . If you like the project please consider giving it a ⭐️.
        </Paragraph>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: -32,
    marginBottom: -32,
  },
  logoImage: {
    height: 200,
    width: 200,
  },
  paragraph: {
    padding: 16,
  },
  paragraphLink: {
    textDecorationLine: 'underline',
  },
});
