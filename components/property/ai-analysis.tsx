import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react"

interface AiAnalysisProps {
    property: Property
}

export function AiAnalysis({ property }: AiAnalysisProps) {
    const yieldNum = parseFloat(property.projectedYield)
    const isHighYield = !isNaN(yieldNum) && yieldNum > 6.0
    const locationCity = property.location.split(',')[0]

    return (
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-brand-light to-white dark:from-secondary/20 dark:to-background">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-brand-gold/20 text-brand-gold">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg">AI Investment Insights</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400 text-sm uppercase tracking-wide">
                        <CheckCircle2 className="h-4 w-4" /> Key Advantages
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground pl-1">
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            Located in <strong className="text-foreground">{locationCity}</strong> prime district with high occupancy potential.
                        </li>
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            Projected yield of <strong className="text-foreground">{property.projectedYield}</strong> {isHighYield ? "outperforms market average." : "offers stable, consistent returns."}
                        </li>
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            High demand from short-term business travelers in this area.
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm uppercase tracking-wide">
                        <AlertTriangle className="h-4 w-4" /> Risk Factors
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground pl-1">
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            Market volatility in {locationCity} may affect short-term asset valuation.
                        </li>
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            Maintenance costs for premium amenities may fluctuate seasonally.
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
