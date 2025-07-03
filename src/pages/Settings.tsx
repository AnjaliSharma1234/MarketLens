
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import { 
  User, 
  Mail, 
  CreditCard, 
  Users, 
  Trash2,
  Plus,
  Crown,
  Shield
} from "lucide-react";

const Settings = () => {
  const [email, setEmail] = useState("john.doe@example.com");
  const [name, setName] = useState("John Doe");

  const teamMembers = [
    { id: 1, name: "Sarah Wilson", email: "sarah@company.com", role: "Admin", avatar: "SW" },
    { id: 2, name: "Mike Chen", email: "mike@company.com", role: "Member", avatar: "MC" },
    { id: 3, name: "Lisa Johnson", email: "lisa@company.com", role: "Member", avatar: "LJ" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage your account and team preferences</p>
          </div>

          {/* Profile Settings */}
          <Card className="premium-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-sm text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <Button className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Plan Management */}
          <Card className="premium-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Plan & Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Premium Plan</h3>
                    <p className="text-sm text-slate-600">50 analyses per month</p>
                  </div>
                </div>
                <Badge className="bg-primary">Active</Badge>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">12</div>
                  <div className="text-sm text-slate-600">Used this month</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">38</div>
                  <div className="text-sm text-slate-600">Remaining</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">Dec 28</div>
                  <div className="text-sm text-slate-600">Renewal date</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing History
                </Button>
                <Button variant="outline">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="premium-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{member.name}</h4>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {member.role !== 'Admin' && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="premium-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Change Password</h4>
                  <p className="text-sm text-slate-500">Update your account password</p>
                </div>
                <Button variant="outline">Update</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="premium-shadow border-0 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Delete Account</h4>
                  <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
