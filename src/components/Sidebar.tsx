import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, User, Settings } from "lucide-react";
const navigation = [{
  name: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard
}, {
  name: 'Saved Reports',
  href: '/saved-reports',
  icon: BookOpen
}];
const Sidebar = () => {
  const navigate = useNavigate();
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  return <div className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ML</span>
          </div>
          <span className="font-bold text-xl text-slate-900">MarketLens</span>
        </div>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map(item => <NavLink key={item.name} to={item.href} className={({
        isActive
      }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}>
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>)}
      </nav>
      
      <div className="absolute bottom-6 left-4 right-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-300 w-full max-w-[230px]">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Anjali Sharma</p>
          </div>
          <button onClick={handleSettingsClick} className="p-1 hover:bg-white rounded transition-colors">
            <Settings className="w-4 h-4 text-slate-500 hover:text-slate-700" />
          </button>
        </div>
      </div>
    </div>;
};
export default Sidebar;