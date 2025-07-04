
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import StepTracker from "./StepTracker";
import { Check, Loader2 } from "lucide-react";

const steps = ["Your Company", "Select Competitor", "Context", "Generating Report"];

const industries = [
  "Tech",
  "SaaS",
  "E-commerce",
  "HealthTech",
  "EdTech",
  "FinTech"
];

const roles = [
  "Founder",
  "Product Manager", 
  "Product Marketing Manager",
  "Engineer",
  "Generalist"
];

const goals = [
  "Refine positioning & messaging",
  "Benchmark product roadmap",
  "Competitive pricing review",
  "Customer acquisition insights",
  "General analysis"
];

const suggestedCompetitors = [
  { name: "Notion", domain: "notion.so", industry: "SaaS" },
  { name: "Figma", domain: "figma.com", industry: "Design" },
  { name: "Linear", domain: "linear.app", industry: "SaaS" },
  { name: "Airtable", domain: "airtable.com", industry: "SaaS" },
];

const CompetitorAnalysisFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    website: "",
    industry: "",
    competitor: "",
    role: "",
    goal: ""
  });
  const [customCompetitor, setCustomCompetitor] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGenerateReport = async () => {
    setCurrentStep(4);
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const competitorName = formData.competitor || customCompetitor;
      navigate(`/analysis/${encodeURIComponent(competitorName)}`);
    }, 3000);
  };

  const addCustomCompetitor = () => {
    if (customCompetitor.trim()) {
      setFormData({ ...formData, competitor: customCompetitor });
      setCustomCompetitor("");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Tell us about your company</h3>
              <p className="text-slate-600 mb-6">We'll use this to find the most relevant competitors</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="website" className="text-sm font-medium text-slate-700">Your Website</Label>
                <Input
                  id="website"
                  placeholder="www.yourstore.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-700">Your Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleNext} 
              className="w-full"
              disabled={!formData.website || !formData.industry}
            >
              Next
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Your Competitor</h3>
              <p className="text-slate-600 mb-6">We've identified top competitors based on your website and industry.</p>
            </div>

            <RadioGroup 
              value={formData.competitor} 
              onValueChange={(value) => setFormData({ ...formData, competitor: value })}
              className="space-y-3"
            >
              {suggestedCompetitors.map((competitor) => (
                <div key={competitor.name} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                  <RadioGroupItem value={competitor.name.toLowerCase()} id={competitor.name} />
                  <Label htmlFor={competitor.name} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{competitor.name}</div>
                        <div className="text-sm text-slate-500">https://{competitor.domain}</div>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                        {competitor.industry}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Or Add Competitor Manually</p>
              <div className="flex gap-2">
                <Input
                  placeholder="competitor-domain.com"
                  value={customCompetitor}
                  onChange={(e) => setCustomCompetitor(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={addCustomCompetitor}>
                  Add
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleNext} 
              className="w-full"
              disabled={!formData.competitor && !customCompetitor}
            >
              Next
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Context</h3>
              <p className="text-slate-600 mb-6">Help us personalize your analysis</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">What's your role?</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role.toLowerCase()}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">What's your analysis goal?</Label>
                <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal} value={goal.toLowerCase()}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerateReport} 
              className="w-full"
              disabled={!formData.role || !formData.goal}
            >
              Generate Report
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Generating your personalized report...</h3>
              <p className="text-slate-600">This will take a few moments</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <StepTracker currentStep={currentStep} steps={steps} />
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};

export default CompetitorAnalysisFlow;
