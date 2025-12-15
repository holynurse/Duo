
import React, { useState, useEffect } from 'react';
import { ViewState, UserData, Preference, INITIAL_USER_DATA, ConsultationRecord, StatusLog } from './types';
import ChoiceTalk from './components/ChoiceTalk';
import OptionTalk from './components/OptionTalk';
import Bridge from './components/Bridge';
import DecisionTalk from './components/DecisionTalk';
import Home from './components/Home';
import Profile from './components/Profile';
import MedicalDashboard from './components/MedicalDashboard';
import Logo from './components/Logo';
import { LayoutDashboard, BookOpen, UserCircle2, CheckCircle2, Home as HomeIcon, LogOut, Settings, Activity, Lock, Menu, X, FileText, ClipboardList, Stethoscope, ArrowLeft } from 'lucide-react';

interface AnalysisData {
    welcomeMsg: string;
    questions: string[];
}


// 의료진 모드에서 사용할 데모 환자(풍부한 로그/히스토리 포함)
const ENRICHED_DEMO_PATIENTS: (UserData & { demoPreferences?: Preference[] })[] = [
  {
    ...INITIAL_USER_DATA,
    name: '김하늘',
    age: '45',
    gender: 'female',
    vasScore: 6,
    durationMonths: 23,
    currentSymptoms: '왼쪽 발목 열감과 부종, 계단 오를 때 찌릿한 통증',
    mainSymptoms: ['열감·부종', '야간 통증'],
    painLocation: ['왼쪽 발목', '종아리'],
    crpsType: 'TYPE_1',
    wantsEmotionalSupport: true,
    knowledgeLevel: 'MEDIUM',
    medicalCommunicationSatisfied: false,
    statusLogs: [
      { id: 'h1-log-1', date: '2025-02-20', time: '08:30', vasScore: 6, symptoms: '밤새 열감, 종아리 당김', painLocation: ['왼쪽 발목'] },
      { id: 'h1-log-2', date: '2025-02-20', time: '20:10', vasScore: 7, symptoms: '계단 오를 때 찌릿, 부종 증가', painLocation: ['왼쪽 발목', '종아리'] },
      { id: 'h1-log-3', date: '2025-02-21', time: '09:00', vasScore: 5, symptoms: '아침에는 약간 완화', painLocation: ['왼쪽 발목'] },
      { id: 'h1-log-4', date: '2025-02-22', time: '14:00', vasScore: 6, symptoms: '외출 후 붓기 재발', painLocation: ['왼쪽 발목', '종아리'] },
      { id: 'h1-log-5', date: '2025-02-23', time: '21:00', vasScore: 6, symptoms: '야간 열감과 당김', painLocation: ['왼쪽 발목'] },
    ],
    history: [
      {
        id: 'h1-rec-1',
        date: '2025-02-10',
        vasScore: 6.5,
        selectedTreatmentIds: ['t1', 't2'],
        customTreatments: [],
        generatedQuestions: ['최근 부종이 심해진 시간대가 있나요?', '계단 오르내릴 때 통증 악화 여부를 더 알려주세요.'],
        memo: '열감/부종이 심해짐, 야간 통증으로 수면 방해',
      },
    ],
    demoPreferences: [
      { treatmentId: 't1a', type: 'LIKE', reasons: ['효과 기대', '통증 감소 경험'] },
      { treatmentId: 't1b', type: 'LIKE', reasons: ['재활 필요', '부작용 적음'] },
      { treatmentId: 't1f', type: 'WORRY', reasons: ['부작용 우려', '비용 부담'] },
    ],
  },
  {
    ...INITIAL_USER_DATA,
    name: '이도윤',
    age: '52',
    gender: 'male',
    vasScore: 4,
    durationMonths: 14,
    currentSymptoms: '작업 후 저린감과 화끈거림, 손끝 감각 저하',
    mainSymptoms: ['저림', '신경통', '감각 둔화'],
    painLocation: ['오른손', '팔꿈치'],
    crpsType: 'TYPE_2',
    wantsEmotionalSupport: false,
    knowledgeLevel: 'HIGH',
    medicalCommunicationSatisfied: true,
    statusLogs: [
      { id: 'h2-log-1', date: '2025-02-19', time: '10:00', vasScore: 4, symptoms: '오전 타이핑 후 저림', painLocation: ['오른손'] },
      { id: 'h2-log-2', date: '2025-02-20', time: '15:30', vasScore: 5, symptoms: '장시간 운전 후 화끈거림', painLocation: ['오른손', '팔꿈치'] },
      { id: 'h2-log-3', date: '2025-02-21', time: '09:30', vasScore: 3, symptoms: '밤 휴식 후 완화', painLocation: ['오른손'] },
      { id: 'h2-log-4', date: '2025-02-22', time: '19:00', vasScore: 4, symptoms: '저녁 무렵 경미한 당김', painLocation: ['오른손'] },
    ],
    history: [
      {
        id: 'h2-rec-1',
        date: '2025-02-08',
        vasScore: 4.2,
        selectedTreatmentIds: ['t5'],
        customTreatments: [],
        generatedQuestions: ['작업-통증 관계를 기록한 시간대가 있나요?', '진통제 복용 시 체감 변화는 어떠셨나요?'],
        memo: '신경차단술 이후 일시적 완화, 업무 패턴과 연관 의심',
      },
    ],
    demoPreferences: [
      { treatmentId: 't2e', type: 'LIKE', reasons: ['높은 증거 수준', '긍정적인 환자 후기'] },
      { treatmentId: 't2g', type: 'DISLIKE', reasons: ['부작용 걱정'] },
    ],
  },
  {
    ...INITIAL_USER_DATA,
    name: '박서연',
    age: '31',
    gender: 'female',
    vasScore: 7,
    durationMonths: 8,
    currentSymptoms: '통증 급상승과 감각 과민, 손등 접촉 시 번개 통증',
    mainSymptoms: ['감각 과민', '촉각 통증', '야간 불면'],
    painLocation: ['왼손 등', '손가락'],
    crpsType: 'UNKNOWN',
    wantsEmotionalSupport: true,
    knowledgeLevel: 'LOW',
    medicalCommunicationSatisfied: false,
    statusLogs: [
      { id: 'h3-log-1', date: '2025-02-18', time: '08:10', vasScore: 7, symptoms: '아침에도 번개 통증', painLocation: ['왼손 등'] },
      { id: 'h3-log-2', date: '2025-02-19', time: '22:00', vasScore: 8, symptoms: '야간 통증으로 수면 중 깸', painLocation: ['왼손 등', '손가락'] },
      { id: 'h3-log-3', date: '2025-02-21', time: '11:30', vasScore: 6, symptoms: '온열팩 후 약간 완화', painLocation: ['왼손 등'] },
      { id: 'h3-log-4', date: '2025-02-22', time: '17:30', vasScore: 7, symptoms: '장보기 중 접촉 시 과민', painLocation: ['왼손 등', '손가락'] },
    ],
    history: [
      {
        id: 'h3-rec-1',
        date: '2025-02-12',
        vasScore: 7.5,
        selectedTreatmentIds: ['t9', 't7'],
        customTreatments: ['온열 요법'],
        generatedQuestions: ['감각 과민이 심해지는 환경(온도/소음)이 있나요?', '수면의 질과 통증 패턴의 상관을 더 알려주세요.'],
        memo: '야간 통증 심해 수면 방해, 온열팩 후 일시 완화',
      },
    ],
    demoPreferences: [
      { treatmentId: 'u3', type: 'LIKE', reasons: ['두려움을 줄여 움직임을 촉진'] },
    ],
  },
];

const App = () => {
  // Session Key to force full re-render on logout
  const [sessionKey, setSessionKey] = useState(0);
  
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  // bridgeCompleted is less relevant now that Bridge is independent, but kept for legacy flow check if needed
  const [bridgeCompleted, setBridgeCompleted] = useState(false); 
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);
  
  // Medical Mode State
  const [isMedicalMode, setIsMedicalMode] = useState(false);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lifted state for DecisionTalk analysis (prevents data loss when switching views)
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);

  // Load from LocalStorage on Mount or Session Change
  useEffect(() => {
    const saved = localStorage.getItem('crps_carepath_user');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Restore basic data
            setUserData(parsed);
            if (parsed.name) {
                // Only go home if not currently forcing logout
                setView(ViewState.HOME);
            } else {
                setView(ViewState.ONBOARDING);
            }
        } catch (e) {
            console.error("Failed to load user data", e);
            setView(ViewState.ONBOARDING);
        }
    } else {
        // If no data found, strictly force ONBOARDING
        setUserData(INITIAL_USER_DATA);
        setView(ViewState.ONBOARDING);
    }
  }, [sessionKey]);

  const saveToStorage = (data: UserData) => {
      localStorage.setItem('crps_carepath_user', JSON.stringify(data));
      setUserData(data);
  };

  const handleLogout = () => {
      // 1. Clear Local Storage
      localStorage.removeItem('crps_carepath_user');
      
      // 2. Reset State with FRESH object
      setUserData(INITIAL_USER_DATA);
      setPreferences([]);
      setBridgeCompleted(false);
      setSelectedRecord(null);
      setCurrentAnalysis(null);
      setIsMobileMenuOpen(false);
      setIsMedicalMode(false); // Reset Medical Mode

      // 3. Force View to Onboarding immediately
      setView(ViewState.ONBOARDING);
      
      // 4. Force Remount with timestamp
      setSessionKey(Date.now());
  };
  
  const handleMedicalLogin = () => {
      setIsMedicalMode(true);
      setView(ViewState.MEDICAL_HOME);
  };

  // Navigation Handlers
  const handleStart = () => {
      setSelectedRecord(null);
      setCurrentAnalysis(null); 
      setView(ViewState.CHOICE_TALK);
  };

  const handleExplore = () => {
      setView(ViewState.OPTION_TALK);
  }

  const handleLogStatus = () => {
      setView(ViewState.BRIDGE);
  }

  const handleGenerateReport = () => {
      setView(ViewState.DECISION_TALK);
  };
  
  // Flow Handlers
  const handleChoiceNext = () => setView(ViewState.OPTION_TALK);
  
  const handleOptionBack = () => setView(ViewState.CHOICE_TALK);
  const handleOptionNext = (prefs: Preference[]) => {
    setPreferences(prefs);
    setView(ViewState.BRIDGE);
  };

  const handleBridgeBack = () => setView(ViewState.OPTION_TALK);
  
  // Save Log and go Home
  const handleSaveLog = (data: UserData, time: string) => {
    // Create new log entry
    const newLog: StatusLog = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        time: time,
        vasScore: data.vasScore,
        symptoms: data.currentSymptoms || '',
        painLocation: data.painLocation
    };

    // Update UserData
    const updatedUser = {
        ...userData,
        vasScore: data.vasScore, // Update latest
        currentSymptoms: data.currentSymptoms, // Update latest
        painLocation: data.painLocation, // Update latest
        statusLogs: [...(userData.statusLogs || []), newLog]
    };
    
    saveToStorage(updatedUser);
    setBridgeCompleted(true); 
    setView(ViewState.HOME);
  };

  // Logic for viewing a past record
  const handleViewHistory = (record: ConsultationRecord) => {
      setSelectedRecord(record);
      // Note: We do NOT clear currentAnalysis here, so we can go back to it later.
      setView(ViewState.DECISION_TALK);
  };
  
  // Medical: Select patient from list
  const handleMedicalSelectPatient = (patient: UserData) => {
      const clonedPatient: UserData = {
          ...patient,
          mainSymptoms: [...(patient.mainSymptoms || [])],
          painLocation: [...(patient.painLocation || [])],
          statusLogs: (patient.statusLogs || []).map(log => ({
              ...log,
              painLocation: [...(log.painLocation || [])],
          })),
          history: (patient.history || []).map(rec => ({
              ...rec,
              selectedTreatmentIds: [...rec.selectedTreatmentIds],
              customTreatments: rec.customTreatments ? [...rec.customTreatments] : undefined,
              generatedQuestions: [...rec.generatedQuestions],
              chatHistory: rec.chatHistory ? [...rec.chatHistory] : undefined,
          })),
      };

      setUserData(clonedPatient);
      setPreferences((patient as UserData & { demoPreferences?: Preference[] }).demoPreferences || []); 
      setSelectedRecord(null);
      setCurrentAnalysis(null);
      setView(ViewState.DECISION_TALK);
  };

  const handleDecisionBack = () => {
      if (isMedicalMode) {
          // Go back to Patient List
          setView(ViewState.MEDICAL_HOME);
          return;
      }
      
      if (selectedRecord) {
          // Case 1: Viewing history -> Go back to where we were (Home)
          setSelectedRecord(null);
          setView(ViewState.HOME);
      } else {
          // Case 2: In live mode -> Go back to Home
          setView(ViewState.HOME);
      }
  };
  
  const handleAnalysisGenerated = (data: AnalysisData) => {
      setCurrentAnalysis(data);
  };

  const handleSaveRecord = (questions: string[], chatHistory: { role: 'user' | 'assistant'; content: string }[]) => {
      // Calculate Average VAS for Today from logs
      const todayStr = new Date().toLocaleDateString();
      const todayLogs = (userData.statusLogs || []).filter(l => l.date === todayStr);
      
      let averageVas = userData.vasScore; // Default to current if no logs
      if (todayLogs.length > 0) {
          const sum = todayLogs.reduce((acc, curr) => acc + curr.vasScore, 0);
          averageVas = parseFloat((sum / todayLogs.length).toFixed(1));
      }

      const newRecord: ConsultationRecord = {
          id: Date.now().toString(),
          date: todayStr,
          vasScore: averageVas, // Use calculated average
          selectedTreatmentIds: preferences.filter(p => p.type === 'LIKE' && !p.customName).map(p => p.treatmentId),
          customTreatments: preferences.filter(p => p.customName).map(p => p.customName!),
          generatedQuestions: questions,
          memo: userData.currentSymptoms,
          chatHistory: chatHistory
      };

      const updatedUser: UserData = {
          ...userData,
          history: [...userData.history, newRecord],
          currentSymptoms: undefined // Clear temp symptoms after save
      };

      saveToStorage(updatedUser);
      setBridgeCompleted(false);
      setSelectedRecord(null);
      setCurrentAnalysis(null); // Clear analysis after save
      setView(ViewState.HOME);
  };

  const handleProfileSave = (updatedData: UserData) => {
      saveToStorage(updatedData);
      if (view === ViewState.ONBOARDING) {
          setView(ViewState.HOME);
      }
  };

  const navigateTo = (target: ViewState) => {
    if (view === ViewState.ONBOARDING) return;
    
    // Clear selected record if explicitly navigating away
    if (target !== ViewState.DECISION_TALK) {
        setSelectedRecord(null);
    }

    setView(target);
    setIsMobileMenuOpen(false); // Close menu
  };

  // Helper for Title
  const getPageTitle = () => {
      switch(view) {
          case ViewState.CHOICE_TALK: return 'CRPS 가이드';
          case ViewState.OPTION_TALK: return '치료 솔루션';
          case ViewState.BRIDGE: return '오늘의 기록';
          case ViewState.DECISION_TALK: return isMedicalMode ? '환자 리포트' : '진료 브리핑';
          case ViewState.PROFILE: return '내 정보 관리';
          default: return '';
      }
  };

  if (view === ViewState.ONBOARDING) {
      return (
          <div key={sessionKey} className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="w-full max-w-xl">
                   {/* Medical Login Button */}
                  <div className="flex justify-end mb-4">
                      <button 
                        onClick={handleMedicalLogin}
                        className="flex items-center gap-2 text-sm text-teal-600 font-bold bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                          <Stethoscope size={16} /> 의료진으로 로그인
                      </button>
                  </div>
                  
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100 bg-white border border-blue-100">
                        <Logo size={52} />
                      </div>
                      <h1 className="text-3xl font-bold text-slate-900">Duo 시작하기</h1>
                      <p className="text-slate-500 mt-2">안녕하세요. 저는 CRPS환자와 의료진의 의사결정을 돕기 위한 Duo입니다. <br/>저는 CRPS 환자를 잘 아는 간호사 Info-Mate와 맞춤형 의사결정을 돕는 Decision-helper로 구성되어 있어 Duo입니다. <br/>저는 여러분의 성공적인 치료를 위한 한 팀이에요.
                         <br/>안전한 서비스 이용을 위해 계정을 생성해주세요.<br/>입력된 정보는 오직 이 기기에만 저장됩니다.</p>
                  </div>
                  <Profile 
                    userData={userData} 
                    onSave={handleProfileSave} 
                  />
              </div>
          </div>
      );
  }

  return (
    <div key={sessionKey} className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-800">
      {/* Sidebar - Visible on Large Screens */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
        ${isMedicalMode ? 'border-teal-200' : ''}
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 bg-white z-50">
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(isMedicalMode ? ViewState.MEDICAL_HOME : ViewState.HOME)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isMedicalMode ? 'bg-teal-50 border-teal-200' : 'bg-blue-50 border-blue-200'}`}>
                    <Logo size={28} variant={isMedicalMode ? 'medical' : 'default'} />
                </div>
                <div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 block leading-none">Duo</span>
                    {isMedicalMode && <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Medical</span>}
                </div>
            </div>
             {/* Close Button Mobile */}
             <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden absolute right-4 top-6 text-slate-400"
            >
                <X size={24} />
            </button>
        </div>
        
        {/* Navigation Content */}
        <div className="flex flex-col flex-1 px-6 pb-6 overflow-y-auto">
          <nav className="space-y-2 flex-1 pt-4">
            {isMedicalMode ? (
                /* Medical Sidebar */
                <>
                    <NavItem 
                        active={view === ViewState.MEDICAL_HOME} 
                        onClick={() => navigateTo(ViewState.MEDICAL_HOME)}
                        icon={<ClipboardList size={20} />} 
                        label="환자 리스트" 
                        sub="담당 환자 대시보드"
                    />
                     <NavItem 
                        active={view === ViewState.CHOICE_TALK} 
                        onClick={() => navigateTo(ViewState.CHOICE_TALK)}
                        icon={<BookOpen size={20} />} 
                        label="CRPS 가이드" 
                        sub="믿을 수 있는 의학 정보 모음"
                    />
                    <NavItem 
                        active={view === ViewState.OPTION_TALK} 
                        onClick={() => navigateTo(ViewState.OPTION_TALK)}
                        icon={<Stethoscope size={20} />} 
                        label="치료 솔루션" 
                        sub="치료 옵션과 FAQ"
                    />
                </>
            ) : (
                /* Patient Sidebar */
                <>
                    <NavItem 
                        active={view === ViewState.HOME} 
                        onClick={() => navigateTo(ViewState.HOME)}
                        icon={<HomeIcon size={20} />} 
                        label="홈" 
                        sub="전체 대시보드"
                    />
                    <NavItem 
                        active={view === ViewState.CHOICE_TALK} 
                        onClick={() => navigateTo(ViewState.CHOICE_TALK)}
                        icon={<BookOpen size={20} />} 
                        label="CRPS 가이드" 
                        sub="믿을 수 있는 의학 정보 모음"
                    />
                    <NavItem 
                        active={view === ViewState.OPTION_TALK} 
                        onClick={() => navigateTo(ViewState.OPTION_TALK)}
                        icon={<Stethoscope size={20} />} 
                        label="치료 솔루션" 
                        sub="나에게 맞는 옵션 탐색"
                    />
                    <NavItem 
                        active={view === ViewState.BRIDGE} 
                        onClick={() => navigateTo(ViewState.BRIDGE)}
                        icon={<ClipboardList size={20} />} 
                        label="오늘의 기록" 
                        sub="매일의 통증과 기분 기록"
                    />
                    <NavItem 
                        active={view === ViewState.DECISION_TALK} 
                        onClick={() => navigateTo(ViewState.DECISION_TALK)}
                        icon={<FileText size={20} />} 
                        label="진료 브리핑" 
                        sub="의료진과 더 쉬운 소통"
                    />
                </>
            )}
          </nav>

          <div className="mt-auto space-y-4 pt-6">
              {!isMedicalMode && (
                  <div className="pt-4 border-t border-slate-100">
                          <NavItem 
                          active={view === ViewState.PROFILE} 
                          onClick={() => navigateTo(ViewState.PROFILE)}
                          icon={<Settings size={20} />} 
                          label="내 정보 관리" 
                          sub="프로필 및 설정 수정"
                      />
                  </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                      <UserCircle2 className="text-slate-400" />
                      <div className="overflow-hidden">
                      <p className="text-xs text-slate-500 uppercase font-bold">{isMedicalMode ? '의료진 계정' : '환자 정보'}</p>
                      <p className="font-medium text-slate-700 truncate">{isMedicalMode ? 'Medical Staff' : `${userData.name}님`}</p>
                      </div>
                  </div>
                  <button 
                      onClick={handleLogout}
                      className="w-full text-xs flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                  >
                      <LogOut size={12} /> 로그아웃
                  </button>
              </div>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Header Overlay */}
      <div className="lg:hidden flex items-center justify-between bg-white p-4 border-b border-slate-200 sticky top-0 z-40">
           <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isMedicalMode ? 'bg-teal-50 border-teal-200' : 'bg-blue-50 border-blue-200'}`}>
                    <Logo size={26} variant={isMedicalMode ? 'medical' : 'default'} />
                </div>
                <span className="font-bold text-lg text-slate-900">Duo</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-1">
               <Menu size={24} />
           </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
      )}

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* Global Back to Home Header (Desktop & Mobile) - Not shown on Home View */}
        {view !== ViewState.HOME && view !== ViewState.MEDICAL_HOME && (
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigateTo(isMedicalMode ? ViewState.MEDICAL_HOME : ViewState.HOME)}
                        className="bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 p-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
                        title="홈으로 돌아가기"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800">{getPageTitle()}</h1>
                </div>
            </div>
        )}

        {view === ViewState.HOME && (
            <Home 
                userData={userData} 
                onStart={handleStart} 
                onExplore={handleExplore}
                onLogStatus={handleLogStatus}
                onGenerateReport={handleGenerateReport} 
                onViewHistory={handleViewHistory}
            />
        )}
        {view === ViewState.MEDICAL_HOME && (
            <MedicalDashboard 
                patients={[...ENRICHED_DEMO_PATIENTS]} // Demo용: 샘플 환자 3명만 표시
                onSelectPatient={handleMedicalSelectPatient}
                onStart={handleStart} // Added
                onExplore={handleExplore} // Added
            />
        )}
        {view === ViewState.PROFILE && <Profile userData={userData} onSave={handleProfileSave} onBack={() => navigateTo(ViewState.HOME)} />}
        {view === ViewState.CHOICE_TALK && <ChoiceTalk onNext={handleChoiceNext} isMedicalView={isMedicalMode} />}
        {view === ViewState.OPTION_TALK && <OptionTalk userData={userData} initialPreferences={preferences} onBack={handleOptionBack} onNext={handleOptionNext} isMedicalView={isMedicalMode} />}
        {view === ViewState.BRIDGE && <Bridge currentUserData={userData} onBack={handleBridgeBack} onSaveLog={handleSaveLog} />}
        {view === ViewState.DECISION_TALK && (
            <DecisionTalk 
                userData={userData} 
                preferences={preferences} 
                record={selectedRecord}
                currentAnalysis={currentAnalysis}
                onBack={handleDecisionBack} 
                onSave={handleSaveRecord}
                onHistoryClick={handleViewHistory}
                onAnalysisGenerated={handleAnalysisGenerated}
                isMedicalView={isMedicalMode}
            />
        )}
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, sub }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, sub: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left group
      ${active ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
    `}
  >
    <div className={`${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </div>
    <div className="min-w-0 hidden md:block lg:block"> {/* Hide text on tablet vertical sidebar if using icon only mode? No, design requested hamburger for tablet, so text is always visible in menu */}
      <div className="font-semibold truncate text-slate-700">{label}</div>
      <div className="text-xs truncate text-slate-400">{sub}</div>
    </div>
    {/* For mobile menu, text is visible. Tablet is now using hamburger, so drawer is same as mobile. */}
    <div className="min-w-0 md:hidden lg:hidden">
       <div className="font-semibold truncate text-slate-700">{label}</div>
       <div className="text-xs truncate text-slate-400">{sub}</div>
    </div>
  </button>
);

export default App;
