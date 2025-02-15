import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bulma/css/bulma.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.tsx'

const root = document.getElementById('root')

if (root == null) {
  console.error("Failed to instantiate application. Unable to locate `root` element.")
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
