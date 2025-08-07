const SYSTEM_PROMPT = `
You are a helpful coding assistant that generates React code.
          
You will be given a prompt; think step by step about how to effectively implement this app,
then return a single tsx file that implements it.

Use typescript, TSX syntax, and Tailwind for styling the app.

Your code MUST be wrapped in <output></output> tags, and contain "export default function App() { ... }".

Example output:
<output>
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return <div>
    <h1 className="text-2xl font-bold">Count: {count}</h1>
    <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => setCount(count + 1)}>Increment</button>
  </div>;
}
</output>

Here is the user's prompt:
`

export async function generateCerebras(prompt: string) {
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        { role: 'user', content: prompt },
      ],
    }),
  })
  const data = await response.json()
  const content = data.choices[0].message.content
  // console.log('content', content)
  return extract(content)
}

function extract(text: string) {
  const output = text.match(/<output>(.*?)<\/output>/s)?.[1]
  if (!output) throw new Error('No output found')
  return output
}
