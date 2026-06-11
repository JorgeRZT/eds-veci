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

  // tools/importer/import-destination-page.js
  var import_destination_page_exports = {};
  __export(import_destination_page_exports, {
    default: () => import_destination_page_default
  });

  // tools/importer/parsers/hero-destination.js
  function parse(element, { document }) {
    const heroImage = element.querySelector("figure picture img, .mod-full-header figure img");
    const heading = element.querySelector(".content-text h1, .content-title-page h1, h1");
    const description = element.querySelector(".content-text p, .content-title-page p");
    const cells = [];
    if (heroImage) {
      cells.push([heroImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description && description.textContent.trim()) contentCell.push(description);
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-destination", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-travel.js
  function parse2(element, { document }) {
    let cardItems = element.querySelectorAll("li");
    if (!cardItems || !cardItems.length) {
      cardItems = element.querySelectorAll("a:has(img)");
    }
    const cells = [];
    if (cardItems && cardItems.length) {
      cardItems.forEach((item) => {
        const link = item.tagName === "A" ? item : item.querySelector("a");
        if (!link) return;
        const img = item.querySelector("img");
        const textEl = item.querySelector("p, span, h3, h4, strong");
        const imageCell = [];
        if (img) {
          imageCell.push(img);
        }
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
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-travel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-features.js
  function parse3(element, { document }) {
    const articles = Array.from(
      element.querySelectorAll("article")
    );
    const cells = [];
    articles.forEach((article) => {
      const heading = article.querySelector("h3");
      const description = article.querySelector("p");
      const cellContent = [];
      if (heading) cellContent.push(heading);
      if (description) cellContent.push(description);
      if (cellContent.length > 0) {
        cells.push([cellContent]);
      }
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-features", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse4(element, { document }) {
    const slideItems = Array.from(element.querySelectorAll("ul li"));
    const descHeading = element.querySelector(".container-description h3, .description h3");
    const descParagraphs = Array.from(
      element.querySelectorAll(".container-description p, .description p")
    );
    const cells = [];
    for (let i = 0; i < slideItems.length; i += 1) {
      const li = slideItems[i];
      const img = li.querySelector("img");
      if (!img) continue;
      const picture = li.querySelector("picture") || img;
      if (i === 0 && descHeading) {
        const textCell = [descHeading];
        descParagraphs.forEach((p) => textCell.push(p));
        cells.push([picture, textCell]);
      } else {
        cells.push([picture]);
      }
    }
    if (cells.length === 0) {
      const allPictures = Array.from(element.querySelectorAll("picture"));
      if (allPictures.length > 0) {
        allPictures.forEach((pic) => cells.push([pic]));
      } else {
        const allImages = Array.from(element.querySelectorAll("img"));
        allImages.forEach((img) => cells.push([img]));
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-guide.js
  function parse5(element, { document }) {
    const heading = element.querySelector("h2, h3, h4");
    const contentContainer = element.querySelector(".content-mod-info, .content");
    const contentElements = [];
    if (contentContainer) {
      const images = Array.from(contentContainer.querySelectorAll("img"));
      for (const img of images) {
        contentElements.push(img);
      }
      const paragraphs = Array.from(contentContainer.querySelectorAll(":scope > p"));
      for (const p of paragraphs) {
        if (p.textContent.trim()) {
          contentElements.push(p);
        }
      }
    }
    const cells = [];
    if (heading) {
      if (contentElements.length > 0) {
        cells.push([heading, contentElements]);
      } else {
        cells.push([heading, ""]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-guide", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/veci-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".pre-loading"]);
      WebImporter.DOMUtils.remove(element, [".inspirational-claim"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, ["#main-top", "#breadcrumb"]);
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
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metadataBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-destination-page.js
  var parsers = {
    "hero-destination": parse,
    "cards-travel": parse2,
    "cards-features": parse3,
    "carousel-gallery": parse4,
    "accordion-guide": parse5
  };
  var PAGE_TEMPLATE = {
    name: "destination-page",
    description: "Travel destination page showcasing a specific country with hero imagery, trip packages, highlights, and booking options",
    urls: [
      "https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto"
    ],
    blocks: [
      {
        name: "hero-destination",
        instances: [".header-block"]
      },
      {
        name: "cards-travel",
        instances: ["section.mod_section_access", "section.mod-links.mod-links-destination-x2"]
      },
      {
        name: "cards-features",
        instances: ["section.hv-advantages"]
      },
      {
        name: "carousel-gallery",
        instances: [".thumbnail-module.mgb30"]
      },
      {
        name: "accordion-guide",
        instances: [".module.mod-info.collapsible"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: ".header-block",
        style: null,
        blocks: ["hero-destination"],
        defaultContent: []
      },
      {
        id: "section-cta",
        name: "CTA Banner",
        selector: "#modAdviseme",
        style: "dark",
        blocks: [],
        defaultContent: ["#modAdviseme h2", "#modAdviseme p", "#modAdviseme .content-button a"]
      },
      {
        id: "section-travel-options",
        name: "Travel Options",
        selector: "section.mod_section_access",
        style: null,
        blocks: ["cards-travel"],
        defaultContent: ["section.mod_section_access header h2", "section.mod_section_access header p"]
      },
      {
        id: "section-usp",
        name: "USP/Trust Features",
        selector: "section.hv-advantages",
        style: "grey",
        blocks: ["cards-features"],
        defaultContent: []
      },
      {
        id: "section-gallery",
        name: "Image Gallery",
        selector: ".thumbnail-module.mgb30",
        style: null,
        blocks: ["carousel-gallery"],
        defaultContent: []
      },
      {
        id: "section-what-to-see",
        name: "What to See",
        selector: [".module.mod-info:not(.collapsible):has(h2:first-child)"],
        style: null,
        blocks: ["accordion-guide"],
        defaultContent: [".module.mod-info:not(.collapsible) > h2"]
      },
      {
        id: "section-where-to-stay",
        name: "Where to Stay",
        selector: ".module.mod-info:has(> h2:contains('alojarse'))",
        style: null,
        blocks: ["accordion-guide"],
        defaultContent: []
      },
      {
        id: "section-useful-info",
        name: "Useful Information",
        selector: ".module.mod-info:has(> h2:contains('til'))",
        style: null,
        blocks: ["accordion-guide"],
        defaultContent: []
      },
      {
        id: "section-other-destinations",
        name: "Other Destinations",
        selector: "section.mod-links.mod-links-destination-x2",
        style: null,
        blocks: ["cards-travel"],
        defaultContent: ["section.mod-links h2"]
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
  var import_destination_page_default = {
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
  return __toCommonJS(import_destination_page_exports);
})();
