
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import CompetitorAnalysisFlow from "@/components/CompetitorAnalysisFlow";

const Dashboard = () => {
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
              <h1 className="text-3xl font-bold text-slate-900">Analyse My Competitors</h1>
              <p className="text-slate-600">Get personalized competitive intelligence in minutes</p>
            </div>

            {/* Competitor Analysis Flow */}
            <CompetitorAnalysisFlow />

            {/* Recent Analyses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Your Recent Reports</h2>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
