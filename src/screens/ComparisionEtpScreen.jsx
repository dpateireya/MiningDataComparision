import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ComparisionEtpScreen() {
    const [fileAData, setFileAData] = useState([]);
    const [fileBData, setFileBData] = useState([]);
    const [fileAName, setFileAName] = useState('');
    const [fileBName, setFileBName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('4');

    // फिल्टर्स और परिणाम स्टेट्स
    const [comparisonReport, setComparisonReport] = useState([]);
    const [totalRowCountA, setTotalRowCountA] = useState(0);
    const [totalRowCountB, setTotalRowCountB] = useState(0);

    // File B के टारगेट माह और उससे एक माह पहले वाले माह की तुलना
    const [monthOverMonthB, setMonthOverMonthB] = useState(null);

    // 🔥 नया स्टेट: क्लिक की गई रो (चयनित माह) की विस्तृत जानकारी के लिए
    const [selectedRowDetails, setSelectedRowDetails] = useState(null);


    // वित्तीय वर्ष के क्रमानुसार महीनों की मास्टर लिस्ट (जैसा एक्सेल शीट में है)
    // "num" वही value है जो MainComparisionScreen (parent) से selectedMonth
    // prop में भेजी जाती है (जैसे April="4", March="3"), और "name" वही है
    // जो इस एक्सेल फ़ाइल के कॉलम हेडर में लिखा है (जैसे "April", "March")
    const financialMonths = [
        { name: "April", num: "4" },
        { name: "May", num: "5" },
        { name: "June", num: "6" },
        { name: "July", num: "7" },
        { name: "Aug", num: "8" },
        { name: "Sept", num: "9" },
        { name: "Oct", num: "10" },
        { name: "Nov", num: "11" },
        { name: "Dec", num: "12" },
        { name: "Jan", num: "1" },
        { name: "Feb", num: "2" },
        { name: "March", num: "3" }
    ];

    // एक्सेल फ़ाइल प्रोसेस करने का फ़ंक्शन
    const processExcel = (e, setRows, setFileName, setTotalCount) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

            setRows(json);
            setTotalCount(json.length - 1); // आख़िरी row (Total/Grand Total) को हटाकर काउंट करें
        };
        reader.readAsBinaryString(file);
    };

    // चुनी गई अवधि के आधार पर तुलना करने का मुख्य फ़ंक्शन
    const handleCompare = () => {
        if (fileAData.length === 0 || fileBData.length === 0) {
            alert("कृपया तुलना करने के लिए दोनों एक्सेल फ़ाइलें अपलोड करें!");
            return;
        }

        // एक्सेल शीट की आख़िरी row (जैसे Total/Grand Total row) को
        // गणना से बाहर रखने के लिए slice(0, -1) से हटाया गया है
        const dataA = fileAData.slice(0, -1);
        const dataB = fileBData.slice(0, -1);

        // चुने हुए महीने का इंडेक्स "num" (value) से निकालें —
        // Parent से selectedMonth हमेशा num की तरह आता है (जैसे "3", "4"),
        // महीने के नाम की तरह नहीं
        const targetIndex = financialMonths.findIndex(m => m.num === selectedMonth);
        console.log("Selected Month (num):", selectedMonth, "Index:", targetIndex);

        // अगर selectedMonth अभी तक सेट नहीं हुआ (undefined) या कोई अमान्य
        // value आई है, तो findIndex() -1 देता है — ऐसे में activeMonths और
        // report खाली रह जाते, और नीचे targetRow.month पढ़ते समय
        // "Cannot read properties of undefined (reading 'month')" एरर आता।
        // इसलिए यहीं रुक जाएं।
        if (targetIndex === -1) {
            alert("कृपया एक वैध माह चुनें।");
            return;
        }

        // अप्रैल से लेकर चुने हुए महीने तक के सभी महीनों को फ़िल्टर करें
        const activeMonths = financialMonths.slice(0, targetIndex + 1);
        console.log("Active Months for Comparison:", activeMonths.map(m => m.name));

        // केवल फ़िल्टर किए गए महीनों के लिए अलग-अलग जोड़ (Sum) निकालना
        // (एक्सेल कॉलम हेडर महीने के "नाम" से हैं, इसलिए row[mItem.name] पढ़ें)
        const report = activeMonths.map(mItem => {
            let sumA = 0;
            let sumB = 0;

            dataA.forEach(row => {
                const val = row[mItem.name];
                if (val !== undefined && val !== null && val !== '') {
                    const cleanNum = Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                    if (!isNaN(cleanNum)) sumA += cleanNum;
                }
            });

            dataB.forEach(row => {
                const val = row[mItem.name];
                if (val !== undefined && val !== null && val !== '') {
                    const cleanNum = Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                    if (!isNaN(cleanNum)) sumB += cleanNum;
                }
            });

            // File A की तुलना में प्रतिशत बदलाव
            // (sumA शून्य होने पर division-by-zero से बचाया गया है)
            const sumDiff = sumB - sumA;
            const sumPercent = sumA !== 0
                ? (sumDiff / sumA) * 100
                : (sumB !== 0 ? 100 : 0);

            return {
                month: mItem.name,
                sumA,
                sumB,
                sumDiff,
                sumPercent
            };
        });

        setComparisonReport(report);
        setSelectedRowDetails(null); // नई तुलना शुरू होने पर पुराना क्लिक विवरण रीसेट करें

        // ===================================================================
        // File B: टारगेट माह का योग, टारगेट से एक माह पहले का योग, और अंतर
        // (report array में महीने April → टारगेट माह के क्रम में हैं,
        //  इसलिए आख़िरी entry टारगेट माह है और उससे पहली entry पिछला माह)
        // ===================================================================
        const targetRow = report[report.length - 1];
        const prevRow = report.length >= 2 ? report[report.length - 2] : null;

        setMonthOverMonthB({
            targetMonthName: targetRow.month,
            targetSumB: targetRow.sumB,
            prevMonthName: prevRow ? prevRow.month : null,
            prevSumB: prevRow ? prevRow.sumB : null,
            diff: prevRow ? targetRow.sumB - prevRow.sumB : null
        });
    };

    // 🔥 नया फ़ंक्शन: रो क्लिक करने पर पट्टाधारियों के नाम और उनकी विशिष्ट ईटीपी खोजने का लॉजिक
    // 🔥 संशोधित फ़ंक्शन: दोनों फाइलों के पट्टाधारियों को एक ही कंबाइंड लिस्ट में मर्ज करने का लॉजिक
    const handleRowClick = (monthName) => {
        const dataA = fileAData.slice(0, -1);
        const dataB = fileBData.slice(0, -1);

        // फ़ाइल A से पट्टाधारी के नाम और चुने माह की ETP निकालें
        const lesseesA = dataA.map(row => {
            const lesseeName = row["Name of lessee"] || row["Name of Lessee"] || row["Lessee Name"] || "Unknown";
            const val = row[monthName];
            const cleanNum = val ? Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim()) : 0;
            return { name: lesseeName.trim(), etp: isNaN(cleanNum) ? 0 : cleanNum };
        }).filter(item => item.etp > 0);

        // फ़ाइल B से पट्टाधारी के नाम और चुने माह की ETP निकालें
        const lesseesB = dataB.map(row => {
            const lesseeName = row["Name of lessee"] || row["Name of Lessee"] || row["Lessee Name"] || "Unknown";
            const val = row[monthName];
            const cleanNum = val ? Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim()) : 0;
            return { name: lesseeName.trim(), etp: isNaN(cleanNum) ? 0 : cleanNum };
        }).filter(item => item.etp > 0);

        // दोनों फाइलों के पट्टाधारियों के यूनिक (Unique) नामों का सेट बनाएं
        const allNames = new Set([
            ...lesseesA.map(item => item.name),
            ...lesseesB.map(item => item.name)
        ]);

        // एक कंबाइंड लिस्ट तैयार करें (Full Outer Join)
        const combinedList = Array.from(allNames).map(name => {
            const matchA = lesseesA.find(item => item.name === name);
            const matchB = lesseesB.find(item => item.name === name);

            const etpA = matchA ? matchA.etp : 0;
            const etpB = matchB ? matchB.etp : 0;

            return {
                name: name,
                etpA: etpA,
                etpB: etpB,
                diff: etpB - etpA
            };
        });

        // सबसे ज्यादा अंतर या वैल्यू वाले पट्टाधारी को ऊपर दिखाने के लिए सॉर्ट करें
        combinedList.sort((a, b) => Math.max(b.etpA, b.etpB) - Math.max(a.etpA, a.etpB));

        setSelectedRowDetails({
            month: monthName,
            combinedList: combinedList
        });
    };


    // ग्रैंड टोटल निकालने का लॉजिक (यह चुने हुए महीने के अनुसार डायनामिक बदलेगा)
    const grandTotalA = comparisonReport.reduce((acc, row) => acc + row.sumA, 0);
    const grandTotalB = comparisonReport.reduce((acc, row) => acc + row.sumB, 0);
    const grandTotalDiff = grandTotalB - grandTotalA;
    const grandTotalPercent = grandTotalA !== 0
        ? (grandTotalDiff / grandTotalA) * 100
        : (grandTotalB !== 0 ? 100 : 0);

    return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
            {/* मुख्य हेडर */}
            <div className="bg-white p-4 text-center rounded border border-slate-200 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 tracking-wide">जारी ई-टीपी की तुलनात्‍मक जानकारी</h1>
            </div>
            {/* फ़ाइल अपलोड बॉक्स */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3] flex flex-col items-center justify-center border-dashed border-2">
                    <label className="cursor-pointer bg-white border border-[#b2ddf3] px-4 py-2 rounded text-center shadow-sm hover:bg-slate-50 block w-full max-w-xs">
                        <span className="font-bold text-xs text-[#0f4c6c]">📁 फ़ाइल A अपलोड करें</span>
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => processExcel(e, setFileAData, setFileAName, setTotalRowCountA)} />
                    </label>
                    {fileAName && <p className="mt-2 text-xs font-semibold text-slate-600 truncate max-w-xs">{fileAName}</p>}
                </div>

                <div className="bg-[#ebd6f1] p-4 rounded border border-[#dcbbe6] flex flex-col items-center justify-center border-dashed border-2">
                    <label className="cursor-pointer bg-white border border-[#dcbbe6] px-4 py-2 rounded text-center shadow-sm hover:bg-slate-50 block w-full max-w-xs">
                        <span className="font-bold text-xs text-purple-800">📁 फ़ाइल B अपलोड करें</span>
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => processExcel(e, setFileBData, setFileBName, setTotalRowCountB)} />
                    </label>
                    {fileBName && <p className="mt-2 text-xs font-semibold text-slate-600 truncate max-w-xs">{fileBName}</p>}
                </div>
            </div>

            {/* कुल रिकॉर्ड काउंट (Total Rows Count) */}
            {(totalRowCountA > 0 || totalRowCountB > 0) && (
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm text-center">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="text-xs text-slate-600 font-bold">{fileAName ? `${fileAName} कुल रिकॉर्ड्स` : 'कुल रिकॉर्ड्स'}</p>
                        <p className="text-xl font-extrabold text-blue-900 mt-1">{totalRowCountA.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                        <p className="text-xs text-slate-600 font-bold">{fileBName ? `${fileBName} कुल रिकॉर्ड्स` : 'कुल रिकॉर्ड्स'}</p>
                        <p className="text-xl font-extrabold text-purple-900 mt-1">{totalRowCountB.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {/* =====================================================
                Common Filter + Single Compare Button + Export
                ====================================================== */}
            <div className="max-w-6xl mx-auto mt-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* 1. माह का चयन (Month Selection) */}
                        <div className="w-full md:w-auto flex-1">
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                किस माह तक की रिपोर्ट देखनी है?
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-slate-100 border border-slate-300 rounded p-2 text-xs font-bold focus:outline-none w-full md:w-64 text-slate-700 cursor-pointer"
                            >
                                {financialMonths.map((month, index) => (
                                    <option key={index} value={month.num}>
                                        📅 {month.name} तक
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. ऐक्शन्स बटन्स (Compare and Export Buttons) */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

                            {/* तुलना करें बटन */}
                            <button
                                onClick={handleCompare}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-8 py-2.5 rounded shadow w-full sm:w-auto transition-all flex items-center justify-center gap-2"
                            >
                                📊 तुलना करें ➔
                            </button>

                            {/* एक्सेल डाउनलोड करें बटन (यदि तुलना रिपोर्ट उपलब्ध है तभी दिखेगा) */}
                            {comparisonReport.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (comparisonReport.length === 0) return;
                                        const workbook = XLSX.utils.book_new();
                                        const excelRows = comparisonReport.map((row) => ({
                                            "माह (Month)": row.month,
                                            [fileAName || 'फ़ाइल A']: row.sumA,
                                            [fileBName || 'फ़ाइल B']: row.sumB,
                                            "अंतर (Difference)": row.sumDiff,
                                            "प्रतिशत (%)": `${row.sumPercent.toFixed(2)}%`
                                        }));
                                        const worksheet = XLSX.utils.json_to_sheet(excelRows);
                                        worksheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 15 }];
                                        XLSX.utils.book_append_sheet(workbook, worksheet, "ETP_Comparision");
                                        XLSX.writeFile(workbook, `ETP_Comparision_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded shadow w-full sm:w-auto transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l4 4v13a2 2 0 01-2 2z" />
                                    </svg>
                                    एक्सेल डाउनलोड
                                </button>
                            )}

                        </div>

                    </div>
                </div>
            </div>




            {/* =========================================================================
                मुख्य तुलनात्मक रिपोर्ट तालिका (100% कम्प्लीट और फिक्स कोड)
                ========================================================================= */}
            {comparisonReport.length > 0 && (
                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3 mt-5">
                    <p className="text-[11px] text-slate-400 font-semibold italic flex items-center gap-1">
                        <span>💡 संकेत: पट्टाधारीवार और विस्तृत ईटीपी विवरण देखने के लिए नीचे किसी भी महीने की पंक्ति (Row) पर क्लिक करें।</span>
                    </p>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-right font-semibold">

                            {/* टेबल हेडर */}
                            <thead className="bg-slate-100 text-slate-700 font-bold text-center select-none">
                                <tr>
                                    <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900 w-1/5">माह (Month)</th>
                                    <th className="px-3 py-3 border-r border-slate-200 bg-blue-50/50 text-blue-900">{fileAName || 'फ़ाइल A'}</th>
                                    <th className="px-3 py-3 border-r border-slate-200 bg-purple-50/50 text-purple-900">{fileBName || 'फ़ाइल B'}</th>
                                    <th className="px-3 py-3 bg-green-50/50 border-r border-slate-200 text-green-900">अंतर (Difference)</th>
                                    <th className="px-3 py-3 bg-yellow-50/50 text-yellow-900">प्रतिशत (%)</th>
                                </tr>
                            </thead>

                            {/* टेबल बॉडी */}
                            <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                                {comparisonReport.map((row, index) => {
                                    const isSelected = selectedRowDetails?.month === row.month;

                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => handleRowClick(row.month)}
                                            className={`transition-all cursor-pointer select-none ${isSelected
                                                ? 'bg-blue-50 hover:bg-blue-100/80 border-l-4 border-l-blue-600'
                                                : 'hover:bg-slate-50/80'
                                                }`}
                                        >
                                            {/* माह नाम कॉलम */}
                                            <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-[#0f4c6c] flex items-center justify-between">
                                                <span>{row.month}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {isSelected ? 'चयनित 👁️' : 'देखें 🔍'}
                                                </span>
                                            </td>

                                            {/* फ़ाइल A का योग */}
                                            <td className="px-3 py-3 border-r border-slate-100 font-mono">
                                                {row.sumA.toLocaleString('en-IN')}
                                            </td>

                                            {/* फ़ाइल B का योग */}
                                            <td className="px-3 py-3 border-r border-slate-200 font-mono">
                                                {row.sumB.toLocaleString('en-IN')}
                                            </td>

                                            {/* अंतर कॉलम */}
                                            <td className={`px-3 py-3 border-r border-slate-200 font-mono font-extrabold ${row.sumDiff > 0 ? 'text-green-600' : row.sumDiff < 0 ? 'text-red-500' : 'text-slate-500'
                                                }`}>
                                                {row.sumDiff > 0 ? `+${row.sumDiff.toLocaleString('en-IN')}` : row.sumDiff.toLocaleString('en-IN')}
                                            </td>

                                            {/* प्रतिशत कॉलम */}
                                            <td className={`px-3 py-3 font-mono font-extrabold ${row.sumPercent > 0 ? 'text-green-600' : row.sumPercent < 0 ? 'text-red-500' : 'text-slate-500'
                                                }`}>
                                                {row.sumPercent > 0 ? `+${row.sumPercent.toFixed(2)}%` : `${row.sumPercent.toFixed(2)}%`}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* संचयी ग्रैंड टोटल रो (Grand Total Row) */}
                                <tr className="bg-slate-800 text-white font-extrabold text-sm border-t-2 border-slate-900 select-none">
                                    <td className="px-4 py-3 border-r border-slate-700 text-left uppercase tracking-wider">
                                        योग (Grand Total)
                                    </td>
                                    <td className="px-3 py-3 border-r border-slate-700 font-mono">
                                        {grandTotalA.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-3 py-3 border-r border-slate-700 font-mono">
                                        {grandTotalB.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-3 py-3 border-r border-slate-700 font-mono ${grandTotalDiff > 0 ? 'text-green-400' : grandTotalDiff < 0 ? 'text-red-400' : 'text-slate-300'
                                        }`}>
                                        {grandTotalDiff > 0 ? `+${grandTotalDiff.toLocaleString('en-IN')}` : grandTotalDiff.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-3 py-3 font-mono ${grandTotalPercent > 0 ? 'text-green-400' : grandTotalPercent < 0 ? 'text-red-400' : 'text-slate-300'
                                        }`}>
                                        {grandTotalPercent > 0 ? `+${grandTotalPercent.toFixed(2)}%` : `${grandTotalPercent.toFixed(2)}%`}
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>
                </div>
            )}

            {/* 🔥 नया सेक्शन: सिंगल कंबाइंड टेबल में पट्टाधारीवार विस्तृत विवरण (Drill-Down UI) */}
            {selectedRowDetails && (
                <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md mt-6 space-y-4 animate-fadeIn">

                    {/* कार्ड हेडर सेक्शन */}
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 select-none">
                            📊 माह <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-mono">{selectedRowDetails.month}</span> का पट्टाधारीवार तुलनात्मक ई-टीपी विवरण
                        </h2>
                        <button
                            onClick={() => setSelectedRowDetails(null)}
                            className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 transition-all shadow-sm active:scale-95"
                        >
                            ✕ विवरण बंद करें
                        </button>
                    </div>

                    {/* कंबाइंड सिंगल टेबल लेआउट */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm text-xs">
                        {selectedRowDetails.combinedList.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-200 text-right font-semibold">
                                <thead className="bg-slate-100 text-slate-700 font-bold text-center select-none">
                                    <tr>
                                        <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900 w-2/5">पट्टाधारी का नाम (Lessee Name)</th>
                                        <th className="px-3 py-3 border-r border-slate-200 bg-blue-50/50 text-blue-900 w-1/5">{fileAName || 'फ़ाइल A वैल्यू'}</th>
                                        <th className="px-3 py-3 border-r border-slate-200 bg-purple-50/50 text-purple-900 w-1/5">{fileBName || 'फ़ाइल B वैल्यू'}</th>
                                        <th className="px-3 py-3 bg-green-50/50 text-green-900 w-1/5">अंतर (Difference)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                                    {selectedRowDetails.combinedList.map((lessee, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                                            {/* पट्टाधारी का नाम */}
                                            <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-slate-800">
                                                {idx + 1}. {lessee.name}
                                            </td>

                                            {/* फ़ाइल A वैल्यू (नहीं होने पर 0) */}
                                            <td className={`px-3 py-3 border-r border-slate-100 font-mono ${lessee.etpA === 0 ? 'text-slate-300' : 'text-blue-700'}`}>
                                                {lessee.etpA.toLocaleString('en-IN')}
                                            </td>

                                            {/* फ़ाइल B वैल्यू (नहीं होने पर 0) */}
                                            <td className={`px-3 py-3 border-r border-slate-200 font-mono ${lessee.etpB === 0 ? 'text-slate-300' : 'text-purple-700'}`}>
                                                {lessee.etpB.toLocaleString('en-IN')}
                                            </td>

                                            {/* दोनों का अंतर */}
                                            <td className={`px-3 py-3 font-mono font-extrabold ${lessee.diff > 0 ? 'text-green-600' : lessee.diff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                                {lessee.diff > 0 ? `+${lessee.diff.toLocaleString('en-IN')}` : lessee.diff.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-slate-400 italic text-center bg-white">
                                इस माह में किसी भी फ़ाइल में कोई रिकॉर्ड नहीं मिला।
                            </div>
                        )}
                    </div>
                </div>
            )}



            {/* =========================================================================
                File B: टारगेट माह बनाम पिछला माह — तुलना (100% कम्प्लीट और फिक्स कोड)
                ========================================================================= */}
            {monthOverMonthB && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 mt-5">

                    {/* कार्ड हेडर */}
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center border-b pb-2 border-slate-100">
                        📊 {fileBName || 'फ़ाइल B'} — {monthOverMonthB.targetMonthName}
                        {monthOverMonthB.prevMonthName ? ` बनाम ${monthOverMonthB.prevMonthName} (माह-दर-माह तुलना)` : ''}
                    </h2>

                    {/* KPI ग्रिड लेआउट */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">

                        {/* 1. टारगेट माह का बॉक्स */}
                        <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl shadow-sm hover:bg-purple-50 transition-colors">
                            <p className="text-xs text-slate-500 font-bold flex items-center justify-center gap-1">
                                📅 {monthOverMonthB.targetMonthName} का कुल योग
                            </p>
                            <p className="text-2xl font-black text-purple-900 mt-1 font-mono">
                                {monthOverMonthB.targetSumB.toLocaleString('en-IN')}
                            </p>
                        </div>

                        {/* 2. पिछले माह का बॉक्स */}
                        <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl shadow-sm hover:bg-slate-100/50 transition-colors">
                            <p className="text-xs text-slate-500 font-bold flex items-center justify-center gap-1">
                                {monthOverMonthB.prevMonthName ? `⏮️ ${monthOverMonthB.prevMonthName} का कुल योग` : ' पिछला माह उपलब्ध नहीं'}
                            </p>
                            <p className="text-2xl font-black text-slate-700 mt-1 font-mono">
                                {monthOverMonthB.prevSumB !== null ? monthOverMonthB.prevSumB.toLocaleString('en-IN') : '—'}
                            </p>
                        </div>

                        {/* 3. अंतर (Difference) का बॉक्स */}
                        <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl shadow-sm hover:bg-slate-100/50 transition-colors">
                            <p className="text-xs text-slate-500 font-bold">
                                📉 अंतर (Month-over-Month MoM)
                            </p>
                            <p className={`text-2xl font-black mt-1 font-mono ${monthOverMonthB.diff === null
                                ? 'text-slate-400'
                                : monthOverMonthB.diff > 0
                                    ? 'text-green-600 bg-green-50/50 border border-green-100 rounded-lg py-0.5'
                                    : monthOverMonthB.diff < 0
                                        ? 'text-red-500 bg-red-50/50 border border-red-100 rounded-lg py-0.5'
                                        : 'text-slate-500'
                                }`}>
                                {monthOverMonthB.diff === null
                                    ? '—'
                                    : monthOverMonthB.diff > 0
                                        ? `+${monthOverMonthB.diff.toLocaleString('en-IN')}`
                                        : monthOverMonthB.diff.toLocaleString('en-IN')}
                            </p>
                        </div>

                    </div>

                    {/* यदि अप्रैल चुना गया हो (पहला महीना) तो छोटी सूचना दिखाएं */}
                    {!monthOverMonthB.prevMonthName && (
                        <p className="text-[10px] text-slate-400 text-center font-medium italic mt-2">
                            ℹ️ यह वित्तीय वर्ष का पहला माह (April) है, इसलिए इसके पिछले माह (March) का डेटा इस डेटाबेस फाइल में उपलब्ध नहीं है।
                        </p>
                    )}

                </div>
            )}


        </div>
    );
}