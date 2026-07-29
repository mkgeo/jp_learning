import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Part1_TextInput from './components/Part1_TextInput';
import Part2_Reader from './components/Part2_Reader';
import Part2_StorageList from './components/Part2_StorageList';
import Part3_VocabularyTable from './components/Part3_VocabularyTable';
import Part4_VocabularyQuiz from './components/Part4_VocabularyQuiz';
import { 
  getStoredItems, 
  saveStoredItems, 
  addStoredItem, 
  updateStoredItem, 
  deleteStoredItem 
} from './utils/storage';
import { parseJapaneseParagraphsSync } from './utils/furiganaParser';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('input');
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  // Initialize stored items on mount
  useEffect(() => {
    const loaded = getStoredItems();
    setItems(loaded);
    if (loaded.length > 0) {
      setActiveItem(loaded[0]);
    }
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Add new item from Part 1
  const handleSaveNewItem = (newItemData) => {
    const created = addStoredItem(newItemData);
    const updatedList = getStoredItems();
    setItems(updatedList);
    setActiveItem(created);
    return created;
  };

  // Open item in Reader mode
  const handleSelectReaderItem = (item) => {
    setActiveItem(item);
    setActiveTab('reader');
  };

  // Handle direct text open from Vocabulary Table into Reader
  const handleOpenVocabInReader = (text, title) => {
    const paragraphs = parseJapaneseParagraphsSync(text);
    const vocabItem = {
      id: `vocab-${Date.now()}`,
      title: title || text,
      japaneseText: text,
      paragraphs: paragraphs,
      englishTranslation: 'N5 Core Vocabulary Example',
      category: 'N5 Vocabulary',
      tags: ['N5', 'Vocabulary']
    };
    setActiveItem(vocabItem);
    setActiveTab('reader');
  };

  // Toggle favorite star
  const handleToggleFavorite = (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const updatedList = updateStoredItem(id, { favorite: !item.favorite });
      setItems(updatedList);
      if (activeItem && activeItem.id === id) {
        setActiveItem(prev => ({ ...prev, favorite: !prev.favorite }));
      }
    }
  };

  // Delete item
  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this Japanese passage?')) {
      const updatedList = deleteStoredItem(id);
      setItems(updatedList);
      if (activeItem && activeItem.id === id) {
        setActiveItem(updatedList[0] || null);
      }
    }
  };

  // Import items
  const handleImportItems = (importedItems) => {
    saveStoredItems(importedItems);
    setItems(importedItems);
    if (importedItems.length > 0) {
      setActiveItem(importedItems[0]);
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        itemCount={items.length} 
      />

      {/* Navigation Tabs */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Sections */}
      <main>
        {activeTab === 'input' && (
          <Part1_TextInput 
            onSaveItem={handleSaveNewItem}
            onOpenReader={(savedItem) => {
              setActiveItem(savedItem);
              setActiveTab('reader');
            }}
          />
        )}

        {activeTab === 'reader' && (
          <Part2_Reader 
            activeItem={activeItem}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'vocab' && (
          <Part3_VocabularyTable 
            onOpenReaderWithText={handleOpenVocabInReader}
          />
        )}

        {activeTab === 'quiz' && (
          <Part4_VocabularyQuiz 
            onOpenReaderWithText={handleOpenVocabInReader}
          />
        )}

        {activeTab === 'storage' && (
          <Part2_StorageList 
            items={items}
            onSelectReaderItem={handleSelectReaderItem}
            onToggleFavorite={handleToggleFavorite}
            onDeleteItem={handleDeleteItem}
            onImportItems={handleImportItems}
            onOpenNewInput={() => setActiveTab('input')}
          />
        )}
      </main>
    </div>
  );
}
