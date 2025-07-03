
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { Calendar, Download, Eye, Trash2, Search } from "lucide-react";

const SavedReports = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const reports = [
    {
      id: 1,
      company: "Notion",
      date: "Dec 15, 2024",
      status: "completed",
      initials: "NS"
    },
    {
      id: 2,
      company: "Figma",
      date: "Dec 14, 2024",
      status: "completed",
      initials: "FG"
    },
    {
      id: 3,
      company: "Linear",
      date: "Dec 12, 2024",
      status: "completed",
      initials: "LR"
    },
    {
      id: 4,
      company: "Airtable",
      date: "Dec 10, 2024",
      status: "completed",
      initials: "AT"
    },
    {
      id: 5,
      company: "Miro",
      date: "Dec 8, 2024",
      status: "completed",
      initials: "MR"
    },
    {
      id: 6,
      company: "Canva",
      date: "Dec 5, 2024",
      status: "completed",
      initials: "CV"
    }
  ];

  const filteredReports = reports.filter(report =>
    report.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {/* Search Bar */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search reports by company name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-200 focus:border-primary"
              />
            </div>
            <p className="text-sm text-slate-500">
              {filteredReports.length} reports saved
            </p>
          </div>

          {/* Reports Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="group hover:shadow-lg transition-all duration-200 border-0 premium-shadow">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      {report.initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors">
                        {report.company}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{report.date}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      {report.status}
                    </Badge>
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
