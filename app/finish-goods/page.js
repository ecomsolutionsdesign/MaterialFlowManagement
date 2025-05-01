// app/finish-goods/page.js
'use client';
import { useState, useEffect } from 'react';
import JumboSelector from '@/components/JumboSelector';
import LineSelector from '@/components/LineSelector';

export default function FinishGoods() {
    const [availableJumbosForFinishGoods, setAvailableJumbosForFinishGoods] = useState([]);
    const [selectedJumbo, setSelectedJumbo] = useState('');
    const [selectedLine, setSelectedLine] = useState('');
    const [formData, setFormData] = useState({
        finishGoodsId: '',
        finishGoodsWeight: '',
        scrapWeight: '',
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchAvailableJumbosForFinishGoods = async () => {
            try {
                const response = await fetch(`/api/jumbo/available-for-finish-goods?lineNo=${selectedLine}`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableJumbosForFinishGoods(data);
                } else {
                    console.error('Error fetching jumbos for finish goods:', response.status);
                    const errorData = await response.json();
                    setMessage({ text: `Error fetching jumbos: ${errorData.message || response.statusText}`, type: 'error' });
                }
            } catch (error) {
                console.error('Error fetching jumbos for finish goods:', error);
                setMessage({ text: `Error fetching jumbos: ${error.message}`, type: 'error' });
            }
        };

        fetchAvailableJumbosForFinishGoods();
    }, [selectedLine]);

    const handleLineSelect = (lineNo) => {
        setSelectedLine(lineNo);
        setSelectedJumbo(''); // Reset jumbo selection when line changes
    };

    const handleJumboSelect = (jumboId) => {
        setSelectedJumbo(jumboId);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedJumbo) {
            setMessage({ text: 'Please select a jumbo', type: 'error' });
            return;
        }

        try {
            const response = await fetch('/api/finish-goods', {
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
                setMessage({ text: 'Finish goods entry saved successfully', type: 'success' });
                setFormData({
                    finishGoodsId: '',
                    finishGoodsWeight: '',
                    scrapWeight: '',
                });
                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                  }, 3000);
                // Re-fetch available jumbos to update the list
                const fetchAvailableJumbosForFinishGoods = async () => {
                    const response = await fetch('/api/jumbo/available-for-finish-goods');
                    if (response.ok) {
                        const data = await response.json();
                        setAvailableJumbosForFinishGoods(data);
                    } else {
                        console.error('Error fetching jumbos for finish goods:', response.status);
                        const errorData = await response.json();
                        setMessage({ text: `Error fetching jumbos: ${errorData.message || response.statusText}`, type: 'error' });
                    }
                };
                fetchAvailableJumbosForFinishGoods();
                setSelectedJumbo(''); // Reset selected jumbo
            } else {
                const errorData = await response.json();
                setMessage({ text: `Error saving finish goods: ${errorData.message || response.statusText}`, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: `Error saving finish goods: ${error.message}`, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="container mx-auto p-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Finish Goods Entry</h2>

                    {message.text && (
                        <div
                            className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <LineSelector onSelect={handleLineSelect} /> {/* Add LineSelector */}


                    {selectedLine && (
                        <JumboSelector
                            fetchUrl={`/api/jumbo/available-for-finish-goods?lineNo=${selectedLine}`} // Filtered URL
                            onSelect={handleJumboSelect}
                        />
                    )}

                    <form onSubmit={handleSubmit}>
                        {selectedJumbo && (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="finishGoodsId" className="block mb-2 font-medium">
                                        Finish Goods Serial No.:
                                    </label>
                                    <input
                                        type="text"
                                        id="finishGoodsId"
                                        name="finishGoodsId"
                                        value={formData.finishGoodsId}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="finishGoodsWeight" className="block mb-2 font-medium">
                                        Finish Goods Weight (kg):
                                    </label>
                                    <input
                                        type="number"
                                        id="finishGoodsWeight"
                                        name="finishGoodsWeight"
                                        value={formData.finishGoodsWeight}
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
                                    disabled={!selectedJumbo}
                                >
                                    Save Finish Goods Entry
                                </button>
                            </>
                        )}
                        {!selectedLine && <p className="text-gray-500">Select a production line to proceed.</p>}
                        {selectedLine && !selectedJumbo && (
                            <p className="text-gray-500">Select a jumbo for the selected line.</p>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}