
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Welcome Message */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Premium Competitive Intelligence</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Welcome to
              <span className="block text-primary mt-2">MarketLens</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Unlock deep competitive insights with AI-powered analysis. 
              Transform how you understand your market landscape.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">10K+</div>
              <div className="text-sm text-slate-600">Companies Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">95%</div>
              <div className="text-sm text-slate-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">24/7</div>
              <div className="text-sm text-slate-600">Real-time Updates</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md premium-shadow border-0">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {isSignUp ? "Create Account" : "Sign In"}
                </h2>
                <p className="text-slate-600">
                  {isSignUp 
                    ? "Join thousands of marketers already using MarketLens" 
                    : "Continue to your competitive intelligence dashboard"
                  }
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-slate-200 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-slate-200 focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>
              
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-3 text-xs text-slate-500">OR CONTINUE WITH</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full h-12 border-slate-200 hover:bg-slate-50"
              >
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  className="w-5 h-5 mr-3"
                />
                Continue with Google
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
