import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Language, AnalysisResult, TEXT, Theme } from './types';
import { TabBar, NavBar, ListItem, ToggleItem } from './components/UIComponents';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { OfflineBanner } from './components/OfflineBanner';
import { analyzeFoodImage } from './services/geminiService';
import { fadeInUp, pageTransition } from './lib/motion';
import { useOnline } from './hooks/useOnline';
import { useProfile } from './hooks/useProfile';
import { ChevronLeft, Check, Copy, Share2, MessageSquare, Star, Settings, X, ChevronRight, Clock, ArrowLeft, Zap, BookOpen, FileText, BarChart3, Edit3 } from 'lucide-react';

// Tabs
import Tab1Home from './views/tabs/Tab1Home';
import Tab2History from './views/tabs/Tab2History';
import TabPassport from './views/tabs/TabPassport';
import Tab4Social from './views/tabs/Tab4Social';

// New Social Views
import { LeaderboardPage, UserDetailPage } from './views/SocialSubViews';

export default function App() {
  // Network status
  const isOnline = useOnline();

  // User profile and settings (persisted to IndexedDB)
  const { settings, isLoading: profileLoading, updateTheme, updateLanguage } = useProfile();

  // State
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN_TABS);
  const [activeTab, setActiveTab] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  // Use settings values with defaults for initial render
  const language = settings?.language === 'zh' ? Language.ZH : Language.EN;
  const theme: Theme = settings?.theme === 'dark' ? 'dark' : 'light';

  // Handlers for theme/language changes
  const handleThemeChange = async (newTheme: Theme) => {
    await updateTheme(newTheme);
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    await updateLanguage(newLanguage === Language.ZH ? 'zh' : 'en');
  };
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Settings State
  const [notifications, setNotifications] = useState({
      reminders: true,
  });
  
  const [privacy, setPrivacy] = useState({
      hideRanking: false,
  });

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TEXT[language];

  // --- Handlers ---

  const handleCameraClick = () => {
    // Disable camera when offline
    if (!isOnline) {
      alert('离线模式下无法使用拍照分析功能，请检查网络连接');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        setCurrentView(AppView.ANALYSIS_RESULT);
        setIsAnalyzing(true);
        // Clean base64 string for API (remove data URL prefix)
        const base64Data = base64.split(',')[1];
        try {
            const result = await analyzeFoodImage(base64Data, language);
            setAnalysisData({ ...result, imageUrl: base64 });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const navigateToProfile = () => setCurrentView(AppView.PROFILE_HOME);
  const navigateBack = () => setCurrentView(AppView.MAIN_TABS);
  const navigateToPremium = () => setCurrentView(AppView.PREMIUM_LANDING);
  const navigateToPayment = () => setCurrentView(AppView.PAYMENT_GATEWAY);

  const handleSubscribe = () => {
    // Simulate Apple Pay
    navigateToPayment();
    setTimeout(() => {
        setIsPremium(true);
        setCurrentView(AppView.MAIN_TABS); // Or back to premium success
    }, 2000);
  };
  
  const toggleNotification = () => {
      setNotifications(prev => ({ ...prev, reminders: !prev.reminders }));
  };

  const togglePrivacy = () => {
      setPrivacy(prev => ({ ...prev, hideRanking: !prev.hideRanking }));
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Styles based on Theme - using CSS variables
  const mainBgClass = 'bg-background text-foreground';
  const profileBgClass = 'bg-card';
  const profileTextClass = 'text-foreground';

  // --- Render Views ---

  // 1. Analysis View (8.jpg)
  if (currentView === AppView.ANALYSIS_RESULT) {
    return (
      <div className={`min-h-screen ${mainBgClass} p-4 safe-top animate-fade-in relative`}>
        <button onClick={navigateBack} className="absolute top-safe-top left-4 z-50 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white">
             <ChevronLeft size={24} />
        </button>
        
        {/* Top Image */}
        <div className="h-[40vh] w-full rounded-3xl overflow-hidden mb-6 relative">
             <img src={capturedImage || ''} className="w-full h-full object-cover" alt="Captured" />
             {isAnalyzing && (
                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                     <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                     <span className="text-white text-sm font-medium">Analyzing...</span>
                 </div>
             )}
        </div>

        {/* Analysis Card */}
        {!isAnalyzing && analysisData ? (
          <div className="space-y-4 animate-slide-up pb-10">
            <Card className="p-5">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                    <div>
                        <h2 className="text-xl font-bold">{analysisData.foodName || (language === Language.ZH ? '未知食物' : 'Unknown Food')}</h2>
                        <span className="text-xs text-muted-foreground">{t.analysis_title}</span>
                    </div>
                </div>
                <div className="flex justify-between text-sm mb-4 text-muted-foreground bg-muted p-3 rounded-xl">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{analysisData.calories || 0} kcal</span>
                    <span>{analysisData.macros?.protein || '0g'} {language === Language.ZH ? '蛋白质' : 'Protein'}</span>
                    <span>{analysisData.macros?.fat || '0g'} {language === Language.ZH ? '脂肪' : 'Fat'}</span>
                </div>
                
                <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed mb-4">
                    {analysisData.description || ''}
                </p>

                {/* Detailed Sections */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t.analysis_plating}</span>
                        <p className="text-sm text-foreground dark:text-muted-foreground leading-snug">{analysisData.plating || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t.analysis_sensory}</span>
                        <p className="text-sm text-foreground dark:text-muted-foreground leading-snug">{analysisData.sensory || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">{t.analysis_container}</span>
                        <p className="text-sm text-foreground dark:text-muted-foreground leading-snug">{analysisData.container || '-'}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-5">
                <h3 className="text-lg font-bold mb-3">{t.suggestions}</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    {analysisData.suggestions?.map((s, i) => (
                        <li key={i}>{s}</li>
                    )) || <li>No suggestions available.</li>}
                </ul>
            </Card>
          </div>
        ) : !isAnalyzing && (
             <div className="text-center mt-10 text-muted-foreground">Analysis Failed. Please try again.</div>
        )}
      </div>
    );
  }

  // 1b. Social Sub-Views
  if (currentView === AppView.SOCIAL_EXPERTS_LIST) {
      return (
        <LeaderboardPage 
            title={t.cuisine_experts} 
            type="experts" 
            lang={language} 
            theme={theme}
            onBack={navigateBack}
            onUserClick={(user) => {
                setSelectedUser(user);
                setCurrentView(AppView.SOCIAL_USER_DETAIL);
            }}
        />
      );
  }

  if (currentView === AppView.SOCIAL_RANKING_LIST) {
      return (
        <LeaderboardPage 
            title={t.gourmet_ranking} 
            type="ranking" 
            lang={language} 
            theme={theme}
            onBack={navigateBack}
            onUserClick={(user) => {
                setSelectedUser(user);
                setCurrentView(AppView.SOCIAL_USER_DETAIL);
            }}
        />
      );
  }

  if (currentView === AppView.SOCIAL_USER_DETAIL) {
      return (
        <UserDetailPage 
            user={selectedUser} 
            lang={language} 
            theme={theme}
            onBack={() => {
                setCurrentView(AppView.MAIN_TABS); 
            }}
        />
      );
  }

  // 2. Profile Views
  if (currentView.startsWith('PROFILE')) {
      const isProfileHome = currentView === AppView.PROFILE_HOME;
      // Use white with shadow for Profile Home (on image), high contrast for others
      const navIconClass = isProfileHome 
          ? "text-white drop-shadow-md" 
          : (theme === 'dark' ? "text-white" : "text-black");

      return (
        <div className={`min-h-screen bg-background ${profileTextClass}`}>
            
            {/* Standard Nav Bar for non-special pages */}
            {currentView !== AppView.PROFILE_NOTIFICATIONS && currentView !== AppView.PROFILE_PRIVACY && (
                <NavBar 
                    theme={theme}
                    title={
                        currentView === AppView.PROFILE_HOME ? '' :
                        currentView === AppView.PROFILE_EDIT ? t.edit_profile :
                        currentView === AppView.PROFILE_APPEARANCE ? t.appearance :
                        currentView === AppView.PROFILE_LANGUAGE ? t.language : ''
                    }
                    leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={navIconClass} />}
                    onLeftClick={currentView === AppView.PROFILE_HOME ? navigateBack : navigateToProfile}
                    className={currentView === AppView.PROFILE_HOME ? 'bg-transparent' : 'bg-card'}
                />
            )}

            {/* Profile Home (13,14) */}
            {currentView === AppView.PROFILE_HOME && (
                <div className="animate-fade-in">
                    {/* Header Image */}
                    <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: 'url(https://picsum.photos/800/600?food)' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
                        <div className="absolute bottom-4 left-4 flex items-end">
                            <div className="w-20 h-20 rounded-full border-2 border-white bg-gray-200 overflow-hidden mr-4">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
                            </div>
                            <div className="mb-2">
                                <h1 className="text-2xl font-bold text-white">GourmetEviOmi</h1>
                                <p className="text-sm text-muted-foreground">@IXmQKIsngd8Z</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-6">
                        <div className="flex justify-between items-center px-2">
                             <div className="text-sm text-muted-foreground">0 {t.meals} • 0 {t.cuisines} {t.unlocked}</div>
                             <Button variant="outline" className="h-8 px-4 text-xs py-0" onClick={navigateToPremium}>{t.unlock_btn}</Button>
                        </div>

                        {/* Menu Group 1 */}
                        <div className="space-y-1">
                            <h3 className="text-xs text-muted-foreground ml-4 mb-2">{t.account_title}</h3>
                            <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                                <ListItem theme={theme} label={t.edit_profile} onClick={() => setCurrentView(AppView.PROFILE_EDIT)} />
                                <ListItem theme={theme} label={t.subscribe_monthly} onClick={navigateToPremium} />
                            </div>
                        </div>

                        {/* Menu Group 2 */}
                        <div className="space-y-1">
                            <h3 className="text-xs text-muted-foreground ml-4 mb-2">{t.settings_title}</h3>
                            <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                                <ListItem theme={theme} label={t.appearance} onClick={() => setCurrentView(AppView.PROFILE_APPEARANCE)} />
                                <ListItem theme={theme} label={t.language} value={language === Language.EN ? 'English' : '简体中文'} onClick={() => setCurrentView(AppView.PROFILE_LANGUAGE)} />
                                <ListItem theme={theme} label={t.notifications} onClick={() => setCurrentView(AppView.PROFILE_NOTIFICATIONS)} />
                                <ListItem theme={theme} label={t.privacy} onClick={() => setCurrentView(AppView.PROFILE_PRIVACY)} />
                            </div>
                        </div>
                         
                        {/* Menu Group 3 - Social/Info */}
                        <div className="space-y-1">
                            <h3 className="text-xs text-muted-foreground ml-4 mb-2">Info</h3>
                            <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                                <ListItem theme={theme} label="About 2.0" icon={<div className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center text-[10px]">i</div>} />
                                <ListItem theme={theme} label="Share with Friends" icon={<Share2 size={16} />} />
                                <ListItem theme={theme} label="Rate App" icon={<Star size={16} />} />
                                <ListItem theme={theme} label="Feedback" icon={<MessageSquare size={16} />} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Edit (15) */}
            {currentView === AppView.PROFILE_EDIT && (
                <div className="pt-20 px-4 animate-slide-left">
                     <div className="flex justify-center mb-8">
                         <div className="w-24 h-24 rounded-full bg-gray-700 relative overflow-hidden">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full" />
                             <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">📷</div>
                             </div>
                         </div>
                     </div>
                     <div className={`${profileBgClass} rounded-xl overflow-hidden mb-8`}>
                         <div className={`flex justify-between p-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                             <span className={profileTextClass}>Nickname</span>
                             <span className={`${profileTextClass} font-medium`}>GourmetEviOmi</span>
                         </div>
                         <div className="p-4">
                             <span className={`${profileTextClass} block mb-2`}>Bio</span>
                             <textarea className="w-full bg-transparent text-muted-foreground h-20 resize-none outline-none" placeholder="Write something..."></textarea>
                         </div>
                     </div>
                     <Button fullWidth onClick={navigateToProfile}>{t.save}</Button>
                </div>
            )}

            {/* Appearance (16) */}
            {currentView === AppView.PROFILE_APPEARANCE && (
                <div className="pt-20 px-4 animate-slide-left">
                    <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                        <ListItem theme={theme} label="Light" hasArrow={false} value={theme === 'light' ? <Check size={16} className="text-blue-500"/> : null} onClick={() => setTheme('light')} />
                        <ListItem theme={theme} label="Dark" hasArrow={false} value={theme === 'dark' ? <Check size={16} className="text-blue-500"/> : null} onClick={() => setTheme('dark')} />
                    </div>
                </div>
            )}

            {/* Language */}
            {currentView === AppView.PROFILE_LANGUAGE && (
                <div className="pt-20 px-4 animate-slide-left">
                    <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                        <ListItem theme={theme}
                            label="简体中文" 
                            hasArrow={false} 
                            value={language === Language.ZH ? <Check size={20} className="text-blue-500"/> : null} 
                            onClick={() => setLanguage(Language.ZH)} 
                        />
                        <ListItem theme={theme}
                            label="English" 
                            hasArrow={false} 
                            value={language === Language.EN ? <Check size={20} className="text-blue-500"/> : null} 
                            onClick={() => setLanguage(Language.EN)} 
                        />
                    </div>
                </div>
            )}
            
            {/* Notifications (Updated 17.jpg style) */}
             {currentView === AppView.PROFILE_NOTIFICATIONS && (
                <div className="min-h-screen relative animate-slide-left">
                    <div className="pt-safe-top px-6 pb-6">
                        <h1 className={`text-3xl font-bold mt-4 ${profileTextClass}`}>{t.notify_header}</h1>
                        <p className="text-muted-foreground text-sm mt-1 mb-8">{t.notify_sub}</p>
                        
                        <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-8`}>
                            <ToggleItem 
                                theme={theme} 
                                label={t.notify_toggle_title} 
                                subLabel={t.notify_toggle_desc}
                                checked={notifications.reminders} 
                                onToggle={toggleNotification}
                            />
                        </div>

                        <h3 className="text-sm font-medium text-muted-foreground mb-2">{t.notify_footer_title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                           {t.notify_footer_desc}
                        </p>
                    </div>
                    {/* Floating Bottom Left Back Button */}
                    <div className="absolute bottom-12 left-6">
                         <button 
                            onClick={navigateToProfile}
                            className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'} shadow-lg flex items-center justify-center`}
                         >
                             <ArrowLeft size={24} />
                         </button>
                    </div>
                </div>
            )}

            {/* Privacy (Updated 18.jpg style) */}
            {currentView === AppView.PROFILE_PRIVACY && (
                <div className="min-h-screen relative animate-slide-left">
                    <div className="pt-safe-top px-6 pb-6">
                        <h1 className={`text-3xl font-bold mt-4 ${profileTextClass}`}>{t.privacy_header}</h1>
                        <p className="text-muted-foreground text-sm mt-1 mb-8">{t.privacy_sub}</p>
                        
                        <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-8`}>
                            <ToggleItem 
                                theme={theme} 
                                label={t.privacy_toggle_title} 
                                subLabel={t.privacy_toggle_desc}
                                checked={privacy.hideRanking} 
                                onToggle={togglePrivacy} 
                            />
                        </div>
                    </div>
                    {/* Floating Bottom Left Back Button */}
                    <div className="absolute bottom-12 left-6">
                         <button 
                            onClick={navigateToProfile}
                            className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'} shadow-lg flex items-center justify-center`}
                         >
                             <ArrowLeft size={24} />
                         </button>
                    </div>
                </div>
            )}

        </div>
      );
  }

  // 3. Premium View
  if (currentView === AppView.PREMIUM_LANDING) {
      return (
          <div className="min-h-screen bg-background p-4 pt-safe-top relative overflow-hidden flex flex-col">
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-6">
                  <button onClick={navigateBack} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                       <ArrowLeft size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
                  </button>
                  <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
              </div>
              
              <div className="text-center mb-8 px-4">
                  <h1 className={`text-xl font-serif font-medium mb-3 ${theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]'}`}>{t.premium_title}</h1>
                  <p className={`${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'} text-xs tracking-wide`}>{t.premium_subtitle}</p>
              </div>

              {/* 2x2 Grid Features */}
              <div className="grid grid-cols-2 gap-3 mb-8 px-2">
                  {/* Card 1 */}
                  <div className="bg-gradient-to-br from-[#E85D75]/30 to-[#C0392B]/20 p-4 rounded-xl border border-[#E85D75]/30 flex flex-col h-32 relative overflow-hidden">
                      <div className="absolute top-2 right-2 opacity-50"><Edit3 size={32} color="#E85D75"/></div>
                      <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#FF9A9E]' : 'text-[#D14D68]'}`}>{t.feat_1_title}</div>
                      <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_1_desc}</p>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-gradient-to-br from-[#D2E603]/30 to-[#76B900]/20 p-4 rounded-xl border border-[#D2E603]/30 flex flex-col h-32 relative overflow-hidden">
                      <div className="absolute top-2 right-2 opacity-50"><Zap size={32} color="#D2E603"/></div>
                      <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#E6FF50]' : 'text-[#8EA800]'}`}>{t.feat_2_title}</div>
                      <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_2_desc}</p>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-gradient-to-br from-[#F3E5AB]/30 to-[#D4AF37]/20 p-4 rounded-xl border border-[#F3E5AB]/30 flex flex-col h-32 relative overflow-hidden">
                       <div className="absolute top-2 right-2 opacity-50"><BookOpen size={32} color="#F3E5AB"/></div>
                      <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#F3E5AB]' : 'text-[#B8860B]'}`}>{t.feat_3_title}</div>
                      <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_3_desc}</p>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-gradient-to-br from-gray-500/30 to-gray-700/20 p-4 rounded-xl border border-gray-500/30 flex flex-col h-32 relative overflow-hidden">
                      <div className="absolute top-2 right-2 opacity-50"><BarChart3 size={32} color="gray"/></div>
                      <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-700'}`}>{t.feat_4_title}</div>
                      <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_4_desc}</p>
                  </div>
              </div>

              {/* Plans */}
              <div className="grid grid-cols-2 gap-4 px-2 mb-6">
                  {/* Monthly */}
                  <div 
                    onClick={() => setSelectedPlan('monthly')}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                        selectedPlan === 'monthly' 
                        ? `border-[#E0CEB5] ${theme === 'dark' ? 'bg-[#E0CEB5]/10' : 'bg-[#E0CEB5]/20'}` 
                        : `${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} bg-transparent`
                    }`}
                  >
                      <div className={`text-sm mb-2 ${selectedPlan === 'monthly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-foreground')}`}>{t.subscribe_monthly}</div>
                      <div className={`text-2xl font-serif mb-2 ${selectedPlan === 'monthly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-black')}`}>{t.plan_monthly_price}</div>
                      <p className={`text-[10px] whitespace-pre-wrap ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{t.plan_monthly_desc}</p>
                  </div>
                  {/* Yearly */}
                  <div 
                    onClick={() => setSelectedPlan('yearly')}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                        selectedPlan === 'yearly' 
                        ? `border-[#E0CEB5] ${theme === 'dark' ? 'bg-[#E0CEB5]/10' : 'bg-[#E0CEB5]/20'}` 
                        : `${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} bg-transparent`
                    }`}
                  >
                      <div className={`text-sm mb-2 ${selectedPlan === 'yearly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-foreground')}`}>{t.subscribe_yearly}</div>
                      <div className={`text-2xl font-serif mb-2 ${selectedPlan === 'yearly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-black')}`}>{t.plan_yearly_price}</div>
                      <p className={`text-[10px] whitespace-pre-wrap ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{t.plan_yearly_desc}</p>
                  </div>
              </div>

              {/* Footer Button */}
              <div className="mt-auto px-4 pb-8">
                  <Button variant="gold" fullWidth onClick={navigateToPayment} className="h-12 bg-gradient-to-r from-[#E0CEB5] to-[#D4AF37] text-black font-bold tracking-wide shadow-lg shadow-yellow-900/20">
                      {t.subscribe_btn}
                  </Button>
                  <div className={`flex justify-center mt-4 space-x-8 text-xs ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      <span className="cursor-pointer">{t.restore}</span>
                      <span className="cursor-pointer">{t.redeem}</span>
                  </div>
              </div>
          </div>
      );
  }

  // 5. Main Tabs
  return (
    <div className={`min-h-screen relative ${mainBgClass}`}>
      {/* Offline Status Banner */}
      <OfflineBanner isOffline={!isOnline} />

      {/* Top Bar for Main Tabs */}
      <div className="fixed top-0 left-0 right-0 h-[50px] z-40 flex items-center justify-between px-4 mt-safe-top bg-gradient-to-b from-background/80 to-transparent">
          {/* Top Left: User Avatar (Profile) - Replaces Tomato for Passport feel */}
          <div onClick={navigateToProfile} className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer shadow-lg overflow-hidden border border-white/20 relative">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
          </div>

          {/* Title changes based on tab */}
          <h1 className="text-lg font-bold tracking-wide">
             {activeTab === 0 ? t.tab_home : 
              activeTab === 1 ? t.tab_passport :
              activeTab === 2 ? t.tab_data :
              t.tab_social}
          </h1>

          {/* Top Right: Premium Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={navigateToPremium}
            className="flex items-center px-3 py-1.5 rounded-full border border-border bg-muted text-primary transition-all"
          >
             <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mr-2">
                <Check size={10} className="text-primary-foreground font-bold" />
             </div>
             <span className="text-xs font-semibold">{t.premium}</span>
          </motion.button>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
         {activeTab === 0 && <Tab1Home lang={language} theme={theme} />}
         {activeTab === 1 && <TabPassport lang={language} theme={theme} />}
         {activeTab === 2 && <Tab2History lang={language} isPremium={isPremium} onUpgrade={navigateToPremium} theme={theme} />}
         {activeTab === 3 && <Tab4Social lang={language} theme={theme} onExpertsClick={() => setCurrentView(AppView.SOCIAL_EXPERTS_LIST)} onRankingClick={() => setCurrentView(AppView.SOCIAL_RANKING_LIST)} />}
      </div>

      {/* Hidden File Input for Camera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <TabBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onCameraClick={handleCameraClick}
        lang={language}
        theme={theme}
      />
    </div>
  );
}