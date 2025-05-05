/**
 * Card component for Samudra Paket ERP Mobile
 * Used for displaying structured content with consistent styling
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SCREEN } from '../../config/constants';

interface CardProps extends TouchableOpacityProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  footerStyle?: ViewStyle;
  elevation?: number;
  onPress?: () => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  headerRight,
  containerStyle,
  contentStyle,
  titleStyle,
  subtitleStyle,
  footerStyle,
  elevation = 2,
  onPress,
  disabled = false,
  ...props
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer
      style={[
        styles.container,
        { elevation },
        containerStyle,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      
      <View style={[styles.content, contentStyle]}>{children}</View>
      
      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND.PRIMARY,
    borderRadius: SCREEN.RADIUS.MD,
    marginVertical: SCREEN.SPACING.SM,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN.SPACING.MD,
    paddingTop: SCREEN.SPACING.MD,
    paddingBottom: SCREEN.SPACING.SM,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT.SECONDARY,
  },
  content: {
    paddingHorizontal: SCREEN.SPACING.MD,
    paddingBottom: SCREEN.SPACING.MD,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN.SPACING.MD,
    paddingVertical: SCREEN.SPACING.SM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.LIGHT,
  },
});

export default Card;
