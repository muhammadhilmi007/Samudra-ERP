import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WarehouseOperationsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  const operationCards = [
    {
      title: 'Incoming Items',
      description: 'Process incoming items and packages',
      icon: 'package-variant-closed',
      color: theme.colors.primary,
      route: 'IncomingItemProcessing',
    },
    {
      title: 'Item Allocation',
      description: 'Allocate items to shipments or delivery routes',
      icon: 'truck-delivery',
      color: '#10B981', // Green
      route: 'ItemAllocation',
    },
    {
      title: 'Loading Management',
      description: 'Manage loading of items into vehicles',
      icon: 'forklift',
      color: '#F59E0B', // Amber
      route: 'LoadingManagement',
    },
    {
      title: 'Batch Scanning',
      description: 'Process multiple items in batches',
      icon: 'barcode-scan',
      color: '#8B5CF6', // Purple
      route: 'BatchScanning',
    },
    {
      title: 'Inventory View',
      description: 'View and search warehouse inventory',
      icon: 'view-list',
      color: '#EC4899', // Pink
      route: 'InventoryView',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardsContainer}>
        {operationCards.map((card, index) => (
          <Card
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(card.route)}
          >
            <Card.Content style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                <MaterialCommunityIcons name={card.icon} size={32} color="white" />
              </View>
              <View style={styles.cardTextContainer}>
                <Title style={styles.cardTitle}>{card.title}</Title>
                <Paragraph style={styles.cardDescription}>{card.description}</Paragraph>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#666',
  },
});

export default WarehouseOperationsScreen;
