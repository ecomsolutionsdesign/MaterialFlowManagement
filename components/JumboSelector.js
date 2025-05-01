// components/JumboSelector.js
'use client';
import { useState, useEffect } from 'react';

export default function JumboSelector({ onSelect, fetchUrl }) {
  const [jumbos, setJumbos] = useState([]);
  const [selectedJumbo, setSelectedJumbo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch jumbos from the provided API URL
    const fetchJumbos = async () => {
      try {
        setLoading(true);
        const response = await fetch(fetchUrl); // Use the dynamic fetchUrl

        if (response.ok) {
          const data = await response.json();
          setJumbos(data);
          setError(null);
        } else {
          setError(`Failed to fetch jumbos from ${fetchUrl}`);
        }
      } catch (error) {
        setError(`Error fetching jumbos from ${fetchUrl}: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchJumbos();
  }, [fetchUrl]); // Re-fetch if fetchUrl changes

  const handleChange = (e) => {
    setSelectedJumbo(e.target.value);
    onSelect(e.target.value);
  };

  if (loading) {
    return (
      <div className="mb-4">
        <p>Loading available jumbos...</p> {/* Updated loading message */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 bg-red-100 text-red-800 p-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor="jumboSelect" className="block mb-2 font-medium">
        Select Jumbo:
      </label>
      <select
        id="jumboSelect"
        value={selectedJumbo}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Select a Jumbo</option>
        {jumbos.length === 0 ? (
          <option disabled>No jumbos available</option>
        ) : (
          jumbos.map((jumbo) => (
            <option key={jumbo._id} value={jumbo.jumboId}>
              {jumbo.jumboId} - {jumbo.weight}kg
            </option>
          ))
        )}
      </select>
    </div>
  );
}