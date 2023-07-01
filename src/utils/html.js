export function b64encodedUrl(mimeType, plainHtml) {
  const encodedHtml = btoa(unescape(encodeURIComponent(plainHtml)));
  return `data:${mimeType};base64,${encodedHtml}`;
}

export function getCurrentCodeFromOrder(orderData) {
  switch (orderData.get('mimeType')) {
    case 'text/html':
      return orderData.get('ordinalsHtml')
    case 'image/svg+xml':
      return orderData.get('ordinalsSvg');
    default:
      return '';
  }
}
