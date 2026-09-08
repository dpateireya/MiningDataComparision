import { useRef, useState } from "react";
import ComparisionRoyaltyScreen from "./ComparisonRoyaltyScreen";
import ComparisionEtpScreen from "./ComparisionEtpScreen";

export default function MainComparisionScreen() {

    const royaltyRef = useRef(null);
    const etpRef = useRef(null);

    // =========================================================
    // Common Month Selection
    // =========================================================
    const [selectedMonth, setSelectedMonth] = useState("3");

    // Financial Year: April → March
    const financialMonths = [
        { name: "April", value: "4" },
        { name: "May", value: "5" },
        { name: "June", value: "6" },
        { name: "July", value: "7" },
        { name: "August", value: "8" },
        { name: "September", value: "9" },
        { name: "October", value: "10" },
        { name: "November", value: "11" },
        { name: "December", value: "12" },
        { name: "January", value: "1" },
        { name: "February", value: "2" },
        { name: "March", value: "3" }
    ];

    // =========================================================
    // Single Comparison Button
    // =========================================================
    const handleCompareAll = () => {

        // Royalty Comparison
        royaltyRef.current?.compare();

        // ETP Comparison
        etpRef.current?.compare();
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">

            {/* =====================================================
                Header
            ====================================================== */}
            <div className="bg-white p-4 text-center border border-slate-200 shadow-sm">

                <h1 className="text-xl font-bold text-slate-900 tracking-wide">
                    📊 Mining Data Comparative Dashboard
                </h1>

                <p className="text-xs text-slate-500 mt-1">
                    निर्धारित माइनिंग पैरामीटर्स का कुल मूल्य और तुलनात्मक विवरण
                </p>

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
                                {financialMonths.map((month) => (
                                    <option
                                        key={month.value}
                                        value={month.value}
                                    >
                                        📅 {month.name} तक
                                    </option>
                                ))}
                            </select>

                        </div>


                        {/* Single Compare Button */}
                        <button
                            onClick={handleCompareAll}
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


            {/* =====================================================
                Comparison Components
            ====================================================== */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 mt-6">

                <ComparisionRoyaltyScreen
                    ref={royaltyRef}
                    selectedMonth={selectedMonth}
                />
                <ComparisionEtpScreen
                    ref={etpRef}
                    selectedMonth={selectedMonth}
                />


            </div>

        </div>
    );
}