/**
 * Samudra Paket ERP - Shipment Form Context
 * 
 * Provides state management for shipment form data persistence across navigation
 * and application state changes. This improves user experience by preserving
 * form data when users navigate between tabs or temporarily leave the form.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const ShipmentFormContext = createContext(undefined);

/**
 * Custom hook to access shipment form context
 * @returns {Object} ShipmentFormContext value
 */
export function useShipmentForm() {
  const context = useContext(ShipmentFormContext);
  if (context === undefined) {
    throw new Error('useShipmentForm must be used within a ShipmentFormProvider');
  }
  return context;
}

/**
 * Provider component for shipment form state
 */
export function ShipmentFormProvider({ children }) {
  // Main form data state
  const [formData, setFormData] = useState({
    // Sender information
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    senderCity: '',
    senderPostalCode: '',
    senderNotes: '',
    
    // Recipient information
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
    recipientCity: '',
    recipientPostalCode: '',
    recipientNotes: '',
    
    // Shipment details
    serviceType: 'regular',
    paymentMethod: 'CASH',
    shipmentDate: new Date(),
    
    // Package information
    items: [
      {
        description: '',
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        quantity: 1,
        itemType: 'GOODS',
        declaredValue: 0,
      },
    ],
    
    // Additional information
    notes: '',
    insurance: false,
    insuranceAmount: 0,
    
    // Pricing information
    shippingCost: 0,
    additionalServices: [],
    taxAmount: 0,
    discount: 0,
    totalPrice: 0,
    priceBreakdown: null,
  });
  
  // Active tab state (for multi-tab forms)
  const [activeTab, setActiveTab] = useState(0);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      senderName: '',
      senderPhone: '',
      senderEmail: '',
      senderAddress: '',
      senderCity: '',
      senderPostalCode: '',
      senderNotes: '',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      recipientAddress: '',
      recipientCity: '',
      recipientPostalCode: '',
      recipientNotes: '',
      serviceType: 'regular',
      paymentMethod: 'CASH',
      shipmentDate: new Date(),
      items: [
        {
          description: '',
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          quantity: 1,
          itemType: 'GOODS',
          declaredValue: 0,
        },
      ],
      notes: '',
      insurance: false,
      insuranceAmount: 0,
      shippingCost: 0,
      additionalServices: [],
      taxAmount: 0,
      discount: 0,
      totalPrice: 0,
      priceBreakdown: null,
    });
    setActiveTab(0);
  }, []);
  
  // Update specific form field
  const updateField = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);
  
  // Update multiple form fields at once
  const updateFields = useCallback((fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  }, []);
  
  // Update entire form
  const setForm = useCallback((data) => {
    setFormData(data);
  }, []);
  
  // Initialize form with existing data
  const initializeForm = useCallback((data) => {
    if (!data) return;
    
    // Format dates if needed
    const formattedData = { ...data };
    
    if (formattedData.shipmentDate && typeof formattedData.shipmentDate === 'string') {
      formattedData.shipmentDate = new Date(formattedData.shipmentDate);
    }
    
    // Ensure items array exists
    if (!formattedData.items || !Array.isArray(formattedData.items) || formattedData.items.length === 0) {
      formattedData.items = [
        {
          description: '',
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          quantity: 1,
          itemType: 'GOODS',
          declaredValue: 0,
        },
      ];
    }
    
    setFormData(formattedData);
  }, []);
  
  // Value to be provided by the context
  const value = {
    formData,
    activeTab,
    isSubmitting,
    setActiveTab,
    setIsSubmitting,
    updateField,
    updateFields,
    setForm,
    resetForm,
    initializeForm,
  };
  
  return (
    <ShipmentFormContext.Provider value={value}>
      {children}
    </ShipmentFormContext.Provider>
  );
}
