# Builds the static JAMRA site (index.html + SEO files) from menu.json and contact.json.
# Contact details are rendered only when provided, so no placeholder data reaches the public page.
import json, html, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
e = html.escape
m = json.load(open("menu.json", encoding="utf-8")); R = m["restaurant"]
C = json.load(open("contact.json", encoding="utf-8"))
SITE_URL = "https://jamra.example"  # replace with the real domain before launch
CUR = R["currency"]

def price(it):
    if "options" in it:
        return "".join(f'<span class="opt"><span>{e(o["label_en"])} <span lang="ar">{e(o["label_ar"])}</span></span><b>{o["price"]}</b></span>' for o in it["options"])
    return f'<b class="price">{it["price"]}<small> {CUR}</small></b>'

def item_html(c, it):
    s = f'{c["id"]} {it["name_en"]} {it["name_ar"]} {it["desc_en"]}'.lower()
    return f'''<li class="item" data-search="{e(s)}">
  <div class="row"><div class="names"><h3>{e(it["name_en"])}</h3><p lang="ar" class="ar-name">{e(it["name_ar"])}</p></div>
  {'' if "options" in it else price(it)}</div>
  <p class="desc">{e(it["desc_en"])}</p><p lang="ar" class="desc-ar">{e(it["desc_ar"])}</p>
  {f'<div class="opts">{price(it)}</div>' if "options" in it else ''}
  </li>'''

cats_nav = "".join(f'<li><a href="#{c["id"]}"><span>{e(c["name_en"])}</span><span lang="ar">{e(c["name_ar"])}</span></a></li>' for c in m["categories"])
menu_html = "".join(f'''<section class="cat" id="{c["id"]}" aria-labelledby="{c["id"]}-h">
  <header><h2 id="{c["id"]}-h">{e(c["name_en"])}</h2><p lang="ar" class="cat-ar">{e(c["name_ar"])}</p></header>
  <ul class="items">{"".join(item_html(c, it) for it in c["items"])}</ul>
</section>''' for c in m["categories"])

# Contact block only when real data is present
contact_html = ""
if C["phone_tel"] or C["whatsapp_number"] or C["address"]:
    parts = []
    if C["address"]: parts.append(f'<p class="addr">{e(C["address"])}</p>')
    if C["opening_hours"]: parts.append("<ul class=\"hours\">" + "".join(f"<li>{e(h)}</li>" for h in C["opening_hours"]) + "</ul>")
    acts = []
    if C["phone_tel"]: acts.append(f'<a class="btn ghost" href="tel:{e(C["phone_tel"])}">Call {e(C["phone_display"] or C["phone_tel"])}</a>')
    if C["whatsapp_number"]: acts.append(f'<a class="btn" href="https://wa.me/{e(C["whatsapp_number"])}?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20the%20menu">WhatsApp</a>')
    if C["map_url"]: acts.append(f'<a class="btn ghost" href="{e(C["map_url"])}" rel="noopener">Directions</a>')
    contact_html = f'''<section class="visit" id="visit" aria-labelledby="visit-h">
  <p class="eyebrow">Visit</p><h2 id="visit-h">Find us</h2>{"".join(parts)}<div class="acts">{"".join(acts)}</div>
  {f'<p class="ig"><a href="{e(C["instagram_url"])}" rel="noopener">Instagram</a></p>' if C["instagram_url"] else ""}
</section>'''

ld = {
  "@context": "https://schema.org", "@type": "Restaurant", "name": "JAMRA",
  "alternateName": "جمرة", "url": SITE_URL + "/", "logo": SITE_URL + "/brand/jamra-app-icon.png",
  "servesCuisine": ["Levantine", "Middle Eastern"], "priceRange": None,
  "hasMenu": {"@type": "Menu", "name": "JAMRA Menu", "inLanguage": ["en", "ar"],
    "hasMenuSection": [{"@type": "MenuSection", "name": c["name_en"],
      "hasMenuItem": [{"@type": "MenuItem", "name": it["name_en"], "description": it["desc_en"],
        **({"offers": {"@type": "Offer", "price": it["price"], "priceCurrency": CUR}} if "price" in it else {})} for it in c["items"]]}
      for c in m["categories"]]}
}
ld.pop("priceRange")
if C["phone_tel"]: ld["telephone"] = C["phone_tel"]
if C["address"]: ld["address"] = {"@type": "PostalAddress", "streetAddress": C["address"]}

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>JAMRA — Charcoal Grill and Mezze · جمرة</title>
<meta name="description" content="JAMRA: charcoal grill and mezze. Browse the full menu of mezze, grilled dishes, mains, manakish, desserts and drinks. Prices in AED.">
<link rel="canonical" href="{SITE_URL}/">
<meta property="og:type" content="website">
<meta property="og:title" content="JAMRA — جمرة">
<meta property="og:description" content="Charcoal grill and mezze. Full menu with prices in AED.">
<meta property="og:url" content="{SITE_URL}/">
<meta property="og:image" content="{SITE_URL}/brand/jamra-logo-reversed.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1E1B18">
<link rel="icon" href="/brand/jamra-app-icon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/cormorant-garamond-latin-500-normal.woff" as="font" type="font/woff" crossorigin>
<link rel="preload" href="/fonts/amiri-arabic-400-normal.woff" as="font" type="font/woff" crossorigin>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<a class="skip" href="#menu">Skip to menu</a>
<header class="top">
  <a class="brand" href="#top" aria-label="JAMRA home"><img src="/brand/jamra-logo-reversed.svg" width="120" height="84" alt="JAMRA — جمرة"></a>
  <nav aria-label="Primary"><ul>
    <li><a href="#menu">Menu</a></li>
    {'<li><a href="#visit">Visit</a></li>' if contact_html else ''}
  </ul></nav>
</header>
<main id="top">
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-inner">
    <img class="hero-logo" src="/brand/jamra-logo-reversed.svg" width="240" height="168" alt="">
    <h1 id="hero-h">JAMRA</h1>
    <p class="hero-ar" lang="ar">جمرة</p>
    <p class="hero-tag">{e(R["descriptor_en"])}</p>
    <p class="hero-tag-ar" lang="ar">{e(R["descriptor_ar"])}</p>
    <a class="btn" href="#menu">View the menu</a>
  </div>
  <a class="scroll" href="#menu" aria-label="Scroll to menu"><span aria-hidden="true"></span></a>
</section>

<section class="menu" id="menu" aria-labelledby="menu-h">
  <header class="menu-head">
    <p class="eyebrow">Menu</p>
    <h2 id="menu-h">Menu <span lang="ar">القائمة</span></h2>
    <p class="cur">{e(R["currency_note_en"])} · <span lang="ar">{e(R["currency_note_ar"])}</span></p>
    <label class="search"><span class="sr">Search dishes</span>
      <input id="q" type="search" placeholder="Search dishes · ابحث عن طبق" autocomplete="off"></label>
  </header>
  <nav class="jump" aria-label="Menu categories"><ul>{cats_nav}</ul></nav>
  <p id="empty" class="empty" hidden>No dishes match your search.</p>
  {menu_html}
</section>
{contact_html}
</main>
<footer class="foot">
  <img src="/brand/jamra-logo-reversed.svg" width="140" height="98" alt="JAMRA — جمرة">
  <p>{e(R["currency_note_en"])}</p>
  <p lang="ar">{e(R["currency_note_ar"])}</p>
  <p class="small">&copy; <span id="yr"></span> JAMRA</p>
</footer>
<script src="/app.js" defer></script>
</body>
</html>
'''
open("index.html", "w", encoding="utf-8").write(page)
open("robots.txt", "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
open("sitemap.xml", "w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{SITE_URL}/</loc></url></urlset>\n')
open("_headers", "w").write("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/brand/*\n  Cache-Control: public, max-age=86400\n")
print("built", len(page))
