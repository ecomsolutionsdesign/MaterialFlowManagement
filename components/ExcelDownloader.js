'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LineSelector from '@/components/LineSelector'; // Assuming you have this component

const ExcelDownloader = () => {
  const [selectedLine, setSelectedLine] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleLineSelect = (lineNo) => {
    setSelectedLine(lineNo);
  };

  const handleDownload = async () => {
    if (!selectedLine) {
      setError('Please select a production line.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select a start and end date.');
      return;
    }

    if (startDate > endDate) {
      setError('Start date cannot be after the end date.');
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `/api/download-report?lineNo=${selectedLine}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production_report_line_${selectedLine}_${formattedStartDate}_to_${formattedEndDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData?.message || 'Failed to download the report.');
      }
    } catch (err) {
      setError(`Download error: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* <h2 className="text-xl font-semibold mb-4">Download Production Report (Excel)</h2> */}

      <div className="mb-4 w-[15%]">
        {/* <label htmlFor="line" className="block text-gray-700 text-sm font-bold mb-2">
          Production Line:
        </label> */}
        <LineSelector onSelect={handleLineSelect} />
        {error && !selectedLine && <p className="text-red-500 text-xs italic">{error}</p>}
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">
            Start Date:
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="startDate"
          />
          {error && !startDate && <p className="text-red-500 text-xs italic">{error}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">
            End Date:
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="endDate"
          />
          {error && !endDate && <p className="text-red-500 text-xs italic">{error}</p>}
        </div>
      </div>

      <button
        onClick={handleDownload}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          downloading ? 'cursor-wait' : ''
        }`}
        disabled={downloading}
      >
        {downloading ? 'Downloading...' : 'Download Excel'}
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-400 rounded mt-4 py-2 px-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExcelDownloader;