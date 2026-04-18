import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Languages, Layers, History, Layout, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { Panel } from './ui/Panel';

interface NavSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export const NavSidebar: React.FC<NavSidebarProps> = ({ isCollapsed, onToggle, onOpenSettings }) => {
  const navItems = [
    { to: '/', icon: <Layout size={20} />, label: 'Reader View', desc: 'Scan & Translate' },
    { to: '/grammar', icon: <BookOpen size={20} />, label: 'Grammar Guide', desc: 'Learning Rules' },
    { to: '/flashcards', icon: <Layers size={20} />, label: 'Word Collection', desc: 'Your Vocabulary' },
    { to: '/history', icon: <History size={20} />, label: 'Past Scans', desc: 'Recent Captures' },
  ];

  return (
    <Panel 
      variant="sidebar" 
      className={cn(
        "flex flex-col p-6 fixed h-full select-none overflow-y-auto transition-all duration-300 z-50",
        isCollapsed ? "w-20 px-4" : "w-80"
      )}
    >
      <div className={cn("flex items-center gap-3 mb-10 group", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-md">
              <Languages className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">Lingo<span className="text-blue-400">Companion</span></h1>
              <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Study Assistant</div>
            </div>
          </div>
        )}
        <button 
          onClick={onToggle}
          className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) => cn(
              "flex items-center gap-4 p-3 rounded-lg transition-all group",
              isActive 
                ? "bg-blue-600/10 border border-blue-600/20 text-blue-400" 
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            )}
          >
            <div className="shrink-0">
              {item.icon}
            </div>
            {!isCollapsed && (
              <div>
                <div className="font-semibold text-sm tracking-tight">{item.label}</div>
                <div className="text-[10px] opacity-50 uppercase tracking-tighter">{item.desc}</div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
        <button
          onClick={onOpenSettings}
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg transition-all text-gray-400 hover:bg-white/5 hover:text-white w-full",
            isCollapsed && "justify-center"
          )}
        >
          <Settings size={20} />
          {!isCollapsed && <span className="font-semibold text-sm">Settings</span>}
        </button>
        
        {!isCollapsed && (
          <div className="text-[9px] text-gray-500 uppercase tracking-widest text-center opacity-50">
            System Ready
          </div>
        )}
      </div>
    </Panel>
  );
};
