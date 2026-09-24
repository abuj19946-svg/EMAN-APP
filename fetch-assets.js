// يُشغَّل مرة واحدة على جهازك (يحتاج إنترنت وNode 18+): npm run assets
// ينتج www/quran.json (المصحف العثماني) وwww/fonts.css + www/fonts/ (Amiri Quran وTajawal) ليعمل التطبيق دون اتصال.
const fs = require('fs'), path = require('path');
const W = path.join(__dirname, '..', 'www');
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36' } };

async function quran() {
  const res = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
  if (!res.ok) throw new Error('quran api ' + res.status);
  const surahs = (await res.json()).data.surahs;
  const s = surahs.map(su => su.ayahs.map(a => {
    let t = a.text;
    // البسملة تُعرض في رأس السورة، فتُحذف من أول آية (عدا الفاتحة)
    if (su.number !== 1 && su.number !== 9 && a.numberInSurah === 1) t = t.split(' ').slice(4).join(' ');
    return [t.trim(), a.page, a.juz];
  }));
  const total = s.reduce((n, x) => n + x.length, 0);
  if (s.length !== 114 || total !== 6236) throw new Error('unexpected data: ' + s.length + ' surahs, ' + total + ' ayahs');
  fs.writeFileSync(path.join(W, 'quran.json'), JSON.stringify({ v: 1, s }));
  console.log('quran.json ok (' + total + ' ayahs)');
}

async function fonts() {
  const css = await (await fetch('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Tajawal:wght@400;500;700&display=swap', UA)).text();
  fs.mkdirSync(path.join(W, 'fonts'), { recursive: true });
  let out = css, n = 0;
  for (const m of css.matchAll(/url\((https:[^)]+)\)/g)) {
    const f = 'f' + (n++) + '.woff2';
    const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
    fs.writeFileSync(path.join(W, 'fonts', f), buf);
    out = out.split(m[1]).join('fonts/' + f);
  }
  fs.writeFileSync(path.join(W, 'fonts.css'), out);
  console.log('fonts ok (' + n + ' files)');
}

(async () => { await quran(); await fonts(); })().catch(e => { console.error(e); process.exit(1); });
