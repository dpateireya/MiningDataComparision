import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ComparisionRoyaltyScreen() {


  const [fileAData, setFileAData] = useState([]);
  const [fileBData, setFileBData] = useState([]);
  const [fileAName, setFileAName] = useState('');
  const [fileBName, setFileBName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('4');

  // फिल्टर्स और परिणाम स्टेट्स
  // const [selectedMonth, setSelectedMonth] = useState('All');
  const [comparisonReport, setComparisonReport] = useState([]);
  const [totalRowCountA, setTotalRowCountA] = useState(0);
  const [totalRowCountB, setTotalRowCountB] = useState(0);

  // File B के टारगेट माह और उससे एक माह पहले वाले माह की तुलना
  const [monthOverMonthB, setMonthOverMonthB] = useState(null);

  // वित्तीय वर्ष के क्रमानुसार महीनों की मास्टर लिस्ट
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

  // एक्सेल डेटा लोड और कॉलम हेडर को साफ़ (Trim) करने का फ़ंक्शन
  const processExcel = (e, setRows, setFileName, setTotalCount) => {
    const file = e.target.files;
    if (!file || file.length === 0) return;
    setFileName(file[0].name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // कॉलम नामों के आगे-पीछे से अदृश्य स्पेस (Spaces) साफ़ करें
      const cleanedJson = json.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
          newRow[String(key).trim()] = row[key];
        });
        return newRow;
      });

      setRows(cleanedJson);
      setTotalCount(cleanedJson.length - 1); // आख़िरी row (Total/Grand Total) को गणना से बाहर रखें  
    };
    reader.readAsBinaryString(file[0]);
  };

  // 'Booking Date' कॉलम में से महीना नंबर निकालने का स्मार्ट फ़ंक्शन
  // (.xls फ़ाइलों में Date कभी-कभी JS Date object, कभी Excel serial number,
  //  और कभी "DD-MM-YYYY HH:MM:SS" जैसी स्ट्रिंग बनकर आती है — तीनों को हैंडल किया गया है)
  const getMonthFromDate = (dateVal) => {
    if (!dateVal) return null;

    // सहायक फ़ंक्शन: हमारा डाटा असल में DD/MM (भारतीय) फॉर्मेट में है।
    // जब तारीख "अस्पष्ट" होती है (दिन और महीना दोनों ही 12 या उससे कम,
    // जैसे 12/03/2025), तो .xls/.xlsx अक्सर इसे गलती से MM/DD मानकर
    // सीरियल नंबर बना देता है — जिससे decode करने पर दिन और महीना
    // आपस में बदल (swap) जाते हैं (12 मार्च की जगह 3 दिसंबर बन जाता है)।
    // ऐसे में decoded "day" वाली value में असली महीना छुपा होता है,
    // इसलिए day <= 12 होने पर month और day को वापस स्वैप करते हैं।
    // (day > 12 वाली तारीखें अस्पष्ट नहीं होतीं, इसलिए वहाँ स्वैप की ज़रूरत नहीं)
    const resolveMonth = (m, d) => (d !== undefined && d <= 12 ? d : m);

    // 1. अगर यह पहले से ही एक असली JavaScript Date ऑब्जेक्ट है
    //    (.xls फ़ाइलों में अक्सर ऐसा होता है) — इसे सीधे पढ़ें,
    //    Number() में बदलकर Excel serial code नहीं मानें, वरना
    //    millisecond timestamp (जैसे 1743434972000) गलत महीना दे देगा।
    if (Object.prototype.toString.call(dateVal) === '[object Date]' && !isNaN(dateVal.getTime())) {
      return String(resolveMonth(dateVal.getMonth() + 1, dateVal.getDate()));
    }

    // 2. अगर यह असली Excel Serial Date नंबर है
    //    (Excel serial dates सामान्यतः ~25000 से ~60000 के बीच होते हैं;
    //    इस रेंज की ऊपरी सीमा लगाकर हम इसे millisecond timestamp से अलग करते हैं)
    const numericVal = Number(dateVal);
    if (!isNaN(numericVal) && numericVal > 20000 && numericVal < 90000) {
      const parsedDate = XLSX.SSF.parse_date_code(numericVal);
      if (parsedDate && parsedDate.m) {
        return String(resolveMonth(parsedDate.m, parsedDate.d));
      }
    }

    // 3. स्ट्रिंग डेट फॉर्मेट ("DD-MM-YYYY HH:MM:SS" या "YYYY-MM-DD HH:MM:SS")
    //    पहले समय (time) वाला हिस्सा हटाएं ताकि कोलन (:) गड़बड़ न करे,
    //    फिर सिर्फ तारीख वाले भाग को - / . से तोड़ें
    const strDate = String(dateVal).trim();
    const datePart = strDate.split(' ')[0];
    const parts = datePart.split(/[-/.]/);

    if (parts.length >= 3) {
      // YYYY-MM-DD फॉर्मेट (पहला भाग 4 अंकों का है)
      if (parts[0].length === 4) {
        return String(Number(parts[1]));
      }
      // DD-MM-YYYY फॉर्मेट
      return String(Number(parts[1]));
    }

    return null;
  };

  // मुख्य तुलनात्मक कैलकुलेशन लॉजिक
  const handleCompare = () => {
    if (fileAData.length === 0 || fileBData.length === 0) {
      alert("कृपया तुलना करने के लिए दोनों एक्सेल फ़ाइलें अपलोड करें!");
      return;
    }

    // एक्सेल शीट की आख़िरी row (Total/Grand Total row) को गणना से बाहर रखें
    // — यह एक ही बार निकाला जाता है, हर महीने के loop में दोबारा नहीं
    const dataA = fileAData.slice(0, -1);
    const dataB = fileBData.slice(0, -1);

    // चुने हुए लक्ष्य माह तक का इंडेक्स निर्धारित करें
    const targetIndex = selectedMonth === 'All'
      ? financialMonths.length - 1
      : financialMonths.findIndex(m => m.num === selectedMonth);

    // अप्रैल से लेकर टारगेट माह तक के एक्टिव महीनों की सूची
    const activeMonths = financialMonths.slice(0, targetIndex + 1);

    // प्रत्येक एक्टिव महीने के लिए अलग-अलग रॉयल्टी जोड़ की गणना
    const report = activeMonths.map(mItem => {
      let sumA = 0;
      let sumB = 0;

      // फ़ाइल A से रॉयल्टी कैलकुलेशन (केवल चालू महीने के लिए)
      dataA.forEach(row => {
        const rowMonth = getMonthFromDate(row["Booking Date"]);
        if (rowMonth === mItem.num) {
          const val = row["Royalty"];
          const cleanNum = Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
          if (!isNaN(cleanNum)) sumA += cleanNum;
        }
      });

      // फ़ाइल B से रॉयल्टी कैलकुलेशन (केवल चालू महीने के लिए)
      dataB.forEach(row => {
        const rowMonth = getMonthFromDate(row["Booking Date"]);
        if (rowMonth === mItem.num) {
          const val = row["Royalty"];
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
        monthName: mItem.name,
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
      targetMonthName: targetRow.monthName,
      targetSumB: targetRow.sumB,
      prevMonthName: prevRow ? prevRow.monthName : null,
      prevSumB: prevRow ? prevRow.sumB : null,
      diff: prevRow ? targetRow.sumB - prevRow.sumB : null
    });
  };

  // संचयी ग्रैंड टोटल (Cumulative Grand Total)
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
        <h1 className="text-xl font-bold text-slate-900 tracking-wide">प्राप्‍त राजस्‍व की तुलनात्‍मक जानकारी</h1>
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

      {/* कुल रिकॉर्ड काउंट */}
      {(totalRowCountA > 0 || totalRowCountB > 0) && (
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm text-center">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-xs text-slate-600 font-bold">{fileAName} कुल रिकॉर्ड</p>
            <p className="text-xl font-extrabold text-blue-900 mt-1">{totalRowCountA.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-3 rounded">
            <p className="text-xs text-slate-600 font-bold">{fileBName} कुल रिकॉर्ड</p>
            <p className="text-xl font-extrabold text-purple-900 mt-1">{totalRowCountB.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

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
                className="bg-slate-100 border border-slate-300 rounded p-2 text-xs font-bold focus:outline-none w-full sm:w-64 text-slate-700"
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
              className=" bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-8 py-2.5 rounded shadow w-full sm:w-auto transition-all"
            >
              📊 तुलना करें ➔
            </button>

          </div>

        </div>

      </div>

      {/* =========================================================================
            मुख्य तुलनात्मक रिपोर्ट तालिका (100% कम्प्लीट और फिक्स कोड)
           ========================================================================= */}
      {comparisonReport.length > 0 && (
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-right font-semibold">
              <thead className="bg-slate-100 text-slate-700 font-bold text-center">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900">माह</th>
                  <th className="px-3 py-3 border-r border-slate-200 bg-blue-50 text-blue-900">{fileAName || 'File A'}</th>
                  <th className="px-3 py-3 border-r border-slate-200 bg-purple-50 text-purple-900">{fileBName || 'File B'}</th>
                  <th className="px-3 py-3 border-r border-slate-200 bg-green-50 text-slate-900 text-center">अंतर (Difference) </th>
                  <th className="px-3 py-3 bg-yellow-50 text-slate-900 text-center">प्रतिशत (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {comparisonReport.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-[#0f4c6c]">{row.monthName}</td>
                    <td className="px-3 py-3 border-r border-slate-100 bg-blue-50 bg-opacity-10">{row.sumA.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-3 border-r border-slate-200 bg-purple-50 bg-opacity-10">{row.sumB.toLocaleString('en-IN')}</td>
                    <td className={`px-3 py-3 border-r border-slate-200 font-extrabold text-center bg-green-50 bg-opacity-20 ${row.sumDiff > 0 ? 'text-green-600' : row.sumDiff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                      {row.sumDiff > 0 ? `+${row.sumDiff.toLocaleString('en-IN')}` : row.sumDiff.toLocaleString('en-IN')}
                    </td>
                    <td className={`px-3 py-3 font-extrabold text-center bg-yellow-50 bg-opacity-20 ${row.sumPercent > 0 ? 'text-green-600' : row.sumPercent < 0 ? 'text-red-500' : 'text-slate-500'}`}>
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
                  <td className={`px-3 py-3 border-r border-slate-700 text-center ${grandTotalDiff > 0 ? 'text-green-400' : grandTotalDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {grandTotalDiff > 0 ? `+${grandTotalDiff.toLocaleString('en-IN')}` : grandTotalDiff.toLocaleString('en-IN')}
                  </td>
                  <td className={`px-3 py-3 text-center ${grandTotalPercent > 0 ? 'text-green-400' : grandTotalPercent < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {grandTotalPercent > 0 ? `+${grandTotalPercent.toFixed(2)}%` : `${grandTotalPercent.toFixed(2)}%`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
            File B: टारगेट माह बनाम पिछला माह — रॉयल्टी तुलना
           ========================================================================= */}
      {monthOverMonthB && (
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">

          <h2 className="text-sm font-bold text-slate-800 text-center">
            {fileBName || 'File B'} — {monthOverMonthB.targetMonthName}
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
}

