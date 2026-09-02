import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, FileText } from "lucide-react";
import { IconButton } from "../ui/IconButton";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Reports", icon: FileText, path: "/reports" },
  ];

  return (
    <header className="sticky top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
        <div className="font-bold text-xl text-indigo-600">Facility Safety</div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center gap-2 font-medium transition-colors ${
                location.pathname === item.path ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.name}
            </Link>
          ))}
        </nav>

        <div className="md:hidden">
          <IconButton icon={isMenuOpen ? X : Menu} onClick={() => setIsMenuOpen(!isMenuOpen)} />
        </div>
      </div>
    </header>
  );
};