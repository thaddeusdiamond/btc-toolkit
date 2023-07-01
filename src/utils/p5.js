export function getP5WrappedHtml(p5js) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">
      const ORDINALS_LIBS = {
        fflate: '6bac7ab4ce8d5d32f202c2e31bba2b5476a18275802b4e0595c708760f9f56b5i0',
        p5: '255ce0c5a0d8aca39510da72e604ef8837519028827ba7b7f723b7489f3ec3a4i0'
      };

      function addScriptToPage(scriptText) {
        const newScript = document.createElement('script');
        newScript.innerHTML = scriptText;
        document.body.appendChild(newScript);
      }

      async function getOrdinalsScript(scriptID) {
        const response = await fetch("/content/" + scriptID);
        return (await response.text());
      }

      // decode from base64 and unzip
      function gunzip64(encodedText) {
        return fflate.strFromU8(fflate.gunzipSync(new Uint8Array(Array.from(atob(encodedText)).map((char) => char.charCodeAt(0)))));
      }

      addScriptToPage(await getOrdinalsScript(ORDINALS_LIBS.fflate));
      addScriptToPage(await gunzip64(await getOrdinalsScript(ORDINALS_LIBS.p5)));
    </script>
    <meta charset="utf-8" />
  </head>
  <body style="margin: 0px">
    <main>
    </main>
    <script>
      ${p5js}
    </script>
  </body>
</html>
`
}
