import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { ExternalLink, Settings, DollarSign, Users, Box, Layers } from "lucide-react";
import { extractJsonFromString } from "@/lib/utils";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BusinessMetrics {
  revenue?: string;
  growth?: string;
  customers?: string;
  retention?: string;
  churn?: string;
  ltv?: string;
}

interface BusinessModel {
  pricingTiers?: Array<{
    name: string;
    price: string;
    billing: string;
    features: string[];
  }>;
  salesModel?: string;
  distributionChannels?: string[];
  paymentOptions?: string[];
  metrics?: BusinessMetrics;
}

interface ProductPricingData {
  product?: {
    keyFeatures?: string[];
    useCases?: string[];
    techStack?: string[];
    platforms?: string[];
    type?: string;
    category?: string;
    roadmap?: {
      upcoming?: string[];
      recent?: string[];
    };
  };
  businessModel?: BusinessModel;
}

const ProductPricingPage = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<ProductPricingData | null>(null);
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

        // Get the product pricing prompt
        const promptRef = doc(db, "prompts", "fetchProductPricing");
        const promptSnap = await getDoc(promptRef);
        
        if (!promptSnap.exists()) {
          throw new Error("Product pricing prompt not found.");
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
        let pricing;
        try {
          pricing = JSON.parse(data.content);
          setAnalysisData(pricing);
        } catch (parseError) {
          console.error("Failed to parse pricing:", data.content);
          throw new Error("Failed to parse product pricing data");
        }

      } catch (e) {
        console.error("Error fetching product pricing:", e);
        setError(e instanceof Error ? e.message : "Failed to load product pricing.");
      }
      setLoading(false);
    };
    
    fetchFromDb();
  }, [docId]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900">Product & Pricing</h1>
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
                onClick={() => navigate(`/analysis/${docId}/marketing`)}
                className="flex items-center gap-2"
              >
                Marketing Insights
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {loading && <div className="text-center text-slate-600 text-lg">Loading analysis...</div>}
          {error && <div className="text-center text-red-600 text-lg">{error}</div>}
          {!loading && analysisData && (
            <>
              {/* Product Overview */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Product Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.isArray(analysisData.product?.keyFeatures) && analysisData.product.keyFeatures.length > 0 ? (
                          analysisData.product.keyFeatures.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 mt-2 bg-primary rounded-full"></div>
                              <span className="text-slate-700">{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">No data available</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Use Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.isArray(analysisData.product?.useCases) && analysisData.product.useCases.length > 0 ? (
                          analysisData.product.useCases.map((useCase: string) => (
                            <li key={useCase} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 mt-2 bg-primary rounded-full"></div>
                              <span className="text-slate-700">{useCase}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">No data available</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Product Details */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Product Details</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tech Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(analysisData.product?.techStack) && analysisData.product.techStack.length > 0 ? (
                          analysisData.product.techStack.map((tech: string) => (
                            <Badge key={tech} variant="outline">{tech}</Badge>
                          ))
                        ) : (
                          <li className="text-slate-400">No data available</li>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Platforms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(analysisData.product?.platforms) && analysisData.product.platforms.length > 0 ? (
                          analysisData.product.platforms.map((platform: string) => (
                            <Badge key={platform}>{platform}</Badge>
                          ))
                        ) : (
                          <li className="text-slate-400">No data available</li>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Classification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600">Type:</p>
                          <p className="font-medium">{analysisData.product?.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Category:</p>
                          <p className="font-medium">{analysisData.product?.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Pricing Tiers */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Pricing Tiers</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {Array.isArray(analysisData.businessModel?.pricingTiers) && analysisData.businessModel.pricingTiers.length > 0 ? (
                    analysisData.businessModel.pricingTiers.map((tier: any) => (
                      <Card key={tier.name}>
                        <CardHeader>
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-3xl font-bold text-slate-900">{tier.price}</p>
                              <p className="text-sm text-slate-500">{tier.billing}</p>
                            </div>
                            <ul className="space-y-2">
                              {Array.isArray(tier.features) && tier.features.length > 0 ? (
                                tier.features.map((feature: string) => (
                                  <li key={feature} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 mt-1.5 bg-green-500 rounded-full"></div>
                                    <span>{feature}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-400">No data available</li>
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <li className="text-slate-400">No data available</li>
                  )}
                </div>
              </section>

              {/* Business Model */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Business Model</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sales & Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-600">Sales Model:</p>
                          <p className="font-medium">{analysisData.businessModel?.salesModel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Distribution Channels:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(analysisData.businessModel?.distributionChannels) && analysisData.businessModel.distributionChannels.length > 0 ? (
                              analysisData.businessModel.distributionChannels.map((channel: string) => (
                                <Badge key={channel} variant="outline">{channel}</Badge>
                              ))
                            ) : (
                              <li className="text-slate-400">No data available</li>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Payment Options:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(analysisData.businessModel?.paymentOptions) && analysisData.businessModel.paymentOptions.length > 0 ? (
                              analysisData.businessModel.paymentOptions.map((option: string) => (
                                <Badge key={option}>{option}</Badge>
                              ))
                            ) : (
                              <li className="text-slate-400">No data available</li>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-600">Paying Customers:</p>
                          <p className="text-2xl font-bold text-slate-900">{analysisData.metrics?.payingCustomers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Estimated Revenue:</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-slate-900">{analysisData.metrics?.estimatedRevenue}</p>
                            {analysisData.metrics?.revenueGrowth && (
                              <Badge variant={
                                parseFloat(analysisData.metrics.revenueGrowth) > 0 ? "default" : "destructive"
                              }>
                                {analysisData.metrics.revenueGrowth}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Customer Growth:</p>
                          <p className="font-medium text-green-600">{analysisData.metrics?.customerGrowth}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Business Metrics */}
              {(() => {
                const businessModel = analysisData.businessModel;
                return businessModel?.metrics && (
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Business Metrics</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      {businessModel.metrics.revenue && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Revenue</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{businessModel.metrics.revenue}</p>
                            {businessModel.metrics.growth && (
                              <p className="text-sm text-green-600">{businessModel.metrics.growth} growth</p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {businessModel.metrics.customers && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Customer Base</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{businessModel.metrics.customers}</p>
                            {businessModel.metrics.retention && (
                              <p className="text-sm text-slate-600">Retention: {businessModel.metrics.retention}</p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {businessModel.metrics.ltv && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Customer LTV</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{businessModel.metrics.ltv}</p>
                            {businessModel.metrics.churn && (
                              <p className="text-sm text-slate-600">Churn: {businessModel.metrics.churn}</p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </section>
                );
              })()}

              {/* Product Roadmap */}
              {analysisData.product?.roadmap && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Product Roadmap</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisData.product.roadmap.upcoming && analysisData.product.roadmap.upcoming.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Upcoming Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisData.product.roadmap.upcoming.map((feature: string) => (
                              <li key={feature} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 mt-2 bg-primary rounded-full"></div>
                                <span className="text-slate-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {analysisData.product.roadmap.recent && analysisData.product.roadmap.recent.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Recent Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisData.product.roadmap.recent.map((feature: string) => (
                              <li key={feature} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 mt-2 bg-primary rounded-full"></div>
                                <span className="text-slate-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>
              )}

              {/* Back to Overview CTA */}
              <div className="mt-8 flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate(`/analysis/${docId}`)}
                  variant="outline"
                >
                  Back to Company Overview
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductPricingPage; 