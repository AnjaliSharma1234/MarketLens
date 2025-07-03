
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { Calendar, Download, Eye, Trash2 } from "lucide-react";

const SavedReports = () => {
  const reports = [
    {
      id: 1,
      company: "Notion",
      date: "Dec 15, 2024",
      status: "completed",
      score: 8.7,
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      company: "Figma",
      date: "Dec 14, 2024",
      status: "completed",
      score: 9.2,
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      company: "Linear",
      date: "Dec 12, 2024",
      status: "completed",
      score: 8.1,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      company: "Airtable",
      date: "Dec 10, 2024",
      status: "completed",
      score: 7.9,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      company: "Miro",
      date: "Dec 8, 2024",
      status: "completed",
      score: 8.5,
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      company: "Canva",
      date: "Dec 5, 2024",
      status: "completed",
      score: 9.0,
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Saved Reports</h1>
              <p className="text-slate-600 mt-1">Access and manage your competitive analysis reports</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 premium-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-900">{reports.length}</div>
                <div className="text-sm text-slate-600">Total Reports</div>
              </CardContent>
            </Card>
            <Card className="border-0 premium-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-900">8.4</div>
                <div className="text-sm text-slate-600">Avg. Score</div>
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
                <div className="text-2xl font-bold text-slate-900">38</div>
                <div className="text-sm text-slate-600">Remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="group hover:shadow-lg transition-all duration-200 border-0 premium-shadow">
                <CardHeader className="p-0">
                  <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={report.image} 
                      alt={report.company}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-slate-700 hover:bg-white">
                        Score: {report.score}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors">
                      {report.company}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{report.date}</span>
                      <Badge variant="outline" className="ml-auto text-green-700 border-green-200">
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Reports
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavedReports;
