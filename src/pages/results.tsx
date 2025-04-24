// src/pages/Results.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Results: React.FC = () => {
  const params = useParams<Record<string, string | undefined>>();
  const [results, setResults] = useState<any[]>([]); // Replace 'any' with your data type

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

      void fetchResults();
    } else {
      setResults([]);
    }
  }, [params.query]);

  return (
    <div>
      <h1>{`Results for "${params.query}"`}</h1>
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
