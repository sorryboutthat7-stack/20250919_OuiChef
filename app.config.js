import * as dotenv from "dotenv";
dotenv.config({ path: './temp.env' });

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
      bundleIdentifier: "com.chevuoi.ouichef",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.chevuoi.ouichef",
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
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "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",
      EXPO_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || "Uc-Mym9cNJcfY0S427GoRHsQh1svsn0nnFE0zSHWf3E",
      eas: {
        projectId: "2b3529d5-db6c-4fe0-8cf6-4843cca13d21"
      }
    },
  },
};
