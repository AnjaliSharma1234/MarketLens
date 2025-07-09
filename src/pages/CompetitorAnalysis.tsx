import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import CompetitorAnalysisFlow from "@/components/CompetitorAnalysisFlow";

function extractFirstJsonObject(str: string): any | null {
  // Find the first top-level JSON object in the string
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (start !== -1 && end !== -1) {
    let jsonString = str.slice(start, end);
    // Remove trailing commas before closing braces/brackets
    jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // Try to recover by trimming to the last closing brace
      const lastBrace = jsonString.lastIndexOf('}');
      if (lastBrace !== -1) {
        try {
          return JSON.parse(jsonString.slice(0, lastBrace + 1));
        } catch {}
      }
      return null;
    }
  }
  return null;
}

interface RecentReport {
  id: string;
  name: string;
  logo?: string;
  status: string;
  companyName?: string;
  companyURL?: string;
  competitorName?: string;
  competitorURL?: string;
  competitorLogo?: string;
  createdAt?: any;
}

const CompetitorAnalysis = () => {
  const { companyName: param } = useParams();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFromDb, setIsFromDb] = useState(false);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

  // Reset step when navigating away and back
  useEffect(() => {
    setCurrentStep(1);
  }, []);

  useEffect(() => {
    if (!param) return;
    setLoading(true);
    setError("");
    setAnalysisData(null);
    // Fetch from savedAnalysis collection
    const fetchFromDb = async () => {
      try {
        const docRef = doc(db, "savedAnalysis", param);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // If there's an analysisJson field, parse it
          if (data.analysisJson) {
            let analysis = data.analysisJson;
            if (typeof analysis === 'string') {
              analysis = extractFirstJsonObject(analysis);
            }
            setAnalysisData(analysis || null);
          } else {
            // Otherwise use the data directly
            setAnalysisData(data);
          }
          setIsFromDb(true);
        } else {
          setError("Analysis not found.");
        }
      } catch (e) {
        setError("Failed to load analysis from database.");
      }
      setLoading(false);
    };
    fetchFromDb();
  }, [param]);

  // Fetch recent reports
  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        const reportsRef = collection(db, "savedAnalysis");
        const q = query(reportsRef, orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        
        const reports = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.competitorName || "Unknown",
            logo: data.competitorLogo,
            status: "completed",
            companyName: data.companyName,
            companyURL: data.companyURL,
            competitorName: data.competitorName,
            competitorURL: data.competitorURL,
            competitorLogo: data.competitorLogo,
            createdAt: data.createdAt
          };
        });
        
        setRecentReports(reports);
      } catch (error) {
        console.error("Error fetching recent reports:", error);
      }
    };

    fetchRecentReports();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="container mx-auto p-8">
          <div className="space-y-8">
            <CompetitorAnalysisFlow onStepChange={setCurrentStep} />

            {/* Recent Reports Section - Only show in step 1 */}
            {currentStep === 1 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Your Recent Reports</h2>
                  <Button variant="link" onClick={() => navigate('/reports')} className="text-primary">
                    View All Reports
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentReports.map((report) => (
                    <Card key={report.id} className="group hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            {report.logo ? (
                              <img
                                src={report.logo}
                                alt={`${report.name} logo`}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-xl font-bold text-primary">
                                {report.name[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{report.name}</h3>
                            <div className="text-sm text-slate-500 mt-1">
                              {report.companyName && (
                                <Badge variant="outline" className="mr-2">
                                  {report.companyName}
                                </Badge>
                              )}
                              {report.createdAt && (
                                <span className="text-xs">
                                  {report.createdAt.toDate().toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/analysis/${report.id}`)}
                        >
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompetitorAnalysis;
