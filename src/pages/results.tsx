// src/pages/Results.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApiToken from "../hooks/useApiToken";
import { getJson } from "../util";

const Results: React.FC = () => {
  const params = useParams<Record<string, string | undefined>>();
  const [results, setResults] = useState<any[]>([]); // Replace 'any' with your data type

  const { apiToken } = useApiToken();
  const [apiTest, setApiTest] = useState<string>('');

  useEffect(() => {
    // getJson('/api/test', apiToken)
    //   .then(res => {
    //     setApiTest(res as string);
    //   })
    //   .catch(err => console.log(err));
    fetch('/api/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && {Authorization: `Bearer ${apiToken}`}),
      },
    })
      .then(res => res.text())
      .then(text => {
        setApiTest(text);
      }).catch(err => console.log(err));
  }, [apiToken]);

  useEffect(() => {
    if (params.query) {
      // Simulate fetching results from an API or local data
      const fetchResults = async () => {
        // Replace this with your actual data fetching logic
        const simulatedResults = [
          {
            id: 1,
            name: `Product ${params.query} 1`,
            description: "Description 1",
          },
          {
            id: 2,
            name: `Product ${params.query} 2`,
            description: "Description 2",
          },
          {
            id: 3,
            name: `Vendor ${params.query} 1`,
            description: "Description 3",
          },
          {
            id: 4,
            name: `Vendor ${params.query} 2`,
            description: "Description 4",
          },
        ].filter((result) =>
          result.name.toLowerCase().includes(params.query!.toLowerCase())
        );

        setResults(simulatedResults);
      };

      fetchResults();
    } else {
      setResults([]);
    }
  }, [params.query]);

  return (
    <div>
      <h1>Results for "{params.query}"</h1>
      <p>{apiTest}</p>
      {results.length > 0 ? (
        <ul>
          {results.map((result) => (
            <li key={result.id}>
              <h2>{result.name}</h2>
              <p>{result.description}</p>
              {/* Add links to vendor or product pages here */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default Results;
