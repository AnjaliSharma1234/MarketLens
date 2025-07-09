import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { CompetitorLogo } from "@/components/CompetitorLogo";
import CompetitorAnalysisFlow from "@/components/CompetitorAnalysisFlow";
import { useState, useEffect } from "react";
import { getUserAnalyses, Analysis, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Helper to get domain from a URL
function getDomainFromUrl(url: string) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return '';
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const analyses = await getUserAnalyses(user.uid);
        // Sort by createdAt and take the 3 most recent
        const sortedAnalyses = analyses
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
          .slice(0, 3);
        setRecentAnalyses(sortedAnalyses);
      } catch (error) {
        console.error("Error fetching recent analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAnalyses();
  }, [user]);

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
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-primary/80"
                  onClick={() => navigate('/saved-reports')}
                >
                  View All Reports
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-3 text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-slate-500 mt-4">Loading your reports...</p>
                  </div>
                ) : recentAnalyses.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-slate-500">No reports yet. Start by creating your first analysis.</p>
                  </div>
                ) : (
                  recentAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 premium-shadow">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
                            <CompetitorLogo 
                              url={analysis.competitorURL} 
                              name={analysis.competitorName} 
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                              {analysis.competitorName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {analysis.createdAt?.toDate().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            completed
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/analysis/${analysis.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
