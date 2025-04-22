// src/pages/vendor.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, patchJson, postJson } from "../util";

const VendorPage: React.FC = () => {
  const { id } = useParams();   //vendor ID

  const { loading, userId, name } = useAppUser()
  const { apiToken } = useApiToken()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState<any>()
  const [userInfo, setUserInfo] = useState<any>()
  const [myPage, setMyPage] = useState<boolean>(false)

  const [editName, setEditName] = useState<boolean>(false)
  const [newName, setNewName] = useState<string>(name || '')
  const [editTags, setEditTags] = useState<boolean>(false)
  const [newTags, setNewTags] = useState<string>('')
  const [editDescription, setEditDescription] = useState<boolean>(false)
  const [newDescription, setNewDescription] = useState<string>('')

  const imageInputRef = useRef<HTMLInputElement[]>([])
  const newImageInputRef = useRef<HTMLInputElement>(null)
  const [imageChange, setImageChange] = useState<'update' | 'delete'>('update')

  const [reviewRating, setReviewRating] = useState<number>(0)
  const [reviewContent, setReviewContent] = useState<string>('')

  useEffect(() => {
    if (apiToken != undefined) {
      getJson(`http://localhost:8000/api/user/${userId}`, apiToken).then(setUserInfo)
    }
    getJson(`http://localhost:8000/api/vendor/${id}`).then(setVendor)
  }, [loading, id])

  useEffect(() => {
    if (typeof (userInfo) == 'object' && id == userInfo.vendorId) {
      setMyPage(true)
    }
  }, [userInfo])

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    //alert('adding more images')
    const file = e.target.files?.[0]
    if (file) {
      const newImage = `../../public/images/${file.name}`  // TODO: replace with actual image URL
      const updatedImages = [...vendor.photos, newImage]
      patchJson(`http://localhost:8000/api/vendor/${id}/photos/add`, { photos: updatedImages }, apiToken)
      setVendor({ ...vendor, photos: updatedImages })
    }
  }

  const handleImageClick = (index: number) => {
    //alert('updating image ' + index)
    if (imageChange == 'update') {
      imageInputRef.current[index]?.click()
    }
    else if (imageChange == 'delete') {
      const updatedImages = [...vendor.photos]
      if (index == 0) {
        updatedImages[0] = null
      }
      else {
        updatedImages.splice(index, 1)
      }
      patchJson(`http://localhost:8000/api/vendor/${id}/photos/delete`, { id: id, index: index }, apiToken)
      setVendor({ ...vendor, photos: updatedImages })
    }
  }

  const handleImageReplace = (index: number, file: File) => {
    //alert('handling image replacement for image ' + (index))
    const newImage = `../../public/images/${file.name}`  //TODO: replace with actual image URL
    const updatedImages = [...vendor.photos]
    updatedImages[index] = newImage
    patchJson(`http://localhost:8000/api/vendor/${id}/photos/add`, { photos: updatedImages }, apiToken)
    setVendor({ ...vendor, photos: updatedImages })
  }

  const handleDM = async () => {
    let conversationId: string
    await getJson(`http://localhost:8000/api/chat?vendor=${id}`, apiToken).then(async (result: any) => {
      // there is no conversation that exists, make one
      if (result.length == 0) {
        await postJson(`http://localhost:8000/api/chat/create`, { vendor: id }, apiToken).then((chat) => {
          conversationId = chat._id
        })
      }
      else {
        conversationId = result[0]._id
      }
      navigate(`/dms/${conversationId}`)
    })
  }

  const handleReviewSubmission = () => {
    if (reviewContent == '' || reviewRating <= 0 || reviewRating > 6) {
      return
    }
    postJson(`http://localhost:8000/api/review/create`, { vendor: id, text: reviewContent, rating: reviewRating }, apiToken)
    const review = {
      name: userInfo.name,
      rating: reviewRating,
      text: reviewContent,
      hidden: false
    }
    const updatedReviews = [...vendor.reviews, review]
    setVendor({ ...vendor, reviews: updatedReviews })
    console.log(updatedReviews)
    setReviewContent('')
    setReviewRating(0)
  }

  const handleHidden = () => {
    patchJson(`http://localhost:8000/api/vendor/${id}/hide`, {}, apiToken)
  }

  const handleHideReview = (index: number) => {
    const isHidden = vendor.reviews[index].hidden
    const updatedReviews = [...vendor.reviews]
    updatedReviews[index] = { ...updatedReviews[index], hidden: !isHidden }
    setVendor({ ...vendor, reviews: updatedReviews })
    patchJson(`http://localhost:8000/api/review/${vendor.reviews[index]._id}/hide/${index}`, {}, apiToken)
  }

  return (
    typeof (vendor) == 'object' && (
      <div className="container mt-5">
        {/* Header: Profile picture, name, talk button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/*Profile Picture*/}
          <div className="d-flex align-items-center">
            <img
              src={vendor.photos[0]}
              alt={vendor.name || "Vendor Profile"}
              style={{
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                objectFit: "cover",
                marginRight: "10px",
              }}
              onClick={() => { if (myPage) { handleImageClick(0) } }}
            />
            <input
              type='file'
              accept='image/*'
              style={{ display: "none" }}
              ref={(e) => { imageInputRef.current[0] = e! }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageReplace(0, e.target.files[0])
                }
              }}
            />
            <div>
              {/*Vendor Store Name*/}
              <h2 className="mb-0" onClick={() => { if (myPage) { setEditName(true); setNewName(vendor.name) } }
              }>
                {editName ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => {
                        patchJson(`http://localhost:8000/api/vendor/${id}/name`, { name: newName }, apiToken)
                        setVendor({ ...vendor, name: newName })
                        setEditName(false)
                      }}
                      autoFocus
                    />
                  </>
                ) : (<>{vendor.name}</>)}
              </h2>
            </div>
          </div>
        </div>
        {/*Talk Button --> Link to DMs*/}
        {!myPage && apiToken != undefined &&
          (<>
            <button onClick={handleDM}>Message</button>
          </>)}
        {/* Terminate Button if admin */}
        {userInfo?.isAdmin && (
          <button onClick={handleHidden}>Hide Vendor Page</button>
        )}

        {/* Bio + Tags */}
        <div onClick={() => { if (myPage) { setEditDescription(true); setNewDescription(vendor.description); } }}>
          {editDescription ?
            (<>
              <textarea
                rows={5}
                cols={200}
                style={{ maxWidth: "100%" }}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={() => {
                  patchJson(`http://localhost:8000/api/vendor/${id}/description`, { description: newDescription }, apiToken)
                  setVendor({ ...vendor, description: newDescription })
                  setEditDescription(false)
                }}
                autoFocus
              />
            </>)
            :
            (<>
              <p>{myPage && vendor.description == '' ? (<>Please enter description here...</>) : (<>{vendor.description}</>)}</p>
            </>)}

        </div>
        <div className="mb-3" onClick={() => { if (myPage) { setEditTags(true); setNewTags(vendor.tags.join(" ") || " "); } }}>
          {editTags ?
            (<>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                onBlur={() => {
                  const updateTags = newTags.split(" ")
                  patchJson(`http://localhost:8000/api/vendor/${id}/tags/add`, { tags: updateTags }, apiToken)
                  setVendor({ ...vendor, tags: updateTags })
                  setEditTags(false)
                }}
                autoFocus
              />
            </>)
            :
            (<>
              {vendor.tags.length > 0 ? vendor.tags.map((tag: string) => (
                <span key={tag} className="badge bg-success me-2">
                  {tag}
                </span>
              ))
                :
                (<>
                  {myPage ? (<p>Please type your tags here separated by spaces...</p>) : (<></>)}
                </>
                )}
            </>
            )}
        </div>

        {/* Portfolio */}
        <h4 className="mt-4">Portfolio</h4>
        {myPage ?
          (
            <>
              <label>
                <input
                  type="radio"
                  name="imageType"
                  value="update"
                  checked={imageChange === 'update'}
                  onChange={() => setImageChange('update')}
                />
                Update Image
              </label>
              <label>
                <input
                  type="radio"
                  name="imageType"
                  value="delete"
                  checked={imageChange === 'delete'}
                  onChange={() => setImageChange('delete')}
                />
                Delete Image
              </label>
            </>)
          : (<></>)}
        <div className="row">
          {myPage ?
            (<>
              <button onClick={() => { if (myPage) { newImageInputRef.current?.click() } }}>Click here to add more images.</button>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={newImageInputRef}
                onChange={handleAddImage}
              />
            </>)
            : (<></>)}
          {vendor.photos.slice(1).map((photo: string, index: number) => (
            <div className="col-md-6" key={index + 1}>
              <input
                type='file'
                accept='image/*'
                style={{ display: "none" }}
                ref={(e) => { imageInputRef.current[index + 1] = e! }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageReplace(index + 1, e.target.files[0])
                  }
                }}
              />
              <Card className="mb-3">
                <Card.Body>
                  <Card.Img variant="top" src={photo} onClick={() => { if (myPage) { handleImageClick(index + 1) } }} />
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>


        {/*Reviews -- cannot be edited only seen*/}
        <h4>Reviews</h4>
        {!myPage && apiToken && (
          <>
            <label>
              Rating:
              <div style={{ fontSize: "1.8rem", cursor: "pointer" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      color: star <= reviewRating ? "#ffc107" : "#e4e5e9",
                      marginRight: "5px",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </label>
            <br />
            <label>
              Review:
              <br />
              <textarea
                rows={5}
                cols={120}
                style={{ maxWidth: "100%" }}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </label>
            <br />
            <button onClick={handleReviewSubmission}>Submit Review</button>
          </>
        )}
        <hr />
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          {vendor?.reviews.map((review:any, idx: number) => (
            <>
              {(review != null && (review.hidden == false || userInfo?.isAdmin)) &&
                (<div key={idx} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <p style={{ fontWeight: "bold", fontSize: "1.1rem", margin: 0 }}>
                      "{review.name}"
                    </p>
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < review.rating ? "#ffc107" : "#e4e5e9",
                            fontSize: "1.2rem",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {userInfo?.isAdmin ? (<><button onClick={() => { handleHideReview(idx) }}>{review.hidden ? "Unhide" : "Hide"}</button></>) : (<></>)}
                  </div>
                  <p style={{ fontStyle: "italic", marginLeft: "5px", marginBottom: "8px" }}>
                    {review.text}
                  </p>
                  <hr style={{ borderTop: "1px solid #ccc", margin: "0" }} />
                </div>)
              }
            </>))
          }
        </div>
      </div>
    )
  );
};

export default VendorPage;