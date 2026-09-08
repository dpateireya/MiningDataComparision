export default function DisplayScreen() {
    return (
        <div>
            <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
                <div className="max-w-7xl mx-auto space-y-6">
             
           
                {/* मुख्य हेडर */}
                <div className="bg-white p-3 text-center rounded border border-slate-200 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900 tracking-wide">District: Katni</h1>
                </div>

                {/* =========================================================================
            सेक्शन 1: Quarry/Mining Lease, Exploration और Revenue
           ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* लेफ्ट कॉलम: लीज और एक्सप्लोरेशन (2/3 भाग) */}
                    <div className="lg:col-span-2 space-y-6">
            
                        {/* 1. Quarry Lease & Mining Lease Card */}
                        <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
                            {/* Quarry Lease */}
                            <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">Quarry Lease</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold mb-6">
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Sanctioned</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">82</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Working</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">67</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Non-working &gt; 6 Months</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">15</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">% Non-working</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-red-500">18%</div></div>
                            </div>

                            {/* Mining Lease */}
                            <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">Mining Lease</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold">
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Sanctioned</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">89</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Working</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">83</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Non-working &gt; 2 Years</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">06</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">% Non-working</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-red-500">7%</div></div>
                            </div>
                        </div>

                        {/* 2. Exploration Card */}
                        <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
                            <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">Exploration</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-semibold">
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Ongoing Exploration</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">12</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">GSI</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">01</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">MECL</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">01</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">DGM</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">00</div></div>
                                <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Other Agencies</div><div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">10</div></div>
                            </div>
                        </div>

                    </div>

                    {/* राइट कॉलम: Revenue Card (1/3 भाग) */}
                    <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3] flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-[#0f4c6c] mb-4 text-base">Revenue</h3>
                            <div className="space-y-2 text-xs md:text-sm font-semibold">
                                <div className="flex justify-between items-center bg-[#e2f0d9] border border-[#c5e0b4] px-3 py-2 rounded">
                                    <span className="text-slate-700">Revenue FY 2025-26</span>
                                    <span className="font-bold text-slate-800">Rs. 158.33 Cr.</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#e2f0d9] border border-[#c5e0b4] px-3 py-2 rounded">
                                    <span className="text-slate-700">Revenue Target FY 2026-27</span>
                                    <span className="font-bold text-slate-800">Rs. 231.00 Cr.</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#e2f0d9] border border-[#c5e0b4] px-3 py-2 rounded">
                                    <span className="text-slate-700">Revenue Target FY 2026-27 (till July)</span>
                                    <span className="font-bold text-slate-800">Rs. 56.14 Cr.</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#e2f0d9] border border-[#c5e0b4] px-3 py-2 rounded">
                                    <span className="text-slate-700">Revenue Receipt FY 2026-27 (till July)</span>
                                    <span className="font-bold text-slate-800">Rs. 35.89 Cr.</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#e2f0d9] border border-[#c5e0b4] px-3 py-2 rounded">
                                    <span className="text-slate-700">% Target Achieved (till July)</span>
                                    <span className="font-bold text-red-500 text-sm">64%</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#e2f0d9] border border-[#c5e0b4] px-3 py-2 rounded">
                                    <span className="text-slate-700">% Overall Target Achieved</span>
                                    <span className="font-bold text-red-500 text-sm">15.54%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Average Daily e-TP Section */}
                <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
                    <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">Average Daily e-TP</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs font-semibold">
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">e-TP FY2025-26 (till July)</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-slate-800">1,464</div></div>
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">e-TP FY2026-27 (till July)</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-slate-800">1,637</div></div>
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">YoY Growth</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-green-600 flex items-center justify-center gap-1">12% <span>↑</span></div></div>
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">e-TP (June'26)</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-slate-800">1,706</div></div>
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">e-TP (July'26)</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-slate-800">1,463</div></div>
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">MoM Growth</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-red-500 flex items-center justify-center gap-1">14% <span>↓</span></div></div>
                        <div><div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Mines with zero e-TP</div><div className="bg-[#ebd6f1] border border-[#dcbbe6] p-2 rounded text-sm md:text-base font-bold text-red-500">8</div></div>
                    </div>
                </div>
                </div>
            </div>
            <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
                 <div className="max-w-7xl mx-auto space-y-4">
        
        {/* मुख्य ग्रिड: लेफ्ट (Illegal Cases & Dead Rent) और राइट (MSS Trigger) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* लेफ्ट कॉलम: Illegal Cases और Dead Rent (2/3 भाग) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 1. Illegal Mining, Transportation, and Storage Cases Card */}
            <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
              <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">
                Illegal Mining, Transportation, and Storage Cases FY2026-27 (till July'26)
              </h3>
              
              {/* केसेस की संख्या */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold mb-4">
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Total Illegal Cases</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">91</div>
                </div>
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Illegal Mining Cases</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">06</div>
                </div>
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Illegal Transportation Cases</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">83</div>
                </div>
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Illegal Storage Cases</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">02</div>
                </div>
              </div>

              {/* पेनल्टी और अमाउंट डिटेल्स */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold">
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Proposed Penalty</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">0.14 Cr.</div>
                </div>
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Imposed Penalty</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">0.67 Cr.</div>
                </div>
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">Deposited Amount</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-slate-800">0.48 Cr.</div>
                </div>
                <div>
                  <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">% Amount Due</div>
                  <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2 rounded text-base font-bold text-red-500">27%</div>
                </div>
              </div>
            </div>

            {/* 2. Dead Rent Section (2 कॉलम ग्रिड) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dead Rent 2025 */}
              <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
                <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm">Dead Rent Year 2025</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                  <div>
                    <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">DR Amount</div>
                    <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-1.5 rounded text-sm font-bold text-slate-800">5.69 Cr.</div>
                  </div>
                  <div>
                    <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">DR Deposited</div>
                    <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-1.5 rounded text-sm font-bold text-slate-800">3.35 Cr.</div>
                  </div>
                  <div>
                    <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">% DR Due</div>
                    <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-1.5 rounded text-sm font-bold text-red-500">41%</div>
                  </div>
                </div>
              </div>

              {/* Dead Rent 2026 */}
              <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
                <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm">Dead Rent Year 2026</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                  <div>
                    <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">DR Amount</div>
                    <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-1.5 rounded text-sm font-bold text-slate-800">5.05 Cr.</div>
                  </div>
                  <div>
                    <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">DR Deposited</div>
                    <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-1.5 rounded text-sm font-bold text-slate-800">2.56 Cr.</div>
                  </div>
                  <div>
                    <div className="mb-1 text-slate-700 h-8 flex items-end justify-center">% DR Due</div>
                    <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-1.5 rounded text-sm font-bold text-red-500">49%</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* राइट कॉलम: MSS Trigger Verification (1/3 भाग) */}
          <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">MSS Trigger verification</h3>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center bg-[#fce4d6] border border-[#f8caad] px-3 py-2 rounded">
                  <span className="text-slate-700">Total Triggers Generated</span>
                  <span className="font-bold text-slate-800 text-sm">168</span>
                </div>
                <div className="flex justify-between items-center bg-[#fce4d6] border border-[#f8caad] px-3 py-2 rounded">
                  <span className="text-slate-700">Triggers Verified</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    166 <span className="text-green-600 font-medium text-[11px]">99%</span>
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#fce4d6] border border-[#f8caad] px-3 py-2 rounded">
                  <span className="text-slate-700">Triggers Pending Verification</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    02 <span className="text-red-500 font-medium text-[11px]">1%</span>
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#fce4d6] border border-[#f8caad] px-3 py-2 rounded">
                  <span className="text-slate-700">Triggers with Illegal Activity</span>
                  <span className="font-bold text-sm text-red-500">08</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* नीचे का फुल-विड्थ सेक्शन: Monthly Return Submission */}
        <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
          <h3 className="font-bold text-[#0f4c6c] mb-3 text-sm md:text-base">Monthly Return Submission</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs font-semibold">
            <div>
              <div className="mb-1 text-slate-700">Total Working Mines</div>
              <div className="bg-slate-300 border border-slate-400 p-2 rounded text-base font-bold text-slate-700">150</div>
            </div>
            <div>
              <div className="mb-1 text-slate-700">Apr'26 Return Submitted</div>
              <div className="bg-slate-300 border border-slate-400 p-2 rounded text-base font-bold text-slate-700">20</div>
            </div>
            <div>
              <div className="mb-1 text-slate-700">May'26 Return Submitted</div>
              <div className="bg-slate-300 border border-slate-400 p-2 rounded text-base font-bold text-slate-700">18</div>
            </div>
            <div>
              <div className="mb-1 text-slate-700">Jun'26 Return Submitted</div>
              <div className="bg-slate-300 border border-slate-400 p-2 rounded text-base font-bold text-slate-700">11</div>
            </div>
          </div>
        </div>

                </div>
            </div>
            <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
                <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Quarry Lease Applications Card */}
        <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
          <h3 className="font-bold text-[#0f4c6c] mb-4 text-sm md:text-base">
            Quarry Lease Applications
          </h3>
          
          <div className="flex flex-col lg:flex-row items-center gap-4 text-center text-xs font-semibold">
            {/* Total Pending Applications */}
            <div className="w-full lg:w-auto min-w-[200px]">
              <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">
                Total Pending Applications
              </div>
              <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">
                197
              </div>
            </div>

            {/* एरो (Arrow) संकेतक */}
            <div className="text-orange-400 font-bold hidden lg:block text-2xl px-1">
              ➔
            </div>

            {/* सालों के अनुसार ग्रिड ब्रेकडाउन */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full">
              <div>
                <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">Year 2021</div>
                <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">86</div>
              </div>
              <div>
                <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">Year 2022</div>
                <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">20</div>
              </div>
              <div>
                <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">Year 2023</div>
                <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">23</div>
              </div>
              <div>
                <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">Year 2024</div>
                <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">42</div>
              </div>
              <div>
                <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">Year 2025</div>
                <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">26</div>
              </div>
              <div>
                <div className="mb-2 text-slate-700 h-8 flex items-end justify-center">Year 2026</div>
                <div className="bg-[#fce5d8] border border-[#f7c2aa] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">00</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. e-Checkgate Illegal Transportation Card */}
        <div className="bg-[#d2ecf9] p-4 rounded border border-[#b2ddf3]">
          <h3 className="font-bold text-[#0f4c6c] mb-4 text-sm md:text-base">
            e-Checkgate Illegal Transportation, 16 Apr'26 to 20 Jul'26
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs font-semibold">
            <div>
              <div className="mb-2 text-slate-700 h-10 flex items-end justify-center px-1">
                Mining Vehicles passed through Checkgate
              </div>
              <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">
                11,412
              </div>
            </div>
            <div>
              <div className="mb-2 text-slate-700 h-10 flex items-end justify-center">
                No of Illegal Vehicles
              </div>
              <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-2.5 rounded text-base font-bold text-red-600 shadow-sm">
                190
              </div>
            </div>
            <div>
              <div className="mb-2 text-slate-700 h-10 flex items-end justify-center">
                No of Legal Vehicles
              </div>
              <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">
                996
              </div>
            </div>
            <div>
              <div className="mb-2 text-slate-700 h-10 flex items-end justify-center">
                Demand note Issued
              </div>
              <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-2.5 rounded text-base font-bold text-slate-800 shadow-sm">
                45
              </div>
            </div>
            <div>
              <div className="mb-2 text-slate-700 h-10 flex items-end justify-center">
                Imposed Penalty
              </div>
              <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-2.5 rounded text-base font-bold text-green-700 shadow-sm">
                219.67 Lakh
              </div>
            </div>
            <div>
              <div className="mb-2 text-slate-700 h-10 flex items-end justify-center">
                % Penalty Collected
              </div>
              <div className="bg-[#e2f0d9] border border-[#c5e0b4] p-2.5 rounded text-base font-bold text-red-600 shadow-sm">
                0%
              </div>
            </div>
          </div>
        </div>

                </div>
            </div>
        </div>
        
        
    );
 }