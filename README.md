# 90 Days app

Your 90-day plan as an Android app: daily quests, XP and levels, streaks, badges,
boss-fight workouts, protein and water trackers, progress charts, and timed reminders.
Everything runs offline on your phone. No account, no Claude needed.

## How the APK gets built

GitHub builds the app for you. Follow SETUP-GUIDE.txt.

## What's inside

- www/index.html: the whole app (screens, plan, game logic, reminders)
- www/fonts/: the display font (Unbounded, SIL Open Font License)
- resources/android/: app icon, splash screen, notification icon, reward chime
- scripts/patch-android.js: adds permissions, icons and sounds during the build
- keys/debug.keystore: fixed signing key so new versions install over old ones
- build-workflow.yml: the build recipe (pasted into GitHub during setup)
- package.json, capacitor.config.json: app settings
