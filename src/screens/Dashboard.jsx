import React, { useState } from 'react';
import MiningRegisterScreen from './MiningRegisterScreen';
import ComparisionProductionScreen from './ComparisionProductionScreen';
import StockRegisterScreen from './StockRegisterScreen';
import ComparisionRoyaltyScreen from './ComparisionRoyaltyScreen';
import ComparisionEtpScreen from './ComparisionEtpScreen';
import QuarryRegisterScreen from './QuarryRegisterScreen';

// ----------------------------------------------------------------------
// 3. तीसरा मॉड्यूल: डैशबोर्ड ओवरव्यू / होम (Dashboard Overview)
// ----------------------------------------------------------------------
function HomeOverviewView() {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md">
                <h2 className="text-2xl font-bold tracking-tight">Mining Data Management System</h2>
                <p className="text-sm text-blue-200/80 mt-2 max-w-xl leading-relaxed">
                    खदानों के तुलनात्मक विश्लेषण और आवश्यक वेब पोर्टल्स को एक ही सेंट्रल डैशबोर्ड से एक्सेस करने के लिए बनाया गया इंटीग्रेटेड आर्किटेक्चर।
                </p>
            </div>

        </div>
    );
}

// ----------------------------------------------------------------------
// 4. मुख्य लेआउट इंजन (Main App Component)
// ----------------------------------------------------------------------
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('mining-reader');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // मेनू लिंक्स कॉन्फ़िगरेशन
    const menuItems = [
        // { id: 'home', label: '🏠 मुख्य डैशबोर्ड' },
        { id: 'mining-reader', label: '📊 मुख्‍य खनिज रीडर' },
        { id: 'quarry-reader', label: '📊 गौण खनिज रीडर' },
        { id: 'stock-reader', label: '📊 भण्‍डारण अनुज्ञप्ति रीडर' },
        { id: 'production-reader', label: '🌐 उत्‍पादन व प्रेषण जानकारी' },
        { id: 'royalty-reader', label: '🌐 राजस्‍व जानकारी' },
        { id: 'etp-reader', label: '🌐 ई-टीपी जानकारी' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans antialiased">

            {/* मोबाइल हेडर (Mobile Sticky Navbar) */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-sm">
                <span className="font-bold tracking-wide text-sm">⛏️ Mining System v4</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                    <svg xmlns="http://w3.org" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {/* मोबाइल ड्रॉपडाउन मेनू */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 space-y-1 fixed top-14 left-0 right-0 z-20 shadow-xl animate-fade-in">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* डेस्कटॉप साइडबार (Sidebar Navigation) */}
            <aside className="hidden md:flex flex-col w-58 bg-slate-900 text-white border-r border-slate-800 p-5 shrink-0 fixed h-full z-20">
                <div className="pb-6 border-b border-slate-800 mb-6 flex items-center gap-2">
                    <span className="text-xl">⛏️</span>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide leading-none text-slate-100">Mining Suite</h1>
                        <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">Get Consolidated and Comparision Data</span>
                    </div>
                </div>

                {/* मेनूबार लिंक्स लिस्ट */}
                <nav className="flex-1 space-y-1.5">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* साइडबार फुटर */}
                <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
                    वर्ज़न: 4.0.0 (Tailwind v4)
                </div>
            </aside>

            {/* मुख्य कंटेंट एरिया (Main Dynamic Content Pane) */}
            <main className="flex-1 p-1 md:ml-58 min-w-0 transition-all duration-300">
                <div className="max-w-6xl mx-auto">
                    {/* कंडीशन के आधार पर वेबपेज का बदलना */}
                    {/*activeTab === 'home' && <HomeOverviewView /> */}
                    {activeTab === 'mining-reader' && <MiningRegisterScreen />}
                    {activeTab === 'quarry-reader' && <QuarryRegisterScreen />}
                    {activeTab === 'stock-reader' && <StockRegisterScreen />}
                    {activeTab === 'production-reader' && <ComparisionProductionScreen />}
                    {activeTab === 'royalty-reader' && <ComparisionRoyaltyScreen />}
                    {activeTab === 'etp-reader' && <ComparisionEtpScreen />}
                </div>
            </main>

        </div>
    );
}
