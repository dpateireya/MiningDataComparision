import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function RoyaltyComparisonScreen() {
  const [fileAData, setFileAData] = useState([]);
  const [fileBData, setFileBData] = useState([]);
  const [fileAName, setFileAName] = useState('');
  const [fileBName, setFileBName] = useState('');

  // फिल्टर्स और परिणाम स्टेट्स
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [comparisonReport, setComparisonReport] = useState([]);
  const [totalRowCountA, setTotalRowCountA] = useState(0);
  const [totalRowCountB, setTotalRowCountB] = useState(0);

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
      setTotalCount(cleanedJson.length);
    };
    reader.readAsBinaryString(file[0]);
  };

  // 'Booking Date' कॉलम में से महीना नंबर निकालने का स्मार्ट फ़ंक्शन
  const getMonthFromDate = (dateVal) => {
    if (!dateVal) return null;

    // 1. यदि एक्सेल ने तारीख को सीरियल नंबर (जैसे 45383) में बदल दिया है
    if (!isNaN(Number(dateVal)) && Number(dateVal) > 40000) {
      const parsedDate = XLSX.SSF.parse_date_code(Number(dateVal));
      return String(parsedDate.m); // महीना रिटर्न करेगा (1 से 12)
    }

    // 2. यदि तारीख स्ट्रिंग फॉर्मेट में है (जैसे DD/MM/YYYY या YYYY-MM-DD)
    const strDate = String(dateVal).trim();
    // स्लैश (/) या डैश (-) के आधार पर बांटें
    const parts = strDate.split(/[-/.]/);

    if (parts.length >= 3) {
      // यदि फॉर्मेट YYYY-MM-DD है (पहला पार्ट 4 अंकों का है)
      if (parts[0].length === 4) {
        return String(Number(parts[1]));
      }
      // यदि फॉर्मेट DD/MM/YYYY या DD-MM-YYYY है
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

    // चुने हुए लक्ष्य माह तक का इंडेक्स निर्धारित करें
    const targetIndex = selectedMonth === 'All'
      ? financialMonths.length - 1
      : financialMonths.findIndex(m => m.num === selectedMonth);

    // अप्रैल से लेकर टारगेट माह तक के एक्टिव महीनों के नंबरों की लिस्ट निकालें
    const activeMonthNums = financialMonths.slice(0, targetIndex + 1).map(m => m.num);

    // प्रत्येक एक्टिव महीने के लिए अलग-अलग रॉयल्टी जोड़ की गणना
    const report = financialMonths.slice(0, targetIndex + 1).map(mItem => {
      let sumA = 0;
      let sumB = 0;

      // फ़ाइल A से रॉयल्टी कैलकुलेशन (केवल चालू महीने के लिए)
      fileAData.forEach(row => {
        const rowMonth = getMonthFromDate(row["Booking Date"]);
        if (rowMonth === mItem.num) {
          const val = row["Royalty"];
          const cleanNum = Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
          if (!isNaN(cleanNum)) sumA += cleanNum;
        }
      });

      // फ़ाइल B से रॉयल्टी कैलकुलेशन (केवल चालू महीने के लिए)
      fileBData.forEach(row => {
        const rowMonth = getMonthFromDate(row["Booking Date"]);
        if (rowMonth === mItem.num) {
          const val = row["Royalty"];
          const cleanNum = Number(String(val).replace(/,/g, '').replace(/Rs\.?/gi, '').trim());
          if (!isNaN(cleanNum)) sumB += cleanNum;
        }
      });

      return {
        monthName: mItem.name,
        sumA,
        sumB,
        sumDiff: sumB - sumA
      };
    });

    setComparisonReport(report);
  };

  // संचयी ग्रैंड टोटल (Cumulative Grand Total)
  const grandTotalA = comparisonReport.reduce((acc, row) => acc + row.sumA, 0);
  const grandTotalB = comparisonReport.reduce((acc, row) => acc + row.sumB, 0);
  const grandTotalDiff = grandTotalB - grandTotalA;

  return (
    <div className="w-full md:w-3/4 mx-auto space-y-6 p-4 font-sans text-slate-800">

      {/* मुख्य हेडर */}
      <div className="bg-white p-4 text-center rounded border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 tracking-wide">📊 प्राप्‍त राजस्‍व की तुलनात्‍मक जानकारी (माहवार विश्लेषण)</h1>
        <p className="text-xs text-slate-500 mt-1">Booking Date से माह निकालकर रॉयल्टी राशि का संचयी जोड़</p>
      </div>

      {/* फ़ाइल अपलोड बॉक्स */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3] flex flex-col items-center justify-center border-dashed border-2">
          <label className="cursor-pointer bg-white border border-[#b2ddf3] px-4 py-2 rounded text-center shadow-sm hover:bg-slate-50 block w-full max-w-xs">
            <span className="font-bold text-xs text-[#0f4c6c]">📁 File A अपलोड करें</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => processExcel(e, setFileAData, setFileAName, setTotalRowCountA)} />
          </label>
          {fileAName && <p className="mt-2 text-xs font-semibold text-slate-600 truncate max-w-xs">{fileAName}</p>}
        </div>

        <div className="bg-[#ebd6f1] p-4 rounded border border-[#dcbbe6] flex flex-col items-center justify-center border-dashed border-2">
          <label className="cursor-pointer bg-white border border-[#dcbbe6] px-4 py-2 rounded text-center shadow-sm hover:bg-slate-50 block w-full max-w-xs">
            <span className="font-bold text-xs text-purple-800">📁 File B अपलोड करें</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => processExcel(e, setFileBData, setFileBName, setTotalRowCountB)} />
          </label>
          {fileBName && <p className="mt-2 text-xs font-semibold text-slate-600 truncate max-w-xs">{fileBName}</p>}
        </div>
      </div>

      {/* कुल रिकॉर्ड काउंट */}
      {(totalRowCountA > 0 || totalRowCountB > 0) && (
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm text-center">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-xs text-slate-600 font-bold">File A कुल रिकॉर्ड count</p>
            <p className="text-xl font-extrabold text-blue-900 mt-1">{totalRowCountA.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-3 rounded">
            <p className="text-xs text-slate-600 font-bold">File B कुल रिकॉर्ड count</p>
            <p className="text-xl font-extrabold text-purple-900 mt-1">{totalRowCountB.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* लक्ष्य अवधि फ़िल्टर बार */}
      {(fileAData.length > 0 && fileBData.length > 0) && (
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">किस लक्ष्य माह तक की रिपोर्ट देखनी है?</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-100 border border-slate-300 rounded p-2 text-xs font-bold focus:outline-none w-64 text-slate-700">
              <option value="All">संपूर्ण वित्तीय वर्ष (April to March)</option>
              <option value="4">📅 April तक (Only April)</option>
              <option value="5">📅 May तक (April से May)</option>
              <option value="6">📅 June तक (April से June)</option>
              <option value="7">📅 July तक (April से July)</option>
              <option value="8">📅 August तक (April से August)</option>
              <option value="9">📅 September तक (April से Sept)</option>
              <option value="10">📅 October तक (April से Oct)</option>
              <option value="11">📅 November तक (April से Nov)</option>
              <option value="12">📅 December तक (April से Dec)</option>
              <option value="1">📅 January तक (April से Jan)</option>
              <option value="2">📅 February तक (April से Feb)</option>
              <option value="3">📅 March तक (April से March)</option>
            </select>
          </div>

          <button onClick={handleCompare} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-8 py-2.5 rounded shadow w-full sm:w-auto transition-all">
            महीनेवार गणना और तुलना करें ➔
          </button>
        </div>
      )}
      {/* =========================================================================
            मुख्य तुलनात्मक रिपोर्ट तालिका (100% कम्प्लीट और फिक्स कोड)
           ========================================================================= */}
      {comparisonReport.length > 0 && (
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-slate-900 text-sm md:text-base">📊 Royalty कॉलम की पृथक एवं संचयी तुलना रिपोर्ट</h2>

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-right font-semibold">
              <thead className="bg-slate-100 text-slate-700 font-bold text-center">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900 w-1/4">माह का नाम (Month)</th>
                  <th className="px-3 py-3 border-r border-slate-200 bg-blue-50 text-blue-900">File A रॉयल्टी जोड़</th>
                  <th className="px-3 py-3 border-r border-slate-200 bg-purple-50 text-purple-900">File B रॉयल्टी जोड़</th>
                  <th className="px-3 py-3 bg-green-50 text-slate-900 text-center">अंतर (Difference)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {comparisonReport.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-[#0f4c6c]">{row.monthName}</td>
                    <td className="px-3 py-3 border-r border-slate-100 bg-blue-50 bg-opacity-10">{row.sumA.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-3 border-r border-slate-200 bg-purple-50 bg-opacity-10">{row.sumB.toLocaleString('en-IN')}</td>
                    <td className={`px-3 py-3 font-extrabold text-center bg-green-50 bg-opacity-20 ${row.sumDiff > 0 ? 'text-green-600' : row.sumDiff < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                      {row.sumDiff > 0 ? `+${row.sumDiff.toLocaleString('en-IN')}` : row.sumDiff.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}

                {/* संचयी ग्रैंड टोटल रो (Grand Total Row) */}
                <tr className="bg-slate-800 text-white font-extrabold text-sm border-t-2 border-slate-900">
                  <td className="px-4 py-3 border-r border-slate-700 text-left uppercase tracking-wider">
                    संचयी कुल योग (Grand Total)
                  </td>
                  <td className="px-3 py-3 border-r border-slate-700">
                    {grandTotalA.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-3 border-r border-slate-700">
                    {grandTotalB.toLocaleString('en-IN')}
                  </td>
                  <td className={`px-3 py-3 text-center ${grandTotalDiff > 0 ? 'text-green-400' : grandTotalDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {grandTotalDiff > 0 ? `+${grandTotalDiff.toLocaleString('en-IN')}` : grandTotalDiff.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>

  ); a
}
