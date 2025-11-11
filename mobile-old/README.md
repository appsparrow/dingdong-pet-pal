## DingDongDog Mobile (Expo SDK 54)

This is the native (iOS/Android) implementation powered by Expo + React Native, using the existing Supabase backend.

### Prerequisites
- Expo CLI and Expo Go (SDK 54). Your device is already on 54 – you're good.
- Node 18+

### 1) Configure environment
Create a `.env` file in `mobile/` (or set shell envs) with:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

These are read via `app.config.ts` (Constants.expoConfig.extra).

### 2) Install and run

```bash
cd mobile
npm install
npm run start
# press i for iOS simulator, a for Android (or scan QR with Expo Go)
```

### Navigation
- Auth → BossHome (tabs) or AgentHome (tabs) based on `profiles.role`
- Boss tabs: Dashboard, Profile
- Agent tabs: Assignments, Profile

### Supabase
Client is initialized in `src/lib/supabase.ts` and talks to the same DB as the web app.

### Theming
Color tokens in `src/theme/colors.ts` mirror the web app palette for consistency.

### Next steps
- Add camera and photo upload flows (expo-image-picker / expo-camera)
- Implement Today checklist and activity logging screens
- Push notifications (@notifee/react-native or expo-notifications)
- Offline cache for queries (already using React Query)


