import React from 'react';
import { PenTool, BookOpenCheck, Library } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="nav-tabs">
      <button 
        className={`nav-button ${activeTab === 'input' ? 'active' : ''}`}
        onClick={() => setActiveTab('input')}
      >
        <PenTool size={18} />
        <span>Part 1: Text Input & Process</span>
      </button>

      <button 
        className={`nav-button ${activeTab === 'reader' ? 'active' : ''}`}
        onClick={() => setActiveTab('reader')}
      >
        <BookOpenCheck size={18} />
        <span>Part 2: Display & Reader</span>
      </button>

      <button 
        className={`nav-button ${activeTab === 'storage' ? 'active' : ''}`}
        onClick={() => setActiveTab('storage')}
      >
        <Library size={18} />
        <span>Saved Passages List</span>
      </button>
    </nav>
  );
}
