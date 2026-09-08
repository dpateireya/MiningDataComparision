import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ReadFiler() {
  const [excelData, setExcelData] = useState([]);
  const [columnStats, setColumnStats] = useState([]);
  const [fileName, setFileName] = useState('');

  // फाइल अपलोड और डेटा प्रोसेसिंग हैंडलर
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      // पहली शीट का नाम निकालें
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // शीट को JSON ऑब्जेक्ट्स की लिस्ट में बदलें
      const data = XLSX.utils.sheet_to_json(ws);
      setExcelData(data);

      if (data.length > 0) {
        // सभी कॉलम हेडर (Keys) निकालें
        const headers = Object.keys(data[0]);
        
        // प्रत्येक कॉलम का काउंट और जोड़ (Sum) निकालें
        const stats = headers.map((header) => {
          let count = 0;
          let sum = 0;
          let isNumericColumn = false;

          data.forEach((row) => {
            const value = row[header];
            if (value !== undefined && value !== null && value !== '') {
              count++; // वैल्यू मौजूद है तो काउंट बढ़ाएं
              
              // यदि वैल्यू नंबर है तो उसे जोड़ें
              const num = Number(value);
              if (!isNaN(num)) {
                sum += num;
                isNumericColumn = true; // इस कॉलम में संख्याएं हैं
              }
            }
          });

          return {
            header,
            count,
            // अगर कॉलम में सिर्फ टेक्स्ट था तो जोड़ की जगह '-' दिखाएं
            sum: isNumericColumn ? sum.toLocaleString('en-IN') : '-', 
          };
        });

        setColumnStats(stats);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* पेज हेडर */}
        <div className="bg-white p-4 text-center rounded border border-slate-200 shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">Excel Data Analyzer</h1>
          <p className="text-xs text-slate-500 mt-1">अपनी एक्सेल फ़ाइल अपलोड करें और कॉलम के अनुसार विश्लेषण (Analysis) देखें</p>
        </div>

        {/* फाइल अपलोडर बॉक्स */}
        <div className="bg-[#d2ecf9] p-6 rounded border border-[#b2ddf3] flex flex-col items-center justify-center border-dashed border-2 bg-opacity-60">
          <label className="flex flex-col items-center justify-center cursor-pointer bg-white border border-[#b2ddf3] px-6 py-4 rounded shadow-sm hover:bg-slate-50 transition-all">
            <span className="text-2xl mb-1">📁</span>
            <span className="font-bold text-sm text-[#0f4c6c]">Excel फ़ाइल चुनें (.xlsx / .xls)</span>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
          {fileName && (
            <p className="mt-3 text-xs font-semibold text-[#0f4c6c]">
              अपलोड की गई फ़ाइल: <span className="underline">{fileName}</span>
            </p>
          )}
        </div>

        {/* रिजल्ट टेबल (अगर डेटा लोड हो गया हो) */}
        {columnStats.length > 0 && (
          <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base">📊 कॉलम एनालिसिस रिपोर्ट</h2>
            
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3 font-medium">कॉलम हेडर (Column Header)</th>
                    <th className="px-4 py-3 font-medium text-center">कुल काउंट (Total Count)</th>
                    <th className="px-4 py-3 font-medium text-right">कुल जोड़ (Total Sum)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {columnStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#0f4c6c]">{stat.header}</td>
                      <td className="px-4 py-3 text-center bg-orange-50 bg-opacity-40 font-bold border-x border-slate-100">{stat.count}</td>
                      <td className="px-4 py-3 text-right bg-green-50 bg-opacity-40 font-bold text-green-700">{stat.sum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-[11px] text-slate-400">
              * नोट: 'कुल जोड़' केवल उन्हीं कॉलम का निकाला गया है जिनमें नंबर्स (संख्याएं) मौजूद थीं। टेक्स्ट वाले कॉलम के लिए '-' दिखाया गया है।
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
