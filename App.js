import { appFont } from "@theme/typography";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
let AppContainer = require("@navigation/index").default;
import store from "@redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Settings } from "react-native-fbsdk-next";
// import * as TaskManager from 'expo-task-manager';
// import * as Notifications from 'expo-notifications';

const queryClient = new QueryClient();

// const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// TaskManager.defineTask(
//     BACKGROUND_NOTIFICATION_TASK,
//     async ({ data, error, executionInfo }) => {
//         if (error) {
//             // console.log('error occurred');
//         }
//         if (data) {
//             const currentNotification =
//                 await Notifications.getPresentedNotificationsAsync();
//             const noti = currentNotification.find(
//                 (item) =>
//                     JSON.parse(data.notification.data.body).conversation_id ===
//                     item.request.content.data.conversation_id,
//             );
//             if (noti) {
//                 await Notifications.dismissNotificationAsync(
//                     noti.request.identifier,
//                 );
//             }
//             return {
//                 shouldShowAlert: true,
//                 shouldPlaySound: true,
//                 shouldSetBadge: false,
//             };
//         }
//     },
// );

// Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareData = async () => {
      await SplashScreen.preventAutoHideAsync();
      // AppContainer = require("@navigation/index").default;
      await Promise.all([Font.loadAsync(appFont)]);
      Settings.initializeSDK();
      setIsReady(true);
    };
    prepareData();
    return () => {};
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <AppContainer />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const AppContainer = () => {
  return (
    <Portal.Host>
      <AppNavigation />
      <GlobalUI />
    </Portal.Host>
  );
};

export default function AppLoaded() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <App />
        <StatusBar style="auto" />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
