// app/raw-material/page.js
'use client';
import { useState, useEffect } from 'react';
import JumboSelector from '@/components/JumboSelector';
import LineSelector from '@/components/LineSelector';

export default function RawMaterial() {
  const [availableJumbos, setAvailableJumbos] = useState([]); // Changed state name
  const [selectedJumbo, setSelectedJumbo] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [formData, setFormData] = useState({
    rawMaterialWeight: '',
    scrapWeight: '0',
    scrapSources: [],
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Fetch available jumbos that do NOT have a raw material entry
    const fetchAvailableJumbos = async () => {
      try {
        const response = await fetch(`/api/jumbo/available-for-raw-material?lineNo=${selectedLine}`); // New API endpoint
        if (response.ok) {
          const data = await response.json();
          setAvailableJumbos(data); // Update state name
        } else {
          console.error('Error fetching available jumbos:', response.status);
        }
      } catch (error) {
        console.error('Error fetching available jumbos:', error);
      }
    };

    fetchAvailableJumbos();
  }, [selectedLine]);

  const handleLineSelect = (lineNo) => {
    setSelectedLine(lineNo);
    setSelectedJumbo(''); // Reset jumbo selection when line changes
  };

  const handleJumboSelect = (jumboId) => {
    setSelectedJumbo(jumboId);
    // No need to check for existing entry here, as the list will only contain those without entries
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleScrapSourceChange = (e, jumboId) => {
    const weight = parseFloat(e.target.value) || 0;

    setFormData((prev) => {
      const exists = prev.scrapSources.find((source) => source.jumboId === jumboId);

      let updatedSources;
      if (exists) {
        updatedSources = prev.scrapSources.map((source) =>
          source.jumboId === jumboId ? { ...source, weight } : source
        );
      } else {
        updatedSources = [...prev.scrapSources, { jumboId, weight }];
      }

      const totalScrapWeight = updatedSources.reduce((sum, source) => sum + source.weight, 0);

      return {
        ...prev,
        scrapWeight: totalScrapWeight.toString(),
        scrapSources: updatedSources,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedJumbo) {
      setMessage({ text: 'Please select a jumbo', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/raw-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineNo: selectedLine,
          jumboId: selectedJumbo,
          ...formData,
        }),
      });

      if (response.ok) {
        setMessage({ text: 'Raw material entry saved successfully', type: 'success' });
        setFormData({
          rawMaterialWeight: '',
          scrapWeight: '0',
          scrapSources: [],
        });
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000)
        // Re-fetch available jumbos to update the list
        const fetchAvailableJumbos = async () => {
          const response = await fetch('/api/jumbo/available-for-raw-material');
          if (response.ok) {
            const data = await response.json();
            setAvailableJumbos(data);
          } else {
            console.error('Error fetching available jumbos:', response.status);
          }
        };
        fetchAvailableJumbos();
        setSelectedJumbo(''); // Reset selected jumbo after successful save
      } else {
        const error = await response.json();
        setMessage({ text: `Error: ${error.message}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Material Entry</h2>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
            >
              {message.text}
            </div>
          )}

          <LineSelector onSelect={handleLineSelect} />

          {selectedLine && (
            <JumboSelector
              onSubmit={handleSubmit}
              onSelect={handleJumboSelect}
              fetchUrl={`/api/jumbo/available-for-raw-material?lineNo=${selectedLine}`} // Filtered URL
            />
          )}

          <form onSubmit={handleSubmit}>
            {selectedJumbo && ( // Conditionally render the form if a jumbo is selected
              <>
                <div className="mb-4">
                  <label htmlFor="rawMaterialWeight" className="block mb-2 font-medium">
                    Raw Material Weight (kg):
                  </label>
                  <input
                    type="number"
                    id="rawMaterialWeight"
                    name="rawMaterialWeight"
                    value={formData.rawMaterialWeight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Scrap Input (Recycled):</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
                    {availableJumbos.length === 0 ? (
                      <p className="text-gray-500">No scrap available for recycling</p>
                    ) : (
                      availableJumbos.map((scrap) => (
                        <div key={scrap.jumboId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <span className="flex-grow">{scrap.jumboId} (Available: {scrap.scrapWeight}kg)</span>
                          <input
                            type="number"
                            min="0"
                            max={scrap.weight}
                            step="0.01"
                            className="w-24 p-1 border rounded"
                            onChange={(e) => handleScrapSourceChange(e, scrap.jumboId)}
                            placeholder="kg"
                          />
                        </div>
                      ))
                    )}
                    {!selectedLine && <p className="text-gray-500">Select a production line to proceed.</p>}
                    {selectedLine && !selectedJumbo && (
                      <p className="text-gray-500">Select a jumbo for the selected line.</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-medium">Total Scrap Weight: {formData.scrapWeight} kg</p>
                </div>

                <button
                  type="submit"
                  className="bg-slate-600 text-white py-2 px-4 rounded hover:bg-slate-700"
                >
                  Save Raw Material Entry
                </button>
              </>
            )}
            {!selectedJumbo && <p className="text-gray-500">Select a jumbo to enter raw material details.</p>}
          </form>
        </div>
      </main>
    </div>
  );
}