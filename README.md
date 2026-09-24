# إيمان — Capacitor (Android + iOS)

## الهيكلية
```
iman-app/
├─ package.json
├─ capacitor.config.json
├─ scripts/fetch-assets.js   ← ينزّل المصحف والخطوط مرة واحدة
└─ www/
   ├─ index.html             ← التطبيق كاملاً (HTML+CSS+JS)
   ├─ quran.json             ← يُنتَج بالأمر npm run assets
   ├─ fonts.css + fonts/     ← يُنتَج بالأمر npm run assets
```

## خطوات البناء
```bash
cd iman-app
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios \
      @capacitor/local-notifications @capacitor/preferences @capacitor/haptics
npm run assets            # يحتاج إنترنت مرة واحدة فقط
npx cap add android       # وعلى macOS: npx cap add ios
npm run android           # أو: npm run ios   ← يفتح Android Studio / Xcode
```
بعد أي تعديل على `www/`: `npx cap sync`.

## صلاحيات أندرويد — `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

## صلاحيات iOS — `ios/App/App/Info.plist`
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>لحساب أوقات الصلاة واتجاه القبلة بدقة.</string>
```
البوصلة على iOS تطلب إذناً عند فتح تبويب القبلة (يظهر مربع الإذن تلقائياً).

## ملاحظات
- **التخزين:** localStorage مع نسخة مطابقة في Capacitor Preferences، وتُستعاد منها عند كل تشغيل.
- **الإشعارات:** تُجدول محلياً وتصل والتطبيق مغلق. يسمح iOS بـ 64 إشعاراً معلّقاً كحد أقصى، والتطبيق يقصّ الجدولة عند 60. تُجدول الصلوات لثلاثة أيام وتتجدد عند فتح التطبيق.
- **الاهتزاز:** عبر Haptics على الجهاز الفعلي (iOS لا يدعم navigator.vibrate).
- **بدون تشغيل `npm run assets`:** يعمل التطبيق بنص تجريبي لأربع سور وخطوط النظام، ولا تظهر أرقام الصفحات والأجزاء الدقيقة.
