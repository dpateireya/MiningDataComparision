import React, {
    forwardRef,
    useImperativeHandle,
    useState
} from 'react';
import * as XLSX from 'xlsx';

const ComparisionProductionScreen = forwardRef(
    function ComparisionProductionScreen({ selectedMonth }, ref) {
        const [fileAData, setFileAData] = useState([]);
        const [fileBData, setFileBData] = useState([]);
        const [fileAName, setFileAName] = useState('');
        const [fileBName, setFileBName] = useState('');

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
        selectedMonth = '12'
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

                // फ़ाइल A के लिए गणना: जहाँ Month कॉलम का मान हमारे मोंथ लिस्ट से मैच करे
                dataA.forEach(row => {
                    const monthVal = row["Month"];
                    if (monthVal && String(monthVal).trim().toLowerCase() === mItem.name.toLowerCase()) {
                        const prodVal = row["Production"];
                        if (prodVal !== undefined && prodVal !== null && prodVal !== '') {
                            const cleanNum = Number(String(prodVal).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                            if (!isNaN(cleanNum)) sumA += cleanNum;
                        }
                    }
                });

                // फ़ाइल B के लिए गणना
                dataB.forEach(row => {
                    const monthVal = row["Month"];
                    if (monthVal && String(monthVal).trim().toLowerCase() === mItem.name.toLowerCase()) {
                        const prodVal = row["Production"];
                        if (prodVal !== undefined && prodVal !== null && prodVal !== '') {
                            const cleanNum = Number(String(prodVal).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
                            if (!isNaN(cleanNum)) sumB += cleanNum;
                        }
                    }
                });

                const sumDiff = sumB - sumA;
                const sumPercent = sumA !== 0 ? (sumDiff / sumA) * 100 : (sumB !== 0 ? 100 : 0);


                return {
                    month: mItem.name,
                    sumA,
                    sumB,
                    sumDiff,
                    sumPercent
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
                targetSumB: targetRow.sumB,
                prevMonthName: prevRow ? prevRow.month : null,
                prevSumB: prevRow ? prevRow.sumB : null,
                diff: prevRow ? targetRow.sumB - prevRow.sumB : null
            });
        };

        useImperativeHandle(ref, () => ({
            compare: handleCompare
        }));

        // ग्रैंड टोटल निकालने का लॉजिक (यह चुने हुए महीने के अनुसार डायनामिक बदलेगा)
        const grandTotalA = comparisonReport.reduce((acc, row) => acc + row.sumA, 0);
        const grandTotalB = comparisonReport.reduce((acc, row) => acc + row.sumB, 0);
        const grandTotalDiff = grandTotalB - grandTotalA;
        const grandTotalPercent = grandTotalA !== 0
            ? (grandTotalDiff / grandTotalA) * 100
            : (grandTotalB !== 0 ? 100 : 0);

        return (
            <div className="w-full md:w-1/2 mx-auto space-y-6">
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

                {/* ➡️  "तुलना करें" बटन */}
                <div className="flex justify-center pt-2">
                    <button
                        onClick={handleCompare}
                        className="w-full max-w-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm py-3 px-6 rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-center tracking-wider uppercase"
                    >
                        📊 तुलना करें (Compare)
                    </button>
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
                                        <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900 w-1/5">माह </th>
                                        <th className="px-3 py-3 border-r border-slate-200 bg-blue-50 text-blue-900">{fileAName || 'फ़ाइल A'} </th>
                                        <th className="px-3 py-3 border-r border-slate-200 bg-purple-50 text-purple-900">{fileBName || 'फ़ाइल B'} </th>
                                        <th className="px-3 py-3 bg-green-50 border-r border-slate-200 text-slate-900">अंतर (Difference) </th>
                                        <th className="px-3 py-3 bg-yellow-50 text-slate-900">प्रतिशत (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-700">
                                    {/* यहाँ filter फ़ंक्शन केवल चुने हुए महीने को ही पास होने देगा */}
                                    {comparisonReport.map((row, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-[#0f4c6c]">{row.month}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 bg-blue-50 bg-opacity-10">{row.sumA.toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-3 border-r border-slate-200 bg-purple-50 bg-opacity-10">{row.sumB.toLocaleString('en-IN')}</td>
                                            <td className={`px-3 py-3 border-r border-slate-200 font-extrabold bg-green-50 bg-opacity-20 ${row.sumDiff > 0 ? 'text-green-600' : row.sumDiff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                                {row.sumDiff > 0 ? `+${row.sumDiff.toLocaleString('en-IN')}` : row.sumDiff.toLocaleString('en-IN')}
                                            </td>
                                            <td className={`px-3 py-3 font-extrabold bg-yellow-50 bg-opacity-20 ${row.sumPercent > 0 ? 'text-green-600' : row.sumPercent < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                                {row.sumPercent > 0 ? `+${row.sumPercent.toFixed(2)}%` : `${row.sumPercent.toFixed(2)}%`}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* संचयी ग्रैंड टोटल रो (Grand Total Row) */}
                                    <tr className="bg-slate-800 text-white font-extrabold text-sm border-t-2 border-slate-900">
                                        <td className="px-4 py-3 border-r border-slate-700 text-left uppercase tracking-wider">

                                            योग
                                        </td>
                                        <td className="px-3 py-3 border-r border-slate-700">
                                            {grandTotalA.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-3 py-3 border-r border-slate-700">
                                            {grandTotalB.toLocaleString('en-IN')}
                                        </td>
                                        <td className={`px-3 py-3 border-r border-slate-700 ${grandTotalDiff > 0 ? 'text-green-400' : grandTotalDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                            {grandTotalDiff > 0 ? `+${grandTotalDiff.toLocaleString('en-IN')}` : grandTotalDiff.toLocaleString('en-IN')}
                                        </td>
                                        <td className={`px-3 py-3 ${grandTotalPercent > 0 ? 'text-green-400' : grandTotalPercent < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                            {grandTotalPercent > 0 ? `+${grandTotalPercent.toFixed(2)}%` : `${grandTotalPercent.toFixed(2)}%`}
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">

                            <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                                <p className="text-xs text-slate-600 font-bold">{monthOverMonthB.targetMonthName} का योग</p>
                                <p className="text-lg font-extrabold text-purple-900 mt-1">
                                    {monthOverMonthB.targetSumB.toLocaleString('en-IN')}
                                </p>
                            </div>

                            <div className="bg-slate-100 border border-slate-200 p-3 rounded">
                                <p className="text-xs text-slate-600 font-bold">
                                    {monthOverMonthB.prevMonthName ? `${monthOverMonthB.prevMonthName} का योग` : 'पिछला माह उपलब्ध नहीं'}
                                </p>
                                <p className="text-lg font-extrabold text-slate-700 mt-1">
                                    {monthOverMonthB.prevSumB !== null ? monthOverMonthB.prevSumB.toLocaleString('en-IN') : '—'}
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 p-3 rounded">
                                <p className="text-xs text-slate-600 font-bold">अंतर (Difference)</p>
                                <p className={`text-lg font-extrabold mt-1 ${monthOverMonthB.diff === null
                                    ? 'text-slate-400'
                                    : monthOverMonthB.diff > 0
                                        ? 'text-green-600'
                                        : monthOverMonthB.diff < 0
                                            ? 'text-red-500'
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

                        {!monthOverMonthB.prevMonthName && (
                            <p className="text-[11px] text-slate-400 text-center">
                                यह वित्तीय वर्ष का पहला माह है, इसलिए पिछले माह से तुलना संभव नहीं है।
                            </p>
                        )}

                    </div>
                )}

            </div>
        );
    })

export default ComparisionProductionScreen;