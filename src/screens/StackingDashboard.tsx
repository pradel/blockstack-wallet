import React from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { Appbar, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { microToStacks } from '../utils';
import { RootStackParamList } from '../types/router';

type StackingDashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StackingDashboard'
>;
type StackingDashboardScreenRouteProp = RouteProp<
  RootStackParamList,
  'StackingDashboard'
>;

export const StackingDashboardScreen = () => {
  const navigation = useNavigation<StackingDashboardScreenNavigationProp>();
  const route = useRoute<StackingDashboardScreenRouteProp>();

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarHeader>
          <AppbarContent title="Stacking dashboard" />
        </AppbarHeader>

        <View>
          <List.Item
            title="Amount locked"
            description={`${microToStacks(route.params.amountInMicro)} STX`}
          />
          <List.Item
            title="Number of cycles"
            description={route.params.numberOfCycles}
          />
          <List.Item
            title="Locking date"
            description={format(
              new Date(route.params.lockingAt),
              'HH:mm dd MMMM yyyy'
            )}
          />
          <List.Item
            title="Unlocking date"
            description={format(
              new Date(route.params.unlockingAt),
              'HH:mm dd MMMM yyyy'
            )}
          />
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
  },
});
