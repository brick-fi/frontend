"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function AdminPage() {
    const [loading, setLoading] = useState(false)

    const handleDistribute = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success("Distribution Triggered Successfully", {
                description: "254.30 USDC has been distributed to 128 token holders."
            })
        }, 2000)
    }

    return (
        <div className="container py-12 max-w-4xl px-4">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rent Distribution</CardTitle>
                        <CardDescription>Manually trigger the monthly rent distribution smart contract.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border p-4 bg-muted/50 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Accumulated Rent (Jan 2026)</span>
                                <span className="text-2xl font-bold font-mono">$254.30</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-full" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleDistribute} disabled={loading} size="lg" variant="default">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Distributing..." : "Trigger Distribution"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Asset Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            All assets are currently operational. No maintenance alerts.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
