# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm start
   ```

Scan the QR code with the iPhone Camera app or from Expo Go. The default command targets Expo Go over the local network. If the phones are not on the same Wi-Fi or the QR does not open, use `npm run start:go:tunnel` instead.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Test notifications on devices

Expo Go cannot provide Android remote push notifications or full media-library access. Use a development build instead:

```bash
npx expo install expo-dev-client
npx eas build --platform android --profile development
# Use --platform ios for iPhone builds, or --platform all for both platforms.
```

Install the generated build on each device, then run:

```bash
npm run start:dev-client
```

Each signed-in device registers its own Expo push token. The app stores all tokens for a user and sends notifications to every registered device. EAS may ask you to link this project to an Expo account the first time you build it.

Before testing push notifications, set the EAS project ID in `.env`:

```bash
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

Find the value in the Expo project dashboard or after running `npx eas init`. Restart Expo after changing `.env`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
