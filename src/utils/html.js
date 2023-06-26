export function b64encodedUrl(mimeType, plainHtml) {
  return `data:${mimeType};base64,${btoa(plainHtml)}`;
}
