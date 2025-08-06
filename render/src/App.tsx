import { useState } from 'react'
import './index.css'

const PROMPT_EXAMPLE = `Make a simple Todo list app.`

async function generateApp(prompt: string) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
  return response.text()
}

// Like Claude Artifacts, let the user type in a prompt and build a micro react webapp for it.
export function App() {
  const [prompt, setPrompt] = useState(PROMPT_EXAMPLE)
  const [app, setApp] = useState('')

  return (
    <div className="">
      {/* Two panes: left has prompt, right has the app */}
      <div className="flex flex-row w-full">
        <div className="w-1/2">
          <h1>Prompt</h1>
          <button
            className="bg-blue-100 p-2 hover:bg-blue-200"
            onClick={() =>
              generateApp(prompt).then((app) => {
                // console.log('app', app)
                setApp(app)
              })
            }
          >
            Generate App
          </button>
          <textarea
            className="w-full h-48 border-2 border-gray-300 rounded-md p-2"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <h1>App Text</h1>
          <textarea
            className="w-full h-96 border-2 border-gray-300 rounded-md p-2"
            value={app}
            onChange={(e) => setApp(e.target.value)}
          />
          <h1>App</h1>
          <iframe className="w-full h-96" srcDoc={app} />
        </div>
      </div>
    </div>
  )
}

export default App
