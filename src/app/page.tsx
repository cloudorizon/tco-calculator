'use client'

import { useState, useCallback } from 'react'

// Configuration per tier
const tiers = {
  basic: {
    standardHours: 100,
    infraMonthly: 100,
    devopsHoursMonth: 4
  },
  moderate: {
    standardHours: 250,
    infraMonthly: 300,
    devopsHoursMonth: 8
  },
  enterprise: {
    standardHours: 500,
    infraMonthly: 800,
    devopsHoursMonth: 16
  }
}

function formatCurrency(amount: number): string {
  return '£' + Math.round(amount).toLocaleString('en-GB')
}

export default function TCOCalculator() {
  // State for counts
  const [basicCount, setBasicCount] = useState(0)
  const [moderateCount, setModerateCount] = useState(0)
  const [enterpriseCount, setEnterpriseCount] = useState(0)

  // State for hours
  const [basicHours, setBasicHours] = useState(100)
  const [moderateHours, setModerateHours] = useState(250)
  const [enterpriseHours, setEnterpriseHours] = useState(500)

  // State for hours edit visibility
  const [showBasicHours, setShowBasicHours] = useState(false)
  const [showModerateHours, setShowModerateHours] = useState(false)
  const [showEnterpriseHours, setShowEnterpriseHours] = useState(false)

  // State for labour rate
  const [labourRate, setLabourRate] = useState(80)
  const [selectedRateButton, setSelectedRateButton] = useState<number>(80)

  // State for assumptions panel
  const [showAssumptions, setShowAssumptions] = useState(false)

  const totalCount = basicCount + moderateCount + enterpriseCount

  // Calculations
  const totalBuild = 
    (basicCount * basicHours * labourRate) +
    (moderateCount * moderateHours * labourRate) +
    (enterpriseCount * enterpriseHours * labourRate)

  const totalInfraAnnual = 
    (basicCount * tiers.basic.infraMonthly * 12) +
    (moderateCount * tiers.moderate.infraMonthly * 12) +
    (enterpriseCount * tiers.enterprise.infraMonthly * 12)

  const totalDevopsAnnual = 
    (basicCount * tiers.basic.devopsHoursMonth * 12 * labourRate) +
    (moderateCount * tiers.moderate.devopsHoursMonth * 12 * labourRate) +
    (enterpriseCount * tiers.enterprise.devopsHoursMonth * 12 * labourRate)

  const totalMaintAnnual = totalBuild * 0.20

  const infra5yr = totalInfraAnnual * 5
  const devops5yr = totalDevopsAnnual * 5
  const maint5yr = totalMaintAnnual * 5
  const total5yr = totalBuild + infra5yr + devops5yr + maint5yr

  const year1 = totalBuild + totalInfraAnnual + totalDevopsAnnual + totalMaintAnnual
  const yearN = totalInfraAnnual + totalDevopsAnnual + totalMaintAnnual

  const totalDevopsHoursMonth = 
    (basicCount * tiers.basic.devopsHoursMonth) +
    (moderateCount * tiers.moderate.devopsHoursMonth) +
    (enterpriseCount * tiers.enterprise.devopsHoursMonth)

  const hiddenPercent = total5yr > 0 ? Math.round(((total5yr - totalBuild) / total5yr) * 100) : 0

  // Portfolio summary
  const parts: string[] = []
  if (basicCount > 0) parts.push(`${basicCount} basic`)
  if (moderateCount > 0) parts.push(`${moderateCount} moderate`)
  if (enterpriseCount > 0) parts.push(`${enterpriseCount} enterprise`)
  const portfolioText = parts.length > 0 
    ? parts.join(', ') + ' integration' + (totalCount > 1 ? 's' : '')
    : 'Your integration portfolio'

  const adjustCount = useCallback((setter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    setter(prev => Math.max(0, Math.min(50, prev + delta)))
  }, [])

  const selectLabourRate = useCallback((rate: number) => {
    setLabourRate(rate)
    setSelectedRateButton(rate)
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-[#0f172a] py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="text-white text-2xl font-semibold">
              <span className="text-[#14b8a6]">C</span>loudorizon
            </div>
            <a href="https://cloudorizon.com" className="text-gray-300 hover:text-white text-sm">← Back to Home</a>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div className="bg-[#0f172a] pb-8 pt-4">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Integration TCO Calculator</h1>
          <p className="text-gray-400">Discover the true cost of your integrations — including the hidden costs you&apos;re not tracking</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            
            {/* Integration Portfolio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-2">Your Integration Portfolio</h2>
              <p className="text-gray-500 text-sm mb-5">How many integrations do you have at each complexity level?</p>
              
              <div className="space-y-4">
                {/* Basic */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-[#0f172a]">Basic</div>
                      <div className="text-xs text-gray-500">Simple API (Payments, Email, Webhooks)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                        onClick={() => adjustCount(setBasicCount, -1)}
                      >−</button>
                      <input 
                        type="number" 
                        value={basicCount} 
                        min={0} 
                        max={50}
                        onChange={(e) => setBasicCount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="w-14 text-center border border-gray-200 rounded-lg py-1 text-lg font-semibold"
                      />
                      <button 
                        className="w-8 h-8 rounded-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold"
                        onClick={() => adjustCount(setBasicCount, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>~100 hours each (industry standard)</span>
                    <button className="text-[#14b8a6] hover:underline" onClick={() => setShowBasicHours(!showBasicHours)}>adjust hours</button>
                  </div>
                  {showBasicHours && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Build hours per integration:</span>
                        <input 
                          type="number" 
                          value={basicHours}
                          min={10}
                          max={500}
                          onChange={(e) => setBasicHours(parseInt(e.target.value) || 100)}
                          className="w-20 text-center border border-gray-200 rounded py-1"
                        />
                        <button className="text-xs text-[#14b8a6] hover:underline" onClick={() => setBasicHours(100)}>reset</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderate */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-[#0f172a]">Moderate</div>
                      <div className="text-xs text-gray-500">Custom Logic (CRM Sync, Data Transforms)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                        onClick={() => adjustCount(setModerateCount, -1)}
                      >−</button>
                      <input 
                        type="number" 
                        value={moderateCount} 
                        min={0} 
                        max={50}
                        onChange={(e) => setModerateCount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="w-14 text-center border border-gray-200 rounded-lg py-1 text-lg font-semibold"
                      />
                      <button 
                        className="w-8 h-8 rounded-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold"
                        onClick={() => adjustCount(setModerateCount, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>~250 hours each (industry standard)</span>
                    <button className="text-[#14b8a6] hover:underline" onClick={() => setShowModerateHours(!showModerateHours)}>adjust hours</button>
                  </div>
                  {showModerateHours && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Build hours per integration:</span>
                        <input 
                          type="number" 
                          value={moderateHours}
                          min={50}
                          max={1000}
                          onChange={(e) => setModerateHours(parseInt(e.target.value) || 250)}
                          className="w-20 text-center border border-gray-200 rounded py-1"
                        />
                        <button className="text-xs text-[#14b8a6] hover:underline" onClick={() => setModerateHours(250)}>reset</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enterprise */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-[#0f172a]">Enterprise</div>
                      <div className="text-xs text-gray-500">ERP, Multi-system, Real-time</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                        onClick={() => adjustCount(setEnterpriseCount, -1)}
                      >−</button>
                      <input 
                        type="number" 
                        value={enterpriseCount} 
                        min={0} 
                        max={50}
                        onChange={(e) => setEnterpriseCount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="w-14 text-center border border-gray-200 rounded-lg py-1 text-lg font-semibold"
                      />
                      <button 
                        className="w-8 h-8 rounded-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold"
                        onClick={() => adjustCount(setEnterpriseCount, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>~500 hours each (industry standard)</span>
                    <button className="text-[#14b8a6] hover:underline" onClick={() => setShowEnterpriseHours(!showEnterpriseHours)}>adjust hours</button>
                  </div>
                  {showEnterpriseHours && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Build hours per integration:</span>
                        <input 
                          type="number" 
                          value={enterpriseHours}
                          min={100}
                          max={2000}
                          onChange={(e) => setEnterpriseHours(parseInt(e.target.value) || 500)}
                          className="w-20 text-center border border-gray-200 rounded py-1"
                        />
                        <button className="text-xs text-[#14b8a6] hover:underline" onClick={() => setEnterpriseHours(500)}>reset</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total integrations summary */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total integrations:</span>
                <span className="text-lg font-bold text-[#0f172a]">{totalCount}</span>
              </div>
            </div>

            {/* Labour Rate */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Labour Rate</h2>
              
              <div className="flex gap-2 mb-4">
                <button 
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRateButton === 80 
                      ? 'bg-[#14b8a6] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => selectLabourRate(80)}
                >
                  Internal Team
                </button>
                <button 
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRateButton === 95 
                      ? 'bg-[#14b8a6] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => selectLabourRate(95)}
                >
                  UK Contractor
                </button>
                <button 
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRateButton === 45 
                      ? 'bg-[#14b8a6] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => selectLabourRate(45)}
                >
                  Offshore
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">£</span>
                <input 
                  type="number" 
                  value={labourRate}
                  min={20}
                  max={200}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 80
                    setLabourRate(val)
                    setSelectedRateButton(0) // Deselect buttons when manually typing
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-lg font-semibold"
                />
                <span className="text-gray-500 text-sm">/hour</span>
              </div>
            </div>

          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            
            {/* Empty State */}
            {totalCount === 0 && (
              <div className="bg-gradient-to-br from-[#0f172a] to-slate-800 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-2">Add your integrations to see the true cost</div>
                <div className="text-5xl mb-4">📊</div>
                <div className="text-sm text-gray-500">Use the + buttons on the left to build your portfolio</div>
              </div>
            )}

            {/* Results */}
            {totalCount > 0 && (
              <>
                {/* Total TCO Card */}
                <div className="bg-gradient-to-br from-[#0f172a] to-slate-800 rounded-xl p-6 text-white">
                  <div className="text-sm text-gray-300 mb-1">5-Year Total Cost of Ownership</div>
                  <div className="text-4xl font-bold mb-2">{formatCurrency(total5yr)}</div>
                  <div className="text-sm text-gray-400">{portfolioText}</div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-[#0f172a] mb-4">Cost Breakdown</h3>
                  
                  <div className="space-y-4">
                    {/* Build Cost */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-800">Initial Build</div>
                        <div className="text-xs text-gray-500">One-time development cost</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{formatCurrency(totalBuild)}</div>
                      </div>
                    </div>
                    
                    {/* Annual Infrastructure */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-800">Infrastructure</div>
                        <div className="text-xs text-gray-500">Hosting, compute, API gateway, monitoring</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{formatCurrency(infra5yr)}</div>
                        <div className="text-xs text-gray-400">{formatCurrency(totalInfraAnnual)}/year × 5</div>
                      </div>
                    </div>
                    
                    {/* DevOps Overhead */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-800">DevOps Overhead</div>
                        <div className="text-xs text-gray-500">Monitoring, restarts, incident response</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{formatCurrency(devops5yr)}</div>
                        <div className="text-xs text-gray-400">{totalDevopsHoursMonth} hrs/month × £{labourRate} × 5 years</div>
                      </div>
                    </div>
                    
                    {/* Maintenance */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">Maintenance</div>
                        <div className="text-xs text-gray-500">Bug fixes, API changes, enhancements</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{formatCurrency(maint5yr)}</div>
                        <div className="text-xs text-gray-400">20% of build × 5 years</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Hidden Cost Reveal */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <div className="font-semibold text-amber-800 mb-1">The Hidden Cost Reality</div>
                      <div className="text-sm text-amber-700">
                        Your {formatCurrency(totalBuild)} build investment will actually cost <strong>{formatCurrency(total5yr)}</strong> over 5 years. 
                        <strong> {hiddenPercent}% of the total cost comes after go-live</strong> — infrastructure, DevOps, and maintenance that rarely gets budgeted.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Year-by-Year */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-[#0f172a] mb-4">Year-by-Year Costs</h3>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Year 1</div>
                      <div className="font-semibold text-sm">{formatCurrency(year1)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Year 2</div>
                      <div className="font-semibold text-sm">{formatCurrency(yearN)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Year 3</div>
                      <div className="font-semibold text-sm">{formatCurrency(yearN)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Year 4</div>
                      <div className="font-semibold text-sm">{formatCurrency(yearN)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Year 5</div>
                      <div className="font-semibold text-sm">{formatCurrency(yearN)}</div>
                    </div>
                  </div>
                </div>

                {/* Assumptions */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <button 
                    className="w-full flex justify-between items-center text-left"
                    onClick={() => setShowAssumptions(!showAssumptions)}
                  >
                    <span className="font-semibold text-gray-700 text-sm">How we calculate these costs</span>
                    <span className="text-gray-400 text-xs">{showAssumptions ? '− Hide' : '+ Show'}</span>
                  </button>
                  {showAssumptions && (
                    <div className="mt-4 space-y-4 text-sm">
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Infrastructure Costs</div>
                        <div className="text-gray-600 text-xs space-y-1">
                          <div className="flex justify-between"><span>Basic integration:</span><span>£100/month</span></div>
                          <div className="flex justify-between"><span>Moderate integration:</span><span>£300/month</span></div>
                          <div className="flex justify-between"><span>Enterprise integration:</span><span>£800/month</span></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Includes hosting, compute, API gateway, logging, and monitoring.</div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="font-medium text-gray-700 mb-2">DevOps Overhead</div>
                        <div className="text-gray-600 text-xs space-y-1">
                          <div className="flex justify-between"><span>Basic integration:</span><span>4 hours/month</span></div>
                          <div className="flex justify-between"><span>Moderate integration:</span><span>8 hours/month</span></div>
                          <div className="flex justify-between"><span>Enterprise integration:</span><span>16 hours/month</span></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Time spent on monitoring, incident response, restarts, and health checks — charged at your labour rate.</div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="font-medium text-gray-700 mb-2">Annual Maintenance</div>
                        <div className="text-gray-600 text-xs">
                          <div className="flex justify-between"><span>All integrations:</span><span>20% of build cost per year</span></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Bug fixes, API version updates, schema changes, and minor enhancements. Industry standard is 15-25%.</div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
                        These are industry benchmarks based on our experience across 100+ integration projects. Your actual costs may vary — adjust the build hours if you have more accurate data for your environment.
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold py-3 px-6 rounded-lg transition">
                    Export PDF Summary
                  </button>
                  <button className="w-full border-2 border-[#14b8a6] text-[#14b8a6] hover:bg-[#14b8a6] hover:text-white font-semibold py-3 px-6 rounded-lg transition">
                    Book Strategy Call →
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
