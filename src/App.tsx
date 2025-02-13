import classNames from 'classnames'
import React, { useState } from 'react'

import LoginForm from './LoginForm.tsx'
import Navbar from './Navbar.tsx'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('Page1')

  return (
    <>
      <Navbar
        activePage={activePage}
        isLoggedIn={isLoggedIn}
        onLogOut={() => { setIsLoggedIn(false) }}
        pages={['Page1', 'Page2', 'Page3']}
        setActivePage={setActivePage}
        />
      <section className="section">
        {!isLoggedIn && (
          <div className="columns is-centered">
            <div className="column" style={{ maxWidth: '600px' }}>
              <LoginForm onSuccess={() => { setIsLoggedIn(true) }} />
            </div>
          </div>
        )}
      </section>
    </>
  )
}

export default App
