import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, User, Settings, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const navigation = [{
  name: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard
}, {
  name: 'Saved Reports',
  href: '/saved-reports',
  icon: BookOpen
}, {
  name: 'Ask Me Anything',
  href: '/ask',
  icon: MessageCircle
}];

const Sidebar = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ displayName: "", email: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({
            displayName: data.displayName || "",
            email: data.email || ""
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-background border-r z-40">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ML</span>
            </div>
            <span className="font-bold text-xl">MarketLens</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map(item => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-foreground/10">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-foreground truncate">
                {userInfo.displayName}
              </p>
              <p className="text-xs text-primary-foreground/80 truncate">
                {userInfo.email}
              </p>
            </div>
            <button 
              onClick={handleSettingsClick} 
              className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
            >
              <Settings className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;