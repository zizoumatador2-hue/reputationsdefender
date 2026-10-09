// Downloads the site's generated images into public/images before the build.
// Skips files that already exist, and never fails the build: a missing image
// degrades gracefully instead of blocking deployment.
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'public', 'images');
const BASE = 'https://v3b.fal.media/files/b/';

const IMAGES = {
  'logo-source.png': '0aad9fa1/J0g3Rlfvy2sFmBU-G5jWA_27Ev9eTY.png',
  'home-office-woman.jpg': '0aad9fa1/LhGMOAl3-Yj_nSw8aqJqP_hyfjWEjP.jpg',
  'typing-search.jpg': '0aad9fa1/iBWBM3-xcLJmxUu7X8dQY_jar1XFpQ.jpg',
  'privacy-padlock.jpg': '0aad9fa1/3Fi3NYdeffYtFIEH3sFdv_OZjqpfxQ.jpg',
  'relieved-man-call.jpg': '0aad9fa1/o90q8gdZanQ9l5_zHl7Ch_NFThvl5N.jpg',
  'search-visibility-illustration.png': '0aad9fa1/COwG9HfkANip1ziF1t9d3_WUMgJ4il.png',
  'shield-privacy-illustration.png': '0aad9fa1/0wRmUx1GNcn533XROCn1w_yXTVWUsi.png',
  'business-owner-reviews.jpg': '0aad9fa1/PCiRoJYSwTtAgV4Nw2m0k_y6DwtWsC.jpg',
  'content-removal-illustration.png': '0aad9fa2/n-n0SHGDDTXfq1MfQvZST_9UQZPok3.png',
  'senior-man-tablet.jpg': '0aad9fa2/EC234Embu2Ceuyzuo6L20_zLTKdYNg.jpg',
  'data-broker-optout-illustration.png': '0aad9fa2/Eal5jsv_e2ql-U-12tPXr_cbYlRpGA.png',
  'team-office.jpg': '0aad9fa2/TW8mvJDO-vbcHhdgE3F8D_dNPi8mn8.jpg',
  'reviews-illustration.png': '0aad9fa2/HlZ-LlUrRI8lL5LBivVpb_ZdijcBeY.png',
  'phone-privacy-closeup.jpg': '0aad9fa2/Fy8lx4gOGO4US6MasRnup_MGX4BmDk.jpg',
  'hero-banner-woman.jpg': '0aad9fa2/PK7b9UtmoQdiarYVjmoX7_67DD53tl.jpg'
};

// Derived files: [target, source]
const COPIES = [
  ['logo.png', 'logo-source.png'],
  ['favicon.png', 'logo-source.png'],
  ['og-default.jpg', 'hero-banner-woman.jpg']
];

mkdirSync(DIR, { recursive: true });

let ok = 0;
for (const [name, path] of Object.entries(IMAGES)) {
  const dest = join(DIR, name);
  if (existsSync(dest)) { ok++; continue; }
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    ok++;
  } catch (err) {
    console.warn(`[fetch-images] could not fetch ${name}: ${err.message}`);
  }
}

for (const [target, source] of COPIES) {
  const src = join(DIR, source);
  const dest = join(DIR, target);
  if (!existsSync(dest) && existsSync(src)) copyFileSync(src, dest);
}

console.log(`[fetch-images] ${ok}/${Object.keys(IMAGES).length} images ready`);
