import { serve } from 'bun'
import { compileReact } from './buni-render'
import { generateCerebras } from './cerebras'

const server = serve({
  routes: {
    '/*': async (req) => {
      const jsx = await Bun.file('./src/App.tsx').text()
      return compileReact(jsx)
    },

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

  development: true,
})

console.log(`🚀 Server running at ${server.url}`)
