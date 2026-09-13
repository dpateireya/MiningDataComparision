import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Eye, EyeOff, BarChart3, Database } from 'lucide-react';

function Test1() {
    // स्टेट्स (States) मैनेजमेंट
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [showDetails, setShowDetails] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [columns, setColumns] = useState([]);

    // 1. पेज लोड होते ही LocalStorage से पुराना डेटा चेक करना
    useEffect(() => {
        const storedData = localStorage.getItem('react_excel_data');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setData(parsedData);
            processLogicAndConsolidation(parsedData);
            setStatusMessage('पूर्व का डेटा प्रदर्शित किया जा रहा है।');
        } else {
            setStatusMessage('कोई पूर्व डेटा नहीं है। कृपया नई एक्सेल फ़ाइल अपलोड करें।');
        }
    }, []);

    // 2. एक्सेल फ़ाइल अपलोड हैंडलर
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            let jsonData = XLSX.utils.sheet_to_json(ws);

            // --- लॉजिक और कंडीशन (Logic & Condition) ---
            // उदाहरण कंडीशन: यदि शीट में 'Status' कॉलम है, तो केवल 'Active' लोगों को फ़िल्टर करें
            jsonData = jsonData.filter(row => {
                const statusKey = Object.keys(row).find(k => k.toLowerCase() === 'status');
                if (statusKey) {
                    return row[statusKey].toString().toLowerCase() === 'active';
                }
                return true;
            });

            // LocalStorage में डेटा सुरक्षित करना (ताकि रिफ्रेश पर डेटा गायब न हो)
            localStorage.setItem('react_excel_data', JSON.stringify(jsonData));

            setData(jsonData);
            processLogicAndConsolidation(jsonData);
            setStatusMessage('नया डेटा सफलतापूर्वक अपलोड और सुरक्षित कर दिया गया है!');
        };
        reader.readAsBinaryString(file);
    };

    // 3. डेटा कंसोलिडेशन और लॉजिक प्रोसेस करने का फंक्शन
    const processLogicAndConsolidation = (jsonData) => {
        if (jsonData.length === 0) return;

        // कॉलम के नाम निकालना
        const keys = Object.keys(jsonData[0]);
        setColumns(keys);

        // ऑटो-डिटेक्ट कॉलम (Amount और Department)
        let amountColumn = keys.find(k => k.toLowerCase().includes('salary') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('राशि')) || keys[0];
        let deptColumn = keys.find(k => k.toLowerCase().includes('dept') || k.toLowerCase().includes('department') || k.toLowerCase().includes('विभाग')) || keys[0];

        // कंसोलिडेशन लॉजिक (Group By Department)
        const deptSummary = {};
        jsonData.forEach(row => {
            const dept = row[deptColumn] || "अन्य (Others)";
            const amt = Number(row[amountColumn]) || 0;

            if (!deptSummary[dept]) {
                deptSummary[dept] = { count: 0, total: 0 };
            }
            deptSummary[dept].count += 1;
            deptSummary[dept].total += amt;
        });

        setSummary({
            deptSummary,
            totalAmount: jsonData.reduce((sum, row) => sum + (Number(row[amountColumn]) || 0), 0),
            amountColumn,
            deptColumn
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* हेडर */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-2">
                        <BarChart3 className="w-8 h-8 text-blue-600" /> React एक्सेल डेटा डैशबोर्ड
                    </h1>
                    <p className="text-sm text-amber-600 font-semibold mt-2 flex items-center justify-center gap-1">
                        <Database className="w-4 h-4" /> {statusMessage}
                    </p>
                </header>

                {/* 1. अपलोड सेक्शन */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8 text-center border border-gray-200">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                        <Upload className="w-5 h-5" /> नई एक्सेल फ़ाइल चुनें
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>

                {data.length > 0 && (
                    <>
                        {/* 2. वर्तमान स्थिति / KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                                <h3 className="text-sm font-medium text-gray-400 uppercase">कुल प्रविष्टियां (Total Count)</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{data.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                                <h3 className="text-sm font-medium text-gray-400 uppercase">कुल संचित राशि ({summary.amountColumn})</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">
                                    ₹{summary.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* 3. कंसोलिडेटेड डेटा टेबल */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> विभाग अनुसार कंसोलिडेटेड समरी
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-left">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-blue-900">विभाग ({summary.deptColumn})</th>
                                            <th className="px-6 py-3 font-semibold text-blue-900">कुल लोग (Count)</th>
                                            <th className="px-6 py-3 font-semibold text-blue-900">कुल राशि (Total Amount)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {summary.deptSummary && Object.entries(summary.deptSummary).map(([dept, values]) => (
                                            <tr key={dept} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{dept}</td>
                                                <td className="px-6 py-4">{values.count}</td>
                                                <td className="px-6 py-4 font-semibold text-emerald-600">
                                                    ₹{values.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4. वन-क्लिक पर ऑल डिटेल (One-Click Toggle) */}
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-900 transition shadow-md mb-8"
                        >
                            {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            {showDetails ? 'सभी विस्तृत जानकारी छुपाएं' : 'वन-क्लिक: सभी विस्तृत जानकारी देखें'}
                        </button>

                        {/* विस्तृत डेटा टेबल */}
                        {showDetails && (
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all">
                                <h3 className="text-lg font-bold text-gray-700 mb-4">🔍 सभी डेटा की विस्तृत सूची (Full Details)</h3>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200 text-left">
                                        <thead className="bg-gray-800 text-white sticky top-0">
                                            <tr>
                                                {columns.map(col => <th key={col} className="px-4 py-2 text-sm font-semibold">{col}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white text-sm">
                                            {data.map((row, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    {columns.map(col => <td key={col} className="px-4 py-2 whitespace-nowrap">{row[col] !== undefined ? row[col].toString() : '-'}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Test1;
