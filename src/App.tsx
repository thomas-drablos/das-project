// src/App.tsx
import SearchBar from "./components/Searchbar";
import NavBar from "./components/Navbar";
import Results from "./pages/results";
import LandingPage from "./pages/landing";
import User from "./pages/user";
import VendorPage from "./pages/vendor";
import Messaging from "./pages/messaging";
import AdminDashboard from "./pages/adminDash";
import NotFoundPage from "./pages/notFound"; // Import your 404 page component

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LinkConsentPopup from "./components/LinkConsentPopup";
import { AppUserProvider } from "./contexts/appUserContext";
import { ApiTokenProvider } from "./contexts/apiTokenContext";
import React from "react";

// Create a PrivateRoute component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>; // Or a more specific loading indicator
  }

  if (!isAuthenticated) {
    // Redirect to the 404 page if not authenticated
    return <Navigate to="/not-found" replace />; // Use replace to prevent going back
  }

  return <>{children}</>;
};

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

                {/* Private Routes */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <User />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dms"
                  element={
                    <PrivateRoute>
                      <Messaging />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dms/:id"
                  element={
                    <PrivateRoute>
                      <Messaging />
                    </PrivateRoute>
                  }
                />
                {/* Public Route */}
                <Route path="/vendor/:id" element={<VendorPage />} />

                {/* 404 Not Found Page */}
                <Route path="/not-found" element={<NotFoundPage />} />

                {/* Catch-all route for other non-matching paths (optional) */}
                <Route path="*" element={<NotFoundPage />} />
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
