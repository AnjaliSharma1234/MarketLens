import { useState, useEffect } from "react";
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
  Shield,
  X
} from "lucide-react";
import { onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Plan {
  id: string;
  name: string;
  price: number;
  analysesPerMonth: number;
}

const Settings = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [plan, setPlan] = useState<string>("");
  const [analysesUsed, setAnalysesUsed] = useState<number>(0);
  const [billingRenewalDate, setBillingRenewalDate] = useState<Date | null>(null);
  const [planDetails, setPlanDetails] = useState<Plan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.displayName || "");
          setEmail(data.email || "");
          setPlan(data.plan || "free");
          setAnalysesUsed(data.analysesUsedThisMonth || 0);
          setBillingRenewalDate(data.billingRenewalDate ? data.billingRenewalDate.toDate() : null);
          // Fetch plan details
          if (data.plan) {
            const planDoc = await getDoc(doc(db, "plans", data.plan));
            if (planDoc.exists()) {
              setPlanDetails(planDoc.data() as Plan);
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch all plans for upgrade modal
    const fetchPlans = async () => {
      const plansSnap = await getDocs(collection(db, "plans"));
      const plansArr: Plan[] = plansSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Plan) }));
      plansArr.sort((a, b) => a.price - b.price);
      setAllPlans(plansArr);
    };
    fetchPlans();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { displayName: name });
    }
  };

  const handlePasswordReset = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Password mismatch while confirming password.");
      return;
    }
    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setPasswordSuccess("Password has been reset.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordModal(false), 1500);
      } catch (err: any) {
        if (err.code === "auth/wrong-password") {
          setPasswordError("Incorrect current password.");
        } else if (err.code === "auth/weak-password") {
          setPasswordError("Weak password. Password should be at least 6 characters.");
        } else {
          setPasswordError("Failed to reset password. Please try again.");
        }
      }
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    const user = auth.currentUser;
    if (user) {
      try {
        // Delete user document from Firestore
        await deleteDoc(doc(db, "users", user.uid));
        // Delete user from Firebase Auth
        await deleteUser(user);
        navigate("/");
      } catch (err: any) {
        setDeleteError("Failed to delete account. Please re-authenticate and try again.");
      }
    }
  };

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
                  {name.split(" ").map(n => n[0]).join("").toUpperCase()}
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
              
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveChanges}>
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
                    <h3 className="font-semibold text-slate-900">{planDetails ? planDetails.name : "-"}</h3>
                    <p className="text-sm text-slate-600">{planDetails ? (planDetails.analysesPerMonth === -1 ? "Unlimited analyses per month" : `${planDetails.analysesPerMonth} analyses per month`) : "-"}</p>
                  </div>
                </div>
                <Badge className="bg-primary">Active</Badge>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{analysesUsed}</div>
                  <div className="text-sm text-slate-600">Used this month</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{planDetails ? (planDetails.analysesPerMonth === -1 ? "∞" : Math.max(0, planDetails.analysesPerMonth - analysesUsed)) : "-"}</div>
                  <div className="text-sm text-slate-600">Remaining</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{billingRenewalDate ? format(billingRenewalDate, "MMM d") : "-"}</div>
                  <div className="text-sm text-slate-600">Renewal date</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowUpgradeModal(true)}>
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Management section hidden for now */}

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
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Update</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Log Out</h4>
                  <p className="text-sm text-slate-500">Sign out of your account</p>
                </div>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setShowLogout(true)}>
                  Log Out
                </Button>
              </div>
              {showLogout && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                    <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
                    <p className="mb-6">Are you sure you want to log out?</p>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowLogout(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-primary text-white" onClick={handleLogout}>
                        Proceed
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {showPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                    <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <input type="password" className="w-full border rounded px-3 py-2" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <input type="password" className="w-full border rounded px-3 py-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <input type="password" className="w-full border rounded px-3 py-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    {passwordError && <div className="text-red-600 text-sm mb-2">{passwordError}</div>}
                    {passwordSuccess && <div className="text-green-600 text-sm mb-2">{passwordSuccess}</div>}
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(""); }}>
                        Cancel
                      </Button>
                      <Button className="bg-primary text-white" onClick={handlePasswordReset}>
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </Button>
              </div>
              {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                    <h3 className="text-lg font-semibold mb-4 text-red-700">Delete Account</h3>
                    <p className="mb-6 text-slate-700">Are you sure you want to permanently delete your account? <br/>All your saved analysis and data will be lost. This action cannot be undone.</p>
                    {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-red-600 text-white" onClick={handleDeleteAccount}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700" onClick={() => setShowUpgradeModal(false)}>
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Upgrade Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {allPlans.map((p) => {
                const isCurrent = plan === p.id;
                const canUpgrade = !isCurrent && (planDetails && p.price > planDetails.price);
                return (
                  <div key={p.id} className={`rounded-xl border p-6 flex flex-col items-center ${isCurrent ? 'border-primary bg-primary/10' : 'border-slate-200 bg-slate-50'}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${isCurrent ? 'bg-primary text-white' : 'bg-slate-200 text-primary'}`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 text-slate-900">{p.name}</h3>
                    <div className="text-2xl font-bold mb-2 text-slate-900">{p.price === 0 ? 'Free' : `$${p.price}/mo`}</div>
                    <div className="text-sm text-slate-600 mb-4">{p.analysesPerMonth === -1 ? 'Unlimited analyses per month' : `${p.analysesPerMonth} analyses per month`}</div>
                    {isCurrent && <Badge className="bg-primary">Current Plan</Badge>}
                    {canUpgrade && (
                      <Button className="mt-4 w-full" onClick={async () => {
                        const user = auth.currentUser;
                        if (user) {
                          await updateDoc(doc(db, 'users', user.uid), { plan: p.id });
                          setPlan(p.id);
                          setPlanDetails(p);
                          setShowUpgradeModal(false);
                        }
                      }}>
                        Upgrade
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
