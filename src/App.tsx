import React, { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react';

import { ButtonField } from './Bulma.tsx'
import Navbar from './Navbar.tsx'

function App() {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } = useAuth0()
  const [activePage, setActivePage] = useState('Page1')

  return (
    <>
      <Navbar
        activePage={activePage}
        isLoggedIn={isAuthenticated}
        onLogOut={() => logout({ returnTo: window.location.origin })}
        pages={['Page1', 'Page2', 'Page3']}
        setActivePage={setActivePage}
      />
      <section className="section">
        {!isAuthenticated && (
          <div className="content">
            <h1>Welcome to Comet Commerce!</h1>
            <p>You are not logged in yet.</p>
            <ButtonField kind="primary" loading={isLoading} onClick={loginWithRedirect}>
              Log in
            </ButtonField>
          </div>
        )}
        {isAuthenticated && (
          <div className="content">
            <h1>Welcome to Comet Commerce, {user.name}!</h1>
            <p>You are logged in.</p>
          </div>
        )}
        {isLoading && (
          <div className="content">
            <p>Loading...</p>
          </div>
        )}
        {error && alert(`Error: ${error.message}`)}
      </section>
    </>
  )
}

export default App
