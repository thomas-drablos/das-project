import { useState } from 'react'
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [query, setQuery] = useState("")
    const [suggestion, setSuggestion] = useState<String[]>([])
    const navigate = useNavigate()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        navigate("/results", { state: {query} })
    }

    return(
        <>
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Search..."></input>
                <button type="submit">Search</button>
            </form>
        </>
    );
}

export default Home