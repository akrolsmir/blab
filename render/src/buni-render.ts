import { unlinkSync } from 'node:fs'

// Build the complete HTML for a given snippet of React code
// Generally runs in 2-20ms
export async function compileReact(
  componentCode: string,
  props: Record<string, any> = {}
) {
  // Generate a unique hash for this pair of componentCode and props,
  // to avoid race conditions between different requests
  // Date.now() prevents duplicate hashes, though unclear why there are racing requests
  const hash = Bun.hash(componentCode + JSON.stringify(props) + Date.now())

  // Write out App.tsx and main.tsx to temp files in /dist
  await Bun.write(`./temp/App.${hash}.tsx`, componentCode)

  const main = `
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.${hash}.tsx';

  const props = ${JSON.stringify(props)};

  function start() {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <React.StrictMode>
        <App {...props} />
      </React.StrictMode>
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  `
  await Bun.write(`./temp/main.${hash}.tsx`, main)

  // Build from the temp files
  const built = await Bun.build({
    entrypoints: [`./temp/main.${hash}.tsx`],
    // Don't bundle stuff we importmap from esm.sh
    external: ['react', 'react-dom', '@uiw/react-textarea-code-editor'],
  })

  // Delete the temp files
  unlinkSync(`./temp/App.${hash}.tsx`)
  unlinkSync(`./temp/main.${hash}.tsx`)

  if (!built.success) {
    console.error(built.logs)
    throw new Error('Failed to build: ' + built.logs)
  }
  const bundled = await built.outputs[0].text()
  const sanitized = bundled.replace(/<\/script>/g, '<\\/script>')

  // TODO: generate importmap and css dynamically?
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@19.0.0?dev",
              "react/jsx-dev-runtime": "https://esm.sh/react@19.0.0/jsx-dev-runtime?dev",
              "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime?dev",
              "react-dom": "https://esm.sh/react-dom@19.0.0?dev",
              "react-dom/client": "https://esm.sh/react-dom@19.0.0/client?dev"
            }
          }
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">${sanitized}</script>
      </body>
    </html>
  `
  // For debugging: write the HTML to a file with a timestamp
  // Bun.write(`./dist/test-${Date.now()}.html`, html)

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
