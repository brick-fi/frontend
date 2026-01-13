"use client"

import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property/property-card"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { useProperties } from "@/context/property-context"

export default function Home() {
  const { properties } = useProperties()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-60 scale-105 animate-in fade-in duration-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent"></div>

        <div className="container relative z-10 px-4 md:px-8 text-center max-w-5xl mx-auto space-y-8 pt-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 text-brand-green text-sm font-medium tracking-wide mb-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300">
            The Future of Real Estate Investment
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            BE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">LANDLORD</span><br />
            BY ONE CLICK
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-700">
            Easiest fractional ownership, powered by DeFi. <br />
            Start building your property empire from just <span className="text-brand-green font-bold">$50</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-1000">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-10 h-14 rounded-full bg-brand-green hover:bg-brand-green/90 text-black font-bold shadow-[0_0_20px_rgba(10,191,83,0.3)] transition-all hover:scale-105"
              onClick={() => {
                const element = document.getElementById('featured');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Start Investing
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm text-lg px-10">
              <Link href="/portfolio">
                View Portfolio
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="featured" className="py-24 bg-background">
        <div className="container px-4 md:px-8 max-w-screen-2xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Opportunities</h2>
              <p className="text-muted-foreground">Curated high-yield rental properties available for immediate investment.</p>
            </div>
            <div className="flex gap-4">
              <Button asChild variant="outline" className="hidden md:flex gap-2">
                <Link href="/property/create">
                  <Plus className="h-4 w-4" /> List Your Property
                </Link>
              </Button>
              <Button variant="ghost" className="hidden md:flex gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

          </div>

          {properties.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Properties Listed Yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to list a property on BrickFi</p>
              <Button asChild>
                <Link href="/property/create">
                  <Plus className="h-4 w-4 mr-2" /> List Your Property
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
          <div className="mt-12 text-center md:hidden">
            <Button variant="ghost" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Value Prop / Trust Section */}
      <section className="py-24 bg-secondary/50 border-y border-border/50">
        <div className="container px-4 md:px-8 max-w-screen-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-coins"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 8.48-4-12.09-1.95 2.47" /></svg>
              </div>
              <h3 className="text-xl font-bold">Monthly Cashflow</h3>
              <p className="text-muted-foreground leading-relaxed">Rent collected is automatically distributed to your wallet via smart contracts.</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
              <h3 className="text-xl font-bold">Stable Assets</h3>
              <p className="text-muted-foreground leading-relaxed">Backed by real-world audited properties in high-demand locations.</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe-2"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" /><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2a2 2 0 0 0 2-2v0" /><path d="M15.3 15.3 21 21" /><path d="m21 3-9.69 9.69" /><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.46" /><circle cx="12" cy="12" r="10" /></svg>
              </div>
              <h3 className="text-xl font-bold">Global Access</h3>
              <p className="text-muted-foreground leading-relaxed">Invest in top-tier markets from anywhere in the world without currency barriers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
