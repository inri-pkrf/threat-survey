// מוריד את כל התמונות של האפליקציה מ-media.base44.com אל public/images
// ומעדכן את src/lib/threats.js כך שיצביע על הקבצים המקומיים.
//
// הרצה (פעם אחת, מהמחשב שלך, עדיף לפני שהמנוי נגמר):
//   node scripts/download-images.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const file = path.resolve("src/lib/threats.js");
const outDir = path.resolve("public/images");
let source = await readFile(file, "utf8");
await mkdir(outDir, { recursive: true });

const urls = [...new Set(source.match(/https:\/\/media\.base44\.com\/[^"'`\s]+/g) || [])];
if (!urls.length) {
  console.log("לא נמצאו כתובות של base44 - אין מה להוריד.");
  process.exit(0);
}

let failed = 0;
for (const url of urls) {
  const name = decodeURIComponent(url.split("/").pop()).replace(/[^\w.\-]/g, "_");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(path.join(outDir, name), Buffer.from(await res.arrayBuffer()));
    source = source.split(url).join(`/images/${name}`);
    console.log("הורד:", name);
  } catch (e) {
    failed++;
    console.error("נכשל:", url, e.message);
  }
}
await writeFile(file, source);
console.log(failed ? `\n${failed} קבצים נכשלו - הכתובות שלהם נשארו כפי שהיו.` : "\nהכל הורד. עכשיו עשי commit ל-public/images ול-src/lib/threats.js.");
