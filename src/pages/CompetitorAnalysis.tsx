import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Sidebar from "@/components/Sidebar";
import { 
  ArrowLeft, 
  Globe, 
  Users, 
  TrendingUp, 
  Star,
  ExternalLink,
  Download,
  Share2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const CompetitorAnalysis = () => {
  const { companyName } = useParams();
  const [showHighIntentKeywords, setShowHighIntentKeywords] = useState(false);

  // Dummy data for charts and tables
  const teamCollaborationData = [
    { name: 'Q1', users: 1200 },
    { name: 'Q2', users: 1500 },
    { name: 'Q3', users: 1800 },
    { name: 'Q4', users: 2100 },
  ];

  const featureAdoptionData = [
    { feature: 'Tasks', adoption: 85 },
    { feature: 'Calendar', adoption: 70 },
    { feature: 'Docs', adoption: 60 },
    { feature: 'Goals', adoption: 45 },
  ];

  const trafficData = [
    { month: 'Jan', visitors: 45000 },
    { month: 'Feb', visitors: 52000 },
    { month: 'Mar', visitors: 48000 },
    { month: 'Apr', visitors: 61000 },
    { month: 'May', visitors: 55000 },
    { month: 'Jun', visitors: 67000 },
  ];

  const trafficSources = [
    { name: 'Direct', value: 40, color: '#8884d8' },
    { name: 'Organic Search', value: 30, color: '#82ca9d' },
    { name: 'Paid Search', value: 15, color: '#ffc658' },
    { name: 'Social', value: 10, color: '#ff7300' },
    { name: 'Referral', value: 5, color: '#8dd1e1' },
  ];

  const keywordData = [
    { keyword: "project management", volume: "5,400", intent: "high" },
    { keyword: "team collaboration", volume: "3,200", intent: "high" },
    { keyword: "task tracking", volume: "2,800", intent: "medium" },
    { keyword: "workflow automation", volume: "1,900", intent: "high" },
    { keyword: "productivity tools", volume: "4,100", intent: "medium" },
    { keyword: "remote work", volume: "6,500", intent: "low" },
    { keyword: "agile methodology", volume: "1,200", intent: "high" },
    { keyword: "kanban board", volume: "890", intent: "high" },
  ];

  const filteredKeywords = showHighIntentKeywords 
    ? keywordData.filter(k => k.intent === "high")
    : keywordData;

  const businessModelCards = [
    { title: "Business Model", value: "SaaS", type: "tag" },
    { title: "Pricing", value: "$49/mo", type: "value" },
    { title: "Market Type", value: "B2B", type: "tag" },
    { title: "Pricing Tiers", value: ["Free", "Pro", "Enterprise"], type: "pills" },
    { title: "Sales Channels", value: ["Website", "Agency Partners"], type: "tags" },
    { title: "Payment Options", value: ["Stripe", "PayPal", "Apple Pay"], type: "icons" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{companyName} Analysis</h1>
                <p className="text-sm text-slate-500">Comprehensive competitive intelligence report</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-12">

            {/* Company Overview */}
            <section id="company-overview" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Company Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                        {companyName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{companyName}</h3>
                        <p className="text-slate-500">Founded 2013</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Founders:</span>
                        <span className="text-slate-900">Ivan Zhao, Simon Last</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Headquarters:</span>
                        <span className="text-slate-900">San Francisco, CA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Funding:</span>
                        <span className="text-slate-900">$343M Series C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Employees:</span>
                        <span className="text-slate-900">500-1000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Major Milestones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">2013 - Founded</p>
                        <p className="text-xs text-slate-500">Started as personal productivity tool</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">2019 - Series A</p>
                        <p className="text-xs text-slate-500">$10M funding round</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">2021 - Series B</p>
                        <p className="text-xs text-slate-500">$275M at $10B valuation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">2024 - Global Expansion</p>
                        <p className="text-xs text-slate-500">20M+ users worldwide</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Business Model & Monetization */}
            <section id="business-model" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Business Model & Monetization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessModelCards.map((card, index) => (
                  <Card key={index} className="premium-shadow border-0">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm text-slate-600 mb-2">{card.title}</h3>
                      <div className="space-y-2">
                        {card.type === "tag" && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            {card.value}
                          </Badge>
                        )}
                        {card.type === "value" && (
                          <p className="font-semibold text-lg text-slate-900">{card.value}</p>
                        )}
                        {card.type === "pills" && (
                          <div className="flex flex-wrap gap-1">
                            {(card.value as string[]).map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {card.type === "tags" && (
                          <div className="flex flex-wrap gap-1">
                            {(card.value as string[]).map((item, i) => (
                              <Badge key={i} className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {card.type === "icons" && (
                          <div className="flex flex-wrap gap-1">
                            {(card.value as string[]).map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-slate-500 italic">
                *Pricing inferred from website + review sources.
              </p>
            </section>

            {/* Marketing & SEO */}
            <section id="marketing-seo" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Marketing & SEO</h2>
              
              {/* Targeted Keywords Section */}
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Targeted Keywords</CardTitle>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="high-intent" className="text-sm text-slate-600">
                        Show Only High-Intent Keywords
                      </label>
                      <Switch
                        id="high-intent"
                        checked={showHighIntentKeywords}
                        onCheckedChange={setShowHighIntentKeywords}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Extracted from homepage meta + blog articles + ads
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-right">Monthly Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((keyword, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{keyword.keyword}</TableCell>
                          <TableCell className="text-right">{keyword.volume}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Rest of Marketing & SEO content */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Social Media Presence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-sm">Twitter</span>
                      <span className="text-slate-600">142K followers</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-sm">LinkedIn</span>
                      <span className="text-slate-600">89K followers</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-sm">Instagram</span>
                      <span className="text-slate-600">45K followers</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Content Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">Educational Content</Badge>
                    <Badge className="bg-green-50 text-green-700 hover:bg-green-100">Product-Led Growth</Badge>
                    <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100">Community-Driven</Badge>
                    <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100">User-Generated Content</Badge>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Website & Tech Stack */}
            <section id="website-tech" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Website & Tech Stack</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Traffic Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trafficData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Line 
                            type="monotone" 
                            dataKey="visitors" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={trafficSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {trafficSources.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
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
                          <span className="text-slate-600">{source.name}</span>
                          <span className="font-medium">{source.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="font-medium text-sm text-slate-900">Frontend</div>
                      <div className="text-xs text-slate-600 mt-1">React, TypeScript</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="font-medium text-sm text-slate-900">Backend</div>
                      <div className="text-xs text-slate-600 mt-1">Node.js</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="font-medium text-sm text-slate-900">Database</div>
                      <div className="text-xs text-slate-600 mt-1">PostgreSQL</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="font-medium text-sm text-slate-900">Hosting</div>
                      <div className="text-xs text-slate-600 mt-1">AWS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Team Collaboration Analysis */}
            <section id="team-collaboration" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Team Collaboration Analysis</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Active Users Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={teamCollaborationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Adoption Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={featureAdoptionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="feature" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Bar dataKey="adoption" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* User Sentiment Analysis */}
            <section id="user-sentiment" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">User Sentiment Analysis</h2>
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Customer Reviews & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-slate-900">Positive Review</div>
                        <div className="text-xs text-slate-500">2 days ago</div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">"Great tool for managing projects and collaborating with team members. Highly recommended!"</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-slate-900">Negative Review</div>
                        <div className="text-xs text-slate-500">5 days ago</div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">"The mobile app is a bit clunky and needs improvement. Overall, the web version is excellent."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Pricing & Value Proposition */}
            <section id="pricing-value" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Pricing & Value Proposition</h2>
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Plans Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Basic</TableHead>
                        <TableHead>Pro</TableHead>
                        <TableHead>Enterprise</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Users</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>25</TableCell>
                        <TableCell>Unlimited</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Storage</TableCell>
                        <TableCell>1 GB</TableCell>
                        <TableCell>10 GB</TableCell>
                        <TableCell>100 GB</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Support</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Priority Email</TableCell>
                        <TableCell>24/7 Phone</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompetitorAnalysis;
