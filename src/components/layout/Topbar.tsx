import React, { useState } from 'react';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="h-16 bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl flex items-center justify-between px-6 border-b border-gray-700 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </div>
      
      {/* Left section */}
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-gray-300 transition-all duration-300 transform hover:scale-110 text-xl p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
        >
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
            <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
            <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
          </div>
        </button>
        
        {/* Tool name with creative styling */}
        <div className="relative">
          <span className="font-black text-2xl bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent tracking-tight">
            CodeBoard
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
        </div>
      </div>

      {/* Center section - Empty for cleaner layout */}
      <div className="flex items-center z-10">
      </div>

      {/* Right section - Dashboard and Auth */}
      <div className="flex items-center gap-3 z-10">
        <button className="text-white hover:text-gray-300 font-medium px-6 py-2 rounded-full border border-gray-600 hover:border-white transition-all duration-300 transform hover:scale-105 hover:bg-white hover:bg-opacity-10 relative overflow-hidden group">
          <span className="relative z-10">Dashboard</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </button>
        
        {!isLoggedIn ? (
          <button 
            onClick={() => setIsLoggedIn(true)}
            className="text-white hover:text-black font-semibold px-5 py-2 rounded-full border-2 border-white hover:bg-white transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">Log In</span>
            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-sm">
              U
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-white hover:text-red-300 font-medium px-4 py-2 rounded-full border border-gray-600 hover:border-red-400 transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-30"></div>
      </div>
    </div>
  );
};

export default Topbar;