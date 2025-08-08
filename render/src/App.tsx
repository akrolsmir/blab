import { useState } from 'react'
// import './index.css'

const PROMPT_EXAMPLE = `Make a simple Todo list app.`

async function generateJsx(prompt: string) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
  return response.text()
}

async function compileReact(jsx: string) {
  const response = await fetch('/api/render', {
    method: 'POST',
    body: JSON.stringify({ jsx }),
  })
  return response.text()
}

// Like Claude Artifacts, let the user type in a prompt and build a micro react webapp for it.
export function App() {
  const [prompt, setPrompt] = useState(PROMPT_EXAMPLE)
  const [jsx, setJsx] = useState('')
  const [html, setHtml] = useState('')

  return (
    <div className="">
      {/* Two panes: left has prompt, right has the app */}
      <div className="flex flex-row w-full">
        <div className="w-1/2 p-2">
          <textarea
            className="w-full h-48 border-1 border-gray-300 rounded-md p-2"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="bg-blue-100 p-2 hover:bg-blue-200 rounded-md float-right"
            onClick={async () => {
              const jsx = await generateJsx(prompt)
              setJsx(jsx)
              setHtml(await compileReact(jsx))
            }}
          >
            Generate App
          </button>
          <textarea
            className="w-full mt-6 h-96 border-1 border-gray-300 rounded-md p-2"
            value={jsx}
            onChange={(e) => setJsx(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <iframe className="w-full h-screen" srcDoc={html} />
        </div>
      </div>
    </div>
  )
}

export default App
