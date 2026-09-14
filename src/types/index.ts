export type PropertyStatus = "for_sale" | "coming_soon" | "sold" | "reserved";

export type PropertyType =
  | "lagenhet"
  | "villa"
  | "radhus"
  | "parhus"
  | "fritidshus"
  | "tomt"
  | "gard";

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
  order: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  address: string;
  city: string;
  area: string;
  zipCode: string;
  price: number;
  pricePerSqm?: number;
  finalPrice?: number;
  status: PropertyStatus;
  type: PropertyType;
  rooms: number;
  livingArea: number;
  plotArea?: number;
  yearBuilt?: number;
  floor?: number;
  totalFloors?: number;
  monthlyFee?: number;
  operatingCost?: number;
  energyClass?: string;
  description: string;
  shortDescription: string;
  features: string[];
  images: PropertyImage[];
  videoUrl?: string;
  floorPlanUrl?: string;
  matterportUrl?: string;
  latitude: number;
  longitude: number;
  viewingDates?: string[];
  bidStatus?: string;
  brokerId: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  preferredAreas: string[];
  budgetMin?: number;
  budgetMax?: number;
  propertyTypes: PropertyType[];
  familySituation?: string;
  buyProbability: number;
  sellProbability: number;
  notes: string;
  source: string;
  lastContactAt?: string;
  createdAt: string;
  tags: string[];
}

export interface Meeting {
  id: string;
  title: string;
  type: "valuation" | "viewing" | "consultation" | "signing" | "photo" | "other";
  customerId?: string;
  propertyId?: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  interest: "buy" | "sell" | "both" | "unknown";
  score: number;
  status: "new" | "contacted" | "qualified" | "meeting_booked" | "converted" | "lost";
  createdAt: string;
  assignedTo?: string;
}

export interface DashboardStats {
  todayMeetings: number;
  newLeads: number;
  activeDeals: number;
  upcomingViewings: number;
  monthlyRevenue: number;
  conversionRate: number;
  totalListings: number;
  soldThisMonth: number;
}

export interface AIRecommendation {
  id: string;
  type: "call" | "email" | "price" | "marketing" | "followup" | "priority";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  relatedCustomerId?: string;
  relatedPropertyId?: string;
  createdAt: string;
}
