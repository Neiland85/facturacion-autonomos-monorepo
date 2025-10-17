

import React, { useState, useEffect } from 'react';
import { View, SubscriptionTier, UserProfile, Invoice, InvoiceSuggestion, VoiceInvoiceData } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Invoices from './components/Invoices';
import NewInvoice from './components/NewInvoice';
import AiAssistant from './components/AiAssistant';
import OcrModal from './components/OcrModal';
import FiscalDashboard from './components/FiscalDashboard';
import Grants from './components/Grants';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import Pricing from './components/Pricing';
import MultiAccount from './components/MultiAccount';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('enterprise');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // State for invoice suggestions flow
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<Invoice | null>(null);
  const [suggestionData, setSuggestionData] = useState<InvoiceSuggestion | null>(null);
  const [voiceInvoiceData, setVoiceInvoiceData] = useState<VoiceInvoiceData | null>(null);


  // Simulate being logged-in on load with special developer access
  useEffect(() => {
    // Mock fetching user data
    setUserProfile({
      companyName: 'Mi Empresa Creativa S.L.',
      email: 'contacto@miempresa.es',
    });
    // As requested, this session is granted full Enterprise access
    // to showcase all premium functionalities.
    setSubscriptionTier('enterprise');
  }, []);

  const handleOcrClick = () => {
    setIsOcrModalOpen(true);
  };

  const handleOcrComplete = (data: any) => {
    setOcrData(data);
    setSuggestionData(null);
    setVoiceInvoiceData(null);
    setView('new-invoice');
  };
  
  const handleVoiceCommandComplete = (data: VoiceInvoiceData) => {
    setOcrData(null);
    setSuggestionData(null);
    setVoiceInvoiceData(data);
    setView('new-invoice');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    setUserProfile({
        companyName: 'Mi Empresa Creativa S.L.',
        email: 'contacto@miempresa.es',
    });
    // On login, grant enterprise access for the demo
    setSubscriptionTier('enterprise'); 
    setView('dashboard');
  };
  
  const handleRegisterSuccess = () => {
     handleLoginSuccess(); // Auto-login after registration
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('subscriptionTier');
    setSubscriptionTier('free');
    setView('login');
  }

  const handleSubscribe = (plan: 'premium' | 'enterprise') => {
      setSubscriptionTier(plan);
      sessionStorage.setItem('subscriptionTier', plan);
      setView('dashboard'); // Redirect to dashboard to see changes
  }

  const handleCancelSubscription = () => {
      // For this special session, we keep enterprise access even after "canceling"
      // to continue testing all features. In a real app, this would be `setSubscriptionTier('free')`.
      setView('settings'); // Stay on settings to see the change
  }

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    console.log("New invoice created:", newInvoice);
    setLastCreatedInvoice(newInvoice);
    setOcrData(null); 
    setSuggestionData(null); 
    setVoiceInvoiceData(null);
    setView('invoices');
  };

  const handleUseSuggestion = (suggestion: InvoiceSuggestion) => {
      setSuggestionData(suggestion);
      setOcrData(null);
      setVoiceInvoiceData(null);
      setView('new-invoice');
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} subscriptionTier={subscriptionTier} />;
      case 'invoices':
        return <Invoices 
                    setView={setView}
                    lastCreatedInvoice={lastCreatedInvoice}
                    clearLastCreatedInvoice={() => setLastCreatedInvoice(null)}
                    onUseSuggestion={handleUseSuggestion}
                    subscriptionTier={subscriptionTier}
                    onVoiceCommandComplete={handleVoiceCommandComplete}
                />;
      case 'new-invoice':
        return <NewInvoice 
                    setView={setView} 
                    ocrData={ocrData} 
                    suggestionData={suggestionData}
                    voiceData={voiceInvoiceData}
                    onInvoiceCreated={handleInvoiceCreated}
                />;
      case 'fiscal':
        return <FiscalDashboard />;
      case 'grants':
        return <Grants subscriptionTier={subscriptionTier} setView={setView} />;
      case 'ai-assistant':
        return <AiAssistant setView={setView} subscriptionTier={subscriptionTier} />;
      case 'settings':
        // FIX: Pass setView to Settings to allow navigation from within the component.
        return <Settings setView={setView} subscriptionTier={subscriptionTier} userProfile={userProfile} onLogout={handleLogout} onCancelSubscription={handleCancelSubscription} />;
      case 'pricing':
          return <Pricing onSubscribe={handleSubscribe} />;
      case 'multi-account':
          return <MultiAccount setView={setView} />;
      default:
        return <Dashboard setView={setView} subscriptionTier={subscriptionTier} />;
    }
  };
  
  if (!isAuthenticated) {
      if (view === 'register') {
          return <Register setView={setView} onRegisterSuccess={handleRegisterSuccess} />;
      }
      return <Login setView={setView} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 flex">
      <Sidebar currentView={view} setView={setView} subscriptionTier={subscriptionTier} userProfile={userProfile} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOcrClick={handleOcrClick} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {renderView()}
        </main>
        <Footer currentView={view} setView={setView} />
      </div>
      <OcrModal 
        isOpen={isOcrModalOpen} 
        onClose={() => setIsOcrModalOpen(false)} 
        onOcrComplete={handleOcrComplete}
      />
    </div>
  );
};

export default App;