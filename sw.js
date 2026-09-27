// sw.js — تطبيق "إيمان"
// خدمة العامل (Service Worker) هذه مسؤولة حصرياً عن عرض جميع الإشعارات
// (تجريبية، أذكار، أو أوقات صلاة) على الجوال، لأن `new Notification()` من
// الواجهة الرئيسية تفشل أو تُقيَّد على Android Chrome و iOS Safari PWA.

const SW_VERSION = 'iman-sw-v2';

self.addEventListener('install', (event) => {
  // فعّل الإصدار الجديد فوراً دون انتظار إغلاق كل التبويبات المفتوحة
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // تحكّم في كل الصفحات المفتوحة فوراً بعد التفعيل
  event.waitUntil(self.clients.claim());
});

// عند الضغط على الإشعار: أغلقه، وركّز نافذة التطبيق المفتوحة إن وُجدت،
// وإلا افتح نافذة جديدة على الصفحة الرئيسية للتطبيق.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.indexOf(self.registration.scope) === 0 && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('./');
        }
      })
  );
});

// قناة بديلة اختيارية: تسمح للصفحة بطلب عرض إشعار عبر postMessage
// بدلاً من استدعاء reg.showNotification() مباشرة، لتغطية أي متصفح/سياق
// يقيّد الاستدعاء المباشر من صفحة الويب.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION') {
    const title = data.title || 'تطبيق مسار';
    const options = Object.assign(
      {
        icon: 'icon-192.png',
        badge: 'badge-96.png',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [200, 100, 200],
        renotify: true,
      },
      data.options || {}
    );
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
