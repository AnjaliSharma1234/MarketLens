
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Search, TrendingUp, Clock, Star } from "lucide-react";

const Dashboard = () => {
  const [companyInput, setCompanyInput] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyInput.trim()) {
      navigate(`/analysis/${encodeURIComponent(companyInput.trim())}`);
    }
  };

  const recentAnalyses = [
    {
      id: 1,
      company: "Notion",
      date: "2 hours ago",
      status: "completed",
      initials: "NS"
    },
    {
      id: 2,
      company: "Figma",
      date: "1 day ago",
      status: "completed",
      initials: "FG"
    },
    {
      id: 3,
      company: "Linear",
      date: "3 days ago",
      status: "completed",
      initials: "LR"
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Start Your Competitive Analysis</h1>
              <p className="text-slate-600">Enter a competitor's website or company name to generate a comprehensive market intelligence report</p>
            </div>

            {/* Search Card */}
            <Card className="premium-shadow border-0">
              <CardContent className="p-8">
                <form onSubmit={handleAnalyze} className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Enter company name or website (e.g., notion.so, Figma, Linear)"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      className="pl-12 h-14 text-lg border-slate-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-semibold"
                    disabled={!companyInput.trim()}
                  >
                    Generate Comprehensive Report
                  </Button>
                </form>
                
                <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Real-time data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~2 min analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>10+ insight categories</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Your Recent Analyses</h2>
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  View All Reports
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 premium-shadow">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                          {analysis.initials}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                            {analysis.company}
                          </h3>
                          <p className="text-sm text-slate-500">{analysis.date}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {analysis.status}
                        </span>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 premium-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-900">47</div>
                  <div className="text-sm text-slate-600">Total Analyses</div>
                </CardContent>
              </Card>
              <Card className="border-0 premium-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-900">12</div>
                  <div className="text-sm text-slate-600">This Month</div>
                </CardContent>
              </Card>
              <Card className="border-0 premium-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-900">8.4</div>
                  <div className="text-sm text-slate-600">Avg. Score</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
