import { serve } from 'bun'
import index from './index.html'
import { compileReact } from './buni-render'
import { generateCerebras } from './cerebras'

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    // Given a prompt that's a jsx string, render as standalone html with bun and serve that
    '/api/render': async (req) => {
      const body = await req.json()
      const { jsx } = body
      return compileReact(jsx)
    },

    '/api/generate': async (req) => {
      const body = await req.json()
      const { prompt } = body
      const jsx = await generateCerebras(prompt)
      return new Response(jsx)
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
