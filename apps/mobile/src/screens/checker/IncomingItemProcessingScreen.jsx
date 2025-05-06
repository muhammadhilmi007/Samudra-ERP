import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import IncomingItemForm from '../../features/checker/components/IncomingItemForm';

const IncomingItemProcessingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Process Incoming Item" />
      </Appbar.Header>
      <View style={styles.content}>
        <IncomingItemForm route={route} />
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

export default IncomingItemProcessingScreen;
