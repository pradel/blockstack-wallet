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
import { UndrawSavings } from '../images/UndrawSavings';

type StackingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const StackingScreen = () => {
  const navigation = useNavigation<StackingScreenNavigationProp>();

  // TODO only show this if user is not already stacking
  // TODO if user is stacking show stacking dashboard with metrics

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <AppbarContent
          title="Stacking"
          subtitle="Stack your Stacks to earn bitcoin"
        />
      </AppbarHeader>

      <View style={styles.imageContainer}>
        <UndrawSavings height={200} />

        <Text>TODO some basic explanations</Text>
        <Text>TODO how it works button that open a new link</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('StackingAmount')}
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
    justifyContent: 'space-between',
  },
  imageContainer: {
    alignItems: 'center',
  },
  buttonsContainer: {
    padding: 16,
  },
});
