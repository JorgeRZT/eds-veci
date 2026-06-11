/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: veci (Viajes El Corte Ingles) site-wide cleanup.
 * Removes non-authorable content from the DOM before and after block parsing.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove loading overlays that could interfere with block parsing
    // Found in cleaned.html: <div class="pre-loading" aria-live="polite" aria-busy="true">
    WebImporter.DOMUtils.remove(element, ['.pre-loading']);

    // Remove empty inspirational claim paragraph
    // Found in cleaned.html: <p class="inspirational-claim"></p>
    WebImporter.DOMUtils.remove(element, ['.inspirational-claim']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove breadcrumb navigation
    // Found in cleaned.html: <div id="main-top"><ul id="breadcrumb">
    WebImporter.DOMUtils.remove(element, ['#main-top', '#breadcrumb']);

    // Remove carousel/slider UI controls (not authorable)
    // Found in cleaned.html: <div class="bx-controls bx-has-controls-direction">
    // Found in cleaned.html: <ul class="slide-pagination">
    // Found in cleaned.html: <button class="btSliderSigFicha">
    // Found in cleaned.html: <button class="btSliderAntFicha">
    WebImporter.DOMUtils.remove(element, [
      '.bx-controls',
      '.slide-pagination',
      'button.btSliderSigFicha',
      'button.btSliderAntFicha',
    ]);

    // Remove collapsible show/hide toggle buttons (UI chrome, not content)
    // Found in cleaned.html: <button class="action-show" aria-label="desplegar para mas informacion">
    WebImporter.DOMUtils.remove(element, ['button.action-show']);

    // Remove gallery close button
    // Found in cleaned.html: <button class="addClassParent"><span>X</span></button>
    WebImporter.DOMUtils.remove(element, ['button.addClassParent']);

    // Remove non-authorable HTML elements
    WebImporter.DOMUtils.remove(element, ['noscript', 'link']);
  }
}
