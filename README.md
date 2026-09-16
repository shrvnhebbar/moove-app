# FORM — fitness + nutrition tracker (Expo / React Native)

Cross-platform prototype combining Cronometer-style nutrition tracking with
Hevy-style workout logging. Dark theme with a lime accent, matching the
earlier web prototype.

## 1. Install

```
npm install
```

## 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → create a project.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create database (start in production mode).
4. Paste the contents of `firestore.rules` into Firestore → Rules, and publish.
5. Project settings → General → "Your apps" → add a **Web app** (yes, even
   though this is React Native — Firebase JS SDK uses the web app config) →
   copy the config object.
6. Paste those values into `firebase/config.js`, replacing the placeholders.

## 3. Run

```
npx expo start
```

- Press `a` to open in an Android emulator, or scan the QR code with the
  **Expo Go** app on a physical Android phone.
- `npm run ios` / `npm run web` also work if you want to preview elsewhere.

## What's wired up

- **Auth**: email/password sign up & login via Firebase Auth, session
  persisted with AsyncStorage so users stay logged in.
- **Nutrition**: food logged per meal (Breakfast/Lunch/Dinner/Snacks) is
  saved to Firestore at `users/{uid}/nutritionLogs/{yyyy-mm-dd}` and synced
  live via `onSnapshot`.
- **Workouts**: finished workouts are saved to
  `users/{uid}/workouts/{autoId}` and the history list updates live.
- **Home dashboard**: pulls today's nutrition totals live from Firestore.
  Steps / calories-burned / active-minutes / weight-trend are still **mock
  data** — there's no device sensor hookup yet.

## Not done yet (next steps)

- Step/activity data from Google Fit or Health Connect on Android.
- Weight logging UI (currently a static trend line).
- Editable calorie/macro goals (currently hardcoded constants).
- Exercise history per exercise (e.g. "last time you did Bench Press").
- App icon / splash assets, and the real brand color palette when you send it.
