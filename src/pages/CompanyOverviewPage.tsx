import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Sidebar from "@/components/Sidebar";
import { 
  ExternalLink, 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  Trophy, 
  DollarSign,
  Target,
  BarChart3,
  Briefcase,
  Globe,
  Award,
  TrendingUp,
  AlertTriangle,
  Star,
  Lightbulb,
  Building,
  Code2,
  CreditCard,
  Check,
  MessageSquare,
  Share2,
  Search,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube
} from "lucide-react";
import { CompetitorLogo } from "@/components/CompetitorLogo";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

interface CompanyOverview {
  companyName: string;
  companyURL: string;
  companyLogo: string;
  tagline: string;
  oneLiner: string;
  founders: Array<{ name: string; linkedin: string }>;
  foundedYear: string | number;
  headcount: string | number;
  hqLocation: string;
  serviceLocations: string[];
  funding: string;
  lastValuation: string;
  majorMilestones: string[];
  businessModel: string;
  revenueModel: string;
  targetMarket: {
    segments: string[];
    geography: string[];
    customerSize: string;
  };
  productAndPricing: {
    keyFeatures: string[];
    uniqueValueProposition: string;
    businessModel: {
      type: string;
      description: string;
    };
    pricingTiers: Array<{
      name: string;
      price: string;
      features: string[];
      targetAudience: string;
    }>;
    techStack: string[];
    platforms: string[];
  };
  competitiveAdvantages: string[];
  partnerships: string[];
  awards: string[];
  marketPosition: string;
  growthStrategy: string;
  marketingInsights: {
    brandMessage: string;
    brandTone: string[];
    uniqueValueProposition: string;
    websiteTraffic: {
      monthlyVisitors: string;
      topSources: Array<{
        source: string;
        percentage: string;
      }>;
    };
    marketingChannels: string[];
    targetAudience: Array<{
      persona: string;
      description: string;
      goals: string[];
    }>;
    seoKeywords: Array<{
      keyword: string;
      volume: string;
      difficulty: string;
    }>;
    competitors?: Array<{
      name: string;
      website: string;
    }>;
  };
  socialAccounts?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

// Helper to get domain from a URL
function getDomainFromUrl(url: string) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return '';
  }
}

const CompanyOverviewPage = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productPricingLoading, setProductPricingLoading] = useState(false);
  const [marketingInsightsLoading, setMarketingInsightsLoading] = useState(false);
  const [competitorInfo, setCompetitorInfo] = useState<{
    name: string;
    website: string;
    logo: string;
  } | null>(null);

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    setError("");
    setAnalysisData(null);
    
    const fetchFromDb = async () => {
      try {
        const docRef = doc(db, "savedAnalysis", docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Set competitor info
          if (data.competitor) {
            setCompetitorInfo({
              name: data.competitor.name || "",
              website: data.competitor.website || "",
              logo: data.competitor.logo || ""
            });
          } else if (data.competitorName) {
            // Handle legacy data structure
            setCompetitorInfo({
              name: data.competitorName || "",
              website: data.competitorURL || "",
              logo: data.competitorLogo || ""
            });
          }

          // Set analysis data
          if (data.analysisJson?.companyOverview) {
            setAnalysisData(data.analysisJson.companyOverview);
          } else if (data.overview) {
            setAnalysisData(data.overview);
          }
        } else {
          setError("Analysis not found.");
        }
      } catch (e) {
        console.error("Error fetching analysis:", e);
        setError("Failed to load analysis from database.");
      }
      setLoading(false);
    };
    
    fetchFromDb();
  }, [docId]);

  // Function to fetch product pricing data
  const fetchProductPricing = async () => {
    if (!competitorInfo?.name || !competitorInfo?.website || !docId) return;
    
    setProductPricingLoading(true);
    try {
      // First check if we already have the data in savedAnalysis
      const analysisRef = doc(db, "savedAnalysis", docId);
      const analysisSnap = await getDoc(analysisRef);
      
      if (analysisSnap.exists() && analysisSnap.data()?.productAndPricing) {
        // If we have existing data, use it
        setAnalysisData(prevData => ({
          ...prevData,
          productAndPricing: analysisSnap.data().productAndPricing
        }));
        setProductPricingLoading(false);
        return;
      }

      // If no existing data, get the product pricing prompt
      const promptRef = doc(db, "prompts", "fetchProductPricing");
      const promptSnap = await getDoc(promptRef);
      
      if (!promptSnap.exists()) {
        throw new Error("Product pricing prompt not found.");
      }

      const promptTemplate = promptSnap.data().prompt;
      const systemPrompt = promptTemplate
        .replace("{companyName}", competitorInfo.name)
        .replace("{companyURL}", competitorInfo.website);

      // Make the API request
      const response = await fetch("/api/ask-gpt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          messages: [{ 
            role: "system", 
            content: systemPrompt 
          }],
          temperature: 0.7,
          model: "gpt-4-turbo-preview"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error("No content in API response");
      }

      // Parse and validate the response
      let productData;
      try {
        productData = JSON.parse(data.content);
        
        // Update state with new data
        setAnalysisData(prevData => ({
          ...prevData,
          productAndPricing: productData.productAndPricing
        }));

        // Store the data in Firestore
        await updateDoc(analysisRef, {
          productAndPricing: productData.productAndPricing,
          lastUpdated: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Product & pricing analysis has been generated and saved.",
        });

      } catch (parseError) {
        console.error("Failed to parse product data:", data.content);
        throw new Error("Failed to parse product data");
      }
    } catch (error) {
      console.error("Error fetching product pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load product & pricing information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProductPricingLoading(false);
    }
  };

  // Function to fetch marketing insights
  const fetchMarketingInsights = async () => {
    if (!competitorInfo?.name || !competitorInfo?.website || !docId) return;
    
    setMarketingInsightsLoading(true);
    try {
      // First check if we already have the data in savedAnalysis
      const analysisRef = doc(db, "savedAnalysis", docId);
      const analysisSnap = await getDoc(analysisRef);
      
      if (analysisSnap.exists() && analysisSnap.data()?.marketingInsights) {
        const existingData = analysisSnap.data().marketingInsights;
        if (
          existingData.brandMessage &&
          existingData.brandTone &&
          existingData.uniqueValueProposition &&
          existingData.websiteTraffic &&
          existingData.marketingChannels &&
          existingData.targetAudience &&
          existingData.seoKeywords
        ) {
          // If we have complete existing data, use it
          setAnalysisData(prevData => ({
            ...prevData,
            marketingInsights: existingData
          }));
          setMarketingInsightsLoading(false);
          return;
        }
      }

      // If no existing data or incomplete data, get the marketing insights prompt
      const promptRef = doc(db, "prompts", "fetchMarketingInsights");
      const promptSnap = await getDoc(promptRef);
      
      if (!promptSnap.exists()) {
        throw new Error("Marketing insights prompt not found.");
      }

      const promptTemplate = promptSnap.data().prompt;
      const systemPrompt = promptTemplate
        .replace("{companyName}", competitorInfo.name)
        .replace("{companyURL}", competitorInfo.website);

      // Make the API request
      const response = await fetch("/api/ask-gpt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          messages: [{ 
            role: "system", 
            content: systemPrompt 
          }],
          temperature: 0.7,
          model: "gpt-4-turbo-preview"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error("No content in API response");
      }

      // Parse and validate the response
      try {
        // Remove any potential markdown formatting or extra text
        const cleanedContent = data.content.replace(/```json\n?|\n?```/g, '').trim();
        const marketingData = JSON.parse(cleanedContent);
        
        // Validate the required fields
        const insights = marketingData.marketingInsights;
        if (!insights || 
            !insights.brandMessage ||
            !Array.isArray(insights.brandTone) ||
            !insights.uniqueValueProposition ||
            !insights.websiteTraffic ||
            !Array.isArray(insights.marketingChannels) ||
            !Array.isArray(insights.targetAudience) ||
            !Array.isArray(insights.seoKeywords)) {
          throw new Error("Invalid marketing insights data structure");
        }

        // Update state with new data
        setAnalysisData(prevData => ({
          ...prevData,
          marketingInsights: insights
        }));

        // Store the data in Firestore
        await updateDoc(analysisRef, {
          marketingInsights: insights,
          lastUpdated: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Marketing insights have been generated and saved.",
        });

      } catch (parseError) {
        console.error("Failed to parse marketing data:", data.content);
        throw new Error("Failed to parse marketing data. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching marketing insights:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load marketing insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMarketingInsightsLoading(false);
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-background">
      <Sidebar />
        <main className="pl-64">
          <div className="container mx-auto p-8">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading company overview...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
          <div className="container mx-auto p-8">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center text-destructive">{error}</div>
            </div>
          </div>
        </main>
        </div>
    );
  }

  const handleVisitWebsite = () => {
    // Get the competitor's URL from the competitor info
    const websiteUrl = competitorInfo?.website;
    
    if (websiteUrl) {
      const url = websiteUrl.startsWith('http') 
        ? websiteUrl 
        : `https://${websiteUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="container mx-auto p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shadow flex items-center justify-center">
                  <CompetitorLogo 
                    url={competitorInfo?.website || ''} 
                    name={competitorInfo?.name || ''} 
                      />
                    </div>
                    <div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    {competitorInfo?.name || 'Company Analysis'}
                  </h1>
                  {analysisData?.oneLiner && (
                    <p className="text-slate-600 mt-2">{analysisData.oneLiner}</p>
                  )}
                  {competitorInfo?.website && (
                    <button
                      onClick={() => {
                        const url = competitorInfo.website.startsWith('http') 
                          ? competitorInfo.website 
                          : `https://${competitorInfo.website}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mt-2"
                    >
                      Visit Website <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Alert if needed */}
            {(!analysisData || Object.keys(analysisData).length === 0) && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Unable to fetch company information. The provided URL might be incorrect or the company data is unavailable.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="w-full" onValueChange={(value) => {
            if (value === "product") {
              fetchProductPricing();
            } else if (value === "market") {
              fetchMarketingInsights();
            }
          }}>
            <TabsList className="w-full justify-start mb-6 bg-muted/50 p-1">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="market" className="flex-1">Marketing Insights</TabsTrigger>
              <TabsTrigger value="product" className="flex-1">Product & Pricing</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{analysisData?.oneLiner}</p>
                  </CardContent>
                </Card>

                {/* Key Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Key Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Founded</span>
                        </div>
                        <p className="text-foreground">{analysisData?.foundedYear || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">Employees</span>
                        </div>
                        <p className="text-foreground">{analysisData?.headcount || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">Headquarters</span>
                        </div>
                        <p className="text-foreground">{analysisData?.hqLocation || 'N/A'}</p>
                      </div>
                    </div>
                    {analysisData?.serviceLocations && analysisData.serviceLocations.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Service Locations</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.serviceLocations.map((location, idx) => (
                            <Badge key={idx} variant="secondary">{location}</Badge>
                          ))}
                  </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Funding & Valuation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Funding & Valuation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-medium">Total Funding</span>
                      </div>
                      <p className="text-foreground">{analysisData?.funding || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-medium">Last Valuation</span>
                      </div>
                      <p className="text-foreground">{analysisData?.lastValuation || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Major Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Major Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisData?.majorMilestones?.map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1 flex-shrink-0">
                            {idx + 1}
                          </Badge>
                          <p className="text-muted-foreground">{milestone}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

                {/* Founders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Founders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisData?.founders?.map((founder, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{founder.name}</span>
                          {founder.linkedin && (
                            <a
                              href={founder.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                          >
                              <Linkedin className="h-4 w-4" />
                          </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media Accounts */}
                {analysisData?.socialAccounts && (
                <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Social Media
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-3">
                        {analysisData.socialAccounts.linkedin && (
                          <a
                            href={analysisData.socialAccounts.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                            <span>LinkedIn</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </a>
                        )}
                        {analysisData.socialAccounts.twitter && (
                          <a
                            href={analysisData.socialAccounts.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                          >
                            <Twitter className="h-5 w-5" />
                            <span>Twitter</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </a>
                        )}
                        {analysisData.socialAccounts.facebook && (
                          <a
                            href={analysisData.socialAccounts.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                          >
                            <Facebook className="h-5 w-5" />
                            <span>Facebook</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </a>
                        )}
                        {analysisData.socialAccounts.instagram && (
                          <a
                            href={analysisData.socialAccounts.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                          >
                            <Instagram className="h-5 w-5" />
                            <span>Instagram</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </a>
                        )}
                        {analysisData.socialAccounts.youtube && (
                          <a
                            href={analysisData.socialAccounts.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                          >
                            <Youtube className="h-5 w-5" />
                            <span>YouTube</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Marketing Insights Tab (formerly Market Position) */}
            <TabsContent value="market" className="mt-6">
              {marketingInsightsLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading marketing insights...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Message & Tone */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Brand Voice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Brand Message</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {analysisData?.marketingInsights?.brandMessage}
                        </p>
                      </div>
                      {analysisData?.marketingInsights?.brandTone && (
                        <div>
                          <h4 className="font-medium mb-2">Brand Tone</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisData.marketingInsights.brandTone.map((tone, idx) => (
                              <Badge key={idx} variant="secondary">{tone}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Unique Value Proposition */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Value Proposition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {analysisData?.marketingInsights?.uniqueValueProposition}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Website Traffic */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Website Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Monthly Traffic</h4>
                        <p className="text-2xl font-bold text-primary">
                          {analysisData?.marketingInsights?.websiteTraffic?.monthlyVisitors}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Top Traffic Sources</h4>
                        <div className="space-y-2">
                          {analysisData?.marketingInsights?.websiteTraffic?.topSources.map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-muted-foreground">{source.source}</span>
                              <Badge variant="outline">{source.percentage}</Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                  {/* Marketing Channels */}
                  <Card>
                <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Marketing Channels
                      </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                        {analysisData?.marketingInsights?.marketingChannels.map((channel, idx) => (
                          <Badge key={idx} variant="secondary">{channel}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

                  {/* Target Audience */}
                  <Card className="md:col-span-2">
                <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Target Audience
                      </CardTitle>
                </CardHeader>
                <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData?.marketingInsights?.targetAudience.map((audience, idx) => (
                          <div key={idx} className="border rounded-lg p-4 space-y-4">
                    <div>
                              <h3 className="font-semibold text-lg">{audience.persona}</h3>
                              <p className="text-muted-foreground text-sm mt-1">{audience.description}</p>
                    </div>
                    <div>
                              <h4 className="font-medium text-sm mb-2">Goals</h4>
                              <div className="space-y-2">
                                {audience.goals.map((goal, goalIdx) => (
                                  <div key={goalIdx} className="flex items-start gap-2">
                                    <Target className="h-4 w-4 text-primary mt-1" />
                                    <span className="text-sm text-muted-foreground">{goal}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SEO Keywords */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Top SEO Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">Keyword</th>
                              <th className="text-right py-2 font-medium">Search Volume</th>
                              <th className="text-right py-2 font-medium">Difficulty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisData?.marketingInsights?.seoKeywords.map((keyword, idx) => (
                              <tr key={idx} className="border-b last:border-0">
                                <td className="py-2">{keyword.keyword}</td>
                                <td className="text-right py-2">{keyword.volume}</td>
                                <td className="text-right py-2">
                                  <Badge variant="outline">{keyword.difficulty}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Competitors */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Competitors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {analysisData?.marketingInsights?.competitors?.map((competitor, idx) => (
                          <a 
                            key={idx} 
                            href={competitor.website?.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50">
                                  <CompetitorLogo 
                                    url={competitor.website} 
                                    name={competitor.name} 
                                  />
                                </div>
                                <h3 className="font-medium text-sm mb-1">{competitor.name}</h3>
                                <p className="text-xs text-muted-foreground">{getDomainFromUrl(competitor.website)}</p>
                              </CardContent>
                            </Card>
                          </a>
                        ))}
                    </div>
                    </CardContent>
                  </Card>
                    </div>
              )}
            </TabsContent>

            {/* Product & Pricing Tab */}
            <TabsContent value="product" className="mt-6">
              {productPricingLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading product & pricing information...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Key Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisData?.productAndPricing?.keyFeatures?.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-1 flex-shrink-0">
                              {idx + 1}
                            </Badge>
                            <p className="text-muted-foreground">{feature}</p>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>

                  {/* Unique Value Proposition */}
              <Card>
                <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Unique Value Proposition
                      </CardTitle>
                </CardHeader>
                <CardContent>
                      <p className="text-muted-foreground">
                        {analysisData?.productAndPricing?.uniqueValueProposition}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Business Model */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Business Model
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="font-medium">Type: </span>
                        <Badge variant="secondary">
                          {analysisData?.productAndPricing?.businessModel?.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {analysisData?.productAndPricing?.businessModel?.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Tech Stack & Platforms */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5" />
                        Technology
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                        <h4 className="font-medium mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData?.productAndPricing?.techStack?.map((tech, idx) => (
                            <Badge key={idx} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Available Platforms</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData?.productAndPricing?.platforms?.map((platform, idx) => (
                            <Badge key={idx} variant="secondary">
                              {platform}
                            </Badge>
                    ))}
                        </div>
                  </div>
                </CardContent>
              </Card>

                  {/* Pricing Tiers */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Pricing Tiers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {analysisData?.productAndPricing?.pricingTiers?.map((tier, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 space-y-4 hover:border-primary/50 transition-colors"
                >
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">{tier.name}</h3>
                              <div className="text-2xl font-bold text-primary">
                                {tier.price}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {tier.targetAudience}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {tier.features.map((feature, featureIdx) => (
                                <div key={featureIdx} className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
              </div>
              </CardContent>
            </Card>
                </div>
          )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CompanyOverviewPage; 