import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { CompetitorLogo } from "@/components/CompetitorLogo";
import { Calendar, Download, Eye, Search, ExternalLink } from "lucide-react";
import { getUserAnalyses, Analysis, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

// Helper to get domain from a URL
function getDomainFromUrl(url: string) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return '';
  }
}

// Helper to extract a readable company name from a URL
function getCompanyName(url: string) {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Remove www. and TLD for a cleaner name
    return hostname.replace(/^www\./, '').split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } catch {
    return url;
  }
}

// Helper to extract a readable competitor name (capitalize words)
function getCompetitorName(name: string) {
  if (!name) return '';
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Helper to get a domain from a URL or competitor string
function getDomainFromUrlOrString(input: string) {
  try {
    if (input.startsWith('http')) {
      return new URL(input).hostname;
    }
    // If it's a domain (e.g. canva.com), return as is
    if (/^[\w.-]+\.[a-zA-Z]{2,}$/.test(input)) {
      return input;
    }
    // If it's a name, try to guess domain (e.g. Canva -> canva.com)
    return input.replace(/\s+/g, '').toLowerCase() + '.com';
  } catch {
    return input;
  }
}

const SavedReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) {
        console.log("No user found, skipping analyses fetch");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      
      try {
        console.log("Fetching analyses for user:", user.uid);
        const data = await getUserAnalyses(user.uid);
        console.log("Fetched analyses:", data);
        
        // Filter out any analyses without required fields
        const validAnalyses = data.filter(analysis => {
          const isValid = analysis.competitorName && analysis.competitorURL;
          if (!isValid) {
            console.warn("Found invalid analysis:", analysis);
          }
          return isValid;
        });
        
        setAnalyses(validAnalyses);
      } catch (err: any) {
        console.error("Error fetching analyses:", err);
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user]);

  const filteredReports = analyses.filter(report =>
    (report.companyName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (report.competitorName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Saved Reports</h1>
                <p className="text-slate-600 mt-1">Access and manage your competitive analysis reports</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search saved reports by company, competitor, or goal"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 w-full border-slate-200 focus:border-primary text-base"
                />
              </div>
              <p className="text-sm text-slate-500">
                {filteredReports.length} reports saved
              </p>
            </div>

            {/* Reports Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-slate-500 mt-4">Loading your reports...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-4">
                <div className="text-red-500 mb-2">⚠️ Error loading reports</div>
                <p className="text-slate-600">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-slate-500 mb-2">No reports found</p>
                {searchQuery ? (
                  <p className="text-sm text-slate-400 mb-4">Try adjusting your search terms</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-400 mb-4">Start by creating a new competitor analysis</p>
                    <Button 
                      variant="default"
                      onClick={() => navigate('/dashboard')}
                      className="mt-2"
                    >
                      Create Your First Analysis
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="group hover:shadow-lg transition-all duration-200 border-0 premium-shadow">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
                          <CompetitorLogo 
                            url={report.competitorURL} 
                            name={report.competitorName} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors truncate">
                            {report.competitorName || 'Unnamed Competitor'}
                          </h3>
                          {report.competitorURL && (
                            <a
                              href={report.competitorURL.startsWith('http') ? report.competitorURL : `https://${report.competitorURL}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {report.competitorURL.replace(/^https?:\/\//, '')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {report.createdAt && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{report.createdAt.toDate().toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="flex items-center">
                        {report.companyName && (
                          <Badge variant="outline" className="text-green-700 border-green-200">
                            {report.companyName}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate(`/analysis/${report.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavedReports;
