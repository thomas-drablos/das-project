import { useEffect, useState } from "react"
import { getJson } from "../util"
import { useNavigate } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";

const AllVendors = () => {
  const { loading, userId } = useAppUser()
  const { apiToken } = useApiToken()
  const [all, setAll] = useState<any>()
  const [userInfo, setUserInfo] = useState<any>()
  const navigate = useNavigate()

  useEffect(() => {
    getJson(`http://localhost:8000/api/vendor/`).then(setAll)
  }, [])

  useEffect(() => {
    if (apiToken != undefined) {
      getJson(`http://localhost:8000/api/user/${userId}`, apiToken).then(setUserInfo)
    }
  }, [loading])

  useEffect(() => {
    if (typeof (userInfo) == 'object' && userInfo.isAdmin && apiToken != undefined) {
      getJson(`http://localhost:8000/api/vendor/${userId}/all`, apiToken).then(setAll)
    }
  }, [userInfo])

  return (
    <>
      <h1>All Vendors</h1>
      {all?.map((vendor: any) => (
        <div key={vendor._id} onClick={() => navigate(`/vendor/${vendor._id}`)}>{vendor.name}</div>
      ))
      }
    </>
  )
}

export default AllVendors