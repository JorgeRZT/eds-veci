/* eslint-disable */
/* global WebImporter */

import heroDestinationParser from './parsers/hero-destination.js';
import cardsTravelParser from './parsers/cards-travel.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';
import accordionGuideParser from './parsers/accordion-guide.js';

import cleanupTransformer from './transformers/veci-cleanup.js';
import sectionsTransformer from './transformers/veci-sections.js';

const parsers = {
  'hero-destination': heroDestinationParser,
  'cards-travel': cardsTravelParser,
  'cards-features': cardsFeaturesParser,
  'carousel-gallery': carouselGalleryParser,
  'accordion-guide': accordionGuideParser,
};

const PAGE_TEMPLATE = {
  name: 'destination-page',
  description: 'Travel destination page showcasing a specific country with hero imagery, trip packages, highlights, and booking options',
  urls: [
    'https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto',
  ],
  blocks: [
    {
      name: 'hero-destination',
      instances: ['.header-block'],
    },
    {
      name: 'cards-travel',
      instances: ['section.mod_section_access', 'section.mod-links.mod-links-destination-x2'],
    },
    {
      name: 'cards-features',
      instances: ['section.hv-advantages'],
    },
    {
      name: 'carousel-gallery',
      instances: ['.thumbnail-module.mgb30'],
    },
    {
      name: 'accordion-guide',
      instances: ['.module.mod-info.collapsible'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: '.header-block',
      style: null,
      blocks: ['hero-destination'],
      defaultContent: [],
    },
    {
      id: 'section-cta',
      name: 'CTA Banner',
      selector: '#modAdviseme',
      style: 'dark',
      blocks: [],
      defaultContent: ['#modAdviseme h2', '#modAdviseme p', '#modAdviseme .content-button a'],
    },
    {
      id: 'section-travel-options',
      name: 'Travel Options',
      selector: 'section.mod_section_access',
      style: null,
      blocks: ['cards-travel'],
      defaultContent: ['section.mod_section_access header h2', 'section.mod_section_access header p'],
    },
    {
      id: 'section-usp',
      name: 'USP/Trust Features',
      selector: 'section.hv-advantages',
      style: 'grey',
      blocks: ['cards-features'],
      defaultContent: [],
    },
    {
      id: 'section-gallery',
      name: 'Image Gallery',
      selector: '.thumbnail-module.mgb30',
      style: null,
      blocks: ['carousel-gallery'],
      defaultContent: [],
    },
    {
      id: 'section-what-to-see',
      name: 'What to See',
      selector: ['.module.mod-info:not(.collapsible):has(h2:first-child)'],
      style: null,
      blocks: ['accordion-guide'],
      defaultContent: ['.module.mod-info:not(.collapsible) > h2'],
    },
    {
      id: 'section-where-to-stay',
      name: 'Where to Stay',
      selector: '.module.mod-info:has(> h2:contains(\'alojarse\'))',
      style: null,
      blocks: ['accordion-guide'],
      defaultContent: [],
    },
    {
      id: 'section-useful-info',
      name: 'Useful Information',
      selector: '.module.mod-info:has(> h2:contains(\'til\'))',
      style: null,
      blocks: ['accordion-guide'],
      defaultContent: [],
    },
    {
      id: 'section-other-destinations',
      name: 'Other Destinations',
      selector: 'section.mod-links.mod-links-destination-x2',
      style: null,
      blocks: ['cards-travel'],
      defaultContent: ['section.mod-links h2'],
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
