import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useDispatch } from "react-redux";
import { setExpoToken } from "@modules/app/redux/appSlice";

// Constants
const ANDROID_CHANNEL_NAME = "default";
const ANDROID_CHANNEL_CONFIG = {
  name: ANDROID_CHANNEL_NAME,
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#FF231F7C",
};

// Types
type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

// Notification handler setup
const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

/**
 * Sets up the notification channel for Android devices.
 * @async
 */
const setupAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      ANDROID_CHANNEL_NAME,
      ANDROID_CHANNEL_CONFIG
    );
  }
};

/**
 * Checks if the current device is a physical device.
 * @returns {boolean} True if it's a physical device, false otherwise.
 */
const isPhysicalDevice = (): boolean => {
  return Device.isDevice;
};

/**
 * Requests notification permissions.
 * @async
 * @returns {Promise<NotificationPermissionStatus>} The final permission status.
 */
const requestNotificationPermissions =
  async (): Promise<NotificationPermissionStatus> => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    }

    return existingStatus;
  };

/**
 * Retrieves the Expo push token.
 * @async
 * @returns {Promise<string | undefined>} The Expo push token if successful, undefined otherwise.
 */
const getExpoPushToken = async (): Promise<string | undefined> => {
  try {
    const projectId = Constants.default.easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token;
  } catch (error) {
    console.error("Error getting Expo push token:", error);
    return undefined;
  }
};

/**
 * Registers the device for push notifications and returns the Expo push token.
 * @async
 * @returns {Promise<string | undefined>} A promise that resolves to the Expo push token if successful, or undefined if unsuccessful.
 */
export const registerForPushNotificationsAsync = async (): Promise<
  string | undefined
> => {
  if (!isPhysicalDevice()) {
    console.warn("Push notifications are only supported on physical devices");
    return undefined;
  }

  await setupAndroidNotificationChannel();

  const permissionStatus = await requestNotificationPermissions();
  if (permissionStatus !== "granted") {
    console.warn("Notification permissions not granted");
    return undefined;
  }

  const token = await getExpoPushToken();
  if (token) {
    console.log("[NOTIFICATION_TOKEN_SET]");
  } else {
    console.log("[NOTIFICATION_TOKEN_NOT_SET]");
  }

  return token;
};

/**
 * React component that handles push notification setup.
 */
const PushNotificationSetup: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    setupNotificationHandler();

    const setupPushNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          dispatch(setExpoToken(token));
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    setupPushNotifications().then((r) => r);
  }, [dispatch]);

  return null;
};

export default PushNotificationSetup;
