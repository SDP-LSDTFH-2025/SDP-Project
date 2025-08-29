import React, { useState } from 'react';

// Navigation data for middle section
const navData = [
  {
    title: 'My Courses',
    view: 'dashboard',
  },
  {
    title: 'All Courses',
    view: 'allcourses',
  },
  {
    title: 'Groups',
    view: 'groups',
  },
  {
    title: 'Buddies',
    view: 'buddies',
  },
  {
    title: 'Chats',
    view: 'events',
  },
  {
    title: 'Events',
    view: 'events',
  },
];

// Account data for far-right dropdown
const accountData = [
  {
    title: 'Profile',
    view: 'profile',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 2-4 2-4 2 .896 2 2zM14 21H6a2 2 0 01-2-2V5a2 2 0 012-2h8m4 0v18m0-9h-4m4 0h4"></path>
      </svg>
    ),
  },
  {
    title: 'Settings',
    view: 'settings',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path>
      </svg>
    ),
  },
  {
    title: 'Logout',
    view: 'logout',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1"></path>
      </svg>
    ),
  },
];

function Dashboard({ setView }) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  function toggleAccountMenu(){
    setIsAccountOpen(!isAccountOpen);
  };

  function logout(){
    localStorage.removeItem("user");
    window.location.reload();
  };

    function handleNavClick(view){
    if (view === 'logout') {
      logout();
    } else {
      setView(view);
      setIsAccountOpen(false); // Close dropdown after selection
    }
  };

  return (
    <nav className="bg-white text-white w-full py-8 px-6 flex items-center justify-between shadow-md fixed top-0 left-0 z-50">

      <div className="text-3xl font-bold">
        <a href="/">StuddyBuddy</a>
      </div>

      <div className="flex items-center space-x-6">
        {navData.map((item) => (
          <button
            key={item.title}
            onClick={() => handleNavClick(item.view)}
            className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-700 transition-colors text-lg focus:outline-none"
          >
            {item.icon}
            <span>{item.title}</span>
            {item.info && item.info}
          </button>
        ))}
      </div>

        <div className="relative">
        <button
          onClick={toggleAccountMenu}
          className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-700 transition-colors focus:outline-none text-md"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span>Account</span>
        </button>
        {isAccountOpen && (
          <div className="absolute right-0 mt-4 w-56 bg-gray-800 rounded-md shadow-lg py-3 z-10">
            {accountData.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavClick(item.view)}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors text-lg w-full text-left focus:outline-none"
              >
                {item.icon}
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </nav>
  );
};

export default Dashboard;