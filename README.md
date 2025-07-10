# Setup

## 1. Create Expo App

```bash
npx create-expo-app@latest ./ --template default@52
```

## 2. Install Firebase App Module

```bash
npx expo install @react-native-firebase/app
```

## 3. Configure `app.json`

Add the following to your `app.json` under the `plugins` section:

```json
"plugins": [
  "@react-native-firebase/app"
]
```

## 4. Get SHA1 Key

Navigate to the Android folder:

```bash
cd android
./gradlew signingReport
```

Copy the **SHA1** key and paste it into your Firebase Console under Project Settings > App > Add fingerprint.

## 5. Add `google-services.json`

- Download `google-services.json` from Firebase Console.
- Place it in the **root** of your project (same level as `app.json`).

## 6. Prebuild the Project

Back in the root of your project:

```bash
npx expo prebuild --clean
```

## 7. Verify Application ID

Open `./android/app/build.gradle` and ensure the `applicationId` matches the value in your `app.json`:

```json
"android": {
  "package": "com.yourapp.package"
}
```

Example in `build.gradle`:

```gradle
defaultConfig {
    applicationId "com.yourapp.package"
    ...
}
```

## 9. Run the App

- Install Android Studio or connect your phone to your laptop through usb

From your project root:

```bash
npm run android
```

OR

```bash
npx expo run:android
```
<<<<<<< HEAD
This is a safe update to enable pull request.
=======

## Setup NativeWind

## 1. Install the dependencies

```bash
npm install nativewind react-native-reanimated@~3.17.4 react-native-safe-area-context@5.4.0
```

then

```bash
npm install -D tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
```

## 2. Setup tailwind config file

```bash
npx tailwindcss init
```

`tailwind.config.json`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 3. Create a CSS file and add the Tailwind directives

Add global.css file in your project root (i.e. same level as app.json)

`global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 4. Add the Babel preset

Add a `babel.config.js` to the root of your project

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

## 5. Create or modify your metro.config.js

Add a `metro.config.js` in your project root

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })
```

## 6. Import your CSS file

Import the `global.css` in your `app/_layout.tsx`

```tsx
import "../global.css"

export default function RootLayout() {...}
```
>>>>>>> upstream/master
