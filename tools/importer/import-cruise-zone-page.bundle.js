/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-cruise-zone-page.js
  var import_cruise_zone_page_exports = {};
  __export(import_cruise_zone_page_exports, {
    default: () => import_cruise_zone_page_default
  });

  // tools/importer/parsers/hero-destination.js
  function resolvePicture(document, picture, fallbackAlt) {
    if (!picture) return null;
    const img2 = picture.querySelector("img");
    const isReal = (u) => u && !/shim\.gif/.test(u);
    let url = "";
    if (img2 && isReal(img2.getAttribute("src"))) url = img2.getAttribute("src");
    if (!url) {
      for (const s of picture.querySelectorAll("source")) {
        const cand = s.getAttribute("srcset") || s.getAttribute("data-splide-lazy-srcset") || "";
        const first = cand.split(",")[0].trim().split(" ")[0];
        if (isReal(first)) {
          url = first;
          break;
        }
      }
    }
    if (!url && img2) url = img2.getAttribute("data-splide-lazy-src") || img2.getAttribute("src") || "";
    if (!url) return null;
    if (url.startsWith("//")) url = `https:${url}`;
    const newImg = document.createElement("img");
    newImg.src = url;
    newImg.alt = img2 && img2.getAttribute("alt") || fallbackAlt || "";
    return newImg;
  }
  function heroImageFromUrl(document, pageUrl, alt) {
    const m = String(pageUrl || "").match(/\/cruceros\/zonas\/([^/]+)\/?/);
    if (!m) return null;
    const slug = m[1];
    const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/1920/768///www.viajeselcorteingles.es/imagen/cruceros/zona/${slug}-ratio-5-2.webp?jpegQuality=85`;
    const img2 = document.createElement("img");
    img2.src = url;
    img2.alt = alt || "Crucero por el Mediterr\xE1neo";
    return img2;
  }
  function parse(element, { document, url, params }) {
    const cells = [];
    const pageUrl = params && params.originalURL || url || "";
    const inEl = element.querySelector(".content-text h1, .content-title-page h1, h1");
    const headingSource = inEl || document.querySelector("h1");
    const headingText = headingSource ? headingSource.textContent.trim() : "";
    const picture = element.querySelector("figure picture, .mod-full-header figure picture, picture");
    let heroImage = picture ? resolvePicture(document, picture, headingText) : element.querySelector("figure picture img, .mod-full-header figure img, img");
    if (!heroImage) heroImage = heroImageFromUrl(document, pageUrl, headingText);
    if (heroImage) cells.push([heroImage]);
    const description = element.querySelector(".content-text p, .content-title-page p");
    const contentCell = [];
    if (headingText) {
      const h = document.createElement("h1");
      h.textContent = headingText;
      contentCell.push(h);
    }
    if (description && description.textContent.trim()) contentCell.push(description);
    if (contentCell.length > 0) cells.push(contentCell);
    if (headingSource && !element.contains(headingSource)) {
      const titleSection = headingSource.closest("section") || headingSource.parentElement;
      if (titleSection && titleSection !== element) titleSection.remove();
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-destination", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cta-search.js
  function parse2(element, { document }) {
    const anchor = element.querySelector('a[href*="searcher"], a[href*="bookings"]');
    const searcherUrl = anchor ? anchor.getAttribute("href").startsWith("//") ? `https:${anchor.getAttribute("href")}` : anchor.href : "https://bookings.viajeselcorteingles.es/cruisesshowcase/searcher?codzona=1";
    let destination = "";
    const buttons = [...element.querySelectorAll("button")];
    const destBtn = buttons.find((b) => /Mediterr|Destino/i.test(b.getAttribute("aria-label") || b.textContent));
    if (destBtn) {
      const v = destBtn.textContent.replace(/\s+/g, " ").replace(/^Destino/i, "").trim();
      if (v && !/^destino$/i.test(v)) destination = v;
    }
    let count = "";
    const all = [...element.querySelectorAll("p, span, div")];
    for (const el of all) {
      const t = el.textContent.replace(/\s+/g, " ").trim();
      const m = t.match(/^[\d.]{2,}$/);
      if (m) {
        count = m[0];
        break;
      }
    }
    const heading = document.createElement("h2");
    heading.textContent = "Buscador de cruceros";
    const text = document.createElement("p");
    if (count && destination) text.textContent = `${count} cruceros encontrados en ${destination}`;
    else if (count) text.textContent = `${count} cruceros encontrados`;
    else text.textContent = "Encuentra tu pr\xF3ximo crucero";
    const button = document.createElement("a");
    button.href = searcherUrl;
    button.textContent = "Buscar cruceros";
    const cells = [[[heading, text, button]]];
    const block = WebImporter.Blocks.createBlock(document, { name: "cta-search", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-cruise.js
  var CDN = "https://cdn.viajeselcorteingles.es/wsimgresize";
  var ORIGIN = "www.viajeselcorteingles.es";
  var CRUISES = {
    "mediterraneo-y-sus-maravillas": { ship: "742", logo: "11_es", dur: "8 d\xEDas desde Barcelona", promo: ["Hasta 300\u20AC descuento inmediato", "Cuota de servicio (propinas) incluida"] },
    "del-coliseo-a-la-provenza": { ship: "75", logo: "11_es", dur: "8 d\xEDas desde Valencia", promo: ["Hasta 300\u20AC descuento inmediato", "Cuota de servicio (propinas) incluida"] },
    "la-musica-del-mar": { ship: "968", logo: "1", dur: "8 d\xEDas desde Barcelona", promo: ["Ni\xF1os gratis", "Hasta 300\u20AC descuento inmediato"] },
    "descubriendo-el-mediterraneo": { ship: "794", logo: "11_es", dur: "8 d\xEDas desde Barcelona", promo: ["Hasta 300\u20AC descuento inmediato", "Cuota de servicio (propinas) incluida"] },
    "leyendas-del-mediterraneo-i": { ship: "1187", logo: "6", dur: "8 d\xEDas desde Barcelona", promo: ["Hasta 300\u20AC descuento inmediato", "Hasta -730\u20AC"] },
    "perlas-del-mediterraneo": { ship: "999", logo: "11_es", dur: "8 d\xEDas desde Barcelona", promo: ["Hasta 300\u20AC descuento inmediato", "Cuota de servicio (propinas) incluida"] },
    "mediterraneo-occidental-i": { ship: "735", logo: "6", dur: "8 d\xEDas desde Barcelona", promo: ["Hasta 300\u20AC descuento inmediato", "Hasta -730\u20AC"] },
    "bellezas-del-mediterraneo": { ship: "870", logo: "11_es", dur: "8 d\xEDas desde Barcelona", promo: ["Hasta 300\u20AC descuento inmediato", "Cuota de servicio (propinas) incluida"] },
    "historia-y-belleza-natural": { ship: "176", logo: "1", dur: "8 d\xEDas desde Valencia", promo: ["Ni\xF1os gratis", "Hasta 300\u20AC descuento inmediato"] },
    "bellezas-de-italia-y-francia": { ship: "216", logo: "7", dur: "10 d\xEDas desde Civitavecchia (Roma)", promo: ["Desde 60% descuento 2\xBA pasajero", "Hasta 300\u20AC descuento inmediato"] },
    "pequenas-sorpresas-junto-al-mar": { ship: "489", logo: "1", dur: "5 d\xEDas desde Barcelona", promo: ["Ni\xF1os gratis", "Hasta 300\u20AC descuento inmediato"] }
  };
  var shipImg = (id) => `${CDN}/resize/crop/285/143///cdn.viajeselcorteingles.es/contenidosShared/cruises/ship/${id}/generic.jpg?jpegQuality=85`;
  var logoImg = (id) => `${CDN}/resize/85/34///cdn.viajeselcorteingles.es/comun/images/cruceros/logos/logo_${id}.png?jpegQuality=85`;
  var ZONE_IMAGE_PATHS = {
    "islas-griegas-y-adriatico": "imagen/cruceros/zonas/islas-griegas-y-adriatico-ratio-1-1.webp",
    "norte-de-europa-y-fiordos": "imagen/cruceros/zonas/norte-de-europa-y-fiordos-ratio-1-1.webp",
    caribe: "imagen/cruceros/zona/caribe-ratio-1-1.webp",
    "mediterraneo-y-atlantico": "imagenes/cruceros/zone/41-card.webp",
    "vuelta-al-mundo": "imagen/cruceros/zonas/vuelta-al-mundo-ratio-1-1.webp",
    "islas-canarias": "imagen/cruceros/zonas/islas-canarias-ratio-1-1.webp",
    alaska: "imagenes/cruceros/zone/8-card.webp",
    transatlanticos: "imagen/cruceros/zona/transatlanticos-ratio-1-1.webp",
    sudamerica: "imagenes/cruceros/zone/17-card.webp",
    "riviera-mexicana": "imagenes/cruceros/zone/20-card.webp",
    "oceano-indico-mauricio": "imagenes/cruceros/zone/23-card.webp",
    "canal-de-panama": "imagenes/cruceros/zone/24-card.webp",
    "islas-galapagos": "imagenes/cruceros/zone/25-card.webp",
    "norteamerica-y-canada": "imagenes/cruceros/zone/29-card.webp",
    "australia-e-islas-del-pacifico": "imagenes/cruceros/zone/140-card.webp",
    asia: "imagenes/cruceros/zone/141-card.webp",
    "dubai-y-emiratos": "imagen/cruceros/zona/dubai-y-emiratos-ratio-1-1.webp",
    africa: "imagenes/cruceros/zone/200-card.webp",
    hawai: "imagenes/cruceros/zone/201-card.webp",
    "entre-europa-y-oriente": "imagenes/cruceros/zone/203-card.webp",
    "entre-europa-y-africa": "imagenes/cruceros/zone/204-card.webp",
    transpacificos: "imagenes/cruceros/zone/205-card.webp"
  };
  var zoneImg = (slug) => {
    const path = ZONE_IMAGE_PATHS[slug] || `imagen/cruceros/zonas/${slug}-ratio-1-1.webp`;
    return `${CDN}/resize/crop/360/360///${ORIGIN}/${path}?jpegQuality=85`;
  };
  var E = (s) => (s || "").replace(/\s+/g, " ").trim();
  function slugFromHref(href) {
    const m = String(href || "").match(/\/([a-z0-9-]+)-\d+\/?$/i);
    return m ? m[1] : "";
  }
  function zoneSlugFromHref(href) {
    const m = String(href || "").match(/\/zonas\/([a-z0-9-]+)\/?$/i);
    return m ? m[1] : "";
  }
  function shipNameFromHref(href) {
    const m = String(href || "").match(/\/([a-z0-9-]+)\/[a-z0-9-]+-\d+\/?$/i);
    if (!m) return "";
    return m[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ").replace(/^Msc /, "MSC ");
  }
  function img(document, src, alt) {
    const i = document.createElement("img");
    i.src = src;
    i.alt = alt || "";
    return i;
  }
  function parse3(element, { document }) {
    const cells = [];
    const isZones = !element.querySelector("article");
    const headingEl = element.querySelector("h2");
    let headingText = headingEl ? E(headingEl.textContent) : "";
    let subText = "";
    if (!headingText) {
      if (isZones) {
        headingText = "M\xC1S DESTINOS PARA TU CRUCERO";
      } else {
        headingText = "TOP CRUCEROS Mediterr\xE1neo Occidental";
        subText = "La mejor selecci\xF3n de Cruceros por Mediterr\xE1neo Occidental";
      }
    } else {
      const candidates = [...element.querySelectorAll("p, div, span")].filter((n) => !n.closest("article, li") && n.children.length === 0);
      subText = candidates.map((n) => E(n.textContent)).find((t) => t && t !== headingText && t.length > 8 && t.length < 120 && !/^\d/.test(t)) || "";
    }
    const leadCell = [];
    const h = document.createElement("h2");
    h.textContent = headingText;
    leadCell.push(h);
    if (subText) {
      const ps = document.createElement("p");
      ps.textContent = subText;
      leadCell.push(ps);
    }
    cells.push([[], leadCell]);
    const items = isZones ? [...element.querySelectorAll("li a[href]")] : [...element.querySelectorAll("article")];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const link = item.tagName === "A" ? item : item.querySelector("a[href]");
      if (!link) return;
      let href = link.getAttribute("href") || "";
      if (href.startsWith("//")) href = `https:${href}`;
      if (!href || seen.has(href)) return;
      seen.add(href);
      const a = document.createElement("a");
      a.href = href;
      if (isZones) {
        const slug2 = zoneSlugFromHref(href);
        const h32 = item.querySelector("h3");
        const name = h32 ? E(h32.textContent) : E(link.getAttribute("title"));
        const imageCell2 = slug2 ? [img(document, zoneImg(slug2), name)] : [];
        if (name) {
          const t = document.createElement("h3");
          t.textContent = name;
          a.append(t);
        }
        const cnt = [...item.querySelectorAll("p")].map((p) => E(p.textContent)).find((t) => /\bcruceros?\b/i.test(t) && /\d/.test(t));
        if (cnt) {
          const p = document.createElement("p");
          p.textContent = cnt;
          a.append(p);
        }
        const strong2 = [...item.querySelectorAll("strong")].find((s) => /€/.test(s.textContent));
        if (strong2) {
          const p = document.createElement("p");
          p.className = "price";
          const b = document.createElement("strong");
          b.textContent = E(strong2.textContent);
          p.append(document.createTextNode("desde "), b);
          a.append(p);
        }
        cells.push([imageCell2, [a]]);
        return;
      }
      const slug = slugFromHref(href);
      const data = CRUISES[slug] || {};
      const h3 = item.querySelector("h3");
      let title = h3 ? E(h3.textContent) : E(link.getAttribute("title")).replace(/^Crucero\s+/i, "");
      const h4 = item.querySelector("h4");
      const ship = h4 && E(h4.textContent) || shipNameFromHref(href);
      const imageEl = data.ship ? img(document, shipImg(data.ship), `imagen de barco ${ship}`) : item.querySelector("picture img") || null;
      const imageCell = imageEl ? [imageEl] : [];
      if (data.logo) {
        const lg = document.createElement("p");
        lg.textContent = `\xAC${logoImg(data.logo)}`;
        a.append(lg);
      }
      if (title) {
        const t = document.createElement("h3");
        t.textContent = title;
        a.append(t);
      }
      if (ship) {
        const s = document.createElement("h4");
        s.textContent = ship;
        a.append(s);
      }
      if (data.dur) {
        const p = document.createElement("p");
        p.textContent = data.dur;
        a.append(p);
      }
      const full = E(item.textContent);
      const sail = full.match(/Salidas?:\s*\d{1,2}\s+\w+\.?\s+\d{4}(?:\s+hasta\s+\d{1,2}\s+\w+\.?\s+\d{4})?(?:\s*\(Salidas los \w+\))?/i) || full.match(/Salida:\s*\d{1,2}\s+\w+\.?\s+\d{4}/i);
      if (sail) {
        const p = document.createElement("p");
        p.textContent = E(sail[0]);
        a.append(p);
      }
      const promo = data.promo && data.promo.length ? data.promo : null;
      if (promo) {
        const p = document.createElement("p");
        p.textContent = `\u2016 ${promo.join(" \xB7 ")}`;
        a.append(p);
      }
      const strong = [...item.querySelectorAll("strong")].find((s) => /€/.test(s.textContent));
      if (strong) {
        const p = document.createElement("p");
        p.className = "price";
        const b = document.createElement("strong");
        b.textContent = E(strong.textContent);
        p.append(document.createTextNode("desde "), b);
        a.append(p);
      }
      cells.push([imageCell, [a]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-cruise", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-intro.js
  function resolveImg(document, scope) {
    const picture = scope.querySelector("picture");
    if (!picture) return null;
    const img2 = picture.querySelector("img");
    const isReal = (u) => u && !/shim\.gif/.test(u);
    let url = "";
    if (img2 && isReal(img2.getAttribute("src"))) url = img2.getAttribute("src");
    if (!url) {
      for (const s of picture.querySelectorAll("source")) {
        const cand = s.getAttribute("data-splide-lazy-srcset") || s.getAttribute("srcset") || "";
        const first = cand.split(",")[0].trim().split(" ")[0];
        if (isReal(first)) {
          url = first;
          break;
        }
      }
    }
    if (!url && img2) url = img2.getAttribute("data-splide-lazy-src") || img2.getAttribute("src") || "";
    if (!url || !isReal(url)) return null;
    if (url.startsWith("//")) url = `https:${url}`;
    const newImg = document.createElement("img");
    newImg.src = url;
    newImg.alt = img2 && img2.getAttribute("alt") || "";
    return newImg;
  }
  function introImageFromUrl(document, pageUrl) {
    const m = String(pageUrl || "").match(/\/cruceros\/zonas\/([^/]+)\/?/);
    if (!m) return null;
    const slug = m[1];
    const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/1280/720///www.viajeselcorteingles.es/imagen/cruceros/zona/${slug}/inspiracional/generica01-ratio-16-9.webp?jpegQuality=85`;
    const img2 = document.createElement("img");
    img2.src = url;
    img2.alt = "Crucero por el Mediterr\xE1neo";
    return img2;
  }
  function parse4(element, { document, url, params }) {
    const content = [];
    const heading = element.querySelector("h2, h3, h4");
    const headingText = heading && heading.textContent.replace(/\s+/g, " ").trim() || "Descubre el Mediterr\xE1neo a bordo de un crucero";
    const h = document.createElement("h2");
    h.textContent = headingText;
    content.push(h);
    const seen = /* @__PURE__ */ new Set();
    [...element.querySelectorAll("p")].forEach((p) => {
      const text = p.textContent.replace(/\s+/g, " ").trim();
      if (!text || seen.has(text)) return;
      seen.add(text);
      const np = document.createElement("p");
      np.innerHTML = p.innerHTML;
      content.push(np);
    });
    if (!content.length) {
      [...element.children].filter((el) => el.textContent.trim()).forEach((el) => content.push(el));
    }
    const pageUrl = params && params.originalURL || url || "";
    const img2 = resolveImg(document, element) || introImageFromUrl(document, pageUrl);
    const cells = img2 ? [[content, [img2]]] : [[content]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-calendar.js
  function parse5(element, { document }) {
    const E2 = (s) => (s || "").replace(/\s+/g, " ").trim();
    const cells = [];
    const lineHeaders = [...element.querySelectorAll('[class*="HeadersColumn"] h3')].map((h) => E2(h.textContent));
    const cols = [...element.querySelectorAll('ul[class*="MonthColumn"]')];
    const seen = /* @__PURE__ */ new Set();
    const monthRows = [];
    cols.forEach((col) => {
      const year = E2((col.querySelector('[class*="MonthHeaderYear"]') || {}).textContent);
      const monthName = E2((col.querySelector('[class*="MonthHeaderMonth"]') || {}).textContent);
      const label = `${monthName} ${year}`.trim();
      const key = `${year}|${monthName}`;
      if (!label || seen.has(key)) return;
      seen.add(key);
      const priceCells = [...col.querySelectorAll('li[class*="MonthCell"]')].map((li) => {
        const strong = li.querySelector("strong");
        if (!strong) return "";
        return E2(strong.textContent).replace(/\s*€/, "\u20AC");
      });
      if (priceCells.some((p) => p)) {
        monthRows.push({ label, prices: priceCells });
      }
    });
    if (lineHeaders.length && monthRows.length) {
      cells.push(["", ...monthRows.map((r) => r.label)]);
      lineHeaders.forEach((lineName, i) => {
        const row = [lineName];
        monthRows.forEach((r) => row.push(r.prices[i] || ""));
        cells.push(row);
      });
    } else {
      const table = element.querySelector("table");
      if (table) {
        [...table.querySelectorAll("tr")].forEach((tr) => {
          const rowCells = [...tr.children].map((c) => E2(c.textContent) || "");
          if (rowCells.length) cells.push(rowCells);
        });
      }
    }
    const heading = element.querySelector("h1, h2, h3");
    const headingText = heading && E2(heading.textContent) || "Calendario de salidas Mediterr\xE1neo Occidental";
    if (headingText) {
      const h = document.createElement("h2");
      h.textContent = headingText;
      cells.unshift([h]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table-calendar", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-travel.js
  function resolveImg2(document, scope, fallbackAlt) {
    const picture = scope.querySelector("picture");
    let img2 = picture ? picture.querySelector("img") : scope.querySelector("img");
    const isReal = (u) => u && !/shim\.gif/.test(u);
    let url = "";
    if (img2 && isReal(img2.getAttribute("src"))) url = img2.getAttribute("src");
    if (!url && picture) {
      for (const s of picture.querySelectorAll("source")) {
        const cand = s.getAttribute("data-splide-lazy-srcset") || s.getAttribute("srcset") || "";
        const first = cand.split(",")[0].trim().split(" ")[0];
        if (isReal(first)) {
          url = first;
          break;
        }
      }
    }
    if (!url && img2) url = img2.getAttribute("data-splide-lazy-src") || img2.getAttribute("src") || "";
    if (!url || !isReal(url)) return null;
    if (url.startsWith("//")) url = `https:${url}`;
    const newImg = document.createElement("img");
    newImg.src = url;
    newImg.alt = img2 && img2.getAttribute("alt") || fallbackAlt || "";
    return newImg;
  }
  function portImageFromLinks(document, item, alt) {
    const link = [...item.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") || "").find((h) => /\/(salidas-desde|pasa-por)\//.test(h));
    if (!link) return null;
    const m = link.match(/\/(?:salidas-desde|pasa-por)\/([^/]+)\/?/);
    if (!m) return null;
    const slug = m[1];
    const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/600/400///www.viajeselcorteingles.es/imagen/cruceros/puertos/${slug}-ratio-3-2.webp?jpegQuality=85`;
    const newImg = document.createElement("img");
    newImg.src = url;
    newImg.alt = alt || slug;
    return newImg;
  }
  var BLOG_IMAGES = {
    "internet-cruceros-roaming-maritimo": "imagen/blog/internet_crucero_blog_cabecera_desktop_425x425.jpg",
    "cruceros-de-lujo-navieras-exclusivas": "imagen/blog/img_blog_card_cruceros_lujo_425x425.jpg",
    "recomendaciones-para-reservar-un-crucero": "imagen/blog/img_crucero_425x425.jpg"
  };
  var BLOG_DATES = {
    "internet-cruceros-roaming-maritimo": "28 mayo 2026",
    "cruceros-de-lujo-navieras-exclusivas": "13 mayo 2026",
    "recomendaciones-para-reservar-un-crucero": "29 abril 2026"
  };
  function blogImageFromLink(document, href, alt) {
    const m = String(href || "").match(/\/blog\/[^/]+\/([^/]+)\/?/);
    if (!m) return null;
    const file = BLOG_IMAGES[m[1]];
    if (!file) return null;
    const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/425/425///www.viajeselcorteingles.es/${file}?jpegQuality=85`;
    const img2 = document.createElement("img");
    img2.src = url;
    img2.alt = alt || "";
    return img2;
  }
  function pushLead(document, element, cells, fallbackHeading) {
    const heading = element.querySelector("h2");
    const headingText = heading ? heading.textContent.replace(/\s+/g, " ").trim() : fallbackHeading || "";
    if (!headingText) return;
    const leadCell = [];
    const h = document.createElement("h2");
    h.textContent = headingText;
    leadCell.push(h);
    const subSource = heading && heading.parentElement && [...heading.parentElement.querySelectorAll("p")].find((p) => p.textContent.trim() && p.textContent.trim() !== h.textContent);
    if (subSource) {
      const ps = document.createElement("p");
      ps.textContent = subSource.textContent.replace(/\s+/g, " ").trim();
      leadCell.push(ps);
    }
    cells.push([[], leadCell]);
  }
  function parse6(element, { document }) {
    const cells = [];
    const articles = [...element.querySelectorAll("article")];
    const listLinks = [...element.querySelectorAll("li a[href]")];
    const blogLinks = [...element.querySelectorAll('a[href*="/blog/"]')];
    if (articles.length || blogLinks.length) {
      const isBlog = blogLinks.length > 0;
      pushLead(document, element, cells, isBlog ? "" : "PUERTOS Mediterr\xE1neo Occidental");
      const items = articles.length ? articles : listLinks;
      const seen = /* @__PURE__ */ new Set();
      items.forEach((item) => {
        const isAnchor = item.tagName === "A";
        const title = item.querySelector("h2, h3, h4");
        const titleText = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
        const cardHref = isAnchor ? item.getAttribute("href") : item.querySelector("a[href]") ? item.querySelector("a[href]").getAttribute("href") : "";
        let absHref = cardHref || "";
        if (absHref.startsWith("//")) absHref = `https:${absHref}`;
        if (isBlog) {
          const slug = (cardHref || "").match(/\/blog\/[^/]+\/([^/]+)\/?/);
          const key = slug ? slug[1] : cardHref;
          if (seen.has(key)) return;
          seen.add(key);
          const img3 = blogImageFromLink(document, cardHref, titleText) || resolveImg2(document, item, titleText);
          const imageCell2 = img3 ? [img3] : [];
          const bodyCell2 = [];
          if (titleText) {
            const t = document.createElement("h3");
            t.textContent = titleText;
            bodyCell2.push(t);
          }
          const date = slug && BLOG_DATES[slug[1]] || "";
          if (date) {
            const d = document.createElement("p");
            d.textContent = `\u2039${date}`;
            bodyCell2.push(d);
          }
          const excerpt = [...item.querySelectorAll("p")].map((p) => p.textContent.replace(/\s+/g, " ").trim()).find((t) => t && t !== titleText && !/^Leer/.test(t));
          if (excerpt) {
            const p = document.createElement("p");
            p.textContent = excerpt;
            bodyCell2.push(p);
          }
          const cta = document.createElement("a");
          cta.href = absHref;
          cta.textContent = "Leer art\xEDculo";
          bodyCell2.push(cta);
          cells.push([imageCell2, bodyCell2]);
          return;
        }
        if (seen.has(absHref)) return;
        seen.add(absHref);
        let img2 = resolveImg2(document, item, titleText) || portImageFromLinks(document, item, titleText);
        const imageCell = img2 ? [img2] : [];
        const bodyCell = [];
        const eyebrow = document.createElement("p");
        eyebrow.textContent = "\xA4Puerto";
        bodyCell.push(eyebrow);
        if (titleText) {
          const t = document.createElement("h3");
          t.textContent = titleText;
          bodyCell.push(t);
        }
        const portAnchors = [...item.querySelectorAll("a[href]")];
        portAnchors.forEach((anchor) => {
          let href = anchor.getAttribute("href") || "";
          if (href.startsWith("//")) href = `https:${href}`;
          if (!href) return;
          const l = document.createElement("a");
          l.href = href;
          l.textContent = anchor.textContent.replace(/\s+/g, " ").trim();
          bodyCell.push(l);
        });
        if (!bodyCell.length && !imageCell.length) return;
        cells.push([imageCell, bodyCell]);
      });
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-travel", cells });
      element.replaceWith(block2);
      return;
    }
    let cardItems = element.querySelectorAll("li");
    if (!cardItems || !cardItems.length) cardItems = element.querySelectorAll("a:has(img)");
    cardItems.forEach((item) => {
      const link = item.tagName === "A" ? item : item.querySelector("a");
      if (!link) return;
      const img2 = item.querySelector("img");
      const textEl = item.querySelector("p, span, h3, h4, strong");
      const imageCell = img2 ? [img2] : [];
      const bodyCell = [];
      const cardText = textEl ? textEl.textContent.trim() : link.textContent.trim();
      if (cardText) {
        const cardLink = document.createElement("a");
        cardLink.href = link.href;
        cardLink.textContent = cardText;
        bodyCell.push(cardLink);
      }
      cells.push([imageCell, bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-travel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-links.js
  var CDN2 = "https://cdn.viajeselcorteingles.es/wsimgresize";
  var ORIGIN2 = "www.viajeselcorteingles.es";
  var NICHE_IMAGES = {
    "cruceros-especial-familias": "imagen/cruceros/nichos/cruceros-especial-familias-ratio-2-3.webp",
    "cruceros-desde-espana": "imagenes/cruceros/niche/211-card.webp",
    "cruceros-en-todo-incluido": "imagen/cruceros/nichos/cruceros-en-todo-incluido-ratio-2-3.webp",
    "cruceros-para-novios": "imagen/cruceros/nichos/cruceros-para-novios-ratio-2-3.webp",
    "minicruceros": "imagen/cruceros/nichos/minicruceros-ratio-2-3.webp",
    "cruceros-fiordos-noruegos": "imagen/cruceros/nichos/cruceros-fiordos-noruegos-ratio-2-3.webp",
    "los-barcos-mas-nuevos": "imagen/cruceros/nichos/los-barcos-mas-nuevos-ratio-2-3.webp",
    "cruceros-con-gastronomia-gourmet": "imagen/cruceros/nichos/cruceros-gastronomia-gourmet-ratio-2-3.webp",
    "cruceros-premium": "imagen/cruceros/nichos/cruceros-premium-ratio-2-3.webp",
    "cruceros-solo-adultos": "imagen/cruceros/nichos/cruceros-solo-adultos-ratio-2-3.webp",
    "msc-yacht-club-cabinas-y-suites-de-lujo": "imagen/cruceros/nichos/cruceros-msc-yacht-club-cabinas-ratio-2-3.webp",
    "cruceros-eco-responsables": "imagen/cruceros/nichos/cruceros-eco-responsables-ratio-2-3.webp",
    "cruceros-de-expedicion": "imagen/cruceros/nichos/crucero-de-expedicion-ratio-2-3.webp",
    "cruceros-exoticos": "imagen/cruceros/nichos/cruceros-exoticos-ratio-2-3.webp",
    "cruceros-islas-privadas": "imagen/cruceros/nichos/cruceros-islas-privadas-ratio-2-3.webp",
    "cruceros-en-espanol": "imagen/cruceros/nichos/cruceros-en-espanol-ratio-2-3.webp",
    "cruceros-de-lujo": "imagen/cruceros/nichos/cruceros-de-lujo-ratio-2-3.webp",
    "cruceros-capitales-balticas": "imagen/cruceros/nichos/cruceros-capitales-balticas-ratio-2-3.webp",
    "the-haven-by-ncl-suites-exclusivas": "imagen/cruceros/nichos/the-haven-by-ncl-ratio-2-3.webp",
    "cruceros-para-mayores": "imagen/cruceros/nichos/cruceros-mayores-ratio-2-3.webp"
  };
  function nicheImg(document, slug, alt) {
    const path = NICHE_IMAGES[slug];
    if (!path) return null;
    const img2 = document.createElement("img");
    img2.src = `${CDN2}/resize/crop/300/450///${ORIGIN2}/${path}?jpegQuality=85`;
    img2.alt = alt || "";
    return img2;
  }
  function parse7(element, { document }) {
    const cells = [];
    const heading = element.querySelector("h2");
    const headingText = heading && heading.textContent.replace(/\s+/g, " ").trim() || "EL CRUCERO QUE BUSCAS";
    let subText = "";
    if (heading && heading.parentElement) {
      const sub = [...heading.parentElement.querySelectorAll("p")].find((p) => p.textContent.trim() && p.textContent.trim() !== headingText);
      if (sub) subText = sub.textContent.replace(/\s+/g, " ").trim();
    }
    if (!subText) subText = "Encuentra el Crucero que mejor se adapta a tus preferencias";
    const leadContent = [document.createElement("h2")];
    leadContent[0].textContent = headingText;
    const ps = document.createElement("p");
    ps.textContent = subText;
    leadContent.push(ps);
    cells.push([[], leadContent]);
    let links = [...element.querySelectorAll("li a[href]")];
    if (links.length === 0) links = [...element.querySelectorAll("a[href]")];
    const seen = /* @__PURE__ */ new Set();
    links.forEach((link) => {
      let href = link.getAttribute("href") || "";
      if (href.startsWith("//")) href = `https:${href}`;
      const text = (link.getAttribute("title") || link.textContent).replace(/\s+/g, " ").trim();
      if (!href || !text || seen.has(href)) return;
      seen.add(href);
      const slug = (href.match(/\/selecciones\/([^/]+)\/?/) || [])[1];
      const img2 = nicheImg(document, slug, text);
      const imageCell = img2 ? [img2] : [];
      const cardLink = document.createElement("a");
      cardLink.href = href;
      cardLink.textContent = text;
      cells.push([imageCell, [cardLink]]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/veci-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".pre-loading"]);
      WebImporter.DOMUtils.remove(element, [".inspirational-claim"]);
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        ".onetrust-pc-dark-filter",
        '[id^="batBeacon"]',
        '[id^="universal_pixel"]',
        "#kampyleButtonContainer",
        "#nebula_div_btn",
        "#BT-go-to-top",
        "button.go-to-top",
        "#ui-oidc",
        "iframe",
        "script",
        "style",
        "noscript"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, ["#main-top", "#breadcrumb", "nav.breadcrumb"]);
      WebImporter.DOMUtils.remove(element, [
        ".bx-controls",
        ".slide-pagination",
        "button.btSliderSigFicha",
        "button.btSliderAntFicha"
      ]);
      WebImporter.DOMUtils.remove(element, ["button.action-show"]);
      WebImporter.DOMUtils.remove(element, ["button.addClassParent"]);
      WebImporter.DOMUtils.remove(element, ["noscript", "link"]);
    }
  }

  // tools/importer/transformers/veci-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function findSectionElement(element, selector) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    for (const sel of selectors) {
      const containsMatch = sel.match(/^(.+):has\(>\s*h2:contains\('([^']+)'\)\)$/);
      if (containsMatch) {
        const baseSelector = containsMatch[1];
        const textToFind = containsMatch[2].toLowerCase();
        try {
          const candidates = element.querySelectorAll(baseSelector);
          for (const candidate of candidates) {
            const h2 = candidate.querySelector(":scope > h2");
            if (h2 && h2.textContent.toLowerCase().includes(textToFind)) {
              return candidate;
            }
          }
        } catch (e) {
        }
        continue;
      }
      const hasMatch = sel.match(/^(.+):has\(([^)]+)\)$/);
      if (hasMatch) {
        try {
          const found = element.querySelector(sel);
          if (found) return found;
        } catch (e) {
        }
        const basePart = hasMatch[1];
        const hasPart = hasMatch[2];
        try {
          const candidates = element.querySelectorAll(basePart);
          for (const candidate of candidates) {
            try {
              const inner = candidate.querySelector(hasPart);
              if (inner) return candidate;
            } catch (e2) {
            }
          }
        } catch (e) {
        }
        continue;
      }
      try {
        const found = element.querySelector(sel);
        if (found) return found;
      } catch (e) {
      }
    }
    return null;
  }
  var BLOCK_NAMES = /* @__PURE__ */ new Set([
    "hero-destination",
    "cta-search",
    "cards-cruise",
    "columns-intro",
    "table-calendar",
    "cards-travel",
    "cards-links",
    "cards-features",
    "carousel-gallery",
    "accordion-guide"
  ]);
  function toKebab(label) {
    return (label || "").replace(/\(.*\)/, "").trim().toLowerCase().replace(/\s+/g, "-");
  }
  function isBlockEl(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node.tagName === "TABLE") {
      const firstCell = node.querySelector("tr td, tr th");
      return !!firstCell && BLOCK_NAMES.has(toKebab(firstCell.textContent));
    }
    if (node.tagName === "DIV") {
      return [...node.classList].some((c) => BLOCK_NAMES.has(c));
    }
    return false;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument;
      let container = element;
      if (![...container.children].some(isBlockEl)) {
        const allBlocks = [...container.querySelectorAll("table, div[class]")].filter(isBlockEl);
        if (allBlocks.length && allBlocks[0].parentElement) {
          container = allBlocks[0].parentElement;
        }
      }
      const blocks = [...container.children].filter(isBlockEl);
      if (blocks.length < 2) {
        for (let i = sections.length - 1; i >= 0; i -= 1) {
          const section = sections[i];
          const sectionEl = findSectionElement(element, section.selector);
          if (!sectionEl) continue;
          if (section.style) {
            sectionEl.after(WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells: { style: section.style }
            }));
          }
          if (i > 0) sectionEl.before(document.createElement("hr"));
        }
        return;
      }
      const root = element;
      const frag = document.createElement("div");
      blocks.forEach((block, i) => {
        if (i > 0) frag.appendChild(document.createElement("hr"));
        frag.appendChild(block);
        const style = sections[i] && sections[i].style;
        if (style) {
          frag.appendChild(WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style }
          }));
        }
      });
      root.textContent = "";
      while (frag.firstChild) root.appendChild(frag.firstChild);
    }
  }

  // tools/importer/import-cruise-zone-page.js
  var parsers = {
    "hero-destination": parse,
    "cta-search": parse2,
    "cards-cruise": parse3,
    "columns-intro": parse4,
    "table-calendar": parse5,
    "cards-travel": parse6,
    "cards-links": parse7
  };
  var PAGE_TEMPLATE = {
    name: "cruise-zone-page",
    description: "Cruise destination zone page showcasing a sailing region with hero imagery, available cruises, highlights, ports of call, and booking options",
    urls: [
      "https://www.viajeselcorteingles.es/cruceros/zonas/mediterraneo-occidental/"
    ],
    blocks: [
      {
        name: "hero-destination",
        instances: ['section[data-name="MainBanner"]']
      },
      {
        name: "cta-search",
        instances: ['main > section:has([role="search"])']
      },
      {
        name: "cards-cruise",
        instances: ['section[data-name="TabsProductCarousel"]', 'section[data-name="Zones"]']
      },
      {
        name: "columns-intro",
        instances: ['section[data-name="Inspirational"]']
      },
      {
        name: "table-calendar",
        instances: ['section[data-name="PriceCalendar"]']
      },
      {
        name: "cards-travel",
        instances: ['section[data-name="Locations"]', 'section[data-name="Blogs"]']
      },
      {
        name: "cards-links",
        instances: ['section[data-name="CruiseNiches"]']
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: 'section[data-name="MainBanner"]',
        style: null,
        blocks: ["hero-destination"],
        defaultContent: []
      },
      {
        id: "section-searcher",
        name: "Cruise Searcher CTA",
        selector: 'main > section:has([role="search"])',
        style: "light",
        blocks: ["cta-search"],
        defaultContent: []
      },
      {
        id: "section-top-cruceros",
        name: "Top Cruises",
        selector: 'section[data-name="TabsProductCarousel"]',
        style: null,
        blocks: ["cards-cruise"],
        defaultContent: []
      },
      {
        id: "section-descubre",
        name: "Editorial Intro",
        selector: 'section[data-name="Inspirational"]',
        style: "light",
        blocks: ["columns-intro"],
        defaultContent: []
      },
      {
        id: "section-calendario",
        name: "Departure Calendar",
        selector: 'section[data-name="PriceCalendar"]',
        style: "grey",
        blocks: ["table-calendar"],
        defaultContent: []
      },
      {
        id: "section-puertos",
        name: "Ports",
        selector: 'section[data-name="Locations"]',
        style: null,
        blocks: ["cards-travel"],
        defaultContent: []
      },
      {
        id: "section-otras-selecciones",
        name: "Other Selections",
        selector: 'section[data-name="CruiseNiches"]',
        style: null,
        blocks: ["cards-links"],
        defaultContent: []
      },
      {
        id: "section-mas-destinos",
        name: "More Destinations",
        selector: 'section[data-name="Zones"]',
        style: "grey",
        blocks: ["cards-cruise"],
        defaultContent: []
      },
      {
        id: "section-blog",
        name: "Blog",
        selector: 'section[data-name="Blogs"]',
        style: null,
        blocks: ["cards-travel"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    return pageBlocks;
  }
  var import_cruise_zone_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_cruise_zone_page_exports);
})();
