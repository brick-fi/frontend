import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react"

interface AiAnalysisProps {
    property: Property
}

export function AiAnalysis({ property }: AiAnalysisProps) {
    // If AI insights are not available, don't render the component
    if (!property.aiInsights) {
        return null
    }

    const { keyAdvantages, riskFactors, summary } = property.aiInsights

    return (
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-brand-light to-white dark:from-secondary/20 dark:to-background">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-brand-gold/20 text-brand-gold">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg">AI Investment Insights</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {summary}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {keyAdvantages && keyAdvantages.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400 text-sm uppercase tracking-wide">
                            <CheckCircle2 className="h-4 w-4" /> Key Advantages
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground pl-1">
                            {keyAdvantages.map((advantage, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                                    <span>{advantage}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {riskFactors && riskFactors.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm uppercase tracking-wide">
                            <AlertTriangle className="h-4 w-4" /> Risk Factors
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground pl-1">
                            {riskFactors.map((risk, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                                    <span>{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
