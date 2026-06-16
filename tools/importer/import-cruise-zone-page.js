/* eslint-disable */
/* global WebImporter */

import heroDestinationParser from './parsers/hero-destination.js';
import ctaSearchParser from './parsers/cta-search.js';
import cardsCruiseParser from './parsers/cards-cruise.js';
import columnsIntroParser from './parsers/columns-intro.js';
import tableCalendarParser from './parsers/table-calendar.js';
import cardsTravelParser from './parsers/cards-travel.js';
import cardsLinksParser from './parsers/cards-links.js';

import cleanupTransformer from './transformers/veci-cleanup.js';
import sectionsTransformer from './transformers/veci-sections.js';

const parsers = {
  'hero-destination': heroDestinationParser,
  'cta-search': ctaSearchParser,
  'cards-cruise': cardsCruiseParser,
  'columns-intro': columnsIntroParser,
  'table-calendar': tableCalendarParser,
  'cards-travel': cardsTravelParser,
  'cards-links': cardsLinksParser,
};

const PAGE_TEMPLATE = {
  name: 'cruise-zone-page',
  description: 'Cruise destination zone page showcasing a sailing region with hero imagery, available cruises, highlights, ports of call, and booking options',
  urls: [
    'https://www.viajeselcorteingles.es/cruceros/zonas/mediterraneo-occidental/',
  ],
  blocks: [
    {
      name: 'hero-destination',
      instances: ['section[data-name="MainBanner"]'],
    },
    {
      name: 'cta-search',
      instances: ['main > section:has([role="search"])'],
    },
    {
      name: 'cards-cruise',
      instances: ['section[data-name="TabsProductCarousel"]', 'section[data-name="Zones"]'],
    },
    {
      name: 'columns-intro',
      instances: ['section[data-name="Inspirational"]'],
    },
    {
      name: 'table-calendar',
      instances: ['section[data-name="PriceCalendar"]'],
    },
    {
      name: 'cards-travel',
      instances: ['section[data-name="Locations"]', 'section[data-name="Blogs"]'],
    },
    {
      name: 'cards-links',
      instances: ['section[data-name="CruiseNiches"]'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: 'section[data-name="MainBanner"]',
      style: null,
      blocks: ['hero-destination'],
      defaultContent: [],
    },
    {
      id: 'section-searcher',
      name: 'Cruise Searcher CTA',
      selector: 'main > section:has([role="search"])',
      style: 'light',
      blocks: ['cta-search'],
      defaultContent: [],
    },
    {
      id: 'section-top-cruceros',
      name: 'Top Cruises',
      selector: 'section[data-name="TabsProductCarousel"]',
      style: null,
      blocks: ['cards-cruise'],
      defaultContent: [],
    },
    {
      id: 'section-descubre',
      name: 'Editorial Intro',
      selector: 'section[data-name="Inspirational"]',
      style: 'light',
      blocks: ['columns-intro'],
      defaultContent: [],
    },
    {
      id: 'section-calendario',
      name: 'Departure Calendar',
      selector: 'section[data-name="PriceCalendar"]',
      style: 'grey',
      blocks: ['table-calendar'],
      defaultContent: [],
    },
    {
      id: 'section-puertos',
      name: 'Ports',
      selector: 'section[data-name="Locations"]',
      style: null,
      blocks: ['cards-travel'],
      defaultContent: [],
    },
    {
      id: 'section-otras-selecciones',
      name: 'Other Selections',
      selector: 'section[data-name="CruiseNiches"]',
      style: null,
      blocks: ['cards-links'],
      defaultContent: [],
    },
    {
      id: 'section-mas-destinos',
      name: 'More Destinations',
      selector: 'section[data-name="Zones"]',
      style: 'grey',
      blocks: ['cards-cruise'],
      defaultContent: [],
    },
    {
      id: 'section-blog',
      name: 'Blog',
      selector: 'section[data-name="Blogs"]',
      style: null,
      blocks: ['cards-travel'],
      defaultContent: [],
    },
  ],
};

const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

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
          section: blockDef.section || null,
        });
      });
    });
  });

  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
