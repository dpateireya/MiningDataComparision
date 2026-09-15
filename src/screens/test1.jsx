import { useState } from 'react';
import * as XLSX from 'xlsx';


export default function Test1() {
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

    // वित्तीय वर्ष के क्रमानुसार महीनों की मास्टर लिस्ट (जैसा एक्सेल शीट में है)
    // "num" वही value है जो MainComparisionScreen (parent) से selectedMonth
    // prop में भेजी जाती है (जैसे April="4", March="3"), और "name" वही है
    // जो इस एक्सेल फ़ाइल के कॉलम हेडर में लिखा है (जैसे "April", "March")
    const financialMonths = [
        { name: "April", num: "4" },
        { name: "May", num: "5" },
        { name: "June", num: "6" },
        { name: "July", num: "7" },
        { name: "August", num: "8" },
        { name: "September", num: "9" },
        { name: "October", num: "10" },
        { name: "November", num: "11" },
        { name: "December", num: "12" },
        { name: "January", num: "1" },
        { name: "Feburary", num: "2" },
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
            let sumProdA = 0;
            let sumDispA = 0;
            let sumProdB = 0;
            let sumDispB = 0;

            // फ़ाइल A के लिए गणना: जहाँ Month कॉलम का मान हमारे मोंथ लिस्ट से मैच करे
            dataA.forEach(row => {
                const monthVal = row["Month"];
                if (monthVal && String(monthVal).trim().toLowerCase() === mItem.name.toLowerCase()) {
                    const prodVal = row["Production"];
                    const dispVal = row["Dispatch"];
                    if (prodVal !== undefined && prodVal !== null && prodVal !== '') {
                        const cleanNum = Number(String(prodVal).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                        if (!isNaN(cleanNum)) sumProdA += cleanNum;
                    }
                    if (dispVal !== undefined && dispVal !== null && dispVal !== '') {
                        const cleanNum = Number(String(dispVal).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                        if (!isNaN(cleanNum)) sumDispA += cleanNum;
                    }
                }
            });

            // फ़ाइल B के लिए गणना
            dataB.forEach(row => {
                const monthVal = row["Month"];
                if (monthVal && String(monthVal).trim().toLowerCase() === mItem.name.toLowerCase()) {
                    const prodVal = row["Production"];
                    const dispVal = row["Dispatch"];
                    if (prodVal !== undefined && prodVal !== null && prodVal !== '') {
                        const cleanNum = Number(String(prodVal).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                        if (!isNaN(cleanNum)) sumProdB += cleanNum;
                    }
                    if (dispVal !== undefined && dispVal !== null && dispVal !== '') {
                        const cleanNum = Number(String(dispVal).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                        if (!isNaN(cleanNum)) sumDispB += cleanNum;
                    }
                }
            });

            const sumProdDiff = sumProdB - sumProdA;
            const sumProdPercent = sumProdA !== 0 ? (sumProdDiff / sumProdA) * 100 : (sumProdB !== 0 ? 100 : 0);
            const sumDispDiff = sumDispB - sumDispA;
            const sumDispPercent = sumDispA !== 0 ? (sumDispDiff / sumDispA) * 100 : (sumDispB !== 0 ? 100 : 0);


            return {
                month: mItem.name,
                sumProdA,
                sumProdB,
                sumProdDiff,
                sumProdPercent,
                sumDispA,
                sumDispB,
                sumDispDiff,
                sumDispPercent
            };
        });

        setComparisonReport(report);

        // ===================================================================
        // File B: टारगेट माह का योग, टारगेट से एक माह पहले का योग, और अंतर
        // (report array में महीने April → टारगेट माह के क्रम में हैं,
        //  इसलिए आख़िरी entry टारगेट माह है और उससे पहली entry पिछला माह)
        // ===================================================================
        const targetRow = report[report.length - 1];
        const prevRow = report.length >= 2 ? report[report.length - 2] : null;

        setMonthOverMonthB({
            targetMonthName: targetRow.month,
            targetProdSumB: targetRow.sumProdB,
            targetDispSumB: targetRow.sumDispB,
            prevMonthName: prevRow ? prevRow.month : null,
            prevSumProdB: prevRow ? prevRow.sumProdB : null,
            prevSumDispB: prevRow ? prevRow.sumDispB : null,
            Proddiff: prevRow ? targetRow.sumProdB - prevRow.sumProdB : null,
            Dispdiff: prevRow ? targetRow.sumDispB - prevRow.sumDispB : null
        });
    };

    // ग्रैंड टोटल निकालने का लॉजिक (यह चुने हुए महीने के अनुसार डायनामिक बदलेगा)
    const grandTotalProdA = comparisonReport.reduce((acc, row) => acc + row.sumProdA, 0);
    const grandTotalProdB = comparisonReport.reduce((acc, row) => acc + row.sumProdB, 0);
    const grandTotalProdDiff = grandTotalProdB - grandTotalProdA;
    const grandTotalProdPercent = grandTotalProdA !== 0
        ? (grandTotalProdDiff / grandTotalProdA) * 100
        : (grandTotalProdB !== 0 ? 100 : 0);
    const grandTotalDispA = comparisonReport.reduce((acc, row) => acc + row.sumDispA, 0);
    const grandTotalDispB = comparisonReport.reduce((acc, row) => acc + row.sumDispB, 0);
    const grandTotalDispDiff = grandTotalDispB - grandTotalDispA;
    const grandTotalDispPercent = grandTotalDispA !== 0
        ? (grandTotalDispDiff / grandTotalDispA) * 100
        : (grandTotalDispB !== 0 ? 100 : 0);
    return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
            {/* मुख्य हेडर */}
            <div className="bg-white p-4 text-center rounded border border-slate-200 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 tracking-wide">उत्‍पादन व प्रेषण की तुलनात्‍मक जानकारी</h1>
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

            {/* =====================================================
                Common Filter + Single Compare Button
            ====================================================== */}

            <div className="max-w-6xl mx-auto mt-5">

                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Month Selection */}
                        <div className="w-full sm:w-auto">

                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                किस माह तक की रिपोर्ट देखनी है?
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="
                                    bg-slate-100
                                    border border-slate-300
                                    rounded
                                    p-2
                                    text-xs
                                    font-bold
                                    focus:outline-none
                                    w-full
                                    sm:w-64
                                    text-slate-700
                                "
                            >
                                {financialMonths.map((month, index) => (
                                    <option
                                        key={index}
                                        value={month.num}
                                    >
                                        📅 {month.name} तक
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Single Compare Button */}
                        <button
                            onClick={handleCompare}
                            className="
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                font-bold
                                text-xs
                                px-8
                                py-2.5
                                rounded
                                shadow
                                w-full
                                sm:w-auto
                                transition-all
                            "
                        >
                            📊 तुलना करें ➔
                        </button>

                    </div>

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

            {/* =========================================================================
            मुख्य तुलनात्मक रिपोर्ट तालिका (100% कम्प्लीट और फिक्स कोड)
           ========================================================================= */}
            {comparisonReport.length > 0 && (
                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">

                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-right font-semibold">
                            <thead className="bg-slate-100 text-slate-700 font-bold text-center">
                                <tr>
                                    <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900 ">माह </th>
                                    <th className="px-3 py-3 border-r border-slate-200 bg-blue-50 text-blue-900">फ़ाइल A </th>
                                    <th className="px-3 py-3 border-r border-slate-200 bg-purple-50 text-purple-900">फ़ाइल B </th>
                                    <th className="px-3 py-3 bg-green-50 border-r border-slate-200 text-slate-900">अंतर (Difference) </th>
                                    <th className="px-3 py-3 bg-yellow-50 text-slate-900">प्रतिशत (%)</th>
                                    <th className="px-3 py-3 border-r border-slate-200 bg-blue-50 text-blue-900">फ़ाइल A </th>
                                    <th className="px-3 py-3 border-r border-slate-200 bg-purple-50 text-purple-900">फ़ाइल B </th>
                                    <th className="px-3 py-3 bg-green-50 border-r border-slate-200 text-slate-900">अंतर (Difference) </th>
                                    <th className="px-3 py-3 bg-yellow-50 text-slate-900">प्रतिशत (%)</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700">
                                {/* यहाँ filter फ़ंक्शन केवल चुने हुए महीने को ही पास होने देगा */}
                                {comparisonReport.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-[#0f4c6c]">{row.month}</td>
                                        <td className="px-3 py-3 border-r border-slate-100 bg-blue-50 bg-opacity-10">{row.sumProdA.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-3 border-r border-slate-200 bg-purple-50 bg-opacity-10">{row.sumProdB.toLocaleString('en-IN')}</td>
                                        <td className={`px-3 py-3 border-r border-slate-200 font-extrabold bg-green-50 bg-opacity-20 ${row.sumProdDiff > 0 ? 'text-green-600' : row.sumProdDiff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {row.sumProdDiff > 0 ? `+${row.sumProdDiff.toLocaleString('en-IN')}` : row.sumProdDiff.toLocaleString('en-IN')}
                                        </td>
                                        <td className={`px-3 py-3 font-extrabold bg-yellow-50 bg-opacity-20 ${row.sumProdPercent > 0 ? 'text-green-600' : row.sumProdPercent < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {row.sumProdPercent > 0 ? `+${row.sumProdPercent.toFixed(2)}%` : `${row.sumProdPercent.toFixed(2)}%`}
                                        </td>
                                        <td className="px-3 py-3 border-r border-slate-100 bg-blue-50 bg-opacity-10">{row.sumDispA.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-3 border-r border-slate-200 bg-purple-50 bg-opacity-10">{row.sumDispB.toLocaleString('en-IN')}</td>
                                        <td className={`px-3 py-3 border-r border-slate-200 font-extrabold bg-green-50 bg-opacity-20 ${row.sumDispDiff > 0 ? 'text-green-600' : row.sumDispDiff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {row.sumDispDiff > 0 ? `+${row.sumDispDiff.toLocaleString('en-IN')}` : row.sumDispDiff.toLocaleString('en-IN')}
                                        </td>
                                        <td className={`px-3 py-3 font-extrabold bg-yellow-50 bg-opacity-20 ${row.sumDispPercent > 0 ? 'text-green-600' : row.sumDispPercent < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {row.sumDispPercent > 0 ? `+${row.sumDispPercent.toFixed(2)}%` : `${row.sumDispPercent.toFixed(2)}%`}
                                        </td>
                                    </tr>
                                ))}

                                {/* संचयी ग्रैंड टोटल रो (Grand Total Row) */}
                                <tr className="bg-slate-800 text-white font-extrabold text-sm border-t-2 border-slate-900">
                                    <td className="px-4 py-3 border-r border-slate-700 text-left uppercase tracking-wider">

                                        योग
                                    </td>
                                    <td className="px-3 py-3 border-r border-slate-700">
                                        {grandTotalProdA.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-3 py-3 border-r border-slate-700">
                                        {grandTotalProdB.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-3 py-3 border-r border-slate-700 ${grandTotalProdDiff > 0 ? 'text-green-400' : grandTotalProdDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                        {grandTotalProdDiff > 0 ? `+${grandTotalProdDiff.toLocaleString('en-IN')}` : grandTotalProdDiff.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-3 py-3 ${grandTotalProdPercent > 0 ? 'text-green-400' : grandTotalProdPercent < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                        {grandTotalProdPercent > 0 ? `+${grandTotalProdPercent.toFixed(2)}%` : `${grandTotalProdPercent.toFixed(2)}%`}
                                    </td>
                                    <td className="px-3 py-3 border-r border-slate-700">
                                        {grandTotalDispA.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-3 py-3 border-r border-slate-700">
                                        {grandTotalDispB.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-3 py-3 border-r border-slate-700 ${grandTotalDispDiff > 0 ? 'text-green-400' : grandTotalDispDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                        {grandTotalDispDiff > 0 ? `+${grandTotalDispDiff.toLocaleString('en-IN')}` : grandTotalDispDiff.toLocaleString('en-IN')}
                                    </td>
                                    <td className={`px-3 py-3 ${grandTotalDispPercent > 0 ? 'text-green-400' : grandTotalDispPercent < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                        {grandTotalDispPercent > 0 ? `+${grandTotalDispPercent.toFixed(2)}%` : `${grandTotalDispPercent.toFixed(2)}%`}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =========================================================================
            File B: टारगेट माह बनाम पिछला माह — तुलना
           ========================================================================= */}
            {monthOverMonthB && (
                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">

                    <h2 className="text-sm font-bold text-slate-800 text-center">
                        {fileBName || 'फ़ाइल B'} — {monthOverMonthB.targetMonthName}
                        {monthOverMonthB.prevMonthName ? ` बनाम ${monthOverMonthB.prevMonthName}` : ''}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 text-center">

                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                            <p className="text-xs text-slate-600 font-bold">{monthOverMonthB.targetMonthName} का योग</p>
                            <p className="text-lg font-extrabold text-purple-900 mt-1">
                                {monthOverMonthB.targetProdSumB.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="bg-slate-100 border border-slate-200 p-3 rounded">
                            <p className="text-xs text-slate-600 font-bold">
                                {monthOverMonthB.prevMonthName ? `${monthOverMonthB.prevMonthName} का योग` : 'पिछला माह उपलब्ध नहीं'}
                            </p>
                            <p className="text-lg font-extrabold text-slate-700 mt-1">
                                {monthOverMonthB.prevSumProdB !== null ? monthOverMonthB.prevSumProdB.toLocaleString('en-IN') : '—'}
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                            <p className="text-xs text-slate-600 font-bold">अंतर (Difference)</p>
                            <p className={`text-lg font-extrabold mt-1 ${monthOverMonthB.Proddiff === null
                                ? 'text-slate-400'
                                : monthOverMonthB.Proddiff > 0
                                    ? 'text-green-600'
                                    : monthOverMonthB.Proddiff < 0
                                        ? 'text-red-500'
                                        : 'text-slate-500'
                                }`}>
                                {monthOverMonthB.Proddiff === null
                                    ? '—'
                                    : monthOverMonthB.Proddiff > 0
                                        ? `+${monthOverMonthB.Proddiff.toLocaleString('en-IN')}`
                                        : monthOverMonthB.Proddiff.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                            <p className="text-xs text-slate-600 font-bold">{monthOverMonthB.targetMonthName} का योग</p>
                            <p className="text-lg font-extrabold text-purple-900 mt-1">
                                {monthOverMonthB.targetDispSumB.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="bg-slate-100 border border-slate-200 p-3 rounded">
                            <p className="text-xs text-slate-600 font-bold">
                                {monthOverMonthB.prevMonthName ? `${monthOverMonthB.prevMonthName} का योग` : 'पिछला माह उपलब्ध नहीं'}
                            </p>
                            <p className="text-lg font-extrabold text-slate-700 mt-1">
                                {monthOverMonthB.prevSumDispB !== null ? monthOverMonthB.prevSumDispB.toLocaleString('en-IN') : '—'}
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                            <p className="text-xs text-slate-600 font-bold">अंतर (Difference)</p>
                            <p className={`text-lg font-extrabold mt-1 ${monthOverMonthB.Dispdiff === null
                                ? 'text-slate-400'
                                : monthOverMonthB.Dispdiff > 0
                                    ? 'text-green-600'
                                    : monthOverMonthB.Dispdiff < 0
                                        ? 'text-red-500'
                                        : 'text-slate-500'
                                }`}>
                                {monthOverMonthB.Dispdiff === null
                                    ? '—'
                                    : monthOverMonthB.Dispdiff > 0
                                        ? `+${monthOverMonthB.Dispdiff.toLocaleString('en-IN')}`
                                        : monthOverMonthB.Dispdiff.toLocaleString('en-IN')}
                            </p>
                        </div>

                    </div>

                    {!monthOverMonthB.prevMonthName && (
                        <p className="text-[11px] text-slate-400 text-center">
                            यह वित्तीय वर्ष का पहला माह है, इसलिए पिछले माह से तुलना संभव नहीं है।
                        </p>
                    )}

                </div>
            )}

        </div>
    );
}
