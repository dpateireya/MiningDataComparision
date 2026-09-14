import React, { useState } from 'react';
import { Upload, ArrowRight, CheckCircle, FileSpreadsheet, RefreshCw, Layers } from 'lucide-react';
import { parseExcelFile, compareData } from './utils/excelComparer';

export default function App() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [columns, setColumns] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]); // मल्टीपल कीज रखने के लिए
    const [results, setResults] = useState([]);
    const [isCompared, setIsCompared] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFile1Change = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile1(file);
            const data = await parseExcelFile(file);
            if (data.length > 0) {
                const cols = Object.keys(data[0]);
                setColumns(cols);

                // आपके डेटा के अनुसार डिफ़ॉल्ट रूप से इन 3 कॉलम्स को मैचिंग के लिए चुन लेते हैं
                const defaultKeys = cols.filter(c => ['Main Recc', 'MLID', 'Month'].includes(c));
                setSelectedKeys(defaultKeys.length > 0 ? defaultKeys : [cols[0]]);
            }
        }
    };

    // चेकबॉक्स से की-कॉलम चुनने या हटाने का हैंडलर
    const handleKeyToggle = (col) => {
        if (selectedKeys.includes(col)) {
            if (selectedKeys.length > 1) {
                setSelectedKeys(selectedKeys.filter(k => k !== col));
            }
        } else {
            setSelectedKeys([...selectedKeys, col]);
        }
    };

    const handleCompare = async () => {
        if (!file1 || !file2 || selectedKeys.length === 0) return;
        setLoading(true);
        try {
            const data1 = await parseExcelFile(file1);
            const data2 = await parseExcelFile(file2);
            const differences = compareData(data1, data2, selectedKeys);
            setResults(differences);
            setIsCompared(true);
        } catch (error) {
            alert("फाइल प्रोसेस करने में खराबी आई। कृपया कॉलम हेडर चेक करें।");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-teal-600 flex items-center justify-center gap-2">
                        <FileSpreadsheet className="w-8 h-8" /> Mineral Data Audit & Comparer
                    </h1>
                    <p className="text-slate-500 mt-2">माइनिंग और मिनरल रिपोर्ट्स के ओपनिंग, प्रोडक्शन और डिस्पैच डेटा की तुलना करें</p>
                </header>

                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
                        <label className="block text-sm font-semibold text-slate-600 mb-2">पुराना डेटा (File 1 / Previous Month)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors relative cursor-pointer">
                            <input type="file" accept=".xlsx, .xls" onChange={handleFile1Change} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">{file1 ? file1.name : "फ़ाइल अपलोड करें"}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
                        <label className="block text-sm font-semibold text-slate-600 mb-2">नया डेटा (File 2 / Current Month)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors relative cursor-pointer">
                            <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile2(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">{file2 ? file2.name : "फ़ाइल अपलोड करें"}</p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Key Selection */}
                {columns.length > 0 && (
                    <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-teal-500" /> मिलान के लिए मुख्य कॉलम चुनें (रो की पहचान के लिए कम से कम 2-3 कॉलम चुनें, उदा. MLID + Month):
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {columns.map((col) => (
                                <button
                                    key={col}
                                    onClick={() => handleKeyToggle(col)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedKeys.includes(col)
                                        ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {col}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleCompare}
                                disabled={!file1 || !file2 || loading}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "डेटा की तुलना करें"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Comparison Dashboard Display */}
                {isCompared && (
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="font-bold text-slate-700">ऑडिट रिपोर्ट (विसंगतियां/बदलाव)</h2>
                            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                                कुल अंतर मिले: {results.length}
                            </span>
                        </div>

                        {results.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                <p className="font-semibold text-slate-700">उत्कृष्ट! दोनों रिपोर्ट्स का संख्यात्मक डेटा 100% मैच है।</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                                            <th className="p-3">खदान / विवरण (Row Identity)</th>
                                            <th className="p-3">स्थिति</th>
                                            <th className="p-3">बदला हुआ फ़ील्ड</th>
                                            <th className="p-3 text-right">पुरानी वैल्यू (File 1)</th>
                                            <th className="p-3 text-right">नई वैल्यू (File 2)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {results.map((res, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="p-3 font-medium text-slate-700 max-w-xs truncate" title={res.identifier}>
                                                    {res.identifier}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${res.status === 'MODIFIED' ? 'bg-amber-100 text-amber-800' :
                                                        res.status === 'ADDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                        {res.status === 'MODIFIED' && 'वैल्यू बदली'}
                                                        {res.status === 'ADDED' && 'नई रो जोड़ी'}
                                                        {res.status === 'DELETED' && 'रो हटा दी'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-500 font-mono text-xs font-semibold">{res.column}</td>
                                                <td className="p-3 text-right text-rose-600 font-mono bg-rose-50/20 line-through">{res.oldValue}</td>
                                                <td className="p-3 text-right text-emerald-600 font-bold font-mono bg-emerald-50/20">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {res.status === 'MODIFIED' && <ArrowRight className="w-3 h-3 text-slate-400" />}
                                                        {res.newValue}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
