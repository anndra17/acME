# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Architecture :
 CLEAN ARCHITECTURE

 /app
  /(authorized)    # Screens available after authentication
    /(drawer)      # Screens accessible from the drawer menu
      /(tabs)      # Screens accessible from the bottom tabs
         _layout.tsx      # Layout for the tab navigation
         explore.tsx      # Explore screen (accessible from tabs)
         index.tsx        # Default screen when opening the tabs
      _layout.tsx         # Layout for the drawer navigation
      profile.tsx         # Profile screen (accessible from drawer)
    _layout.tsx    # Main layout for authenticated users
    index.tsx      # Entry point after authentication (e.g., Home screen)
    
  /login           # Screens used before authentication (login, register, reset password)
    index.tsx      # Default entry point (redirects to sign-in or another start screen)
    forgot-password.tsx  # Screen for password recovery
    sign-in.tsx    # Login screen
    sign-up.tsx    # Registration screen
    
  _layout.tsx      # Root layout for the entire app (defines main navigation)
  +not-found.tsx   # Default page for non-existent routes (404 handling)

/src
  /components      # Reusable UI components (e.g., buttons, cards, modals)
  /context         # Global state management (e.g., authentication, themes)
  /lib             # API calls and Firebase interactions
  /store           # Global state using Redux/Zustand
  /hooks           # Custom hooks (e.g., useAuth, useFetch)
  /utils           # Utility functions (e.g., validation, formatting, date manipulation)
  /assets          # Static assets (images, fonts, icons)
