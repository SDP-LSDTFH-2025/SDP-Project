import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Settings, Archive, Star, Trash2, LogOut, User } from "lucide-react";

export default function DropdownMenu({ 
  items = [], 
  trigger = <MoreVertical size={20} />,
  className = "",
  position = "bottom-right"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "left-0";
      case "bottom-right":
        return "right-0";
      case "top-left":
        return "left-0 bottom-full mb-1";
      case "top-right":
        return "right-0 bottom-full mb-1";
      default:
        return "right-0";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className={`absolute ${getPositionClasses()} top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}>
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                disabled={item.disabled}
              >
                {item.icon && <span className="text-gray-500">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined menu items
export const chatListMenuItems = [
  {
    label: "New Group",
    icon: <User size={16} />,
    onClick: () => console.log("New Group clicked")
  },
  {
    label: "Archived Chats",
    icon: <Archive size={16} />,
    onClick: () => console.log("Archived Chats clicked")
  },
  {
    label: "Starred Messages",
    icon: <Star size={16} />,
    onClick: () => console.log("Starred Messages clicked")
  },
  {
    label: "Settings",
    icon: <Settings size={16} />,
    onClick: () => console.log("Settings clicked")
  }
];

export const chatWindowMenuItems = [
  {
    label: "View Contact",
    icon: <User size={16} />,
    onClick: () => console.log("View Contact clicked")
  },
  {
    label: "Media, Links, and Docs",
    icon: <Archive size={16} />,
    onClick: () => console.log("Media clicked")
  },
  {
    label: "Search",
    icon: <MoreVertical size={16} />,
    onClick: () => console.log("Search clicked")
  },
  {
    label: "Mute Notifications",
    icon: <Settings size={16} />,
    onClick: () => console.log("Mute clicked")
  },
  {
    label: "Clear Chat",
    icon: <Trash2 size={16} />,
    onClick: () => console.log("Clear Chat clicked")
  }
];
