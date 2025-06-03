import React from "react";

export const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex flex-col pl-2.5 mt-10 w-full text-xl text-gray-700 max-md:mt-10 max-md:max-w-full">
      <div className="flex gap-10 self-start">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`font-medium cursor-pointer ${
              activeTab === tab.id ? "font-bold " : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="flex shrink-0 bg-cyan-600 h-[5px]" />
            )}
          </div>
        ))}
      </div>
      <div className="shrink-0 h-0.5 border border-solid border-zinc-300 max-md:max-w-full" />
    </div>
  );
};
