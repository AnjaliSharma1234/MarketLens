
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Globe, 
  Users, 
  TrendingUp, 
  Calendar,
  MapPin,
  DollarSign,
  Target,
  Award,
  ExternalLink
} from "lucide-react";

const CompetitorAnalysis = () => {
  const { companyName } = useParams();

  // Dummy data for charts
  const trafficData = [
    { month: 'Jan', visits: 850000 },
    { month: 'Feb', visits: 920000 },
    { month: 'Mar', visits: 1100000 },
    { month: 'Apr', visits: 1350000 },
    { month: 'May', visits: 1200000 },
    { month: 'Jun', visits: 1450000 },
  ];

  const trafficSources = [
    { name: 'Direct', value: 45, color: '#7B61FF' },
    { name: 'Organic', value: 30, color: '#06D6A0' },
    { name: 'Paid', value: 15, color: '#FFD166' },
    { name: 'Social', value: 10, color: '#F72585' },
  ];

  const competitors = [
    { name: 'Slack', logo: '🟣', similarity: '92%' },
    { name: 'Microsoft Teams', logo: '🔵', similarity: '88%' },
    { name: 'Discord', logo: '🟢', similarity: '75%' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Competitive Analysis</h1>
              <p className="text-slate-600 mt-1">Deep market intelligence for {companyName}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Export Report
            </Button>
          </div>

          {/* Section 1: Company Overview */}
          <section id="company-overview" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Company Overview</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {companyName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{companyName}</h3>
                      <p className="text-sm text-slate-500">Team Collaboration Platform</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Founded: 2013</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>2,500+ employees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>$340M funding</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Key Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { year: '2013', event: 'Company founded' },
                      { year: '2014', event: 'First $1M ARR' },
                      { year: '2019', event: 'IPO Launch' },
                      { year: '2021', event: 'Acquired by Salesforce' },
                    ].map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-medium text-sm">{milestone.year}</span>
                        <span className="text-sm text-slate-600">{milestone.event}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Brand & Messaging */}
          <section id="brand-messaging" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Brand & Messaging</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Brand Tagline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-slate-700">"Where work happens"</p>
                  <p className="text-sm text-slate-500 mt-2">Focus on productivity and collaboration</p>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Tone of Voice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Friendly</Badge>
                    <Badge variant="secondary">Professional</Badge>
                    <Badge variant="secondary">Approachable</Badge>
                    <Badge variant="secondary">Confident</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Key USPs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Real-time messaging</li>
                    <li>• Seamless integrations</li>
                    <li>• Organized channels</li>
                    <li>• Remote-first culture</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3: Product */}
          <section id="product" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Product Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Core Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Messaging & Channels</span>
                      <Badge>Core</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>File Sharing</span>
                      <Badge>Core</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Video Calls</span>
                      <Badge>Advanced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Workflow Automation</span>
                      <Badge>Advanced</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Platform Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Web App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">iOS App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Android</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-sm">Desktop</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Website & Tech Stack */}
          <section id="website-tech" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Website & Technology</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Website Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="visits" stroke="#7B61FF" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSources}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {trafficSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {trafficSources.map((source, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: source.color }}
                        ></div>
                        <span>{source.name}: {source.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 5: Business & Pricing */}
          <section id="business-pricing" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Business Model & Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <p className="text-2xl font-bold">$0</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 10K message history</li>
                    <li>• 10 integrations</li>
                    <li>• 1:1 video calls</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0 ring-2 ring-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Pro
                    <Badge className="bg-primary">Popular</Badge>
                  </CardTitle>
                  <p className="text-2xl font-bold">$7.25<span className="text-sm font-normal">/month</span></p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Unlimited message history</li>
                    <li>• Unlimited integrations</li>
                    <li>• Group video calls</li>
                    <li>• Guest access</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle>Enterprise Grid</CardTitle>
                  <p className="text-2xl font-bold">$15</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Organization-wide</li>
                    <li>• Advanced security</li>
                    <li>• Compliance features</li>
                    <li>• Premium support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 6: SWOT Analysis */}
          <section id="swot-analysis" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">SWOT Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="premium-shadow border-0 border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-700">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Market leader in team collaboration</li>
                    <li>• Strong brand recognition</li>
                    <li>• Extensive integration ecosystem</li>
                    <li>• User-friendly interface</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0 border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-red-700">Weaknesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• High pricing for small teams</li>
                    <li>• Information overload in large channels</li>
                    <li>• Limited project management features</li>
                    <li>• Dependency on internet connectivity</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0 border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-blue-700">Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• AI integration and automation</li>
                    <li>• Expansion into new markets</li>
                    <li>• Enhanced mobile experience</li>
                    <li>• Industry-specific solutions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-0 border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-yellow-700">Threats</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Microsoft Teams integration</li>
                    <li>• Economic downturn affecting subscriptions</li>
                    <li>• Security and privacy concerns</li>
                    <li>• Emerging collaboration platforms</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 7: Top Competitors */}
          <section id="competitors" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Top Competitors</h2>
            
            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <Card key={index} className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                          {competitor.logo}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{competitor.name}</h3>
                          <p className="text-sm text-slate-500">Similarity: {competitor.similarity}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CompetitorAnalysis;
