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

            {comparisonReport.length > 0 && (
                <div className="max-w-6xl mx-auto mt-6 space-y-3">
                    {/* यूजर संकेत संदेश */}
                    <p className="text-[11px] text-slate-400 font-semibold italic flex items-center gap-1 px-1">
                        <span>💡 टू-डू लिस्ट संकेत: विस्तृत पट्टाधारीवार ई-टीपी विवरण देखने और टास्क को एक्सपैंड करने के लिए किसी भी महीने के बॉक्स पर क्लिक करें।</span>
                    </p>

                    {/* मुख्य टू-डू लिस्ट कंटेनर */}
                    <div className="flex flex-col gap-3">
                        {comparisonReport.map((row, index) => {
                            const isSelected = selectedRowDetails?.month === row.month;

                            return (
                                <div
                                    key={index}
                                    className={`bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${isSelected
                                        ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                                        : 'border-slate-200 hover:border-slate-300 hover:shadow'
                                        }`}
                                >
                                    {/* टू-डू लिस्ट आइटम हेडर (महीने की मुख्य जानकारी) */}
                                    <div
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedRowDetails(null); // दोबारा क्लिक करने पर बंद (Toggle Collapse)
                                            } else {
                                                handleRowClick(row.month); // क्लिक करने पर डेटा लोड और ओपन
                                            }
                                        }}
                                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                                    >
                                        {/* बायाँ भाग: चेकबॉक्स और महीने का नाम */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-slate-300 bg-slate-50'
                                                }`}>
                                                {isSelected ? (
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                    </svg>
                                                ) : null}
                                            </div>
                                            <div>
                                                <span className={`text-sm font-extrabold tracking-wide ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                                    {row.month} की समीक्षा
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {isSelected ? '📂 टास्क एक्टिव - विवरण खुला है' : '📁 टास्क पेंडिंग - देखने के लिए क्लिक करें'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* दायाँ भाग: संचित आंकड़े (KPI ग्रिड) */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-right text-xs">
                                            <div className="px-2 py-1 bg-blue-50 rounded-lg text-blue-900 font-semibold">
                                                <span className="text-[10px] block text-blue-600 font-bold">{fileAName || 'फ़ाइल A'}</span>
                                                <span className="font-mono">{row.sumA.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="px-2 py-1 bg-purple-50 rounded-lg text-purple-900 font-semibold">
                                                <span className="text-[10px] block text-purple-600 font-bold">{fileBName || 'फ़ाइल B'}</span>
                                                <span className="font-mono">{row.sumB.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg font-bold font-mono ${row.sumDiff > 0 ? 'bg-green-50 text-green-700' : row.sumDiff < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                <span className="text-[10px] block text-slate-400 font-bold">अंतर</span>
                                                {row.sumDiff > 0 ? `+${row.sumDiff.toLocaleString('en-IN')}` : row.sumDiff.toLocaleString('en-IN')}
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg font-bold font-mono ${row.sumPercent > 0 ? 'bg-emerald-50 text-emerald-700' : row.sumPercent < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                <span className="text-[10px] block text-slate-400 font-bold">प्रतिशत</span>
                                                {row.sumPercent > 0 ? `+${row.sumPercent.toFixed(2)}%` : `${row.sumPercent.toFixed(2)}%`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* टू-डू लिस्ट का इनर सेक्शन (पट्टाधारीवार कंबाइंड टेबल - केवल सिलेक्टेड होने पर दिखेगा) */}
                                    {isSelected && selectedRowDetails?.combinedList && (
                                        <div className="border-t border-slate-200 bg-slate-50/50 p-4 transition-all">
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-inner overflow-hidden">
                                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
                                                    📝 पट्टाधारीवार ब्रेकडाउन विवरण ({row.month})
                                                </div>

                                                <div className="overflow-x-auto text-xs">
                                                    {selectedRowDetails.combinedList.length > 0 ? (
                                                        <table className="min-w-full divide-y divide-slate-200 text-right font-semibold">
                                                            <thead className="bg-slate-50 text-slate-600 font-bold text-center">
                                                                <tr>
                                                                    <th className="px-4 py-2.5 border-r border-slate-200 text-left text-slate-700">पट्टाधारी का नाम (Lessee Name)</th>
                                                                    <th className="px-3 py-2.5 border-r border-slate-200 bg-blue-50/30 text-blue-900">{fileAName || 'फ़ाइल A'}</th>
                                                                    <th className="px-3 py-2.5 border-r border-slate-200 bg-purple-50/30 text-purple-900">{fileBName || 'फ़ाइल B'}</th>
                                                                    <th className="px-3 py-2.5 bg-green-50/30 text-green-900">अंतर</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                                                                {selectedRowDetails.combinedList.map((lessee, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                                        {/* पट्टाधारी का नाम */}
                                                                        <td className="px-4 py-2.5 border-r border-slate-200 text-left font-bold text-slate-800">
                                                                            {idx + 1}. {lessee.name}
                                                                        </td>

                                                                        {/* फ़ाइल A डेटा */}
                                                                        <td className={`px-3 py-2.5 border-r border-slate-100 font-mono ${lessee.etpA === 0 ? 'text-slate-300 font-normal' : 'text-blue-700'}`}>
                                                                            {lessee.etpA.toLocaleString('en-IN')}
                                                                        </td>

                                                                        {/* फ़ाइल B डेटा (0 होने पर म्यूटेड ग्रे कलर) */}
                                                                        <td className={`px-3 py-2.5 border-r border-slate-200 font-mono ${lessee.etpB === 0 ? 'text-slate-300 font-normal' : 'text-purple-700'}`}>
                                                                            {lessee.etpB.toLocaleString('en-IN')}
                                                                        </td>

                                                                        {/* दोनों फाइलों का अंतर */}
                                                                        <td className={`px-3 py-2.5 font-mono font-extrabold ${lessee.diff > 0 ? 'text-green-600' : lessee.diff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                                                            {lessee.diff > 0 ? `+${lessee.diff.toLocaleString('en-IN')}` : lessee.diff.toLocaleString('en-IN')}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="p-6 text-slate-400 italic text-center">
                                                            इस माह में किसी भी फ़ाइल में कोई पट्टाधारी रिकॉर्ड नहीं मिला।
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* संचयी ग्रैंड टोटल बॉक्स (पूरी लिस्ट के नीचे एक समरी कार्ड की तरह) */}
                        <div className="bg-slate-800 text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none mt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📊</span>
                                <div>
                                    <span className="text-sm font-black uppercase tracking-wider">कुल संचयी योग (Grand Total)</span>
                                    <p className="text-[10px] text-slate-400">चुने गए सभी महीनों का फाइनल समरी रिकॉर्ड</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-right text-xs font-bold">
                                <div className="px-3 py-1.5 bg-slate-700 rounded-lg">
                                    <span className="text-[10px] block text-slate-400 font-bold">कुल फ़ाइल A</span>
                                    <span className="font-mono text-sm text-blue-300">{grandTotalA.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-slate-700 rounded-lg">
                                    <span className="text-[10px] block text-slate-400 font-bold">कुल फ़ाइल B</span>
                                    <span className="font-mono text-sm text-purple-300">{grandTotalB.toLocaleString('en-IN')}</span>
                                </div>
                                <div className={`px-3 py-1.5 bg-slate-700 rounded-lg font-mono text-sm ${grandTotalDiff > 0 ? 'text-green-400' : grandTotalDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                    <span className="text-[10px] block text-slate-400 font-bold">कुल अंतर</span>
                                    {grandTotalDiff > 0 ? `+${grandTotalDiff.toLocaleString('en-IN')}` : grandTotalDiff.toLocaleString('en-IN')}
                                </div>
                                <div className={`px-3 py-1.5 bg-slate-700 rounded-lg font-mono text-sm ${grandTotalPercent > 0 ? 'text-green-400' : grandTotalPercent < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                    <span className="text-[10px] block text-slate-400 font-bold">कुल %</span>
                                    {grandTotalPercent > 0 ? `+${grandTotalPercent.toFixed(2)}%` : `${grandTotalPercent.toFixed(2)}%`}
                                </div>
                            </div>
                        </div>

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
                </div>

            )
            }




        </div>
    );
}