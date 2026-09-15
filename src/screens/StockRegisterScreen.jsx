import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

export default function StockRegisterScreen() {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            // आदेश नंबर (orders) के आधार पर डेटा को मर्ज करने के लिए मैप
            const ordersMap = new Map();

            for (let i = 7; i < sheetData.length; i += 2) {
                const firstRow = sheetData[i];
                const secondRow = sheetData[i + 1];

                if (!firstRow || !secondRow) continue;

                const cleanFirstCells = firstRow.map(c => c ? String(c).trim() : '');
                const cleanSecondCells = secondRow.map(c => c ? String(c).trim() : '');

                const lesseeName = `${cleanFirstCells[2]} ${cleanFirstCells[6]} ${cleanFirstCells[8]}`.trim() || '';
                const address = cleanFirstCells[5] || '';
                const situation = cleanFirstCells[17] || '';
                const mineral = cleanFirstCells[13] || '';

                const orders = cleanSecondCells[2] || '';
                const periods = cleanSecondCells[6] || '';
                const idCode = cleanSecondCells[17] || '';

                const periodArray = cleanSecondCells[6]?.split('-')[1] || '';
                const parts = String(periodArray || '').trim().split('/');
                const target = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : null;
                const diffDays = target ? Math.ceil((target.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000) : null;

                const status = diffDays === null ? "Invalid Date" : diffDays > 0 ? "Working" : "Lapse";

                if (orders && idCode) {
                    const uniqueKey = orders.trim().toLowerCase();

                    // वर्तमान रो के खनिजों को साफ करके एरे (Array) में बदलें
                    const currentMinerals = mineral ? mineral.split(',').map(m => m.trim()).filter(m => m !== '') : [];

                    if (ordersMap.has(uniqueKey)) {
                        // 🔄 यदि यह आदेश पहले आ चुका है, तो डेटा को मर्ज करें:
                        const existingRow = ordersMap.get(uniqueKey);

                        // पुराने खनिजों और नए खनिजों को आपस में मिलाएं और Set का उपयोग करके केवल UNIQUE खनिज रखें
                        const mergedMineralsSet = new Set([
                            ...existingRow.mineralArray,
                            ...currentMinerals
                        ]);

                        // मैप में पुराने रिकॉर्ड को नए मर्ज किए गए खनिजों के साथ अपडेट करें
                        existingRow.mineralArray = Array.from(mergedMineralsSet);
                        existingRow.mineral = existingRow.mineralArray.join(', '); // दोबारा टेक्स्ट में बदलें

                    } else {
                        // 🆕 यदि यह आदेश पहली बार आया है, तो मैप में नया दर्ज करें
                        ordersMap.set(uniqueKey, {
                            lesseeName,
                            address,
                            situation,
                            periods,
                            mineral: currentMinerals.join(', '), // शुरुआती खनिज सूची
                            mineralArray: currentMinerals,       // ट्रैकिंग के लिए एरे
                            status,
                            idCode,
                            orders,
                            isDuplicateRow: false // मर्ज होने के कारण अब कोई भी रो डुप्लीकेट नहीं बचेगी
                        });
                    }
                }
            }

            // मैप से वापस एरे (List) बनाकर स्टेट में स्टोर करें
            const finalParsedRows = Array.from(ordersMap.values());
            finalParsedRows.sort((a, b) => b.status.localeCompare(a.status));
            setData(finalParsedRows);
        };

        reader.readAsBinaryString(file);
    };



    // एडवांस सर्च और फ़िल्टर लॉजिक
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch =
                item.lesseeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.idCode.includes(searchTerm) ||
                item.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.mineral.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || item.status.trim() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, statusFilter]);

    // 📊 डैशबोर्ड स्टेटिस्टिक्स काउंटर (केवल मुख्य पंक्तियों को गिनेगा, डुप्लीकेट्स को नहीं)
    const stats = useMemo(() => {
        // केवल उन्हीं रो को फ़िल्टर करें जो डुप्लीकेट नहीं हैं (`isDuplicateRow: false`)
        const uniqueMines = data.filter(d => !d.isDuplicateRow);

        return {
            total: uniqueMines.length,
            invaliddate: uniqueMines.filter(d => d.status.trim() === "Invalid Date").length,
            working: uniqueMines.filter(d => d.status.trim() === "Working").length,
            lapse: uniqueMines.filter(d => d.status.trim() === "Lapse").length,
        };
    }, [data]);

    // 🔢 सीरियल नंबर को डायनामिक रूप से केवल मुख्य पंक्तियों के लिए गिनने का लॉजिक
    let currentSNo = 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Header Card */}
                <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock License Register Reader (.xlsx)</h1>
                        <p className="text-sm text-slate-500 mt-1">अपनी एक्सेल फ़ाइल (.xlsx / .xls) अपलोड करें।</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl cursor-pointer transition-colors shadow-sm">
                            <svg xmlns="http://w3.org" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            एक्सेल फ़ाइल चुनें
                            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                        </label>
                        {fileName && <span className="text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">{fileName}</span>}
                    </div>
                </header>

                {data.length > 0 && (
                    <>
                        {/* Summary KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mx-auto">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">कुल भण्‍डारण (Total)</span>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">कार्यशील (Working)</span>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.working}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">अवधि समाप्‍त (Lapse)</span>
                                <p className="text-3xl font-bold text-red-500 mt-1">{stats.lapse}</p>
                            </div>
                        </div>

                        {/* Filters & Search Control Bar */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <input
                                    type="text"
                                    placeholder="नाम, आईडी कोड, तहसील या खनिज खोजें..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                {['ALL', 'Working', 'Lapse', 'Non-Working'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${statusFilter === status
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {status === 'ALL' ? 'सभी माइन्स' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Data Table */}
                        {/* डेटा टेबल कार्ड स्टार्ट */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
                                <table className="w-full text-left border-collapse">

                                    {/* 1. टेबल हेडर (Sticky Header) */}
                                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                                        <tr>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">क्र.</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">ID Code</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider md:w-80">पट्टाधारी का नाम व पता (Lessee Details)</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">खदान लोकेशन (Situation)</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">आदेश विवरण (Orders)</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">अवधि (Periods)</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">खनिज (Mineral)</th>
                                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36 text-center">स्थिति (Status)</th>
                                        </tr>
                                    </thead>

                                    {/* 2. टेबल बॉडी (Dynamic Rows) */}
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {filteredData.length > 0 ? (
                                            filteredData.map((row, index) => {
                                                // यदि यह मुख्य रो है, तो ही सीरियल नंबर (क्र.) को बढ़ाएं
                                                if (!row.isDuplicateRow) {
                                                    currentSNo++;
                                                }

                                                return (
                                                    <tr
                                                        key={index}
                                                        className={`transition-colors ${row.isDuplicateRow
                                                            ? 'bg-slate-50/50 hover:bg-slate-100/70 border-l-4 border-l-blue-400'
                                                            : 'hover:bg-slate-50/80 bg-white'
                                                            }`}
                                                    >
                                                        {/* क्र. (सीरियल नंबर - केवल मुख्य रो के लिए दिखेगा) */}
                                                        <td className="p-4 text-slate-500 font-medium text-center">
                                                            {!row.isDuplicateRow ? currentSNo : ""}
                                                        </td>

                                                        {/* यूनिक आईडी कोड */}
                                                        <td className="p-4">
                                                            <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-1 rounded-md border border-slate-200 font-bold tracking-wide">
                                                                {row.idCode}
                                                            </span>
                                                        </td>

                                                        {/* पट्टाधारी का नाम व पता */}
                                                        <td className="p-4">
                                                            <div className={`font-semibold text-slate-900 ${row.isDuplicateRow ? 'text-slate-500 text-xs italic' : ''}`}>
                                                                {row.lesseeName}
                                                                {row.isDuplicateRow && (
                                                                    <span className="text-[10px] text-blue-500 font-normal ml-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                                        अतिरिक्त आदेश
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {row.address && !row.isDuplicateRow && (
                                                                <div className="text-xs font-normal text-slate-400 mt-1 max-w-xs truncate" title={row.address}>
                                                                    {row.address}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* खदान लोकेशन (Situation) */}
                                                        <td className="p-4 text-slate-600 max-w-2xs">
                                                            <div className="text-xs md:text-sm leading-relaxed" title={row.situation}>
                                                                {row.situation || <span className="text-slate-300 italic">जानकारी उपलब्ध नहीं</span>}
                                                            </div>
                                                        </td>

                                                        {/* आदेश विवरण (Orders) */}
                                                        <td className="p-4 text-xs font-medium text-slate-700">
                                                            {row.orders || <span className="text-slate-300">—</span>}
                                                        </td>

                                                        {/* अवधि (Periods) */}
                                                        <td className="p-4">
                                                            <span className="text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs inline-block">
                                                                {row.periods || "N/A"}
                                                            </span>
                                                        </td>

                                                        {/* खनिज (Mineral) */}
                                                        <td className="p-4">
                                                            <span className="text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs inline-block">
                                                                {row.mineral || "N/A"}
                                                            </span>
                                                        </td>

                                                        {/* स्थिति (Status) */}
                                                        <td className="p-4 text-center">
                                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border tracking-wide w-28
                                     ${row.status.trim() === 'Working' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-50' :
                                                                    row.status.trim() === 'Lapse' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-50' :
                                                                        'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-50'
                                                                }`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${row.status.trim() === 'Working' ? 'bg-green-500' :
                                                                    row.status.trim() === 'Lapse' ? 'bg-red-500' : 'bg-amber-500'
                                                                    }`}></span>
                                                                {row.status}
                                                            </span>
                                                        </td>

                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            /* नो डेटा स्टेट (No Data Found UI) */
                                            <tr>
                                                <td colSpan="8" className="p-16 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <svg xmlns="http://w3.org" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <p className="text-base font-semibold text-slate-700">कोई रिकॉर्ड नहीं मिला</p>
                                                        <p className="text-xs text-slate-400 max-w-xs">सर्च कीवर्ड बदलें या फ़िल्टर रीसेट करके दोबारा प्रयास करें।</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>

                            {/* 3. टेबल फुटर (प्रोग्रेस / काउंटर बार) */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    <span>फ़िल्टर किए गए परिणाम: <b className="text-slate-800">{filteredData.length} रिकॉर्ड्स</b></span>
                                </div>
                                <div className="text-slate-400">
                                    कुल यूनिक भंडारण: <span className="font-semibold text-slate-600">{stats.total}</span> | कुल रो (आदेशों सहित): <span className="font-semibold text-slate-600">{data.length}</span>
                                </div>
                            </div>
                        </div>
                        {/* डेटा टेबल कार्ड एंड */}

                    </>

                )}


            </div>
        </div>
    )
}
