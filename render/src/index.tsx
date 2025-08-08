import { serve } from 'bun'
// import index from './index.html'
import { compileReact } from './buni-render'
import { generateCerebras } from './cerebras'

const server = serve({
  routes: {
    // Serve the homepage app via custom renderer
    '/': async (req) => {
      const jsx = await Bun.file('./src/App.tsx').text()
      return compileReact(jsx)
    },
    // Serve with bun's html bundler
    // '/': index,

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

    // for anything like /make/a-todo-list, generate the app
    '/make/:prompt': async (req) => {
      const { prompt } = req.params
      const jsx = await generateCerebras(prompt)
      return compileReact(jsx)
    },
  },

  development: true,
})

console.log(`🚀 Server running at ${server.url}`)
