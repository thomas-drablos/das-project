import { useParams } from "react-router-dom"
import { useState } from 'react'

const Vendor = () => {
    const params = useParams()  //route: /vendor/:id use :id to get and fill data in page
    const [show, setShow] = useState(false)
    return(
        //TODO: fill in details w/ info from db
        //TODO: add terminate page button if admin
        <>
            <h1>Vendor {params.id} Page</h1>
            <div>Profile Picture</div>
            <div>Name</div>
            <div>Score</div>
            <div>Tags</div>
            <div>Your Work Images</div>
            <div>Reviews</div>
            <button onClick={() => setShow(!show)}>Leave a Review</button>
            { show && (
                <form>  {/* TODO: onSubmit={ some function that sends data to db } */}
                    Rating: 
                    <select>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    <br/>
                    Write your review
                    <br/>
                    <textarea rows={4} cols={50}></textarea>
                    <br/>
                    <button type="submit">Submit Review</button>
                </form>
            )}
        </>
    )
}

export default Vendor