'use client';
import { useState, useEffect } from 'react';
import LineSelector from '@/components/LineSelector';

export default function Reports() {
  const [selectedLine, setSelectedLine] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedLine) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/reports?lineNo=${selectedLine}`);

        if (response.ok) {
          const data = await response.json();
          setReports(data);
          setError(null);
        } else {
          setError('Failed to fetch reports');
        }
      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedLine]);

  const handleLineSelect = (lineNo) => {
    setSelectedLine(lineNo);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Production Report</h2>

          <LineSelector onSelect={handleLineSelect} />

          {loading ? (
            <div className="text-center py-8">
              <p>Loading reports...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          ) : selectedLine ? (
            reports.length > 0 ? (
              <div className="overflow-x-auto">
                <h3 className="mb-4">Production Report for Line {selectedLine}</h3>
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 w-[8%]">Jumbo ID</th>
                      <th className="border px-4 py-2 w-[8%]">Raw Material (kg)</th>
                      <th className="border px-4 py-2 w-[8%]">Recycled Scrap (kg)</th>
                      <th className="border px-4 py-2 w-[10%]">Total Input (kg)</th>
                      <th className="border px-4 py-2 w-[18%]">Finish Goods Serial No.</th>
                      <th className="border px-4 py-2 w-[10%]">Finish Goods (kg)</th>
                      <th className="border px-4 py-2 w-[8%]">Output Scrap (kg)</th>
                      <th className="border px-4 py-2 w-[10%]">Total Output (kg)</th>
                      <th className="border px-4 py-2 w-[10%]">Difference (kg)</th>
                      <th className="border px-4 py-2 w-[10%]">Difference (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const totalInput = report.rawMaterialWeight + report.recycledScrapWeight;
                      const totalOutput = report.finishGoodsWeight + report.outputScrapWeight;
                      const difference = totalInput - totalOutput;
                      const differencePercentage = ((difference / totalInput) * 100).toFixed(2);

                      return (
                        <tr key={report.jumboId}>
                          <td className="border px-4 py-2 w-[8%]">{report.jumboId}</td>
                          <td className="border px-4 py-2 w-[8%]">{report.rawMaterialWeight.toFixed(2)}</td>
                          <td className="border px-4 py-2 w-[8%]">{report.recycledScrapWeight.toFixed(2)}</td>
                          <td className="border px-4 py-2 w-[10%] font-medium">{totalInput.toFixed(2)}</td>
                          <td className="border px-4 py-2 w-[18%] font-medium">{report.finishGoodsId}</td>
                          <td className="border px-4 py-2 w-[10%]">{report.finishGoodsWeight.toFixed(2)}</td>
                          <td className="border px-4 py-2 w-[8%]">{report.outputScrapWeight.toFixed(2)}</td>
                          <td className="border px-4 py-2 w-[10%] font-medium">{totalOutput.toFixed(2)}</td>
                          <td className={`border px-4 py-2 w-[10%] font-medium ${difference !== 0 ? 'text-red-600' : ''}`}>
                            {difference.toFixed(2)}
                          </td>
                          <td className={`border px-4 py-2 ${difference !== 0 ? 'text-red-600' : ''}`}>
                            {differencePercentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data available for the selected line.</p>
            )
          ) : (
            <p>Select a production line to view the report.</p>
          )}
        </div>
      </main>
    </div>
  );
}