import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import BatchScanning from '../../features/checker/components/BatchScanning';

const BatchScanningScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Batch Scanning" />
      </Appbar.Header>
      <View style={styles.content}>
        <BatchScanning route={route} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});

export default BatchScanningScreen;
