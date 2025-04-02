import { NavLink } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Login from './buttons/Login.tsx'
import Logout from './buttons/Logout.tsx'

function NavigationBar() {
    const { isAuthenticated, user } = useAuth0();
    //TODO: check if user is an admin -> show admin buttons
    return(
        <>
        <div>
            <nav>
                <NavLink to="/">Home |</NavLink>
                {isAuthenticated ? (
                    <>
                        <NavLink to="/userprofile"><button>Profile</button></NavLink>
                        <NavLink to="/DM"><button>DM</button></NavLink>
                        <Logout/>
                    </>
                ) : (<Login/>)}
            </nav>
        </div>
        </>
    );
}

export default NavigationBar