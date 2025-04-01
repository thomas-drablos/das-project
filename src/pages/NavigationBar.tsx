import { NavLink } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Login from './buttons/Login.tsx'
import Logout from './buttons/Logout.tsx'

function NavigationBar() {
    const { isAuthenticated } = useAuth0();
    return(
        <>
            <nav>
                <NavLink to="/">Home |</NavLink>
                {isAuthenticated ? (
                    <>
                        <NavLink to="/userprofile">Profile |</NavLink>
                        <Logout/>
                    </>
                ) : (<Login/>)}
            </nav>
        </>
    );
}

export default NavigationBar