
'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function JumboEntry() {
  const [formData, setFormData] = useState({
    lineNo: '1',
    weight: '',
    scrapWeight: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/jumbo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, selectedDate: selectedDate.toISOString() }), // Send selectedDate to the API
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ text: `Jumbo created successfully with ID: ${data.jumboId}`, type: 'success' });
        setFormData({
          lineNo: '1',
          weight: '',
          scrapWeight: '',
        });
        setSelectedDate(new Date()); // Reset the date after successful submission
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
        <div className="bg-slate-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Jumbo Entry</h2>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="lineNo" className="block mb-2 font-medium">
                Line Number:
              </label>
              <select
                id="lineNo"
                name="lineNo"
                value={formData.lineNo}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="1">Line 1</option>
                <option value="2">Line 2</option>
                <option value="3">Line 3</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="date" className="block mb-2 font-medium">
                Select Date:
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="weight" className="block mb-2 font-medium">
                Jumbo Weight (kg):
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="scrapWeight" className="block mb-2 font-medium">
                Scrap Weight (kg):
              </label>
              <input
                type="number"
                id="scrapWeight"
                name="scrapWeight"
                value={formData.scrapWeight}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-slate-600 text-white py-2 px-4 rounded hover:bg-slate-700"
            >
              Create Jumbo
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}