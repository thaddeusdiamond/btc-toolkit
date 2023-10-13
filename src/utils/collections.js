export const COLLECTION_PREVIEW = `
  <html>
    <body style="display:flex;align-items:center;justify-content:center;font-family:Helvetica;width:100%;font-style:italic;font-size:1.5rem">
      &#128072;	Previews will appear at left
    </body>
  </html>`;

export async function recursiveViewerFor(inscription) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Build Your Own Recursive Ordinal</title>
      </head>
      <body style="margin: 0px">
        <div>
          <img style="width:100%;margin:0px" src="/content/01b00167726b0187388dd9362bb1fcb986e12419b01799951628bbb428df1deei0" />
        </div>
      </body>
    </html>`;
}
