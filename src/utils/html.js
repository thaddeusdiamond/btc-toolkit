import { COLLECTION_PREVIEW } from '../utils/collections.js';
import { getP5WrappedHtml } from '../utils/p5.js';

export const HTML_TYPE = 'html';
export const JSON_TYPE = 'json';
export const SVG_TYPE = 'svg';
export const P5_TYPE = 'p5';
export const COLLECTION_TYPE = 'collection';

export const GZIP_ENCODING = 'application/gzip';

export function b64encodedUrl(contentType, plainHtml) {
  const encodedHtml = btoa(unescape(encodeURIComponent(plainHtml)));
  return `data:${mimeTypeFor(contentType)};base64,${encodedHtml}`;
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
    case COLLECTION_TYPE:
      return 'text/html';
    case SVG_TYPE:
      return 'image/svg+xml';
    case GZIP_ENCODING:
      return 'application/gzip';
    default:
      throw `MIME: Unknown content type ${contentType}`;
  }
}

export function getHtmlPageFor(contentType, plainCode) {
  switch (contentType) {
    case JSON_TYPE:
    case HTML_TYPE:
    case SVG_TYPE:
      return plainCode;
    case P5_TYPE:
      return getP5WrappedHtml(plainCode);
    case COLLECTION_TYPE:
      return COLLECTION_PREVIEW;
    default:
      throw `HTML: Unknown content type ${contentType}`;
  }
}
