import * as dotenv from "dotenv";
dotenv.config();

console.log("ENV OPENAI:", process.env.EXPO_PUBLIC_OPENAI_API_KEY?.substring(0,8));
console.log("ENV UNSPLASH:", process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY?.substring(0,8));


export default {
  expo: {
    name: "Oui, Chef",
    slug: "OuiChef",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./logo/ouichef_logo-01.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      EXPO_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY,
    },
  },
};
