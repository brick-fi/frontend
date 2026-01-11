import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PROPERTIES } from "@/data/properties"
import { Badge } from "@/components/ui/badge"

export default function PortfolioPage() {
    const myProperty = PROPERTIES[0]

    return (
        <div className="container py-12 max-w-4xl px-4">
            <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$1,250.00</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cashflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">+$7.50</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,225 CFT</div>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-bold mt-8">Your Assets</h2>
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                                {/* Placeholder for small thumbnail */}
                                <div className="w-full h-full bg-slate-200" style={{ backgroundImage: `url(${myProperty.imageUrl})`, backgroundSize: 'cover' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold">{myProperty.title}</h3>
                                <p className="text-sm text-muted-foreground">{myProperty.location}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium">$1,250.00</div>
                            <Badge variant="secondary" className="mt-1">Active</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
