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
