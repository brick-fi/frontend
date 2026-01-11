"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Plus, Pencil, Check, X, Wallet } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface DistributionItem {
    id: string
    name: string
    amount: number
    status: "Pending" | "Distributed"
    holders: number
}

export default function AdminPage() {
    // Initial Mock Data: 3 items as requested
    const [distributions, setDistributions] = useState<DistributionItem[]>([
        { id: "dist-1", name: "Downtown SkyView - Jan 2026", amount: 254.30, status: "Pending", holders: 128 },
        { id: "dist-2", name: "Marina Gate - Jan 2026", amount: 185.00, status: "Pending", holders: 85 },
        { id: "dist-3", name: "Palm Villa - Jan 2026", amount: 1250.00, status: "Pending", holders: 42 },
    ])

    const [loadingIds, setLoadingIds] = useState<string[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState<string>("")

    // Handle Distribute Action
    const handleDistribute = (id: string, amount: number) => {
        setLoadingIds(prev => [...prev, id])

        // Simulate Blockchain Transaction
        setTimeout(() => {
            setLoadingIds(prev => prev.filter(loadingId => loadingId !== id))
            setDistributions(prev => prev.map(item =>
                item.id === id ? { ...item, status: "Distributed" } : item
            ))
            toast.success("Distribution Successful", {
                description: `$${amount.toFixed(2)} USDC has been sent to token holders.`
            })
        }, 2000)
    }

    // Handle Edit Start
    const startEditing = (item: DistributionItem) => {
        setEditingId(item.id)
        setEditAmount(item.amount.toString())
    }

    // Handle Save Edit
    const saveEdit = () => {
        if (!editingId) return
        const newAmount = parseFloat(editAmount)
        if (isNaN(newAmount) || newAmount < 0) {
            toast.error("Invalid Amount", { description: "Please enter a valid positive number." })
            return
        }

        setDistributions(prev => prev.map(item =>
            item.id === editingId ? { ...item, amount: newAmount } : item
        ))
        setEditingId(null)
        toast.success("Amount Updated")
    }

    // Handle Add New Rent
    const handleAddRent = () => {
        const newId = `dist-${Date.now()}`
        const newItem: DistributionItem = {
            id: newId,
            name: "New Property Rent",
            amount: 0,
            status: "Pending",
            holders: 0
        }
        setDistributions(prev => [newItem, ...prev])
        // Automatically start editing the new item
        setEditingId(newId)
        setEditAmount("0")
    }

    return (
        <div className="container py-12 max-w-4xl px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Button onClick={handleAddRent} className="gap-2 bg-brand-green text-black hover:bg-brand-green/90">
                    <Plus className="h-4 w-4" /> Record New Rent
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Distributions</CardTitle>
                        <CardDescription>Manage and trigger monthly rental income distributions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {distributions.map((item) => (
                            <div key={item.id} className="rounded-lg border p-4 bg-muted/30 transition-all hover:border-brand-green/50">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                                    {/* Left: Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            {item.status === "Distributed" && (
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Distributed</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.holders > 0 ? `${item.holders} Token Holders` : "No holders yet"}</p>
                                    </div>

                                    {/* Middle: Amount (Editable) */}
                                    <div className="flex items-center gap-2 min-w-[200px]">
                                        {editingId === item.id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                    <Input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                        className="pl-6 w-32"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={saveEdit}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => setEditingId(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => item.status === "Pending" && startEditing(item)}>
                                                <span className="text-2xl font-bold font-mono tracking-tight">
                                                    ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                {item.status === "Pending" && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit Amount</span>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Action */}
                                    <div>
                                        {item.status === "Pending" ? (
                                            <Button
                                                onClick={() => handleDistribute(item.id, item.amount)}
                                                disabled={loadingIds.includes(item.id) || editingId === item.id || item.amount <= 0}
                                                variant="default" // Using default (green)
                                                className="min-w-[140px]"
                                            >
                                                {loadingIds.includes(item.id) ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wallet className="mr-2 h-4 w-4" /> Distribute
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button variant="outline" disabled className="min-w-[140px] opacity-50">
                                                Completed
                                            </Button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
