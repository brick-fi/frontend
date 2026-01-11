export interface Property {
    id: string
    title: string
    location: string
    imageUrl: string
    projectedYield: string
    minInvestment: string
    totalValue: string
    funded: number
    description: string
    tags: string[]
    tokenSymbol: string
}

export const PROPERTIES: Property[] = [
    {
        id: "prop-downtown",
        title: "The Address Downtown SkyView",
        location: "Downtown Dubai, UAE",
        imageUrl: "/dubai-downtown.png",
        projectedYield: "5.8% - 6.8%",
        minInvestment: "$50",
        totalValue: "$1,250,000",
        funded: 82,
        description: "Ultra-luxury 2-bedroom apartment with direct views of Burj Khalifa. Located in the heart of Downtown, offering premium amenities and high short-term rental demand from tourists.",
        tags: ["Prime Location", "Luxury", "Short-term"],
        tokenSymbol: "ADS",
    },
    {
        id: "prop-marina",
        title: "Marina Gate Waterfront",
        location: "Dubai Marina, UAE",
        imageUrl: "/dubai-marina.png",
        projectedYield: "6.5% - 7.2%",
        minInvestment: "$50",
        totalValue: "$850,000",
        funded: 45,
        description: "Modern 1-bedroom unit in Dubai Marina with stunning canal views. High occupancy rates year-round due to proximity to JBR beach and Marina Walk.",
        tags: ["High Yield", "Waterfront", "Stable"],
        tokenSymbol: "MGW",
    },
    {
        id: "prop-palm",
        title: "Signature Villa Palm Jumeirah",
        location: "Palm Jumeirah, UAE",
        imageUrl: "/dubai-palm.png",
        projectedYield: "5.0% - 6.0%",
        minInvestment: "$50",
        totalValue: "$5,500,000",
        funded: 12,
        description: "Exclusive beachfront villa on the iconic Palm Jumeirah Frond. Represents the pinnacle of luxury living with private beach access and high capital appreciation potential.",
        tags: ["Trophy Asset", "Beachfront", "Exclusive"],
        tokenSymbol: "SVP",
    },
]
