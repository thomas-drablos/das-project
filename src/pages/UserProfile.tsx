import { useAuth0 } from '@auth0/auth0-react'
import { NavLink } from 'react-router-dom'

const UserProfile = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
      return <div>Loading ...</div>;
    }
  
    return (
      isAuthenticated && (
        //TODO: fill in details & ability to edit
        <div>
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <NavLink to="/editvendor"><button>Edit Your Vendor Page</button></NavLink>
        </div>
      )
    )
}

export default UserProfile