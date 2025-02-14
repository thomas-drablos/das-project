import classNames from 'classnames'
import React from 'react'
import viteLogo from '/vite.svg'

interface NavItemProps {
  active?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const NavItem: React.FC<NavItemProps> = ({ active, children, onClick }) => {
  return (
    <a className={classNames('navbar-item', { "is-active": active })} onClick={onClick}>
      {children}
    </a>
  )
}

interface NavbarProps {
  activePage: string;
  isLoggedIn: boolean;
  onLogOut: () => void;
  pages: [string];
  setActivePage: (string) => void;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const start = props.isLoggedIn && props.pages.map((page) => (
    <NavItem
      key={page}
      active={props.activePage === page}
      onClick={() => { props.setActivePage(page) }}
    >
      {page}
    </NavItem>
  ))

  const end = props.isLoggedIn && (
    <NavItem onClick={props.onLogOut}>Log out</NavItem>
  )

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item" href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo}/>
          </a>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">{start}</div>
          <div className="navbar-end">{end}</div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
