import { getP5WrappedHtml } from '../utils/p5.js';

export const HTML_TYPE = 'html';
export const IMG_TYPE = 'img';
export const JSON_TYPE = 'json';
export const SVG_TYPE = 'svg';
export const P5_TYPE = 'p5';

export function b64encodedUrl(contentType, plainHtml) {
  switch (contentType) {
    case IMG_TYPE:
      // Already exported as base64 by filerobot-image-editor
      return plainHtml;
    default:
      const encodedHtml = btoa(unescape(encodeURIComponent(plainHtml)));
      return `data:${mimeTypeFor(contentType)};base64,${encodedHtml}`;
  }
}

export function getCurrentCodeFromOrder(orderData) {
  switch (orderData.get('contentType')) {
    case HTML_TYPE:
      return orderData.get('ordinalsHtml')
    case JSON_TYPE:
      return orderData.get('ordinalsJson')
    case SVG_TYPE:
      return orderData.get('ordinalsSvg');
    case P5_TYPE:
      return orderData.get('ordinalsP5');
    case IMG_TYPE:
      return orderData.get('ordinalsImg');
    default:
      return '';
  }
}

export function mimeTypeFor(contentType) {
  switch (contentType) {
    case JSON_TYPE:
      return 'application/json';
    case P5_TYPE:
    case HTML_TYPE:
      return 'text/html';
    case SVG_TYPE:
      return 'image/svg+xml';
    default:
      throw `Unknown content type ${contentType}`;
  }
}

export function getHtmlPageFor(contentType, plainCode) {
  switch (contentType) {
    case JSON_TYPE:
    case HTML_TYPE:
    case SVG_TYPE:
    case IMG_TYPE:
      return plainCode;
    case P5_TYPE:
      return getP5WrappedHtml(plainCode);
    default:
      throw `Unknown content type ${contentType}`;
  }
}
