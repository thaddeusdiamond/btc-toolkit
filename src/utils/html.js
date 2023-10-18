import { getP5WrappedHtml } from '../utils/p5.js';
import { getOrdersWrappedHtml } from '../utils/orders.js'

export const HTML_TYPE = 'html';
export const JSON_TYPE = 'json';
export const SVG_TYPE = 'svg';
export const P5_TYPE = 'p5';
export const ORDERS_TYPE = 'orders';

export function b64encodedUrl(contentType, plainHtml) {
  const encodedHtml = btoa(unescape(encodeURIComponent(plainHtml)));
  return `data:${mimeTypeFor(contentType != ORDERS_TYPE ? contentType : HTML_TYPE)};base64,${encodedHtml}`;
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
    case ORDERS_TYPE:
      return orderData.get('orders');
    default:
      return '';
  }
}

export function mimeTypeFor(contentType) {
  switch (contentType) {
    case JSON_TYPE:
    case ORDERS_TYPE:
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
      return plainCode;
    case P5_TYPE:
      return getP5WrappedHtml(plainCode);
    case ORDERS_TYPE:
      return getOrdersWrappedHtml(plainCode);
    default:
      throw `Unknown content type ${contentType}`;
  }
}
