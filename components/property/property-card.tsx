import Link from "next/link"
import Image from "next/image"
import { Property } from "@/data/properties"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface PropertyCardProps {
    property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg border border-border/50">
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <Image
                    src={property.imageUrl}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background">
                        <Heart className="h-4 w-4" />
                    </Button>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                    {property.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs font-medium bg-brand-dark/80 text-brand-light backdrop-blur-md rounded-md">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="font-semibold text-lg tracking-tight group-hover:text-brand-gold transition-colors">
                        {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Proj. Yield</p>
                        <p className="font-semibold text-brand-gold">{property.projectedYield}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Min. Inv</p>
                        <p className="font-semibold">{property.minInvestment}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Funded</span>
                            <span className="font-medium">{property.funded}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold rounded-full" style={{ width: `${property.funded}%` }} />
                        </div>
                    </div>
                </div>

                <Button asChild className="w-full" variant="outline">
                    <Link href={`/property/${property.id}`}>View Details</Link>
                </Button>
            </div>
        </div>
    )
}
