// src/App.tsx
import SearchBar from "./components/Searchbar";
import NavBar from "./components/Navbar";
import Results from "./pages/results";
import LandingPage from "./pages/landing";
import User from "./pages/user";
import VendorPage from "./pages/vendor";
import Messaging from "./pages/messaging";
import AdminDashboard from "./pages/adminDash";

import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LinkConsentPopup from "./components/LinkConsentPopup";
import { AppUserProvider } from "./contexts/appUserContext";
import { ApiTokenProvider } from "./contexts/apiTokenContext";

function App() {
  return (
    <Auth0Provider
      domain="dev-olcmjrm1xuqtgb8o.us.auth0.com"
      clientId="zqvb0HiU9R5WVx2KObs9wGepXr46sTwO"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <ApiTokenProvider>
        <AppUserProvider>
          <Router>
            <div>
              <NavBar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/results/:query" element={<Results />} />
                <Route path="/search" element={<SearchBar />} />
                <Route path="/profile" element={<User />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dms" element={<Messaging />} />
                <Route path="/dms/:id" element={<Messaging />} />
                <Route path="/vendor/:id" element={<VendorPage />} />
              </Routes>
            </div>
          </Router>
          <LinkConsentPopup />
        </AppUserProvider>
      </ApiTokenProvider>
    </Auth0Provider>
  );
}

export default App;
