/**
 * Navigation types for the Samudra Paket ERP Mobile app
 */

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  PickupManagement: undefined;
  DeliveryManagement: undefined;
  ShipmentTracking: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Offline: undefined;
};
