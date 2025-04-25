// src/pages/vendor.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Modal, Button } from "react-bootstrap";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, patchJson, postJson } from "../util";
import DOMPurify from "dompurify"; // Import DOMPurify

const VendorPage: React.FC = () => {
  const { id } = useParams(); //vendor ID

  const { loading, userId, name } = useAppUser();
  const { apiToken } = useApiToken();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<any>();
  const [userInfo, setUserInfo] = useState<any>();
  const [myPage, setMyPage] = useState<boolean>(false);

  const [editName, setEditName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(name || "");
  const [editTags, setEditTags] = useState<boolean>(false);
  const [newTags, setNewTags] = useState<string>("");
  const [editDescription, setEditDescription] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>("");

  const [imageChange, setImageChange] = useState<"update" | "delete">("update");
  const [editProfileImage, setEditProfileImage] = useState<boolean>(false);
  const [editImage, setEditImage] = useState<number | null>(null);
  const [url, setUrl] = useState<string>("");

  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState<string>("");
  const [filterStars, setFilterStars] = useState<number | "all">("all");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showHiddenModal, setShowHiddenModal] = useState<boolean>(false);

  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleCloseHiddenModal = () => setShowHiddenModal(false);

  useEffect(() => {
    if (apiToken != undefined) {
      getJson(`http://localhost:8000/api/user/${userId}`, apiToken).then(
        setUserInfo
      );
    }
    getJson(`http://localhost:8000/api/vendor/${id}`).then(setVendor);
  }, [loading, id]);

  useEffect(() => {
    if (typeof userInfo == "object" && id == userInfo.vendorId) {
      setMyPage(true);
    }
  }, [userInfo]);

  useEffect(() => {
    if (myPage && vendor?.hidden) {
      setShowHiddenModal(true);
    } else if (
      vendor?.hidden &&
      (!userId || (userId && !myPage && !userInfo?.isAdmin))
    ) {
      navigate("/not-found");
    } else {
      setShowHiddenModal(false);
    }
  }, [myPage, vendor?.hidden, navigate, userId, userInfo?.isAdmin]);

  const handleAddImage = () => {
    //alert('adding more images')
    if (url == "") return;
    const updatedImages = [...vendor.photos, url];
    patchJson(
      `http://localhost:8000/api/vendor/${id}/photos/add`,
      { photos: updatedImages },
      apiToken
    );
    setVendor({ ...vendor, photos: updatedImages });
    setUrl("");
  };

  const handleImageClick = (index: number) => {
    //alert(imageChange + ' at ' + index)
    if (url == "" && imageChange == "update") return;
    const updatedImages = [...vendor.photos];
    if (imageChange == "update") {
      updatedImages[index] = url;
      patchJson(
        `http://localhost:8000/api/vendor/${id}/photos/add`,
        { photos: updatedImages },
        apiToken
      );
    } else if (imageChange == "delete") {
      if (index == 0) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }
      patchJson(
        `http://localhost:8000/api/vendor/${id}/photos/delete`,
        { index: index },
        apiToken
      );
    }
    setVendor({ ...vendor, photos: updatedImages });
    setUrl("");
  };

  const handleDM = async () => {
    if (!apiToken) {
      setShowLoginModal(true);
      return;
    }
    let conversationId: string;
    await getJson(`http://localhost:8000/api/chat?vendor=${id}`, apiToken).then(
      async (result: any) => {
        // there is no conversation that exists, make one
        if (result.length == 0) {
          await postJson(
            `http://localhost:8000/api/chat/create`,
            { vendor: id },
            apiToken
          ).then((chat: any) => {
            conversationId = chat._id;
          });
        } else {
          conversationId = result[0]._id;
        }
        navigate(`/dms/${conversationId}`);
      }
    );
  };

  const handleReviewSubmission = () => {
    if (!apiToken) {
      setShowLoginModal(true);
      return;
    }
    if (reviewContent == "" || reviewRating <= 0 || reviewRating > 5) {
      return;
    }
    postJson(
      `http://localhost:8000/api/review/create`,
      { vendor: id, text: reviewContent, rating: reviewRating },
      apiToken
    );
    const review = {
      name: userInfo.name,
      rating: reviewRating,
      text: reviewContent,
      hidden: false,
    };
    const updatedReviews = [...vendor.reviews, review];
    setVendor({ ...vendor, reviews: updatedReviews });
    console.log(updatedReviews);
    setReviewContent("");
    setReviewRating(0);
  };

  const handleHidden = () => {
    patchJson(`http://localhost:8000/api/vendor/${id}/hide`, {}, apiToken);
    setVendor({ ...vendor, hidden: !vendor.hidden });
  };

  const handleHideReview = (index: number) => {
    const isHidden = vendor.reviews[index].hidden;
    const updatedReviews = [...vendor.reviews];
    updatedReviews[index] = { ...updatedReviews[index], hidden: !isHidden };
    setVendor({ ...vendor, reviews: updatedReviews });
    patchJson(
      `http://localhost:8000/api/review/${vendor.reviews[index]._id}/hide/${index}`,
      {},
      apiToken
    );
  };

  return (
    typeof vendor == "object" && (
      <>
        {" "}
        <Modal show={showLoginModal} onHide={handleCloseLoginModal}>
          <Modal.Header closeButton>
            <Modal.Title>Login Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>You must be logged in to perform this action.</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseLoginModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={showHiddenModal} onHide={handleCloseHiddenModal}>
          {" "}
          <Modal.Header closeButton>
            <Modal.Title>Oh no!</Modal.Title>{" "}
          </Modal.Header>{" "}
          <Modal.Body>
            This page has been hidden from potential customers. To appeal this
            decision, please contact an administrator.
          </Modal.Body>{" "}
          <Modal.Footer>
            {" "}
            <Button variant="primary" onClick={handleCloseHiddenModal}>
              Close{" "}
            </Button>{" "}
          </Modal.Footer>{" "}
        </Modal>
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
                onClick={() => {
                  if (myPage) {
                    setEditProfileImage(true);
                    setUrl(vendor.photos[0]);
                  }
                }}
              />
              {editProfileImage ? (
                <>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                    }}
                    onBlur={() => {
                      handleImageClick(0);
                      setEditProfileImage(false);
                    }}
                    autoFocus
                  />
                </>
              ) : (
                <></>
              )}
              <div>
                {/*Vendor Store Name*/}
                <h2
                  className="mb-0"
                  onClick={() => {
                    if (myPage) {
                      setEditName(true);
                      setNewName(vendor.name);
                    }
                  }}
                >
                  {editName ? (
                    <>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => {
                          if (newName != "") {
                            patchJson(
                              `http://localhost:8000/api/vendor/${id}/name`,
                              { name: newName },
                              apiToken
                            );
                            setVendor({ ...vendor, name: newName });
                          }
                          setEditName(false);
                          setNewName(vendor.name);
                        }}
                        autoFocus
                      />
                    </>
                  ) : (
                    <>{DOMPurify.sanitize(vendor.name || "")}</>
                  )}
                </h2>
              </div>
            </div>
          </div>
          {/*Talk Button --> Link to DMs*/}
          <div>
            {!myPage && userInfo != undefined && (
              <button className="btn btn-primary" onClick={handleDM}>
                Message
              </button>
            )}

            {/* Terminate Button if admin */}
            {userInfo?.isAdmin && (
              <button
                className={`btn btn-${
                  vendor.hidden ? "secondary" : "warning"
                } ms-2`}
                onClick={handleHidden}
              >
                {vendor.hidden ? "Unhide Page" : "Hide Page"}
              </button>
            )}
          </div>

          {/* Bio + Tags */}
          <div
            onClick={() => {
              if (myPage) {
                setEditDescription(true);
                setNewDescription(vendor.description);
              }
            }}
          >
            {editDescription ? (
              <>
                <textarea
                  rows={5}
                  cols={200}
                  style={{ maxWidth: "100%" }}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onBlur={() => {
                    patchJson(
                      `http://localhost:8000/api/vendor/${id}/description`,
                      { description: newDescription },
                      apiToken
                    );
                    setVendor({ ...vendor, description: newDescription });
                    setEditDescription(false);
                  }}
                  autoFocus
                />
              </>
            ) : (
              <>
                <p>
                  {myPage && vendor.description == "" ? (
                    <>Please enter description here...</>
                  ) : (
                    <>{DOMPurify.sanitize(vendor.description || "")}</>
                  )}
                </p>
              </>
            )}
          </div>
          <div
            className="mb-3"
            onClick={() => {
              if (myPage) {
                setEditTags(true);
                setNewTags(vendor.tags.join(" ") || " ");
              }
            }}
          >
            {editTags ? (
              <>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  onBlur={() => {
                    const updateTags = newTags.split(" ");
                    patchJson(
                      `http://localhost:8000/api/vendor/${id}/tags/add`,
                      { tags: updateTags },
                      apiToken
                    );
                    setVendor({ ...vendor, tags: updateTags });
                    setEditTags(false);
                  }}
                  autoFocus
                />
              </>
            ) : (
              <>
                {vendor.tags.length > 1 || vendor.tags[0] != "" ? (
                  vendor.tags.map((tag: string) => (
                    <span key={tag} className="badge bg-success me-2">
                      {DOMPurify.sanitize(tag || "")}
                    </span>
                  ))
                ) : (
                  <>
                    {myPage ? (
                      <p>Please type your tags here separated by spaces...</p>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Portfolio */}
          <h4 className="mt-4">Portfolio</h4>
          {myPage ? (
            <>
              <label>
                <input
                  type="radio"
                  name="imageType"
                  value="update"
                  checked={imageChange === "update"}
                  onChange={() => setImageChange("update")}
                />
                Update Image
              </label>
              <label>
                <input
                  type="radio"
                  name="imageType"
                  value="delete"
                  checked={imageChange === "delete"}
                  onChange={() => setImageChange("delete")}
                />
                Delete Image
              </label>
            </>
          ) : (
            <></>
          )}
          <div className="row">
            {myPage ? (
              <>
                <button
                  onClick={() => {
                    if (myPage) {
                      setEditImage(0);
                    }
                  }}
                >
                  Click here to add more images.
                </button>
                {editImage == 0 ? (
                  <>
                    <input
                      type="text"
                      onChange={(e) => {
                        setUrl(e.target.value);
                      }}
                      onBlur={() => {
                        handleAddImage();
                        setEditImage(null);
                      }}
                      autoFocus
                    />
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}
            {vendor.photos.slice(1).map((photo: string, index: number) => (
              <div className="col-md-6" key={index + 1}>
                <Card className="mb-3">
                  <Card.Body
                    onClick={() => {
                      if (myPage) {
                        if (imageChange == "delete") {
                          handleImageClick(index + 1);
                        } else {
                          setEditImage(index + 1);
                        }
                      }
                    }}
                  >
                    <Card.Img variant="top" src={photo} />
                    {editImage == index + 1 ? (
                      <>
                        <input
                          type="text"
                          onChange={(e) => {
                            setUrl(e.target.value);
                          }}
                          onBlur={() => {
                            handleImageClick(index + 1);
                            setEditImage(null);
                          }}
                          autoFocus
                        />
                      </>
                    ) : (
                      <></>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          {/* Reviews Section */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4 className="mb-0">Reviews</h4>
            <select
              className="form-select w-auto"
              value={filterStars}
              onChange={(e) =>
                setFilterStars(
                  e.target.value === "all" ? "all" : parseInt(e.target.value)
                )
              }
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {!myPage && userInfo != undefined && (
            <>
              <label className="mt-3">Rating:</label>
              <div style={{ fontSize: "1.8rem", cursor: "pointer" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      color: star <= reviewRating ? "#ffc107" : "#e4e5e9",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="form-control my-2"
                rows={3}
                placeholder="Write your review..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={handleReviewSubmission}
              >
                Submit Review
              </button>
            </>
          )}

          <div className="mt-3">
            {vendor.reviews
              .filter(
                (review: any) =>
                  review != null &&
                  (!review.hidden || userInfo?.isAdmin) &&
                  (filterStars === "all" || review.rating === filterStars)
              )
              .map((review: any, idx: number) => (
                <div
                  key={idx}
                  className={`border p-2 mb-3 rounded ${
                    review != null && review.hidden ? "bg-light" : ""
                  }`}
                >
                  {review != null && (
                    <>
                      <div className="d-flex align-items-center justify-content-between">
                        <strong>"{DOMPurify.sanitize(review.name)}"</strong>
                        <div>
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              style={{
                                color:
                                  i < review.rating ? "#ffc107" : "#e4e5e9",
                              }}
                            >
                              ★
                            </span>
                          ))}
                          {userInfo?.isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-warning ms-3"
                              onClick={() => handleHideReview(idx)}
                            >
                              {review.hidden ? "Unhide" : "Hide"}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 mb-0" style={{ fontStyle: "italic" }}>
                        {DOMPurify.sanitize(review.text)}
                      </p>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      </>
    )
  );
};

export default VendorPage;
