import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fileName, setFileName] = useState('');

  // पॉपअप मॉडल में चुनी गई खदान का डेटा स्टोर करने के लिए स्टेट
  const [selectedMine, setSelectedMine] = useState(null);

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

      const parsedRows = [];

      for (let i = 0; i < sheetData.length; i++) {
        const rowCells = sheetData[i];
        if (!rowCells || rowCells.length < 5) continue;

        const cleanCells = rowCells.map(cell => cell ? String(cell).trim() : '');

        let idCode = '';
        let idIndex = -1;

        for (let j = cleanCells.length - 1; j >= 0; j--) {
          if (cleanCells[j] && /^\d+$/.test(cleanCells[j])) {
            idCode = cleanCells[j];
            idIndex = j;
            break;
          }
        }

        if (idCode && idIndex > 4) {
          const sNo = cleanCells[1] || '';
          const lesseeName = cleanCells[2] || '';
          const address = cleanCells[3] || '';

          // पूरी जन्म कुंडली के लिए आवश्यक अतिरिक्त फ़ील्ड्स
          const appDate = cleanCells[4] || 'उपलब्ध नहीं'; // आवेदन की तारीख
          const leaseOrderDetails = cleanCells[6] || 'उपलब्ध नहीं'; // लीज़ ऑर्डर नंबर और तारीख
          const situation = cleanCells.find(cell => cell.includes('Tehsil :')) || '';
          const mineral = cleanCells.find(cell => cell.includes('Marble') || cell.includes('Gitti') || cell.includes('Stone') || cell.includes('Murrum') || cell.includes('Sand')) || '';
          const remarks = cleanCells[cleanCells.length - 3] || 'कोई रिमार्क नहीं है'; // रिमार्क्स कॉलम
          const status = cleanCells[cleanCells.length - 2] || 'Unknown';

          if (lesseeName && !lesseeName.toLowerCase().includes('name of the lessee')) {
            parsedRows.push({
              id: `${idCode}-${sNo}-${i}`,
              sNo,
              lesseeName,
              address,
              appDate,
              leaseOrderDetails,
              situation,
              mineral,
              remarks,
              status,
              idCode
            });
          }
        }
      }
      setData(parsedRows);
    };
    reader.readAsBinaryString(file);
  };

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

  const stats = useMemo(() => {
    return {
      total: data.length,
      working: data.filter(d => d.status.trim() === 'Working').length,
      lapse: data.filter(d => d.status.trim() === 'Lapse').length,
      nonWorking: data.filter(d => d.status.trim() === 'Non-Working').length,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quarry Lease Register Reader</h1>
            <p className="text-sm text-slate-500 mt-1">खदान पर क्लिक करके उसकी पूरी जन्म कुंडली (पॉपअप मॉडल) देखें।</p>
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
            {/* KPI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span className="text-xs font-semibold text-slate-400 uppercase">कुल खदानें</span><p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p></div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span className="text-xs font-semibold text-green-500 uppercase">चालू (Working)</span><p className="text-3xl font-bold text-green-600 mt-1">{stats.working}</p></div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span className="text-xs font-semibold text-red-400 uppercase">निरस्त (Lapse)</span><p className="text-3xl font-bold text-red-500 mt-1">{stats.lapse}</p></div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><span className="text-xs font-semibold text-amber-500 uppercase">बंद (Non-Working)</span><p className="text-3xl font-bold text-amber-600 mt-1">{stats.nonWorking}</p></div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                placeholder="नाम, आईडी कोड, तहसील या खनिज खोजें... (जैसे: गुलाब सिंह)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <div className="flex gap-2">
                {['ALL', 'Working', 'Lapse', 'Non-Working'].map((status) => (
                  <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-1.5 rounded-lg text-xs font-medium ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{status}</button>
                ))}
              </div>
            </div>

            {/* Data Table विद रो क्लिक इवेंट */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse">

                  {/* 1. स्टिकी टेबल हेडर (Sticky Header) */}
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">क्र.</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">ID Code</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider md:w-80">पट्टाधारी का नाम व पता</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">लोकेशन (Situation)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">खनिज (Mineral)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36 text-center">स्थिति (Status)</th>
                    </tr>
                  </thead>

                  {/* 2. टेबल बॉडी (Dynamic Data Rows) */}
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredData.length > 0 ? (
                      filteredData.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedMine(row)} // रो पर क्लिक करने का इवेंट जिससे मॉडल खुलेगा
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                        >
                          {/* सीरियल नंबर */}
                          <td className="p-4 text-slate-500 text-center font-medium">
                            {row.sNo}
                          </td>

                          {/* यूनिक आईडी कोड */}
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-1 rounded-md border border-slate-200 font-bold tracking-wide group-hover:bg-slate-200 transition-colors">
                              {row.idCode}
                            </span>
                          </td>

                          {/* पट्टाधारी का नाम और उसका पता */}
                          <td className="p-4">
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {row.lesseeName}
                            </div>
                            {row.address && (
                              <div className="text-xs font-normal text-slate-400 mt-1 max-w-xs truncate" title={row.address}>
                                {row.address}
                              </div>
                            )}
                          </td>

                          {/* खदान की भौगोलिक स्थिति (तहसील, ग्राम, खसरा) */}
                          <td className="p-4 text-slate-600 max-w-sm">
                            <div className="text-xs md:text-sm leading-relaxed truncate" title={row.situation}>
                              {row.situation || <span className="text-slate-300 italic">जानकारी उपलब्ध नहीं</span>}
                            </div>
                          </td>

                          {/* निकाला जाने वाला खनिज */}
                          <td className="p-4">
                            <span className="text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs inline-block">
                              {row.mineral || "N/A"}
                            </span>
                          </td>

                          {/* खदान का वर्तमान स्टेटस */}
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border tracking-wide w-28 ${row.status.trim() === 'Working'
                              ? 'bg-green-50 text-green-700 border-green-200 shadow-xs' :
                              row.status.trim() === 'Lapse'
                                ? 'bg-red-50 text-red-700 border-red-200 shadow-xs' :
                                'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${row.status.trim() === 'Working' ? 'bg-green-500' :
                                row.status.trim() === 'Lapse' ? 'bg-red-500' : 'bg-amber-500'
                                }`}></span>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* नो डेटा स्टेट (No Records Found UI) */
                      <tr>
                        <td colSpan="6" className="p-16 text-center">
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
            </div>
            {/* ----------------- POPUP MODAL (जन्म कुंडली बॉक्स) ----------------- */}
            {selectedMine && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden transform transition-all flex flex-col max-h-[90vh]">

                  {/* 1. मॉडल हेडर (Modal Header) - डार्क थीम */}
                  <div className="bg-slate-900 text-white p-5 flex justify-between items-start sticky top-0 z-20">
                    <div>
                      <span className="text-xs uppercase bg-blue-500/20 text-blue-300 font-bold px-2.5 py-1 rounded-md tracking-wider border border-blue-500/30">
                        Id Code: {selectedMine.idCode}
                      </span>
                      <h3 className="text-lg font-bold mt-2.5 leading-snug tracking-tight">
                        {selectedMine.lesseeName}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedMine(null)}
                      className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      title="बंद करें"
                    >
                      <svg xmlns="http://w3.org" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 2. मॉडल बॉडी (Modal Body) - स्क्रॉलेबल विवरण */}
                  <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">

                    {/* पट्टाधारी का पूरा पता */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">पट्टाधारी का पूरा पता</h4>
                      <p className="text-sm font-medium text-slate-700 mt-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        {selectedMine.address || 'विवरण उपलब्ध नहीं'}
                      </p>
                    </div>

                    {/* आवेदन तिथि और वर्तमान स्थिति (Grid Layout) */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">आवेदन की तारीख</h4>
                        <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                          <svg xmlns="http://w3.org" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {selectedMine.appDate}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">वर्तमान स्थिति (Status)</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold mt-1 border ${selectedMine.status.trim() === 'Working' ? 'bg-green-100 text-green-800 border-green-200' :
                          selectedMine.status.trim() === 'Lapse' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                          {selectedMine.status}
                        </span>
                      </div>
                    </div>

                    {/* लीज़ ऑर्डर विवरण */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">लीज़ ऑर्डर विवरण (No. & Date)</h4>
                      <p className="text-sm font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1.5 font-mono text-xs leading-relaxed break-words">
                        {selectedMine.leaseOrderDetails}
                      </p>
                    </div>

                    {/* भौगोलिक स्थिति और खसरा */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">भौगोलिक स्थिति (Situation)</h4>
                      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed bg-slate-50/30 p-2.5 rounded-xl border border-slate-100">
                        {selectedMine.situation}
                      </p>
                    </div>

                    {/* खनिज प्रकार */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">खनिज (Mineral)</h4>
                      <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        {selectedMine.mineral}
                      </p>
                    </div>

                    {/* रिमार्क / विशेष टिप्पणी - हाइलाइटेड बॉक्स */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">रिमार्क / विशेष टिप्पणी</h4>
                      <div className="text-sm italic text-amber-800 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 mt-1.5 flex items-start gap-2">
                        <svg xmlns="http://w3.org" className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="leading-relaxed">{selectedMine.remarks || 'कोई रिमार्क दर्ज नहीं है।'}</p>
                      </div>
                    </div>

                  </div>

                  {/* 3. मॉडल फुटर (Modal Footer) */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end sticky bottom-0 z-20">
                    <button
                      onClick={() => setSelectedMine(null)}
                      className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      बंद करें
                    </button>
                  </div>

                </div>
              </div>
            )}
            {/* पॉपअप मॉडल एंड */}
            {/* रजिस्टर फ़ाइल लोड नहीं होने पर दिखने वाला एम्प्टी स्टेट बॉक्स */}
            {data.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 md:p-20 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm my-8">

                {/* आकर्षक एनिमेटेड आइकन कंटेनर */}
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-5 animate-pulse shadow-xs">
                  <svg
                    xmlns="http://w3.org"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                {/* मुख्य शीर्षक */}
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  रजिस्टर फ़ाइल लोड नहीं है
                </h3>

                {/* विस्तृत विवरण संदेश */}
                <p className="text-sm text-slate-500 max-w-md mt-2 mb-8 leading-relaxed">
                  डेटा विश्लेषण और सर्च शुरू करने के लिए ऊपर दिए गए बटन से अपनी असली एक्सेल
                  <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mx-1 text-xs">.xlsx</span>
                  या
                  <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mx-1 text-xs">.xls</span>
                  फ़ाइल अपलोड करें।
                </p>

                {/* अतिरिक्त सहायता टेक्स्ट (Optional Layout Separator) */}
                <div className="text-xs text-slate-400 flex items-center gap-1.5 border-t border-slate-100 pt-4 w-full justify-center">
                  <svg xmlns="http://w3.org" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>यह रीडर पूरी तरह सुरक्षित है और आपकी फाइल का डेटा कहीं बाहर नहीं भेजता है।</span>
                </div>

              </div>
            )}

          </>
        )
        }
      </div>
    </div>
  )
}