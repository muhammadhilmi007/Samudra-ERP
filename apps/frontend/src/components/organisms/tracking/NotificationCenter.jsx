/**
 * Samudra Paket ERP - Notification Center Component
 * Central hub for receiving and managing real-time system notifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, clearAllNotifications } from '@/store/slices/notification/notificationSlice';
import { getRelativeTime } from '@/lib/dateUtils';
import { Bell, Check, CheckCheck, Clock, Info, AlertTriangle, X, AlertCircle, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState('all');

  // Mark single notification as read
  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    notifications
      .filter(n => !n.read)
      .forEach(n => dispatch(markAsRead(n.id)));
  };

  // Clear all notifications
  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    const iconMap = {
      info: <Info className="h-4 w-4 text-blue-500" />,
      success: <Check className="h-4 w-4 text-green-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      error: <AlertCircle className="h-4 w-4 text-red-500" />,
      update: <Clock className="h-4 w-4 text-indigo-500" />
    };

    return iconMap[type] || <Info className="h-4 w-4 text-blue-500" />;
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'shipment':
        return notifications.filter(n => n.category === 'shipment');
      case 'system':
        return notifications.filter(n => n.category === 'system');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                    <CheckCheck className="h-4 w-4" />
                    <span className="sr-only">Mark all as read</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleClearAll} disabled={notifications.length === 0}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear all</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="shipment" className="flex-1">
                Shipment
              </TabsTrigger>
              <TabsTrigger value="system" className="flex-1">
                System
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-[300px] px-4 py-2">
            <TabsContent value="all" className="m-0">
              <NotificationList 
                notifications={filteredNotifications} 
                onMarkAsRead={handleMarkAsRead} 
                getNotificationIcon={getNotificationIcon} 
              />
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <NotificationList 
                notifications={filteredNotifications} 
                onMarkAsRead={handleMarkAsRead} 
                getNotificationIcon={getNotificationIcon} 
              />
            </TabsContent>
            
            <TabsContent value="shipment" className="m-0">
              <NotificationList 
                notifications={filteredNotifications} 
                onMarkAsRead={handleMarkAsRead} 
                getNotificationIcon={getNotificationIcon} 
              />
            </TabsContent>
            
            <TabsContent value="system" className="m-0">
              <NotificationList 
                notifications={filteredNotifications} 
                onMarkAsRead={handleMarkAsRead} 
                getNotificationIcon={getNotificationIcon} 
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="link" size="sm" asChild>
          <a href="/notifications">View all notifications</a>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead} 
          disabled={unreadCount === 0}
        >
          <MailOpen className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
};

// Notification List Component
const NotificationList = ({ notifications, onMarkAsRead, getNotificationIcon }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
        <p className="text-muted-foreground">No notifications to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 py-1">
      {notifications.map((notification) => (
        <div key={notification.id} className="relative">
          <div 
            className={`p-3 rounded-md transition-colors ${
              notification.read ? 'bg-background' : 'bg-muted/30'
            } hover:bg-muted`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!notification.read && 'font-medium'}`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                
                {notification.link && (
                  <a 
                    href={notification.link} 
                    className="text-xs text-primary hover:underline inline-block mt-1"
                  >
                    View details
                  </a>
                )}
              </div>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              )}
            </div>
          </div>
          <Separator className="my-1" />
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
