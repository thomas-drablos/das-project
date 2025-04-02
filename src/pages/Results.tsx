import { useParams } from "react-router-dom"

const Results = () => {
    const params = useParams()
    //TODO: use params (query) to list possible vendors & link to page
    return(
        <h1>Results for {params.query}</h1>
    )
}

export default Results