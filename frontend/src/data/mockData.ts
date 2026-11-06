export interface FairDropEvent {
  id: string;
  name: string;
  category: "music" | "tech" | "campus" | "conference";
  categoryLabel: string;
  tagline: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  priceUsdc: number;
  totalTickets: number;
  claimedTickets: number;
  status: "Registration Open" | "World ID Verified Only" | "Allocation Draw Soon" | "Sold Out";
  statusType: "open" | "verified" | "draw" | "closed";
  imageUrl: string;
  description: string;
  lineup: string[];
  rules: string[];
}

export interface ResaleListing {
  id: string;
  eventId: string;
  eventName: string;
  ticketNumber: string;
  tier: string;
  sellerWallet: string;
  originalPriceUsdc: number;
  resalePriceUsdc: number;
  priceCapMaxUsdc: number;
  markupPercent: number;
  status: "Available" | "Pending Settlement" | "Sold";
  settlementNetwork: string;
  verifiedHumanOnly: boolean;
}

export interface PartnerIntegration {
  id: "world" | "arkiv" | "arc";
  name: string;
  role: string;
  shortDesc: string;
  fullDesc: string;
  status: "In Development" | "Planned" | "Connected" | "Demo Mode";
  statusColor: "emerald" | "amber" | "indigo" | "violet";
  phase: string;
  docsUrl: string;
  features: string[];
}

export const DEMO_EVENTS: FairDropEvent[] = [
  {
    id: "mumbai-music-festival",
    name: "Mumbai Music Festival 2026",
    category: "music",
    categoryLabel: "Music & Live Art",
    tagline: "India's premiere electronic & indie open-air festival",
    location: "Mumbai, India",
    venue: "Jio World Garden, BKC, Bandra East",
    date: "Dec 18–19, 2026",
    time: "4:00 PM – 11:30 PM IST",
    priceUsdc: 45,
    totalTickets: 2500,
    claimedTickets: 1240,
    status: "Registration Open",
    statusType: "open",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    description:
      "A 2-day multi-genre celebration featuring 3 stages, world-class acoustic engineering, interactive light installations, and curated artisan food districts in the heart of Mumbai's BKC.",
    lineup: [
      "Subtle Sounds Collective",
      "Prateek Kuhad Live Ensemble",
      "Anish Sood & Guests",
      "Kavya Trehan",
      "Sandunes Ambient Set",
    ],
    rules: [
      "Strict limit: 1 ticket allocation per verified World ID human",
      "Must hold verified World ID proof at time of claim",
      "Non-transferable except through FairDrop controlled resale with max +10% price cap",
      "Government photo ID must match registered World ID profile at gate check-in",
    ],
  },
  {
    id: "ethglobal-mumbai-2026",
    name: "ETHGlobal Mumbai 2026",
    category: "tech",
    categoryLabel: "Web3 Hackathon",
    tagline: "36 hours of relentless decentralized engineering and showcase",
    location: "Mumbai, India",
    venue: "Grand Hyatt Mumbai, Off Western Express Hwy, Santacruz",
    date: "Nov 14–16, 2026",
    time: "Starts Friday 9:00 AM IST",
    priceUsdc: 0,
    totalTickets: 1000,
    claimedTickets: 850,
    status: "World ID Verified Only",
    statusType: "verified",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    description:
      "Gathering 1,000+ global blockchain engineers, cryptographers, and protocol designers to build decentralized applications, zero-knowledge primitives, and scalable infrastructure.",
    lineup: [
      "36-Hour Hackathon Arena",
      "Mentor Workshops & Deep Dives",
      "Protocols Demo Stage & Awards",
      "Partner Bounties & Grants Desk",
      "Closing Ceremony & Networking",
    ],
    rules: [
      "100% Free registration sponsored by ETHGlobal Foundation",
      "Zero-knowledge World ID verification mandatory to prevent Sybil bot registrations",
      "Admittance subject to staking pledge or hackathon acceptance code",
      "Secondary resale strictly disabled; unreserved passes return to waitlist queue",
    ],
  },
  {
    id: "mumbai-tech-summit",
    name: "Mumbai Tech Summit 2027",
    category: "conference",
    categoryLabel: "Conference & AI",
    tagline: "Connecting frontier AI researchers, Web3 founders, and tech visionaries",
    location: "Mumbai, India",
    venue: "NESCO Center, Hall 4, Goregaon East",
    date: "Jan 22, 2027",
    time: "8:30 AM – 7:00 PM IST",
    priceUsdc: 65,
    totalTickets: 600,
    claimedTickets: 490,
    status: "Allocation Draw Soon",
    statusType: "draw",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    description:
      "The flagship convention uniting industry giants, venture capital firms, AI pioneers, and decentralized builders. Featuring over 40 keynote speeches and an exclusive startup pitch exhibition.",
    lineup: [
      "Frontier AI & Autonomous Agents Track",
      "Enterprise Blockchain Infrastructure",
      "Founder & Angel Investor Breakfast",
      "40 Keynote Addresses & Debates",
      "VIP Networking Gala Dinner",
    ],
    rules: [
      "One claim entry per verified human nullifier",
      "Transparent on-chain allocation draw executed 72 hours before event",
      "Unallocated claims automatically refunded in USDC via Arc protocol",
      "Resale transfers capped strictly at original purchase price (0% scalping markup)",
    ],
  },
  {
    id: "college-fest-2026",
    name: "Campus Fest 2026: Mood Indigo Tribute",
    category: "campus",
    categoryLabel: "Youth & Campus",
    tagline: "The largest inter-college cultural & music celebration in Western India",
    location: "Mumbai, India",
    venue: "IIT Bombay Campus Grounds, Powai, Mumbai",
    date: "Feb 10–12, 2027",
    time: "11:00 AM – 10:00 PM IST",
    priceUsdc: 15,
    totalTickets: 5000,
    claimedTickets: 3620,
    status: "Registration Open",
    statusType: "open",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    description:
      "Three exhilarating days of battle-of-the-bands, street theatre, EDM arena nights, choreo competitions, and creative hack showcases across the scenic lakeside campus of Powai.",
    lineup: [
      "ProNite EDM Arena with Headline Acts",
      "National Collegiate Rock Band Finals",
      "Street Dance & Freestyle Battles",
      "Short Film & Photography Pavilions",
      "Campus Food Street & Stalls",
    ],
    rules: [
      "Subsidized student tier: 15 USDC flat price",
      "World ID proof required to stop bot cart-hoarding and counterfeit QR scalping",
      "Valid Student ID must be presented in conjunction with the on-chain ticket badge",
      "Resale locked at original student face value ($15 USDC)",
    ],
  },
];

export const RESALE_LISTINGS: ResaleListing[] = [
  {
    id: "resale-001",
    eventId: "mumbai-music-festival",
    eventName: "Mumbai Music Festival 2026",
    ticketNumber: "#MMF-0412",
    tier: "General Admission • 2-Day Pass",
    sellerWallet: "0x8F3a...9B21",
    originalPriceUsdc: 45,
    resalePriceUsdc: 45,
    priceCapMaxUsdc: 49.5,
    markupPercent: 0,
    status: "Available",
    settlementNetwork: "Arc Protocol • USDC",
    verifiedHumanOnly: true,
  },
  {
    id: "resale-002",
    eventId: "mumbai-tech-summit",
    eventName: "Mumbai Tech Summit 2027",
    ticketNumber: "#MTS-0524",
    tier: "Executive All-Access Pass",
    sellerWallet: "0x6D91...10eB",
    originalPriceUsdc: 65,
    resalePriceUsdc: 70,
    priceCapMaxUsdc: 71.5,
    markupPercent: 7.6,
    status: "Available",
    settlementNetwork: "Arc Protocol • USDC",
    verifiedHumanOnly: true,
  },
  {
    id: "resale-003",
    eventId: "ethglobal-mumbai-2026",
    eventName: "ETHGlobal Mumbai 2026",
    ticketNumber: "#EGM-0189",
    tier: "Hacker Pass • Builder Tier",
    sellerWallet: "0x2A1c...74C8",
    originalPriceUsdc: 0,
    resalePriceUsdc: 0,
    priceCapMaxUsdc: 0,
    markupPercent: 0,
    status: "Pending Settlement",
    settlementNetwork: "Zero-Knowledge Transfer",
    verifiedHumanOnly: true,
  },
  {
    id: "resale-004",
    eventId: "college-fest-2026",
    eventName: "Campus Fest 2026: Mood Indigo Tribute",
    ticketNumber: "#CF-2104",
    tier: "Full Festival Student Pass",
    sellerWallet: "0x44Be...E377",
    originalPriceUsdc: 15,
    resalePriceUsdc: 15,
    priceCapMaxUsdc: 16.5,
    markupPercent: 0,
    status: "Sold",
    settlementNetwork: "Arc Protocol • USDC",
    verifiedHumanOnly: true,
  },
];

export const PARTNERS_DATA: PartnerIntegration[] = [
  {
    id: "world",
    name: "World",
    role: "Human Verification",
    shortDesc: "World ID helps verify unique-human participation and reduce duplicate claims.",
    fullDesc:
      "Leveraging World ID's privacy-preserving Zero-Knowledge proofs (ZKPs), FairDrop verifies each attendee is an authentic, unique human without revealing their legal identity, phone number, or email. The cryptographic nullifier hash guarantees exactly one claim per person per event.",
    status: "In Development",
    statusColor: "amber",
    phase: "Phase 1 (Active Milestone)",
    docsUrl: "https://docs.world.org/world-id",
    features: [
      "Zero-Knowledge Proof of Personhood",
      "Orb & Device Verification Tiers",
      "Event-Scoped Nullifier Uniqueness",
      "No Personal Data Stored or Leaked",
    ],
  },
  {
    id: "arkiv",
    name: "Arkiv",
    role: "Decentralized Records",
    shortDesc: "Arkiv provides queryable records for events, allocations and ticket marketplace activity.",
    fullDesc:
      "Arkiv serves as the verifiable data tier for event metadata, verifiable ticket allocations, and audit trails. By maintaining cryptographic records off-chain with deterministic indexing, attendees and organizers can independently audit fair distribution without expensive L1 state bloat.",
    status: "Planned",
    statusColor: "indigo",
    phase: "Phase 2 (Next Milestone)",
    docsUrl: "https://arkiv.network",
    features: [
      "Verifiable Event Registry",
      "Queryable Allocation Log",
      "Secondary Resale Audit Trail",
      "Cryptographic Merkle Proofs",
    ],
  },
  {
    id: "arc",
    name: "Arc",
    role: "Payments and Settlement",
    shortDesc: "Arc enables USDC payments and programmable ticket resale settlement.",
    fullDesc:
      "Arc coordinates the settlement layer using native USDC payment rails. Smart contracts enforce organizer-set price caps (e.g. maximum 10% above face value), automatic royalty routing to artists/venues, and atomic ticket transfers when a resale transaction occurs.",
    status: "Planned",
    statusColor: "violet",
    phase: "Phase 3 (Subsequent Milestone)",
    docsUrl: "https://arc.market",
    features: [
      "Native USDC Programmable Escrow",
      "Hardcoded Anti-Scalping Price Ceilings",
      "Automated Artist / Organizer Royalties",
      "Atomic Ownership Transfer on Settlement",
    ],
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Discover Events",
    description: "Browse upcoming concerts, festivals, conferences and exclusive events curated for verified human audiences.",
    tagline: "Explore Curated Lineups",
    detail: "Every listed event establishes a hard cap on ticket capacity, pricing transparency, and resale parameters before allocation begins.",
  },
  {
    step: "02",
    title: "Verify Your Humanity",
    description: "Use World ID to prove unique-human eligibility without disclosing your legal identity, credit card, or biometrics.",
    tagline: "Zero-Knowledge Sybil Defense",
    detail: "World ID generates an event-scoped cryptographic nullifier. The FairDrop protocol verifies this proof on the backend to enforce one registration per person.",
  },
  {
    step: "03",
    title: "Get Your Fair Chance",
    description: "Participate in a transparent ticket allocation process where bots, multi-account farms, and automated scripts cannot enter.",
    tagline: "Verifiable Queue & Draw",
    detail: "Every participant has an identical mathematical chance. No VIP scalper allotments, backdoors, or predatory speed-sniping.",
  },
  {
    step: "04",
    title: "Own Your Ticket",
    description: "Purchase using USDC and manage your ticket through blockchain-based ownership with smart-contract-controlled fair resale.",
    tagline: "Cryptographic Asset Ownership",
    detail: "Your ticket lives in your wallet. If you can't make it, resell it legally on FairDrop's secondary market under strict anti-scalping price caps.",
  },
];

export const TRUST_BENEFITS = [
  {
    title: "Unique-Human Verification",
    short: "Privacy-Preserving ZKPs",
    description:
      "World ID verifies you are a real, individual person without ever learning your name, email, or government credentials. Bots and multi-account botnets are mathematically barred.",
    bulletPoints: [
      "Zero personal identity storage",
      "Event-scoped nullifier isolation",
      "Resistant to AI & script automation",
    ],
  },
  {
    title: "Transparent Allocation",
    short: "Auditable Randomness",
    description:
      "Traditional ticketing keeps allocations behind a black curtain. FairDrop makes the claim ledger verifiable, ensuring every attendee gets an honest, equal shot.",
    bulletPoints: [
      "Open distribution mechanics",
      "No secret VIP or broker reserves",
      "Publicly verifiable claim lists",
    ],
  },
  {
    title: "Verifiable Ticket Ownership",
    short: "Non-Duplicable Passes",
    description:
      "Say goodbye to fake PDF barcodes and duplicate screenshot scams. Tickets are cryptographically signed on-chain and directly controlled by your personal Web3 wallet.",
    bulletPoints: [
      "Cryptographic validity guarantee",
      "Impossible to double-sell or forge",
      "Instant on-chain check-in verification",
    ],
  },
  {
    title: "Controlled Secondary Resale",
    short: "Anti-Scalper Smart Contracts",
    description:
      "Life happens and plans change. If you cannot attend, list your ticket on FairDrop's secondary market where smart contracts cap resale prices to eradicate exploitative scalping.",
    bulletPoints: [
      "Hardcoded price ceilings (e.g. max +10%)",
      "Verified human-to-human transfers only",
      "Automated artist & venue royalty routing",
    ],
  },
];
