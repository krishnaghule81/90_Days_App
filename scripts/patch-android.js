// Runs in the GitHub build after `npx cap add android`.
// Adds notification permissions, the app icon, splash screen,
// notification icon and reward chime to the generated Android project.
const fs = require("fs");
const path = require("path");

const RES = "android/app/src/main/res";
const SRC = "resources/android";

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// 1. Permissions
const manifestPath = "android/app/src/main/AndroidManifest.xml";
let manifest = fs.readFileSync(manifestPath, "utf8");
const perms = [
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.USE_EXACT_ALARM",
  "android.permission.SCHEDULE_EXACT_ALARM",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.WAKE_LOCK",
  "android.permission.VIBRATE"
];
const missing = perms.filter(p => !manifest.includes('"' + p + '"'));
if (missing.length) {
  const lines = missing.map(p => '    <uses-permission android:name="' + p + '" />').join("\n");
  manifest = manifest.replace("</manifest>", lines + "\n</manifest>");
  fs.writeFileSync(manifestPath, manifest);
}

// 2. App icons
for (const dir of fs.readdirSync(SRC)) {
  if (!dir.startsWith("mipmap-")) continue;
  for (const f of fs.readdirSync(path.join(SRC, dir))) {
    copy(path.join(SRC, dir, f), path.join(RES, dir, f));
  }
}
fs.writeFileSync(path.join(RES, "values/ic_launcher_background.xml"),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#160C2B</color>\n</resources>\n');

// 3. Splash screens
for (const dir of fs.readdirSync(RES)) {
  if (!dir.startsWith("drawable")) continue;
  const target = path.join(RES, dir, "splash.png");
  if (!fs.existsSync(target)) continue;
  const src = dir.includes("land") ? "splash-land.png" : "splash-port.png";
  copy(path.join(SRC, "splash", src), target);
}
const stylesPath = path.join(RES, "values/styles.xml");
let styles = fs.readFileSync(stylesPath, "utf8");
if (!styles.includes("windowSplashScreenBackground")) {
  styles = styles.replace(
    '<item name="android:background">@drawable/splash</item>',
    '<item name="android:background">@drawable/splash</item>\n        <item name="windowSplashScreenBackground">#160C2B</item>'
  );
  fs.writeFileSync(stylesPath, styles);
}

// 4. Notification icon and chime
copy(path.join(SRC, "drawable/ic_stat_icon.xml"), path.join(RES, "drawable/ic_stat_icon.xml"));
copy(path.join(SRC, "raw/chime.wav"), path.join(RES, "raw/chime.wav"));

// 5. Version number = build number, so each build is a clean update
const gradlePath = "android/app/build.gradle";
const build = process.env.BUILD_NUMBER;
if (build && /^\d+$/.test(build)) {
  let g = fs.readFileSync(gradlePath, "utf8");
  g = g.replace(/versionCode\s+\d+/, "versionCode " + build)
       .replace(/versionName\s+"[^"]*"/, 'versionName "1.0.' + build + '"');
  fs.writeFileSync(gradlePath, g);
}

console.log("Android project patched. Added permissions:", missing.join(", ") || "none");
