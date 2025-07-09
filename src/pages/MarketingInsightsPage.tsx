import { useState, useEffect, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { ExternalLink, TrendingUp, Users, Globe, MessageSquare } from "lucide-react";
import { CompetitorLogo } from "@/components/CompetitorLogo";
import { extractJsonFromString } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AnalysisData {
  brandMessaging?: {
    tagline?: string;
    uniqueValueProposition?: string;
    brandTone?: string[];
  };
  websiteTraffic?: {
    monthly?: string;
    growth?: string;
    sources?: Record<string, string>;
  };
  marketingChannels?: string[];
  seoStrategy?: {
    targetedKeywords?: Array<{
      keyword: string;
      volume: string;
      difficulty: string;
    }>;
  };
  targetAudience?: {
    personas?: Array<{
      role: string;
      goals: string[];
      painPoints: string[];
    }>;
    buyers?: string[];
    users?: string[];
    companyTypes?: string[];
    companySize?: string;
  };
  competitors?: Array<{
    name: string;
    website: string;
    strengthsVsTarget?: string[];
  }>;
  socialChannels?: Record<string, string>;
}

const MarketingInsightsPage = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    setError("");
    setAnalysisData(null);
    
    const fetchFromDb = async () => {
      try {
        // First get the saved analysis to get company details
        const analysisRef = doc(db, "savedAnalysis", docId);
        const analysisSnap = await getDoc(analysisRef);
        
        if (!analysisSnap.exists()) {
          throw new Error("Analysis not found.");
        }

        const analysisData = analysisSnap.data();
        const companyName = analysisData.competitor?.name;
        const companyURL = analysisData.competitor?.website;

        if (!companyName || !companyURL) {
          throw new Error("Missing company information.");
        }

        // Get the marketing insights prompt
        const promptRef = doc(db, "prompts", "fetchMarketingInsights");
        const promptSnap = await getDoc(promptRef);
        
        if (!promptSnap.exists()) {
          throw new Error("Marketing insights prompt not found.");
        }

        const promptTemplate = promptSnap.data().prompt;
        const systemPrompt = promptTemplate
          .replace("{companyName}", companyName)
          .replace("{companyURL}", companyURL);

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
        let insights;
        try {
          insights = JSON.parse(data.content);
          setAnalysisData(insights);
        } catch (parseError) {
          console.error("Failed to parse insights:", data.content);
          throw new Error("Failed to parse marketing insights data");
        }

      } catch (e) {
        console.error("Error fetching marketing insights:", e);
        setError(e instanceof Error ? e.message : "Failed to load marketing insights.");
      }
      setLoading(false);
    };
    
    fetchFromDb();
  }, [docId]);

  // Update the renderPieLabel to avoid cropping and use a smaller font size, and clamp label positions within the pie chart bounds
  const renderPieLabel = ({ name = '', value = 0, cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, index = 0, ...rest }: {
    name?: string;
    value?: number;
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    index?: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.8;
    let x = cx + radius * Math.cos(-midAngle * RADIAN);
    let y = cy + radius * Math.sin(-midAngle * RADIAN);
    // Clamp x/y to stay within the pie chart bounds
    const minX = cx - outerRadius + 20;
    const maxX = cx + outerRadius - 20;
    const minY = cy - outerRadius + 16;
    const maxY = cy + outerRadius - 16;
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));
    return (
      <text
        x={x}
        y={y}
        fill="#334155"
        fontSize="11"
        fontWeight="400"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ pointerEvents: 'none' }}
      >
        {`${String(name).charAt(0).toUpperCase() + String(name).slice(1)}: ${value}%`}
      </text>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900">Marketing Insights</h1>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/analysis/${docId}`)}
                className="flex items-center gap-2"
              >
                Back to Overview
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/analysis/${docId}/product`)}
                className="flex items-center gap-2"
              >
                Product & Pricing
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {loading && <div className="text-center text-slate-600 text-lg">Loading analysis...</div>}
          {error && <div className="text-center text-red-600 text-lg">{error}</div>}
          {!loading && !error && analysisData && (
            <>
              {/* Brand Messaging */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Brand Messaging</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tagline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium text-slate-700">{analysisData.brandMessaging?.tagline}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Value Proposition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{analysisData.brandMessaging?.uniqueValueProposition}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Brand Tone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.brandMessaging?.brandTone.map((tone: string) => (
                          <Badge key={tone}>{tone}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Traffic & Channels */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Traffic & Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Website Traffic + Pie Chart (move to left) */}
                    <div className="flex-1 w-full order-1 md:order-1">
                      <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        {analysisData.websiteTraffic?.monthly}
                        {analysisData.websiteTraffic?.growth && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">
                            {analysisData.websiteTraffic.growth}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 mb-4">Monthly Visits</div>
                      <div className="w-full md:w-56 h-56 mx-auto">
                        {analysisData.websiteTraffic?.sources && (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={Object.entries(analysisData.websiteTraffic.sources).map(([name, value]) => ({ name, value: parseFloat(value) }))}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={renderPieLabel}
                                labelLine={false}
                              >
                                {Object.entries(analysisData.websiteTraffic.sources).map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={["#6366f1", "#818cf8", "#a5b4fc", "#fbbf24", "#f472b6"][idx % 5]} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                    {/* Marketing Channels (move to right) */}
                    <div className="flex-1 w-full order-2 md:order-2 flex flex-col items-start justify-start">
                      <div className="mb-2 text-lg font-semibold text-slate-900">Marketing Channels</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(analysisData.marketingChannels) && analysisData.marketingChannels.length > 0 ? (
                          analysisData.marketingChannels.map((channel: string) => (
                            <span key={channel} className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-700 whitespace-nowrap">{channel}</span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">No marketing channels available</span>
                        )}
                      </div>
                      {/* Social Accounts */}
                      {analysisData.socialChannels && (
                        <div className="mt-2 space-y-1">
                          <div className="font-medium text-slate-900 mb-1">Social Accounts</div>
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(analysisData.socialChannels).map(([platform, url]) => (
                              url ? (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"
                                >
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Strategy */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">SEO Strategy</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Targeted Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="font-semibold mb-2">Targeted Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(analysisData.seoStrategy?.targetedKeywords) && analysisData.seoStrategy.targetedKeywords.length > 0 ? (
                          analysisData.seoStrategy.targetedKeywords.slice(0, 6).map((kw: any, idx: number) => (
                            <span key={kw.keyword + idx} className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-700 flex items-center gap-2">
                              {kw.keyword}
                              {kw.volume && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{kw.volume}</span>}
                              {kw.difficulty && <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{kw.difficulty}</span>}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">No keyword data available</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Target Audience */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Target Audience</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Buyer Personas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.isArray(analysisData.targetAudience?.personas) && analysisData.targetAudience.personas.length > 0 && (
                          analysisData.targetAudience.personas.slice(0, 2).map((persona, idx) => (
                            <Card key={persona.role + idx} className="mb-4">
                              <CardContent>
                                <div className="font-semibold text-slate-900 mb-2">{persona.role}</div>
                                <div className="mb-1 text-slate-700 font-medium">Goals:</div>
                                <ul className="mb-2 ml-4 list-disc text-slate-700 text-sm">
                                  {persona.goals.map((goal: string, i: number) => (
                                    <li key={i}>{goal}</li>
                                  ))}
                                </ul>
                                <div className="mb-1 text-slate-700 font-medium">Pain Points:</div>
                                <ul className="ml-4 list-disc text-slate-700 text-sm">
                                  {persona.painPoints.map((pain: string, i: number) => (
                                    <li key={i}>{pain}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Target Companies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Company Types:</p>
                            <div className="flex flex-wrap gap-2">
                              {analysisData.targetAudience?.companyTypes.map((type: string) => (
                                <Badge key={type} variant="outline">{type}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Company Size:</p>
                            <p className="font-medium">{analysisData.targetAudience?.companySize}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Stakeholders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Buyers:</p>
                            <div className="flex flex-wrap gap-2">
                              {analysisData.targetAudience?.buyers.map((buyer: string) => (
                                <Badge key={buyer}>{buyer}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Users:</p>
                            <div className="flex flex-wrap gap-2">
                              {analysisData.targetAudience?.users.map((user: string) => (
                                <Badge key={user} variant="outline">{user}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Competitors */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Top Competitors</h2>
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {Array.isArray(analysisData.competitors) && analysisData.competitors.length > 0 ? (
                    analysisData.competitors.slice(0, 5).map((competitor: any) => (
                      <Card key={competitor.name} className="min-w-[260px] max-w-xs flex-shrink-0">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                              <CompetitorLogo 
                                url={competitor.website} 
                                name={competitor.name} 
                              />
                            </div>
                            <div>
                              <p className="font-medium">{competitor.name}</p>
                              <a 
                                href={competitor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {competitor.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {Array.isArray(competitor.strengthsVsTarget) && competitor.strengthsVsTarget.length > 0 && (
                              competitor.strengthsVsTarget.map((strength: string) => (
                                <p key={strength} className="text-sm text-slate-600">• {strength}</p>
                              ))
                            )}
                          </div>
                          <div className="mt-3">
                            <a
                              href={competitor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 text-xs"
                            >
                              Analyse
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">No competitor data available</span>
                  )}
                </div>
              </section>

              {/* Next Page CTA */}
              <div className="mt-8 flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate(`/analysis/${docId}/product`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  View Product & Pricing
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MarketingInsightsPage; 