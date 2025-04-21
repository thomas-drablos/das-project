import { useEffect, useState } from "react"
import { getJson } from "../util"
import { useNavigate } from "react-router-dom";

const AllVendors = () => {
  const [all, setAll] = useState<any>()
  const navigate = useNavigate()

  useEffect(() => {
    getJson(`http://localhost:8000/api/vendor/`).then(setAll)
  }, [])

  return (
    <>
      <h1>All Vendors</h1>
      {all?.map((vendor:any) => (
        <>
          <div onClick={() => navigate(`/vendor/${vendor._id}`)}>{vendor.name}</div>
        </>))
      }
    </>
  )
}

export default AllVendors