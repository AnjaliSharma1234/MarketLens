import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Sidebar from "@/components/Sidebar";
import { 
  Globe, 
  Users, 
  TrendingUp, 
  Star,
  ExternalLink,
  Download,
  Share2,
  Info,
  Target,
  DollarSign,
  Building,
  MessageSquare,
  ChevronDown
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

  // Sample data for charts
  const demographicsData = [
    { name: '25-34', value: 35, color: '#8b5cf6' },
    { name: '35-44', value: 28, color: '#06b6d4' },
    { name: '45-54', value: 22, color: '#10b981' },
    { name: '18-24', value: 15, color: '#f59e0b' },
  ];

  const marketMetricsData = [
    { name: 'Q1', value: 12 },
    { name: 'Q2', value: 14 },
    { name: 'Q3', value: 16 },
    { name: 'Q4', value: 18 },
  ];

  const competitors = [
    { name: "Slack", website: "slack.com", category: "Direct", logo: "S" },
    { name: "Microsoft Teams", website: "teams.microsoft.com", category: "Direct", logo: "MT" },
    { name: "Discord", website: "discord.com", category: "Alternative", logo: "D" },
    { name: "Zoom", website: "zoom.us", category: "Niche", logo: "Z" },
  ];

  const canvasBlocks = [
    { 
      id: 'key-partners', 
      title: 'Key Partners', 
      color: 'bg-blue-50', 
      description: 'External companies or entities that help you run your business.',
      content: ['Technology providers', 'Integration partners', 'Consulting firms', 'Cloud infrastructure providers']
    },
    { 
      id: 'key-activities', 
      title: 'Key Activities', 
      color: 'bg-green-50', 
      description: 'Core actions required to deliver value to customers.',
      content: ['Product development', 'Customer support', 'Marketing & sales', 'Platform maintenance']
    },
    { 
      id: 'key-resources', 
      title: 'Key Resources', 
      color: 'bg-purple-50', 
      description: 'Assets and infrastructure required to deliver the value proposition.',
      content: ['Development team', 'Brand reputation', 'Technology platform', 'Customer data']
    },
    { 
      id: 'value-propositions', 
      title: 'Value Propositions', 
      color: 'bg-orange-50', 
      description: 'The unique value your product or service delivers to customers.',
      content: ['Real-time collaboration', 'Unified workspace', 'Cross-platform sync', 'Enterprise security']
    },
    { 
      id: 'customer-relationships', 
      title: 'Customer Relationships', 
      color: 'bg-pink-50', 
      description: 'Types of relationships expected and maintained with customers.',
      content: ['Self-service support', 'Community forums', 'Dedicated account management', 'Automated assistance']
    },
    { 
      id: 'channels', 
      title: 'Channels', 
      color: 'bg-indigo-50', 
      description: 'Ways the company delivers value and interacts with customers.',
      content: ['Direct sales', 'Online marketing', 'Partner channels', 'App stores']
    },
    { 
      id: 'customer-segments', 
      title: 'Customer Segments', 
      color: 'bg-teal-50', 
      description: 'Specific groups of people or organizations being targeted.',
      content: ['Small teams', 'Enterprise organizations', 'Remote workers', 'Creative agencies']
    },
    { 
      id: 'cost-structure', 
      title: 'Cost Structure', 
      color: 'bg-red-50', 
      description: 'All major costs involved in operating the business model.',
      content: ['Development costs', 'Infrastructure costs', 'Marketing expenses', 'Personnel costs']
    },
    { 
      id: 'revenue-streams', 
      title: 'Revenue Streams', 
      color: 'bg-yellow-50', 
      description: 'How the business earns money from each customer segment.',
      content: ['Subscription fees', 'Enterprise licenses', 'Premium features', 'Add-on services']
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
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

        <div className="p-8 max-w-6xl mx-auto">
          <div className="space-y-12">

            {/* Company Overview */}
            <section className="space-y-6">
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

            {/* Website Overview */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Website Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-slate-900">Monthly Traffic</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-slate-900">345,000</p>
                      <p className="text-sm text-slate-500">monthly visits</p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        +12% vs last month
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-slate-900">Tech Stack</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Redis'].map((tech) => (
                        <div key={tech} className="text-center p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs font-medium text-slate-700">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Audience Insights */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Audience Insights</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographicsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {demographicsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1 mt-2">
                      {demographicsData.map((item) => (
                        <div key={item.name} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.name}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Personas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-sm">Product Manager</h4>
                      <p className="text-xs text-slate-600 mt-1">Goal: Streamline team workflows</p>
                      <p className="text-xs text-slate-500">Pain: Scattered communication</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-sm">Engineering Lead</h4>
                      <p className="text-xs text-slate-600 mt-1">Goal: Improve code collaboration</p>
                      <p className="text-xs text-slate-500">Pain: Context switching</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Target Org Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">SaaS</Badge>
                      <Badge variant="outline">Mid-market</Badge>
                      <Badge variant="outline">Tech Teams</Badge>
                      <Badge variant="outline">Startups</Badge>
                      <Badge variant="outline">Remote-first</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Market Metrics */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Market Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="premium-shadow border-0">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">$5B</p>
                      <p className="text-sm text-slate-500">Market Size (TAM)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="premium-shadow border-0">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">$14M</p>
                      <p className="text-sm text-slate-500">Estimated Revenue (ARR)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="premium-shadow border-0">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">60K</p>
                      <p className="text-sm text-slate-500">User Count</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="premium-shadow border-0">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">+18%</p>
                      <p className="text-sm text-slate-500">Growth Rate (YoY)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="premium-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Brand & Messaging */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Brand & Messaging</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <p className="font-medium text-slate-900">Brand Tagline</p>
                    </div>
                    <p className="text-slate-600 text-lg font-semibold">"Work, Together"</p>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="w-5 h-5 text-primary" />
                      <p className="font-medium text-slate-900">Tone of Voice</p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Bold</Badge>
                      <Badge className="bg-green-100 text-green-800">Clear</Badge>
                      <Badge className="bg-purple-100 text-purple-800">Playful</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <p className="font-medium text-slate-900">Key USPs</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        Real-time collaboration
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        Global sync across devices
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        Enterprise-grade security
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        Seamless integrations
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Competitor List */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Competitor List</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {competitors.map((competitor) => (
                  <Card key={competitor.name} className="premium-shadow border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {competitor.logo}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{competitor.name}</p>
                          <p className="text-xs text-slate-500">{competitor.website}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {competitor.category}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Analyse
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Business Model Canvas - Updated layout */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Business Model Canvas</h2>
              <Card className="premium-shadow border-0">
                <CardContent className="p-6">
                  <TooltipProvider>
                    <div className="grid grid-cols-5 gap-4 min-h-[500px]">
                      {/* Row 1 */}
                      <div className={`${canvasBlocks[0].color} p-4 rounded-lg`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[0].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[0].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[0].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${canvasBlocks[1].color} p-4 rounded-lg`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[1].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[1].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[1].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${canvasBlocks[2].color} p-4 rounded-lg`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[2].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[2].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[2].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${canvasBlocks[6].color} p-4 rounded-lg row-span-2`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[6].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[6].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[6].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${canvasBlocks[5].color} p-4 rounded-lg row-span-2`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[5].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[5].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[5].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Row 2 */}
                      <div className={`${canvasBlocks[3].color} p-4 rounded-lg col-span-3`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[3].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[3].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[3].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Row 3 */}
                      <div className={`${canvasBlocks[4].color} p-4 rounded-lg`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[4].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[4].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[4].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Row 4 */}
                      <div className={`${canvasBlocks[7].color} p-4 rounded-lg col-span-2`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[7].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[7].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[7].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${canvasBlocks[8].color} p-4 rounded-lg col-span-2`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-sm text-slate-900">{canvasBlocks[8].title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center justify-center">
                                <Info className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-48">
                              <p className="text-xs">{canvasBlocks[8].description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ul className="space-y-1.5">
                          {canvasBlocks[8].content.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TooltipProvider>
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
