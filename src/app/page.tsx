'use client'

import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'

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

  const handleLabourRateChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0
    setLabourRate(numValue)
    if (numValue === 80 || numValue === 95 || numValue === 45) {
      setSelectedRateButton(numValue)
    } else {
      setSelectedRateButton(0)
    }
  }, [])

  const exportPDF = useCallback(() => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header
    doc.setFillColor(15, 23, 42) // slate-900
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Cloudorizon', 20, 22)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Integration TCO Calculator', pageWidth - 20, 22, { align: 'right' })
    
    // Title
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('5-Year Total Cost of Ownership', 20, 50)
    
    // Big number
    doc.setFontSize(32)
    doc.setTextColor(20, 184, 166) // teal
    doc.text(formatCurrency(total5yr), 20, 68)
    
    // Portfolio summary
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(portfolioText, 20, 78)
    
    // Divider
    doc.setDrawColor(229, 231, 235)
    doc.line(20, 85, pageWidth - 20, 85)
    
    // Cost Breakdown
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Cost Breakdown', 20, 97)
    
    let yPos = 108
    const lineHeight = 16
    
    // Cost items
    const costs = [
      { label: 'Initial Build', sublabel: 'One-time development cost', value: formatCurrency(totalBuild) },
      { label: 'Infrastructure (5 years)', sublabel: 'Hosting, compute, API gateway, monitoring', value: formatCurrency(infra5yr) },
      { label: 'DevOps Overhead (5 years)', sublabel: 'Monitoring, restarts, incident response', value: formatCurrency(devops5yr) },
      { label: 'Maintenance (5 years)', sublabel: 'Bug fixes, API changes, enhancements', value: formatCurrency(maint5yr) },
    ]
    
    costs.forEach((cost) => {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text(cost.label, 20, yPos)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(cost.sublabel, 20, yPos + 4)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text(cost.value, pageWidth - 20, yPos, { align: 'right' })
      
      yPos += lineHeight
    })
    
    // Hidden Cost callout
    yPos += 8
    doc.setFillColor(254, 243, 199) // amber-100
    doc.roundedRect(20, yPos, pageWidth - 40, 28, 3, 3, 'F')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(146, 64, 14) // amber-800
    doc.text('The Hidden Cost Reality', 28, yPos + 10)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 83, 9) // amber-700
    const hiddenText = `${hiddenPercent}% of the total cost comes after go-live — infrastructure, DevOps, and maintenance that rarely gets budgeted.`
    doc.text(hiddenText, 28, yPos + 20, { maxWidth: pageWidth - 56 })
    
    // Year-by-year
    yPos += 40
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Year-by-Year Costs', 20, yPos)
    
    yPos += 10
    const years = [
      { year: 'Year 1', value: formatCurrency(year1) },
      { year: 'Year 2', value: formatCurrency(yearN) },
      { year: 'Year 3', value: formatCurrency(yearN) },
      { year: 'Year 4', value: formatCurrency(yearN) },
      { year: 'Year 5', value: formatCurrency(yearN) },
    ]
    
    const boxWidth = (pageWidth - 60) / 5
    years.forEach((item, index) => {
      const xPos = 20 + (index * (boxWidth + 5))
      doc.setFillColor(243, 244, 246) // gray-100
      doc.roundedRect(xPos, yPos, boxWidth, 22, 2, 2, 'F')
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(item.year, xPos + boxWidth/2, yPos + 7, { align: 'center' })
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(item.value, xPos + boxWidth/2, yPos + 16, { align: 'center' })
    })
    
    // Footer
    yPos += 35
    doc.setDrawColor(229, 231, 235)
    doc.line(20, yPos, pageWidth - 20, yPos)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Generated by Cloudorizon Integration TCO Calculator', 20, yPos + 8)
    doc.text('cloudorizon.com', pageWidth - 20, yPos + 8, { align: 'right' })
    
    // Save
    doc.save('integration-tco-summary.pdf')
  }, [total5yr, portfolioText, totalBuild, infra5yr, devops5yr, maint5yr, hiddenPercent, year1, yearN])

  const openCalendly = useCallback(() => {
    window.open('https://calendly.com/amber-cunningham-/30min', '_blank')
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <a href="https://cloudorizon.com">
              <img src="/cloudorizon-logo.png" alt="Cloudorizon" className="h-8" />
            </a>
            <a href="https://cloudorizon.com" className="text-gray-300 hover:text-white text-sm cursor-pointer">← Back to Home</a>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div className="bg-slate-900 pb-8 pt-4">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Integration TCO Calculator</h1>
          <p className="text-gray-400">Discover the true cost of your integrations — including the hidden costs you&apos;re not tracking</p>
        </div>
      </div>

      {/* Context Banner */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-sm text-blue-800">
            <strong>What is this?</strong> This calculator shows the true 5-year cost of building and maintaining integrations with custom code or frameworks. 
            Most teams only budget for the initial build — this reveals the ongoing infrastructure, DevOps, and maintenance costs that add up over time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            
            {/* Integration Portfolio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Integration Portfolio</h2>
              <p className="text-gray-500 text-sm mb-5">How many integrations do you have at each complexity level?</p>
              
              <div className="space-y-4">
                {/* Basic */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-slate-900">Basic</div>
                      <div className="text-xs text-gray-500">Simple API (Payments, Email, Webhooks)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold cursor-pointer"
                        onClick={() => adjustCount(setBasicCount, -1)}
                      >−</button>
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={basicCount} 
                        onChange={(e) => setBasicCount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-lg font-semibold text-slate-900"
                      />
                      <button 
                        className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold cursor-pointer"
                        onClick={() => adjustCount(setBasicCount, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>~100 hours each (industry standard)</span>
                    <button className="text-teal-600 hover:underline cursor-pointer" onClick={() => setShowBasicHours(!showBasicHours)}>adjust hours</button>
                  </div>
                  {showBasicHours && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Build hours per integration:</span>
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={basicHours}
                          onChange={(e) => setBasicHours(parseInt(e.target.value) || 100)}
                          className="w-24 text-center border border-gray-300 rounded py-1.5 text-slate-900"
                        />
                        <button className="text-xs text-teal-600 hover:underline cursor-pointer" onClick={() => setBasicHours(100)}>reset</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderate */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-slate-900">Moderate</div>
                      <div className="text-xs text-gray-500">Custom Logic (CRM Sync, Data Transforms)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold cursor-pointer"
                        onClick={() => adjustCount(setModerateCount, -1)}
                      >−</button>
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={moderateCount} 
                        onChange={(e) => setModerateCount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-lg font-semibold text-slate-900"
                      />
                      <button 
                        className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold cursor-pointer"
                        onClick={() => adjustCount(setModerateCount, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>~250 hours each (industry standard)</span>
                    <button className="text-teal-600 hover:underline cursor-pointer" onClick={() => setShowModerateHours(!showModerateHours)}>adjust hours</button>
                  </div>
                  {showModerateHours && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Build hours per integration:</span>
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={moderateHours}
                          onChange={(e) => setModerateHours(parseInt(e.target.value) || 250)}
                          className="w-24 text-center border border-gray-300 rounded py-1.5 text-slate-900"
                        />
                        <button className="text-xs text-teal-600 hover:underline cursor-pointer" onClick={() => setModerateHours(250)}>reset</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enterprise */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-slate-900">Enterprise</div>
                      <div className="text-xs text-gray-500">ERP, Multi-system, Real-time</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold cursor-pointer"
                        onClick={() => adjustCount(setEnterpriseCount, -1)}
                      >−</button>
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={enterpriseCount} 
                        onChange={(e) => setEnterpriseCount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-lg font-semibold text-slate-900"
                      />
                      <button 
                        className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold cursor-pointer"
                        onClick={() => adjustCount(setEnterpriseCount, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>~500 hours each (industry standard)</span>
                    <button className="text-teal-600 hover:underline cursor-pointer" onClick={() => setShowEnterpriseHours(!showEnterpriseHours)}>adjust hours</button>
                  </div>
                  {showEnterpriseHours && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Build hours per integration:</span>
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={enterpriseHours}
                          onChange={(e) => setEnterpriseHours(parseInt(e.target.value) || 500)}
                          className="w-24 text-center border border-gray-300 rounded py-1.5 text-slate-900"
                        />
                        <button className="text-xs text-teal-600 hover:underline cursor-pointer" onClick={() => setEnterpriseHours(500)}>reset</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total integrations summary */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Total integrations:</span>
                <span className="text-xl font-bold text-slate-900">{totalCount}</span>
              </div>
            </div>

            {/* Labour Rate */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Labour Rate</h2>
              
              <div className="flex gap-2 mb-4">
                <button 
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                    selectedRateButton === 80 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => selectLabourRate(80)}
                >
                  Internal Team
                </button>
                <button 
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                    selectedRateButton === 95 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => selectLabourRate(95)}
                >
                  UK Contractor
                </button>
                <button 
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                    selectedRateButton === 45 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => selectLabourRate(45)}
                >
                  Offshore
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm font-medium">£</span>
                <input 
                  type="text"
                  inputMode="numeric"
                  value={labourRate}
                  onChange={(e) => handleLabourRateChange(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2.5 text-xl font-semibold text-slate-900"
                />
                <span className="text-gray-600 text-sm font-medium">/hour</span>
              </div>
            </div>

          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            
            {/* Empty State */}
            {totalCount === 0 && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-2">Add your integrations to see the true cost</div>
                <div className="text-5xl mb-4">📊</div>
                <div className="text-sm text-gray-500">Use the + buttons on the left to build your portfolio</div>
              </div>
            )}

            {/* Results */}
            {totalCount > 0 && (
              <>
                {/* Total TCO Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-6 text-white">
                  <div className="text-sm text-gray-300 mb-1">5-Year Total Cost of Ownership</div>
                  <div className="text-4xl font-bold mb-2">{formatCurrency(total5yr)}</div>
                  <div className="text-sm text-gray-400">{portfolioText}</div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Cost Breakdown</h3>
                  
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
                  <h3 className="font-semibold text-slate-900 mb-4">Year-by-Year Costs</h3>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1 font-medium">Year 1</div>
                      <div className="font-bold text-base text-slate-900">{formatCurrency(year1)}</div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1 font-medium">Year 2</div>
                      <div className="font-bold text-base text-slate-900">{formatCurrency(yearN)}</div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1 font-medium">Year 3</div>
                      <div className="font-bold text-base text-slate-900">{formatCurrency(yearN)}</div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1 font-medium">Year 4</div>
                      <div className="font-bold text-base text-slate-900">{formatCurrency(yearN)}</div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1 font-medium">Year 5</div>
                      <div className="font-bold text-base text-slate-900">{formatCurrency(yearN)}</div>
                    </div>
                  </div>
                </div>

                {/* Assumptions */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <button 
                    className="w-full flex justify-between items-center text-left cursor-pointer"
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
                  <button 
                    onClick={exportPDF}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF Summary
                  </button>
                  <button 
                    onClick={openCalendly}
                    className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
                  >
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

