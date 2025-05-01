// components/LineSelector.js
'use client';
import { useState, useEffect } from 'react';

export default function LineSelector({ onSelect }) {
    const [selectedLine, setSelectedLine] = useState('');
    const [availableLines, setAvailableLines] = useState([]);

    useEffect(() => {
        const fetchAvailableLines = async () => {
            try {
                const response = await fetch('/api/lines'); // Create this API endpoint
                if (response.ok) {
                    const data = await response.json();
                    setAvailableLines(data);
                } else {
                    console.error('Error fetching available lines:', response.status);
                }
            } catch (error) {
                console.error('Error fetching available lines:', error);
            }
        };

        fetchAvailableLines();
    }, []);

    const handleChange = (e) => {
        const lineNo = parseInt(e.target.value);
        setSelectedLine(lineNo);
        onSelect(lineNo);
    };

    return (
        <div className="mb-4">
            <label htmlFor="lineSelect" className="block mb-2 font-medium">
                Select Production Line:
            </label>
            <select
                id="lineSelect"
                value={selectedLine}
                onChange={handleChange}
                className="w-full p-2 border rounded"
            >
                <option value="">Select a Line</option>
                {availableLines.map((line) => (
                    <option key={line} value={line}>
                        Line {line}
                    </option>
                ))}
            </select>
        </div>
    );
}