import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react"

interface AiAnalysisProps {
    property: Property
}

export function AiAnalysis({ property }: AiAnalysisProps) {
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
                            Located in Gangnam's prime business district with <strong className="text-foreground">0.5% vacancy rate</strong> avg.
                        </li>
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            Recent renovation (2024) minimizes maintenance costs for next 5 years.
                        </li>
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            High demand from short-term business travelers (Yield premium +1.2%).
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
                            Short-term lease structure requires active property management (delegated).
                        </li>
                        <li className="flex gap-2">
                            <span className="block w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                            Sensitive to potential regulatory changes in Gangnam district housing laws.
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
