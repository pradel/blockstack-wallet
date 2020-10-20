import React from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { RootStackParamList } from '../types/router';

type StackingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const StackingScreen = () => {
  const navigation = useNavigation<StackingScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <AppbarContent
          title="Stacking"
          subtitle="Stack your Stacks to earn bitcoin"
        />
      </AppbarHeader>

      <Text>TODO how it works button that open a new link</Text>
      <Text>TODO nice illustration</Text>
      <Text>TODO only show this if user is not already stacking</Text>

      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('StartStacking')}
        >
          Get started
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  buttonsContainer: {
    padding: 16,
  },
});
