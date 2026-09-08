import React, {
    forwardRef,
    useImperativeHandle,
    useState
} from "react";

import * as XLSX from "xlsx";
export default forwardRef(function ComparisionEtpScreen(
    { selectedMonth },
    ref
) {


    const [fileAData, setFileAData] = useState([]);
    const [fileBData, setFileBData] = useState([]);

    const [fileAName, setFileAName] = useState("");
    const [fileBName, setFileBName] = useState("");

    // =========================================================
    // Comparison Result States
    // =========================================================
    const [comparisonReport, setComparisonReport] = useState([]);

    const [totalRowCountA, setTotalRowCountA] = useState(0);
    const [totalRowCountB, setTotalRowCountB] = useState(0);


    // =========================================================
    // Financial Year Months
    // Main Screen के selectedMonth value से Mapping
    // =========================================================
    const financialMonths = [
        { name: "April", value: "4" },
        { name: "May", value: "5" },
        { name: "June", value: "6" },
        { name: "July", value: "7" },
        { name: "Aug", value: "8" },
        { name: "Sept", value: "9" },
        { name: "Oct", value: "10" },
        { name: "Nov", value: "11" },
        { name: "Dec", value: "12" },
        { name: "Jan", value: "1" },
        { name: "Feb", value: "2" },
        { name: "March", value: "3" }
    ];


    // =========================================================
    // Excel File Processing
    // =========================================================
    const processExcel = (
        e,
        setRows,
        setFileName,
        setTotalCount
    ) => {

        const file = e.target.files[0];

        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();

        reader.onload = (evt) => {

            const bstr = evt.target.result;

            const wb = XLSX.read(bstr, {
                type: "binary"
            });

            const ws =
                wb.Sheets[wb.SheetNames[0]];

            const json =
                XLSX.utils.sheet_to_json(
                    ws,
                    {
                        defval: ""
                    }
                );

            setRows(json);

            setTotalCount(json.length - 1);
        };

        reader.readAsBinaryString(file);
    };


    // =========================================================
    // ETP Comparison
    // =========================================================
    const handleCompare = () => {

        // दोनों files check
        if (
            fileAData.length === 0 ||
            fileBData.length === 0
        ) {

            alert(
                "ETP तुलना करने के लिए दोनों एक्सेल फ़ाइलें अपलोड करें!"
            );

            return;
        }


        // Main से आया Month
        const targetIndex =
            financialMonths.findIndex(
                month =>
                    String(month.value) ===
                    String(selectedMonth)
            );


        if (targetIndex === -1) {

            alert("कृपया वैध माह चुनें!");

            return;
        }


        console.log(
            "ETP Selected Month:",
            selectedMonth
        );

        console.log(
            "ETP Target Index:",
            targetIndex
        );


        // April से Selected Month तक
        const activeMonths =
            financialMonths.slice(
                0,
                targetIndex + 1
            );


        console.log(
            "ETP Active Months:",
            activeMonths.map(
                month => month.name
            )
        );


        // =====================================================
        // Monthly ETP Calculation
        // =====================================================
        const report =
            activeMonths.map(monthItem => {

                const month =
                    monthItem.name;

                let sumA = 0;
                let sumB = 0;

                const dataA = fileAData.slice(0, -1);
                const dataB = fileBData.slice(0, -1);
                // File A
                dataA.forEach(row => {

                    const val =
                        row[month];

                    if (
                        val !== undefined &&
                        val !== null &&
                        val !== ""
                    ) {

                        const cleanNum =
                            Number(
                                String(val)
                                    .replace(/,/g, "")
                                    .replace(/Rs\.?/gi, "")
                                    .trim()
                            );

                        if (!isNaN(cleanNum)) {
                            sumA += cleanNum;
                        }
                    }

                });


                // File B
                dataB.forEach(row => {

                    const val =
                        row[month];

                    if (
                        val !== undefined &&
                        val !== null &&
                        val !== ""
                    ) {

                        const cleanNum =
                            Number(
                                String(val)
                                    .replace(/,/g, "")
                                    .replace(/Rs\.?/gi, "")
                                    .trim()
                            );

                        if (!isNaN(cleanNum)) {
                            sumB += cleanNum;
                        }
                    }

                });


                return {
                    month,
                    sumA,
                    sumB,
                    sumDiff: sumB - sumA
                };

            });


        setComparisonReport(report);
    };


    // =========================================================
    // Main Screen को handleCompare उपलब्ध कराना
    // =========================================================
    useImperativeHandle(ref, () => ({
        compare: handleCompare
    }));


    // =========================================================
    // Grand Total
    // =========================================================
    const grandTotalA =
        comparisonReport.reduce(
            (acc, row) =>
                acc + row.sumA,
            0
        );

    const grandTotalB =
        comparisonReport.reduce(
            (acc, row) =>
                acc + row.sumB,
            0
        );

    const grandTotalDiff =
        grandTotalB - grandTotalA;


    return (
        <div className="w-full md:w-1/2 mx-auto space-y-6">

            {/* =================================================
                    Header
                ================================================= */}
            <div className="bg-white p-4 text-center rounded border border-slate-200 shadow-sm">

                <h1 className="text-xl font-bold text-slate-900 tracking-wide">
                    जारी ई-टीपी की तुलनात्‍मक जानकारी
                </h1>

            </div>


            {/* =================================================
                    File Upload
                ================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* File A */}
                <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3] flex flex-col items-center justify-center border-dashed border-2">

                    <label className="cursor-pointer bg-white border border-[#b2ddf3] px-4 py-2 rounded text-center shadow-sm hover:bg-slate-50 block w-full max-w-xs">

                        <span className="font-bold text-xs text-[#0f4c6c]">
                            📁 फ़ाइल A अपलोड करें
                        </span>

                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={(e) =>
                                processExcel(
                                    e,
                                    setFileAData,
                                    setFileAName,
                                    setTotalRowCountA
                                )
                            }
                        />

                    </label>

                    {fileAName && (
                        <p className="mt-2 text-xs font-semibold text-slate-600 truncate max-w-xs">
                            {fileAName}
                        </p>
                    )}

                </div>


                {/* File B */}
                <div className="bg-[#ebd6f1] p-4 rounded border border-[#dcbbe6] flex flex-col items-center justify-center border-dashed border-2">

                    <label className="cursor-pointer bg-white border border-[#dcbbe6] px-4 py-2 rounded text-center shadow-sm hover:bg-slate-50 block w-full max-w-xs">

                        <span className="font-bold text-xs text-purple-800">
                            📁 फ़ाइल B अपलोड करें
                        </span>

                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={(e) =>
                                processExcel(
                                    e,
                                    setFileBData,
                                    setFileBName,
                                    setTotalRowCountB
                                )
                            }
                        />

                    </label>

                    {fileBName && (
                        <p className="mt-2 text-xs font-semibold text-slate-600 truncate max-w-xs">
                            {fileBName}
                        </p>
                    )}

                </div>

            </div>


            {/* =================================================
                    Total Records
                ================================================= */}
            {(totalRowCountA > 0 || totalRowCountB > 0) && (

                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm text-center">

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">

                        <p className="text-xs text-slate-600 font-bold">
                            {fileAName
                                ? `${fileAName} कुल रिकॉर्ड्स`
                                : "कुल रिकॉर्ड्स"
                            }
                        </p>

                        <p className="text-xl font-extrabold text-blue-900 mt-1">
                            {totalRowCountA.toLocaleString("en-IN")}
                        </p>

                    </div>


                    <div className="bg-purple-50 border border-purple-200 p-3 rounded">

                        <p className="text-xs text-slate-600 font-bold">
                            {fileBName
                                ? `${fileBName} कुल रिकॉर्ड्स`
                                : "कुल रिकॉर्ड्स"
                            }
                        </p>

                        <p className="text-xl font-extrabold text-purple-900 mt-1">
                            {totalRowCountB.toLocaleString("en-IN")}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                    Comparison Report
                ================================================= */}
            {comparisonReport.length > 0 && (

                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">

                    <div className="overflow-x-auto border border-slate-200 rounded">

                        <table className="min-w-full divide-y divide-slate-200 text-xs text-right font-semibold">

                            <thead className="bg-slate-100 text-slate-700 font-bold text-center">

                                <tr>

                                    <th className="px-4 py-3 border-r border-slate-200 text-left text-slate-900 w-1/4">
                                        माह (Month)
                                    </th>

                                    <th className="px-3 py-3 border-r border-slate-200 bg-blue-50 text-blue-900">
                                        {fileAName || "फ़ाइल A"}
                                    </th>

                                    <th className="px-3 py-3 border-r border-slate-200 bg-purple-50 text-purple-900">
                                        {fileBName || "फ़ाइल B"}
                                    </th>

                                    <th className="px-3 py-3 bg-green-50 text-slate-900">
                                        अंतर (Difference)
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-200 text-slate-700">

                                {comparisonReport.map(
                                    (row, index) => (

                                        <tr
                                            key={index}
                                            className="hover:bg-slate-50 transition-colors"
                                        >

                                            <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-[#0f4c6c]">
                                                {row.month}
                                            </td>

                                            <td className="px-3 py-3 border-r border-slate-100 bg-blue-50 bg-opacity-10">
                                                {row.sumA.toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-3 py-3 border-r border-slate-200 bg-purple-50 bg-opacity-10">
                                                {row.sumB.toLocaleString("en-IN")}
                                            </td>

                                            <td
                                                className={`
                                                        px-3 py-3
                                                        font-extrabold
                                                        bg-green-50
                                                        bg-opacity-20
                                                        ${row.sumDiff > 0
                                                        ? "text-green-600"
                                                        : row.sumDiff < 0
                                                            ? "text-red-500"
                                                            : "text-slate-500"
                                                    }
                                                    `}
                                            >
                                                {row.sumDiff > 0
                                                    ? `+${row.sumDiff.toLocaleString("en-IN")}`
                                                    : row.sumDiff.toLocaleString("en-IN")
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}


                                {/* Grand Total */}
                                <tr className="bg-slate-800 text-white font-extrabold text-sm border-t-2 border-slate-900">

                                    <td className="px-4 py-3 border-r border-slate-700 text-left uppercase tracking-wider">
                                        कुल योग
                                    </td>

                                    <td className="px-3 py-3 border-r border-slate-700">
                                        {grandTotalA.toLocaleString("en-IN")}
                                    </td>

                                    <td className="px-3 py-3 border-r border-slate-700">
                                        {grandTotalB.toLocaleString("en-IN")}
                                    </td>

                                    <td
                                        className={`
                                                px-3 py-3
                                                ${grandTotalDiff > 0
                                                ? "text-green-400"
                                                : grandTotalDiff < 0
                                                    ? "text-red-400"
                                                    : "text-slate-300"
                                            }
                                            `}
                                    >
                                        {grandTotalDiff > 0
                                            ? `+${grandTotalDiff.toLocaleString("en-IN")}`
                                            : grandTotalDiff.toLocaleString("en-IN")
                                        }
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}
);
