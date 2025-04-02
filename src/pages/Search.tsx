import { useState } from 'react'
import { NavLink } from "react-router-dom";

const Search = () => {
    const [query, setQuery] = useState("")
    const [suggestion, setSuggestion] = useState<String[]>([])
    //TODO: add search suggestion, fetch tags and names from db to use as suggestions

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
    }

    return(
        <>
            <input type="text" value={query} onChange={handleChange} />
            <NavLink to={`/results/${query}`}><button>Search</button></NavLink>
        </>
    );
}

export default Search