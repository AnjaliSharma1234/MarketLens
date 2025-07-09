import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import StepTracker from "./StepTracker";
import { Check, Loader2, X, ExternalLink } from "lucide-react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, increment, Timestamp, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { isValidUrl, fetchCompanyInfo } from "@/lib/utils";

const steps = ["Your Company", "Select Competitor", "Context", "Generating Report"];

const industries = [
  "Advertising & Marketing",
  "Aerospace & Defense",
  "Agriculture & Farming",
  "Artificial Intelligence & Machine Learning",
  "Automotive",
  "Banking & Financial Services",
  "Biotechnology",
  "Blockchain & Cryptocurrency",
  "Chemical & Materials",
  "Clean Energy & Sustainability",
  "Cloud Computing",
  "Construction & Real Estate",
  "Consumer Electronics",
  "Cybersecurity",
  "E-commerce & Retail",
  "Education Technology (EdTech)",
  "Entertainment & Media",
  "Fashion & Apparel",
  "Financial Technology (FinTech)",
  "Food & Beverage",
  "Gaming & Esports",
  "Healthcare Technology",
  "Healthcare & Medical",
  "Human Resources Technology",
  "Industrial Manufacturing",
  "Insurance Technology (InsurTech)",
  "Internet of Things (IoT)",
  "Legal Technology",
  "Logistics & Supply Chain",
  "Mobile Apps & Software",
  "Pharmaceuticals",
  "Professional Services",
  "Robotics & Automation",
  "SaaS (Software as a Service)",
  "Social Media & Communication",
  "Space Technology",
  "Sports & Fitness Technology",
  "Telecommunications",
  "Transportation & Mobility",
  "Travel & Hospitality",
  "Virtual & Augmented Reality",
  "Web3 & Decentralized Tech"
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

// Helper to map competitor names to domains for logo fetching
const COMPETITOR_DOMAIN_MAP: Record<string, string> = {
  'Adobe XD': 'adobe.com',
  'Sketch': 'sketch.com',
  'InVision Studio': 'invisionapp.com',
  'InVision': 'invisionapp.com',
  'Axure RP': 'axure.com',
  'Adobe Photoshop': 'adobe.com',
  'Zeplin': 'zeplin.io',
  'Proto.io': 'proto.io',
  'Figma': 'figma.com',
};

function getCompetitorLogoUrl(name: string) {
  const domain = COMPETITOR_DOMAIN_MAP[name] || name.replace(/\s+/g, '').toLowerCase() + '.com';
  return `https://logo.clearbit.com/${domain}`;
}

// Utility to extract first JSON object or array from a string
function extractFirstJson(str: string): any | null {
  // Try to match a JSON object or array
  const match = str.match(/({[\s\S]*})|\[([\s\S]*)\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

// Dummy logo SVG (inline)
const DUMMY_LOGO = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#E5E7EB"/>
    <text x="16" y="21" textAnchor="middle" fontSize="14" fill="#9CA3AF" fontFamily="Arial">Logo</text>
  </svg>
);

// Helper to check if a logo URL is a valid image
async function isValidLogoUrl(url?: string) {
  if (!url) return false;
  
  // First check if it's a valid URL
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Try to fetch the image to verify it exists and is an image
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    return contentType ? contentType.startsWith('image/') : false;
  } catch {
    // If we can't verify, assume it's valid if it's a well-formed URL
    return true;
  }
}

// Helper to truncate description
function truncateDescription(desc: string, max = 120) {
  if (!desc) return '';
  return desc.length > max ? desc.slice(0, max - 3) + '...' : desc;
}

// Helper to get domain from a URL
function getDomainFromUrl(url: string) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return '';
  }
}

// Helper to fetch real company info from backend scraping endpoint
async function fetchScrapedCompanyInfo(url) {
  const res = await fetch('/api/scrape-company-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to fetch company info');
  return await res.json();
}

// Helper to clean company name (removes unwanted suffixes like meta_fillmeta_fill)
function cleanCompanyName(name?: string) {
  if (!name) return '';
  // Remove common unwanted suffixes (e.g., meta_fillmeta_fill, _fillmeta_fill, etc.)
  return name.replace(/[_-]?meta[_-]?fill(meta)?[_-]?fill/gi, '').trim();
}

// Utility to sanitize data for Firestore (removes undefined/null, skips empty objects)
function sanitizeForFirestore(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Function to fetch overview prompt from Firestore
const fetchOverviewPrompt = async () => {
  try {
    const promptRef = doc(db, "prompts", "fetchAnalysis");
    const promptSnap = await getDoc(promptRef);
    if (promptSnap.exists()) {
      return promptSnap.data().prompt;
    }
    console.warn("Overview prompt not found, using default");
    return `You are a company intelligence expert. Given the following input:
- companyName: {companyName}
- companyURL: {companyURL}
Your task is to analyze the company and return a complete Company Overview section in the following strict JSON format:
{
  "companyOverview": {
    "companyName": "string",
    "companyURL": "string",
    "companyLogo": "string (direct image URL)",
    "tagline": "string (marketing slogan if available)",
    "oneLiner": "string (brief description of what the company does)",
    "founders": [{ "name": "string", "linkedin": "https://linkedin.com/in/..." }],
    "foundedYear": "string or number (e.g. 2015)",
    "headcount": "string or number (e.g. 100-200)",
    "hqLocation": "string (city, country)",
    "serviceLocations": ["string", "string", ...],
    "funding": "string (e.g. $50M Series B)",
    "lastValuation": "string (e.g. $300M in 2023)",
    "majorMilestones": ["string (e.g. Reached 10K users)", ...],
    "businessModel": "string (detailed explanation of how the company makes money)",
    "revenueModel": "string (specific revenue streams and pricing strategy)",
    "targetMarket": {
      "segments": ["string (e.g. Enterprise SaaS)", ...],
      "geography": ["string (e.g. North America)", ...],
      "customerSize": "string (e.g. Mid-market to Enterprise)"
    },
    "keyMetrics": {
      "revenue": "string (e.g. $100M ARR in 2023)",
      "growth": "string (e.g. 150% YoY)",
      "marketShare": "string (e.g. 15% of global market)",
      "customerBase": "string (e.g. 5000+ businesses)",
      "retention": "string (e.g. 95% annual retention)"
    },
    "competitiveAdvantages": [
      "string (e.g. Proprietary AI technology)",
      "string (e.g. First-mover in the market)",
      ...
    ],
    "partnerships": [
      "string (e.g. Microsoft Gold Partner)",
      "string (e.g. AWS Advanced Partner)",
      ...
    ],
    "awards": [
      "string (e.g. Gartner Magic Quadrant Leader 2023)",
      ...
    ],
    "marketPosition": "string (detailed analysis of company's position in the market)",
    "growthStrategy": "string (company's approach to expansion and scaling)"
  }
}
Return ONLY valid JSON, no explanation, no extra text, no markdown. Focus on providing accurate, detailed information while maintaining professional tone.`;
  } catch (err) {
    console.error("Error fetching overview prompt:", err);
    throw err;
  }
};

// Function to fetch competitor fetching prompt from Firestore
const fetchCompetitorFetchingPrompt = async () => {
  try {
    const promptRef = doc(db, "prompts", "competitorFetching");
    const promptSnap = await getDoc(promptRef);
    
    // Default prompt to use if Firestore fetch fails
    const defaultPrompt = `Given the following company details:
- Name: {companyName}
- Description: {companyDesc}
List the top 5 real, well-known direct competitors as a JSON array with fields: name and website (URL).
Return ONLY the JSON array, no explanation, no extra text, no markdown.
Do NOT use placeholder names, fake URLs, or return an empty array. If you cannot find 5, return as many as possible, but only real companies.
Example: [{"name":"Airtable","website":"https://airtable.com"},{"name":"Coda","website":"https://coda.io"}]`;

    if (!promptSnap.exists()) {
      console.warn("Competitor fetching prompt not found in Firestore, using default");
      return defaultPrompt;
    }

    const data = promptSnap.data();
    if (!data || !data.prompt) {
      console.warn("Invalid prompt data in Firestore, using default");
      return defaultPrompt;
    }

    return data.prompt;
  } catch (err) {
    console.error("Error fetching competitor prompt:", err);
    throw err;
  }
};

interface CompetitorAnalysisFlowProps {
  onStepChange?: (step: number) => void;
}

const CompetitorAnalysisFlow = ({ onStepChange }: CompetitorAnalysisFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    website: "",
    industry: "",
    competitor: "",
    role: "",
    goal: ""
  });
  const [customCompetitor, setCustomCompetitor] = useState("");
  const [addedCompetitor, setAddedCompetitor] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string>("");
  const [websiteError, setWebsiteError] = useState("");
  const [companyInfo, setCompanyInfo] = useState<{ name?: string; description?: string; logo?: string } | null>(null);
  const [fetchingCompanyInfo, setFetchingCompanyInfo] = useState(false);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);
  const [competitorsError, setCompetitorsError] = useState("");
  const [dynamicCompetitors, setDynamicCompetitors] = useState<any[]>([]);
  const [companyDetails, setCompanyDetails] = useState<{ name?: string; logo?: string; industry?: string; description?: string } | null>(null);
  const [companyDetailsLoading, setCompanyDetailsLoading] = useState(false);
  const [companyDetailsError, setCompanyDetailsError] = useState("");
  const [failedCompetitorLogos, setFailedCompetitorLogos] = useState<{ [name: string]: boolean }>({});
  const [failedCompanyLogo, setFailedCompanyLogo] = useState(false);
  const [customCompetitorError, setCustomCompetitorError] = useState("");
  const [manualCompetitorInfo, setManualCompetitorInfo] = useState<{ name?: string; logo?: string; url?: string } | null>(null);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  const isOverLimit = userData && planData && planData.analysesPerMonth !== -1 && userData.analysesUsedThisMonth >= planData.analysesPerMonth;

  // Centralized validation for Step 1: Only enable if URL is valid
  const canProceedToNextStep = () => {
    return isValidUrl(formData.website);
  };

  // Initialize step in parent component
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!isValidUrl(formData.website)) {
        setWebsiteError("Please enter a valid website URL (e.g. example.com or https://example.com)");
        return;
      }
      setWebsiteError("");
      try {
        const info = await fetchScrapedCompanyInfo(formData.website);
        setCompanyInfo({ name: info.title || getDomainFromUrl(formData.website), description: info.description || "", logo: info.favicon || "" });
      } catch (err) {
        setWebsiteError("Failed to fetch company details. Please try again.");
        return;
      }
    }

    // Save analysis data when moving from step 2 to 3
    if (currentStep === 2) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to save analysis.",
            variant: "destructive"
          });
          return;
        }

        // Validate competitor selection
        if (!formData.competitor) {
          toast({
            title: "Error",
            description: "Please select a competitor or add one manually.",
            variant: "destructive"
          });
          return;
        }

        // Get competitor details
        let selectedCompetitor;
        let competitorUrl = '';

        // Check if it's from dynamic list or manual entry
        const fromDynamicList = dynamicCompetitors.find(c => c.name === formData.competitor);
        if (fromDynamicList) {
          selectedCompetitor = fromDynamicList;
          competitorUrl = fromDynamicList.website;
        } else if (manualCompetitorInfo) {
          selectedCompetitor = {
            name: manualCompetitorInfo.name || formData.competitor,
            website: manualCompetitorInfo.url
          };
          competitorUrl = manualCompetitorInfo.url;
        } else {
          toast({
            title: "Error",
            description: "Invalid competitor selection. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Get competitor logo
        const competitorLogo = await getValidLogoUrl(competitorUrl);

        // Create document in savedAnalysis collection
        const docId = selectedCompetitor.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const docRef = doc(db, "savedAnalysis", docId);
        
        // Get company logo
        const companyUrl = formData.website.startsWith('http') ? formData.website : `https://${formData.website}`;
        const companyLogo = await getValidLogoUrl(companyUrl);
        
        await setDoc(docRef, {
          userId: user.uid,
          companyName: companyDetails?.name || getDomainFromUrl(formData.website),
          companyURL: companyUrl,
          companyLogo: companyLogo,
          competitorName: selectedCompetitor.name,
          competitorURL: competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`,
          competitorLogo: competitorLogo,
          createdAt: serverTimestamp()
        });

        // Store the document ID for later use
        setSavedAnalysisId(docId);

        console.log('Saved analysis data:', docId);
      } catch (err) {
        console.error('Error saving analysis:', err);
        toast({
          title: "Error",
          description: "Failed to save analysis data. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAnalysisError(null);
    
    try {
      // Get competitor details
      let competitorUrl = '';
      
      // Check if it's from dynamic list or manual entry
      const fromDynamicList = dynamicCompetitors.find(c => c.name === formData.competitor);
      if (fromDynamicList) {
        competitorUrl = fromDynamicList.website;
      } else if (manualCompetitorInfo) {
        competitorUrl = manualCompetitorInfo.url || '';
      }

      if (!competitorUrl) {
        throw new Error("Competitor URL not found");
      }

      // Ensure URL has protocol
      competitorUrl = competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`;

      // Get the overview prompt template
      const promptRef = doc(collection(db, "prompts"), "fetchAnalysis");
      const promptDoc = await getDoc(promptRef);
      
      if (!promptDoc.exists()) {
        throw new Error("Overview prompt not found in database");
      }
      
      const promptTemplate = promptDoc.data().prompt;
      
      // Replace placeholders in the prompt with competitor info
      const systemPrompt = promptTemplate
        .replace("{companyName}", formData.competitor)
        .replace("{companyURL}", competitorUrl);
        
      // Make the API request with proper error handling
      const response = await fetch("/api/ask-gpt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          messages: [{ 
            role: "system", 
            content: systemPrompt 
          }],
          temperature: 0.7,
          model: "gpt-4-turbo-preview"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error("No content in API response");
      }
      
      // Parse and validate the response
      let overview;
      try {
        // First, check if we already have the analysis saved
        if (!savedAnalysisId) {
          throw new Error("No saved analysis ID found");
        }

        const docRef = doc(db, "savedAnalysis", savedAnalysisId);
        const savedDoc = await getDoc(docRef);

        // If we already have the overview data, use it instead of calling OpenAI
        if (savedDoc.exists() && savedDoc.data().overview) {
          setAnalysisResult(JSON.stringify({ companyOverview: savedDoc.data().overview }, null, 2));
          navigate(`/analysis/${savedAnalysisId}`);
          return;
        }

        // If no saved overview, proceed with OpenAI call
        const content = data.content.trim();
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        
        // Try to parse the JSON
        overview = JSON.parse(jsonStr);
        
        // Validate the response structure
        if (!overview || typeof overview !== 'object') {
          throw new Error("Invalid response format - not a JSON object");
        }
        
        if (!overview.companyOverview) {
          throw new Error("Invalid response format - missing companyOverview object");
        }

        // Validate required fields
        const requiredFields = [
          'companyName',
          'companyURL',
          'oneLiner',
          'founders',
          'foundedYear',
          'headcount',
          'hqLocation',
          'serviceLocations',
          'businessModel',
          'targetMarket'
        ];

        const missingFields = requiredFields.filter(field => !overview.companyOverview[field]);
        if (missingFields.length > 0) {
          throw new Error(`Invalid response format - missing required fields: ${missingFields.join(', ')}`);
        }

        // Get the competitor's domain for logo
        const competitorDomain = getDomainFromUrl(competitorUrl);
        
        // Try to get logo from different sources in order of preference:
        // 1. GPT-provided logo if valid
        // 2. Clearbit logo
        // 3. Fallback to first letter of company name
        let logoUrl = null;
        
        // Try GPT-provided logo
        if (overview.companyOverview.companyLogo) {
          const isValid = await isValidLogoUrl(overview.companyOverview.companyLogo);
          if (isValid) {
            logoUrl = overview.companyOverview.companyLogo;
          }
        }
        
        // If no valid logo from GPT, try Clearbit
        if (!logoUrl) {
          const clearbitUrl = `https://logo.clearbit.com/${competitorDomain}`;
          const isValid = await isValidLogoUrl(clearbitUrl);
          if (isValid) {
            logoUrl = clearbitUrl;
          }
        }

        // Update the existing document with overview data
        await updateDoc(docRef, {
          overview: overview.companyOverview,
          competitorLogo: logoUrl,
          updatedAt: serverTimestamp(),
          // Include additional context
          context: {
            industry: formData.industry,
            role: formData.role,
            goal: formData.goal
          }
        });

        setAnalysisResult(JSON.stringify(overview, null, 2));
        
        // Navigate to the analysis page
        navigate(`/analysis/${savedAnalysisId}`);
      } catch (parseError) {
        console.error("Failed to parse overview:", {
          error: parseError,
          content: data.content
        });
        throw new Error(`Failed to parse overview data: ${parseError.message}`);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setAnalysisError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch company details and competitors in Step 2
  useEffect(() => {
    const fetchData = async () => {
      if (currentStep !== 2 || !formData.website) return;
      
      // Reset states
      setCompanyDetailsLoading(true);
      setCompanyDetailsError("");
      setCompanyDetails(null);
      setCompetitorsLoading(true);
      setCompetitorsError("");
      setDynamicCompetitors([]);

      try {
        // First fetch company details
        const info = await fetchScrapedCompanyInfo(formData.website);
        const companyInfo = { 
          name: info.title || getDomainFromUrl(formData.website), 
          description: info.description || 'No description available', 
          logo: info.favicon 
        };
        setCompanyDetails(companyInfo);
        setCompanyDetailsError("");

        // Then fetch competitors using the company info
        const companyName = companyInfo.name;
        const companyDesc = companyInfo.description;
        
        try {
          // Get the prompt from Firestore
          const promptTemplate = await fetchCompetitorFetchingPrompt();
          console.group('Competitor Fetching');
          console.log('Prompt Template:', promptTemplate);

          const prompt = promptTemplate
            .replace('{companyName}', companyName)
            .replace('{companyDesc}', companyDesc);

          console.log('Final Prompt:', prompt);
          console.groupEnd();

      const res = await fetch("/api/ask-gpt", {
        method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({ 
              messages: [
                {
                  role: "system",
                  content: "You are a competitive intelligence expert. Your task is to identify real, direct competitors for the given company. Return ONLY valid JSON array."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7,
              model: "gpt-4-turbo-preview"
            })
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(errorData.error || `API request failed: ${res.status}`);
          }

      const data = await res.json();
          console.log('API Response:', data);

          if (!data.content) {
            throw new Error('No content received from API');
          }

          // Parse competitors from response
          let competitors = [];
          try {
            const content = data.content.trim();
            // Handle potential markdown code block
            const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
            competitors = JSON.parse(jsonStr);
          } catch (err) {
            console.error('Failed to parse competitors:', err);
            throw new Error('Failed to parse competitors list');
          }

          if (!Array.isArray(competitors)) {
            throw new Error('Invalid competitors format received');
          }

          if (competitors.length === 0) {
            throw new Error('No competitors found');
          }

          setDynamicCompetitors(competitors);
          setCompetitorsError("");
        } catch (err) {
          console.error('Error fetching competitors:', err);
          setCompetitorsError(err.message || "Failed to fetch competitors. Please try again or add manually.");
        }
      } catch (err) {
        console.error('Error fetching company details:', err);
        setCompanyDetailsError("Failed to fetch company details. Please try again.");
      } finally {
        setCompanyDetailsLoading(false);
        setCompetitorsLoading(false);
      }
    };

    fetchData();
  }, [currentStep, formData.website]);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserData(userData);
        // Fetch plan details
        if (userData.plan) {
          const planRef = doc(db, "plans", userData.plan);
          const planSnap = await getDoc(planRef);
          if (planSnap.exists()) {
            setPlanData(planSnap.data());
          }
        }
      }
      setLoadingUserData(false);
    };
    fetchUserData();
  }, []);

  const addCustomCompetitor = async () => {
    if (!customCompetitor.trim()) return;
    if (!isValidUrl(customCompetitor.trim())) {
      setCustomCompetitorError("Please enter a valid competitor URL (e.g. competitor.com or https://competitor.com)");
      return;
    }
    setCustomCompetitorError("");
    setAddedCompetitor(customCompetitor);
    
    // Fetch info for manual competitor
    try {
      // Normalize the URL first
      const normalizedUrl = customCompetitor.startsWith('http') ? customCompetitor : `https://${customCompetitor}`;
      
      // Try to get company info
      const info = await fetchScrapedCompanyInfo(normalizedUrl);
      
      // Get the competitor name, with proper fallbacks
      const competitorName = info.title || getDomainFromUrl(normalizedUrl);
      
      // Get the logo URL using our robust logo fetching
      const domain = getDomainFromUrl(normalizedUrl);
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      const isValidClearbit = await isValidLogoUrl(clearbitUrl);
      const logoUrl = isValidClearbit ? clearbitUrl : (info.favicon || null);
      
    setManualCompetitorInfo({
        name: competitorName,
        logo: logoUrl,
        url: normalizedUrl
      });
      // Set the competitor name in formData
      setFormData(prev => ({ ...prev, competitor: competitorName }));
    } catch (err) {
      console.error('Error fetching competitor info:', err);
      const fallbackName = getDomainFromUrl(customCompetitor);
      setManualCompetitorInfo({
        name: fallbackName,
      url: customCompetitor.startsWith('http') ? customCompetitor : `https://${customCompetitor}`
    });
      // Set the fallback name in formData
      setFormData(prev => ({ ...prev, competitor: fallbackName }));
    }
    setCustomCompetitor("");
  };

  const removeCustomCompetitor = () => {
    setAddedCompetitor("");
    setFormData({ ...formData, competitor: "" });
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, website: value });
    if (!isValidUrl(value)) {
      setWebsiteError("Please enter a valid website URL (e.g. example.com or https://example.com)");
    } else {
      setWebsiteError("");
    }
  };

  const handleWebsiteBlur = async () => {
    if (!isValidUrl(formData.website)) {
      setWebsiteError("Please enter a valid website URL (e.g. example.com or https://example.com)");
      return;
    }
    setWebsiteError("");
    setCompanyInfo(null);
    setFetchingCompanyInfo(true);
    try {
      const info = await fetchScrapedCompanyInfo(formData.website);
      setCompanyInfo({ name: info.title, description: info.description, logo: info.favicon });
    } catch {
      setCompanyInfo(null);
    }
    setFetchingCompanyInfo(false);
  };

  // Validation for Step 3
  const canGenerateReport = () => {
    return formData.role && formData.goal && (formData.competitor || addedCompetitor);
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
                  onChange={handleWebsiteChange}
                  onBlur={handleWebsiteBlur}
                  className="mt-1"
                  disabled={fetchingCompanyInfo}
                />
                {websiteError && <div className="text-red-600 text-xs mt-1">{websiteError}</div>}
                {fetchingCompanyInfo && <div className="text-slate-500 text-xs mt-1">Fetching company info...</div>}
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
              disabled={!isValidUrl(formData.website)}
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
            {/* Always show company details at the top */}
            <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 rounded border">
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded">
                {(!companyDetails?.logo || failedCompanyLogo)
                  ? DUMMY_LOGO
                  : (
                      <img
                        src={companyDetails.logo}
                        alt="logo"
                        className="w-8 h-8 object-contain rounded"
                        onError={() => setFailedCompanyLogo(true)}
                      />
                    )}
              </div>
              <div>
                <div className="font-medium text-slate-900">{cleanCompanyName(companyDetails?.name) || getDomainFromUrl(formData.website)}</div>
                <div className="text-xs text-slate-600">{companyDetails?.description || ''}</div>
              </div>
            </div>
            {companyDetailsLoading && <div className="text-slate-500 text-xs mb-2">Fetching company details...</div>}
            {companyDetailsError && (
              <div className="text-red-600 text-xs mb-2">Could not fetch company details. Please try again or continue without company info.</div>
            )}
            {/* Log raw error to console for debugging */}
            {companyDetailsError && companyDetailsError.startsWith('Could not parse company details. Raw:') && (
              (() => { console.warn(companyDetailsError); return null; })()
            )}
            {/* Debug: Show raw competitors if missing */}
            {!competitorsLoading && dynamicCompetitors.length === 0 && !competitorsError && (
              <div className="text-xs text-amber-600 mb-2">No competitors found. (Check API response in console)</div>
            )}
            {competitorsError && (
              <div className="text-red-600 text-xs mb-2">Could not fetch competitors. Please try again or add manually.</div>
            )}
            {/* Log raw error to console for debugging */}
            {competitorsError && competitorsError.startsWith('Could not parse competitors. Raw:') && (
              (() => { console.warn(competitorsError); return null; })()
            )}
            {dynamicCompetitors.length > 0 && (
              <div className="space-y-4">
                {dynamicCompetitors.map((competitor) => (
                  <Card
                    key={competitor.website}
                    className={`cursor-pointer transition-colors ${
                      formData.competitor === competitor.name ? 'border-primary' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, competitor: competitor.name })}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-200">
                        <img
                          src={`https://logo.clearbit.com/${getDomainFromUrl(competitor.website)}`}
                          alt={`${competitor.name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `<div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                              ${competitor.name[0]?.toUpperCase() || '?'}
                            </div>`;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{competitor.name}</h3>
                        <a 
                          href={competitor.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {competitor.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {formData.competitor === competitor.name && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* Show manually added competitor if present */}
            {addedCompetitor && manualCompetitorInfo && (
              <div className="mt-4">
                <Card
                  className={`cursor-pointer transition-colors ${formData.competitor === manualCompetitorInfo.name ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'}`}
                  onClick={() => setFormData({ ...formData, competitor: manualCompetitorInfo.name || addedCompetitor })}
                >
                  <CardContent className="p-4 flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-200">
                        {manualCompetitorInfo?.logo ? (
                          <img
                            src={manualCompetitorInfo.logo}
                            alt={`${manualCompetitorInfo.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<div class=\"w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold\">${manualCompetitorInfo.name?.[0]?.toUpperCase() || addedCompetitor[0]?.toUpperCase() || '?'}</div>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                            {manualCompetitorInfo?.name?.[0]?.toUpperCase() || addedCompetitor[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{manualCompetitorInfo?.name || addedCompetitor}</h3>
                        <a 
                          href={manualCompetitorInfo?.url || `https://${addedCompetitor}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {addedCompetitor}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeCustomCompetitor(); }}>
                        <X className="w-4 h-4" />
                      </Button>
                      {formData.competitor === manualCompetitorInfo.name && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Fallback to manual competitor add if none found */}
            {!addedCompetitor && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Or Add Competitor Manually</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="competitor-domain.com"
                    value={customCompetitor}
                    onChange={(e) => {
                      setCustomCompetitor(e.target.value);
                      if (e.target.value && !isValidUrl(e.target.value)) {
                        setCustomCompetitorError("Please enter a valid competitor URL (e.g. competitor.com or https://competitor.com)");
                      } else {
                        setCustomCompetitorError("");
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={addCustomCompetitor} disabled={!customCompetitor || !!customCompetitorError}>
                    Add
                  </Button>
                </div>
                {customCompetitorError && <div className="text-red-600 text-xs mt-1">{customCompetitorError}</div>}
              </div>
            )}
            <Button
              onClick={handleNext}
              className="w-full"
              disabled={(!formData.competitor && !addedCompetitor) || competitorsLoading}
            >
              Next
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Context</h2>
              <p className="text-slate-600">Help us personalize your analysis</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-700 mb-1">What's your role?</label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role" className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary transition">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg border border-slate-200">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="text-base px-4 py-2 cursor-pointer hover:bg-primary/10 focus:bg-primary/10 rounded">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="goal" className="text-sm font-medium text-slate-700 mb-1">What's your analysis goal?</label>
                <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                  <SelectTrigger id="goal" className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary transition">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg border border-slate-200">
                    {goals.map((goal) => (
                      <SelectItem key={goal} value={goal} className="text-base px-4 py-2 cursor-pointer hover:bg-primary/10 focus:bg-primary/10 rounded">
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 mt-6"
              onClick={handleGenerateReport}
              disabled={!canGenerateReport() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-slate-600">Generating your competitive analysis...</p>
              </div>
            ) : analysisError ? (
              <div className="text-red-500 text-center">{analysisError}</div>
            ) : analysisResult ? (
              <div className="w-full space-y-6">
                {(() => {
                  try {
                    const analysis = extractFirstJson(analysisResult);
                    if (!analysis) return <div className="text-red-500">Failed to parse analysis result</div>;

                    return (
                      <>
                        <Card>
                <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Company Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Basic Info</h4>
                                <div className="space-y-1">
                                  <div className="text-sm"><span className="font-medium">Name:</span> {analysis.companyOverview.name}</div>
                                  <div className="text-sm"><span className="font-medium">Website:</span> {analysis.companyOverview.website}</div>
                                  <div className="text-sm"><span className="font-medium">Industry:</span> {analysis.companyOverview.industry}</div>
                                  <div className="text-sm"><span className="font-medium">Founded:</span> {analysis.companyOverview.founded}</div>
                                  <div className="text-sm"><span className="font-medium">Employees:</span> {analysis.companyOverview.employees}</div>
                                  <div className="text-sm"><span className="font-medium">HQ:</span> {analysis.companyOverview.hq}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <div className="text-sm text-slate-600">{analysis.companyOverview.description}</div>
                                <h4 className="font-medium mt-4 mb-2">Tagline</h4>
                                <div className="text-sm text-slate-600">{analysis.companyOverview.tagline}</div>
                              </div>
                            </div>
                </CardContent>
              </Card>

                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Competitor Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Basic Info</h4>
                                <div className="space-y-1">
                                  <div className="text-sm"><span className="font-medium">Name:</span> {analysis.competitorOverview.name}</div>
                                  <div className="text-sm"><span className="font-medium">Website:</span> {analysis.competitorOverview.website}</div>
                                  <div className="text-sm"><span className="font-medium">Industry:</span> {analysis.competitorOverview.industry}</div>
                                  <div className="text-sm"><span className="font-medium">Founded:</span> {analysis.competitorOverview.founded}</div>
                                  <div className="text-sm"><span className="font-medium">Employees:</span> {analysis.competitorOverview.employees}</div>
                                  <div className="text-sm"><span className="font-medium">HQ:</span> {analysis.competitorOverview.hq}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <div className="text-sm text-slate-600">{analysis.competitorOverview.description}</div>
                                <h4 className="font-medium mt-4 mb-2">Tagline</h4>
                                <div className="text-sm text-slate-600">{analysis.competitorOverview.tagline}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Market Metrics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Market Size & Growth</h4>
                                <div className="space-y-1">
                                  <div className="text-sm"><span className="font-medium">Market Size:</span> {analysis.marketMetrics.marketSize}</div>
                                  <div className="text-sm"><span className="font-medium">Growth Rate:</span> {analysis.marketMetrics.growthRate}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Key Markets</h4>
                                <div className="space-y-1">
                                  {analysis.marketMetrics.keyMarkets?.length > 0 ? (
                                    analysis.marketMetrics.keyMarkets.map((market: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{market}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No key markets information available</div>
                                  )}
                                </div>
                                <h4 className="font-medium mt-4 mb-2">Global Presence</h4>
                                <div className="text-sm text-slate-600">{analysis.marketMetrics.globalPresence}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Audience Insights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Target Audience</h4>
                                <div className="text-sm text-slate-600">{analysis.audienceInsights.targetAudience}</div>
                                <h4 className="font-medium mt-4 mb-2">Customer Segments</h4>
                                <div className="space-y-1">
                                  {analysis.audienceInsights.customerSegments?.length > 0 ? (
                                    analysis.audienceInsights.customerSegments.map((segment: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{segment}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No customer segment information available</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">User Personas</h4>
                                <div className="space-y-1">
                                  {analysis.audienceInsights.userPersonas?.length > 0 ? (
                                    analysis.audienceInsights.userPersonas.map((persona: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{persona}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No user persona information available</div>
                                  )}
                                </div>
                                <h4 className="font-medium mt-4 mb-2">Geographies</h4>
                                <div className="space-y-1">
                                  {analysis.audienceInsights.geographies?.length > 0 ? (
                                    analysis.audienceInsights.geographies.map((geo: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{geo}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No geography information available</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Features</h4>
                                <div className="space-y-1">
                                  {analysis.product.features?.length > 0 ? (
                                    analysis.product.features.map((feature: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{feature}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No feature information available</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Differentiators</h4>
                                <div className="space-y-1">
                                  {analysis.product.differentiators?.length > 0 ? (
                                    analysis.product.differentiators.map((diff: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{diff}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No differentiator information available</div>
                                  )}
                                </div>
                                <h4 className="font-medium mt-4 mb-2">Pricing Model</h4>
                                <div className="text-sm text-slate-600">{analysis.product.pricingModel}</div>
                                <h4 className="font-medium mt-4 mb-2">Integrations</h4>
                                <div className="space-y-1">
                                  {analysis.product.integrations?.length > 0 ? (
                                    analysis.product.integrations.map((integration: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{integration}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No integration information available</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Plans</h4>
                                <div className="space-y-1">
                                  {analysis.pricing.plans?.length > 0 ? (
                                    analysis.pricing.plans.map((plan: string, i: number) => (
                                      <div key={i} className="text-sm text-slate-600">{plan}</div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-slate-600">No pricing plan information available</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Details</h4>
                                <div className="text-sm text-slate-600">{analysis.pricing.details}</div>
                                <h4 className="font-medium mt-4 mb-2">Last Known Valuation</h4>
                                <div className="text-sm text-slate-600">{analysis.pricing.lastKnownValuation}</div>
                                <h4 className="font-medium mt-4 mb-2">Funding Status</h4>
                                <div className="text-sm text-slate-600">{analysis.pricing.fundingStatus}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  } catch (err) {
                    console.error('Error rendering analysis:', err);
                    return <div className="text-red-500">Failed to render analysis result</div>;
                  }
                })()}
              </div>
            ) : (
              <div className="text-slate-500">No analysis generated yet.</div>
            )}
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

// Helper to get and validate a logo URL
async function getValidLogoUrl(url: string): Promise<string | null> {
  // First try to get logo from scraping
  try {
    const info = await fetchScrapedCompanyInfo(url);
    if (info.favicon) {
      const resolvedUrl = resolveUrl(url, info.favicon);
      if (resolvedUrl) {
        const isValid = await isValidLogoUrl(resolvedUrl);
        if (isValid) {
          return resolvedUrl;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch scraped logo:', err);
  }
  
  // If scraping fails, try Clearbit
  try {
    const domain = getDomainFromUrl(url);
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const isValid = await isValidLogoUrl(clearbitUrl);
    if (isValid) {
      return clearbitUrl;
    }
  } catch (err) {
    console.warn('Failed to fetch Clearbit logo:', err);
  }
  
  return null;
}

// Helper to resolve relative URLs
function resolveUrl(baseUrl: string, relativeUrl: string): string | null {
  if (!relativeUrl) return null;
  try {
    // If it's already an absolute URL, return it
    new URL(relativeUrl);
    return relativeUrl;
  } catch {
    // If it's a relative URL, resolve it against the base URL
    try {
      const base = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
      // Handle protocol-relative URLs
      if (relativeUrl.startsWith('//')) {
        return `${base.protocol}${relativeUrl}`;
      }
      // Handle root-relative URLs
      if (relativeUrl.startsWith('/')) {
        return `${base.origin}${relativeUrl}`;
      }
      // Handle relative URLs
      return new URL(relativeUrl, base.origin).href;
    } catch {
      return null;
    }
  }
}
