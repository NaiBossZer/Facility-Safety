import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  return (
    <nav className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Facility Safety</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:space-x-8 items-center">
            <a href="#" className="flex items-center gap-2 border-blue-500 text-gray-900 px-1 pt-1 border-b-2 text-sm font-medium h-full">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 px-1 pt-1 border-b-2 'border-transparent' text-sm font-medium h-full">
              <FileText className="w-4 h-4" /> Reports
            </a>
          </div>

          {/* Action Section */}
          <div className="flex items-center">
            <button className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}