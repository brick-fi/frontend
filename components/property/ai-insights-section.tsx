'use client'

import { InvestmentInsights } from '@/types/ai-insights'
import { Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react'

interface AIInsightsSectionProps {
  insights: InvestmentInsights
  loading?: boolean
}

export function AIInsightsSection({ insights, loading }: AIInsightsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-6 p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold">AI Investment Insights</h3>
          <span className="text-xs text-muted-foreground ml-auto">Analyzing...</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold">AI Investment Insights</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Powered by AI
        </span>
      </div>

      {/* Summary */}
      {insights.summary && (
        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-foreground/90">{insights.summary}</p>
          {insights.yieldEstimate && (
            <div className="mt-2 flex items-center gap-2 text-brand-green font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Projected Yield: {insights.yieldEstimate}</span>
            </div>
          )}
        </div>
      )}

      {/* Key Advantages */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          Key Advantages
        </h4>
        <ul className="space-y-2">
          {insights.keyAdvantages.map((advantage, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span className="text-foreground/80">{advantage}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Factors */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Risk Factors
        </h4>
        <ul className="space-y-2">
          {insights.riskFactors.map((risk, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
              <span className="text-foreground/80">{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-muted-foreground italic">
          These insights are AI-generated and should not be considered as financial advice.
          Always conduct your own research before making investment decisions.
        </p>
      </div>
    </div>
  )
}
