import React from 'react'

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['Sales Actions', 'Sales Leads', 'Assigned Report']
  return (
    <div className="flex gap-2 border-b border-gray-800">
      {tabs.map(t => (
        <button
          key={t}
          className={`px-3 py-2 rounded-t-md border-b-2 transition-colors ${
            activeTab === t
              ? 'bg-primary text-white border-primary'
              : 'bg-gray-100 dark:bg-gray-800 text-[var(--content-text)] border-transparent hover:border-gray-600'
          }`}
          onClick={() => setActiveTab(t)}
        >{t}</button>
      ))}
    </div>
  )
}

export default Tabs