import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Search from './pages/Search.tsx'
import NavigationBar from './pages/NavigationBar.tsx'
import UserProfile from './pages/UserProfile.tsx'
import Results from './pages/Results.tsx'
import Admin from './pages/Admin.tsx'
import DM from './pages/DM.tsx'
import EditVendor from './pages/EditVendor.tsx'
import Vendor from './pages/Vendor.tsx'

const root = document.getElementById('root')

if (root == null) {
  console.error("Failed to instantiate application. Unable to locate `root` element.")
} else {
  createRoot(root).render(
    <StrictMode>
      <Auth0Provider
        domain="dev-olcmjrm1xuqtgb8o.us.auth0.com"
        clientId="zqvb0HiU9R5WVx2KObs9wGepXr46sTwO"
        authorizationParams={
          {redirect_uri: window.location.origin}
        }
      >
        <Router>
          <NavigationBar/>
          <Routes>
            <Route path="/" element={<Search/>}/>
            <Route path="/userprofile" element={<UserProfile/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/DM" element={<DM/>}/>
            <Route path="/editvendor" element={<EditVendor/>} />
            <Route path="/vendor/:id" element={<Vendor/>}/>
            <Route path="/results/:query" element={<Results/>}/>
          </Routes>
        </Router>
      </Auth0Provider>
    </StrictMode>
  )
}
