// src/pages/results.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import { getJson } from "../util";

const Results: React.FC = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!query) return
    getJson(`http://localhost:8000/api/vendor/results/${query}`).then(setResults)
  }, [query])

  return (
    <div className="container mt-5">
      <h2>Results for "{query}"</h2>
      {results != null ? (
        <div className="row">
          {results.map((vendor) => (
            <div className="col-md-6" key={vendor.id}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>{vendor.name}</Card.Title>
                  <Card.Text>{vendor.description}</Card.Text>
                  <div className="mb-2">
                    {vendor.tags.map((tag: string) => (
                      <span className="badge bg-secondary me-2" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button onClick={() => navigate(`/vendor/${vendor._id}`)}>
                    View Vendor
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <p>No vendors found.</p>
      )}
    </div>
  );
};

export default Results;
