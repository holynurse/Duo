
import React, { useEffect, useState, useRef } from 'react';
import { UserData, Preference, ConsultationRecord } from '../types';
import { generatePersonaMessage, generateSmartQuestions, chatWithDecisionPersona } from '../services/geminiService';
import { TREATMENT_OPTIONS } from '../constants';
import { Bot, ClipboardList, ArrowLeft, Save, History, TrendingUp, Calendar, Activity, BookOpenCheck, Loader2, User, Zap, Heart, MessageCircle, Brain, AlertTriangle, ThumbsUp, Send, Stethoscope, X, MessageSquare, AlertCircle, FileText, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnalysisData {
    welcomeMsg: string;
    questions: string[];
}

interface Props {
  userData: UserData;
  preferences: Preference[];
  record?: ConsultationRecord | null;
  currentAnalysis: AnalysisData | null;
  onBack: () => void;
  onSave: (questions: string[], chatHistory: { role: 'user' | 'assistant'; content: string }[]) => void;
  onHistoryClick: (record: ConsultationRecord) => void;
  onAnalysisGenerated: (data: AnalysisData) => void;
  isMedicalView?: boolean;
}

const DecisionTalk: React.FC<Props> = ({ userData, preferences, record, currentAnalysis, onBack, onSave, onHistoryClick, onAnalysisGenerated, isMedicalView = false }) => {
  const [welcomeMsg, setWelcomeMsg] = useState("환자정보의 요약을 불러오는 중입니다...");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [forceGenerate, setForceGenerate] = useState(false);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const modalChatEndRef = useRef<HTMLDivElement>(null);

  const isHistoryView = !!record;
  const hasPreferences = preferences && preferences.length > 0;
  const hasLogs = userData.statusLogs && userData.statusLogs.length > 0;
  const hasEnoughData = hasPreferences || hasLogs;
  const showEmptyState = !isHistoryView && !currentAnalysis && !isMedicalView && !hasEnoughData && !forceGenerate;

  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showEmptyState) {
        setLoadingQuestions(false);
        return;
    }

    const init = async () => {
      setLoadingQuestions(true);

      if (isHistoryView && record) {
          const msg = await generatePersonaMessage('history-view');
          setWelcomeMsg(msg);
          setQuestions(record.generatedQuestions);
          setChatMessages(record.chatHistory || []);
          setLoadingQuestions(false);

      } else if (currentAnalysis) {
          setWelcomeMsg(currentAnalysis.welcomeMsg);
          setQuestions(currentAnalysis.questions);
          setLoadingQuestions(false);

      } else {
          try {
            const msg = await generatePersonaMessage('decision', userData);
            setWelcomeMsg(msg);
            
            const qs = await generateSmartQuestions(userData, preferences);
            setQuestions(qs);
            setLoadingQuestions(false);
            
            if (!isMedicalView) {
                 setChatMessages([{ role: 'assistant', content: "분석을 마쳤습니다. 더 궁금한 점이 있으시면 편하게 물어봐주세요." }]);
            } else {
                 setChatMessages([{ role: 'assistant', content: "의료진 모드입니다. 환자의 데이터를 기반으로 답변해드립니다." }]);
            }
            
            onAnalysisGenerated({ welcomeMsg: msg, questions: qs });
          } catch (e) {
            console.error("Generation failed", e);
            setQuestions(["질문을 생성하지 못했습니다. 다시 시도해주세요."]);
            setLoadingQuestions(false);
          }
      }
    };

    init();
  }, [userData.vasScore, userData.history.length, isHistoryView, record?.id, currentAnalysis, showEmptyState]);

  useEffect(() => {
      modalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, showChatModal]);

  const handleSendMessage = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputMessage.trim() || isHistoryView) return;

      const userMsg = inputMessage;
      setInputMessage("");
      
      const newHistory = [...chatMessages, { role: 'user' as const, content: userMsg }];
      setChatMessages(newHistory);
      setIsTyping(true);

      const response = await chatWithDecisionPersona(userData, newHistory, userMsg, isMedicalView);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
  };

  const chartData = (userData.statusLogs || [])
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
    .map(log => ({
        fullDate: `${log.date} ${log.time}`,
        displayDate: log.date.slice(5),
        time: log.time,
        vas: log.vasScore
    }));
  
  if (chartData.length === 0 && userData.history.length > 0) {
      userData.history.forEach(h => {
          chartData.push({ fullDate: h.date, displayDate: h.date.slice(5), time: '', vas: h.vasScore });
      });
  }

  const todayStr = new Date().toLocaleDateString();
  const todayLogs = (userData.statusLogs || []).filter(l => l.date === todayStr);
  let todayVasDisplay = userData.vasScore;
  if (todayLogs.length > 0) {
      const sum = todayLogs.reduce((acc, curr) => acc + curr.vasScore, 0);
      todayVasDisplay = parseFloat((sum / todayLogs.length).toFixed(1));
  }

  const allPainLocs = Array.from(new Set(todayLogs.flatMap(l => l.painLocation)));
  const displayPainLoc = allPainLocs.length > 0 ? allPainLocs.join(', ') : (userData.painLocation?.join(', ') || '정보 없음');
  const todayComments = todayLogs.filter(l => l.symptoms).map(l => ({ time: l.time, text: l.symptoms }));

  const getTypeName = (type: string) => {
      if (type === 'TYPE_1') return '제1형';
      if (type === 'TYPE_2') return '제2형';
      return '미상';
  };

  const getTreatmentTitle = (pref: Preference) => {
      if (pref.treatmentId.startsWith('custom') || pref.customName) {
          return pref.customName || '직접 입력';
      }
      const option = TREATMENT_OPTIONS.find(t => t.id === pref.treatmentId);
      return option ? option.title : pref.treatmentId;
  };

  const likes = preferences.filter(p => p.type === 'LIKE');
  const worries = preferences.filter(p => p.type === 'WORRY');
  const themeColor = isMedicalView ? 'teal' : 'indigo';
  const themeBg = isMedicalView ? 'bg-teal-600' : 'bg-indigo-600';
  const themeText = isMedicalView ? 'text-teal-600' : 'text-indigo-600';
  const themeLightBg = isMedicalView ? 'bg-teal-50' : 'bg-indigo-50';

  if (showEmptyState) {
      return (
          <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 animate-fade-in text-center">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-slate-400">
                      <AlertCircle size={32} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">분석할 데이터가 충분하지 않습니다</h2>
                  <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8 leading-relaxed">
                      더 정확한 진료 준비 리포트를 생성하려면,<br/>
                      관심 있는 치료법을 선택하거나 오늘의 상태를 기록해주세요.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <button onClick={onBack} className="p-3 md:p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors flex flex-col items-center gap-2 text-sm md:text-base">
                          <Stethoscope size={20} /> 치료법 탐색하러 가기
                      </button>
                       <button onClick={onBack} className="p-3 md:p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors flex flex-col items-center gap-2 text-sm md:text-base">
                          <ClipboardList size={20} /> 오늘 상태 기록하기
                      </button>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                      <button onClick={() => setForceGenerate(true)} className="text-slate-400 text-xs md:text-sm hover:text-slate-600 font-medium underline">
                          입력된 정보 없이 기본 프로필로만 생성하기
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12 relative">
      {/* Header */}
      <div className={`text-white p-5 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center transition-colors relative overflow-hidden ${isHistoryView ? 'bg-slate-700' : isMedicalView ? 'bg-gradient-to-r from-teal-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}>
         <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm flex-shrink-0 z-10">
            {isHistoryView ? <BookOpenCheck className="w-6 h-6 md:w-8 md:h-8 text-white" /> : isMedicalView ? <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-white" /> : <HeartPulse className="w-6 h-6 md:w-8 md:h-8 text-white" />}
         </div>
        <div className="z-10 flex-1 w-full">
            <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
                {isHistoryView ? `${record?.date} 진료 기록` : isMedicalView ? '환자 진료 리포트' : '현재 상태 요약'}
            </h1>
            {!isMedicalView && (
                <p className="text-indigo-100 text-xs md:text-sm leading-relaxed opacity-95">{welcomeMsg}</p>
            )}
            {isMedicalView && (
                <p className="text-teal-50 text-xs md:text-sm opacity-95">환자 데이터를 기반으로 분석된 리포트입니다.</p>
            )}
         </div>
         
         {!isHistoryView && (
             <button 
                onClick={() => setShowChatModal(true)}
                className={`z-10 flex items-center gap-2 bg-white ${themeText} px-5 py-3 md:px-6 md:py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-105 w-full md:w-auto justify-center text-sm md:text-base ${isMedicalView ? 'hover:bg-teal-50' : 'hover:bg-indigo-50'}`}
             >
                 <MessageCircle size={18} />
                 {isMedicalView ? "Decision-helper와 대화하기" : "Decision-helper와 대화하기"}
             </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={14}/> 환자 기본 정보 및 성향
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3 mb-4 border-b border-slate-50 pb-4">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-sm">
                          <span className="text-slate-500 text-xs">이름</span>
                          <span className="font-bold text-slate-700">{userData.name}</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-sm">
                          <span className="text-slate-500 text-xs">투병 기간</span>
                          <span className="font-bold text-slate-700">{userData.durationMonths}개월</span>
                      </div>
                       <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-sm">
                          <Activity size={14} className="text-blue-500"/>
                          <span className="font-bold text-slate-700">{getTypeName(userData.crpsType)}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                              <Brain size={12}/> 지식 수준
                          </span>
                          <span className="font-bold text-slate-700 text-xs md:text-sm">
                              {userData.knowledgeLevel === 'HIGH' ? '높음 (전문 용어)' : 
                               userData.knowledgeLevel === 'LOW' ? '낮음 (쉬운 설명)' : '보통'}
                          </span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 bg-pink-50 rounded-xl border border-pink-100">
                          <span className="text-xs text-pink-600 font-medium flex items-center gap-1">
                              <Heart size={12}/> 정서적 지지
                          </span>
                          <span className="font-bold text-slate-700 text-xs md:text-sm">
                              {userData.wantsEmotionalSupport ? '필요함 (위로 중심)' : '정보 전달 중심'}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Current Status Card */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap size={14} /> 오늘의 상태 체크 (종합)
                  </h3>
                  
                  <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={todayVasDisplay >= 7 ? '#ef4444' : todayVasDisplay >= 4 ? '#f59e0b' : '#3b82f6'} strokeWidth="3" strokeDasharray={`${todayVasDisplay * 10}, 100`} />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                              <span className={`text-lg md:text-xl font-bold ${todayVasDisplay >= 7 ? 'text-red-500' : todayVasDisplay >= 4 ? 'text-amber-500' : 'text-blue-500'}`}>{todayVasDisplay}</span>
                              <span className="text-[8px] md:text-[9px] text-slate-400">평균 VAS</span>
                          </div>
                      </div>
                      <div className="flex-1">
                          <div className="mb-2">
                            <p className="text-[10px] md:text-xs text-slate-400 mb-0.5">오늘 호소한 통증 부위</p>
                            <p className="font-bold text-slate-800 text-sm md:text-base break-keep">{displayPainLoc}</p>
                          </div>
                          <div>
                            <p className="text-[10px] md:text-xs text-slate-400 mb-0.5">기록 횟수</p>
                            <p className="font-bold text-slate-800 text-sm">{todayLogs.length}회</p>
                          </div>
                      </div>
                  </div>

                  {todayComments.length > 0 ? (
                      <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {todayComments.map((comment, i) => (
                             <div key={i} className="flex gap-2 text-xs md:text-sm">
                                 <span className="text-slate-400 font-mono text-[10px] md:text-xs mt-0.5 whitespace-nowrap">[{comment.time}]</span>
                                 <span className="text-slate-600">{comment.text}</span>
                             </div>
                          ))}
                      </div>
                  ) : (
                      isHistoryView && record?.memo && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs md:text-sm text-slate-600 leading-relaxed border border-slate-100">
                             "{record.memo}"
                        </div>
                      )
                  )}
              </div>
          </div>

          <div className="space-y-6">
              {/* Pain Trend Chart */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp size={14}/> 통증 변화 그래프 (전체 기록)
                  </h3>
                  <div className="h-40 md:h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="fullDate" 
                                tickFormatter={(val) => {
                                    const date = new Date(val);
                                    return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
                                }}
                                tick={{fontSize: 9}} 
                                stroke="#94a3b8" 
                                minTickGap={30}
                              />
                              <YAxis domain={[0, 10]} stroke="#94a3b8" hide />
                              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} cursor={{stroke: '#cbd5e1', strokeWidth: 1}} labelFormatter={(label) => label}/>
                              <Line type="monotone" dataKey="vas" stroke="#3b82f6" strokeWidth={2} dot={{r: 2, fill: '#3b82f6', strokeWidth: 1, stroke: '#fff'}} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Treatment Preferences */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ClipboardList size={14}/> 치료 선호도 분석
                  </h3>
                  {likes.length > 0 && (
                      <div className="mb-4">
                          <h4 className="text-[10px] md:text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                              <ThumbsUp size={10} /> 긍정적으로 고려 중
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {likes.map(p => (
                                  <span key={p.treatmentId} className="bg-green-50 text-green-700 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium border border-green-100">
                                      {getTreatmentTitle(p)}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}

                  {worries.length > 0 && (
                      <div>
                          <h4 className="text-[10px] md:text-xs font-bold text-amber-600 mb-2 flex items-center gap-1">
                              <AlertTriangle size={10} /> 고민되거나 우려되는 치료
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {worries.map(p => (
                                  <span key={p.treatmentId} className="bg-amber-50 text-amber-700 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium border border-amber-100">
                                      {getTreatmentTitle(p)}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}

                  {likes.length === 0 && worries.length === 0 && (
                      <p className="text-xs text-slate-400 italic">선택된 치료 옵션이 없습니다.</p>
                  )}
              </div>
          </div>
      </div>

      {/* Generated Questions */}
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border border-indigo-100 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 md:w-2 h-full ${themeBg}`}></div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
              <MessageCircle className={themeText} /> 
              {isMedicalView 
                ? '환자 상담 시 참고할 질문 목록입니다'
                : (userData.medicalCommunicationSatisfied ? '의료진에게 이렇게 질문해보세요' : '진료실에서 당황하지 않게 준비했어요')}
          </h3>
          
          {loadingQuestions ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className={`w-6 h-6 md:w-8 md:h-8 animate-spin ${themeText} mb-2`} />
                  <p className="text-sm">분석 중입니다...</p>
              </div>
          ) : (
              <div className="space-y-3 md:space-y-4">
                  {questions.map((q, idx) => (
                      <div key={idx} className={`bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-200 flex gap-3 md:gap-4 items-start hover:border-${themeColor}-300 transition-colors`}>
                          <div className={`bg-white ${themeText} font-bold w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5 text-sm md:text-base`}>
                              {idx + 1}
                          </div>
                          <p className="text-slate-700 font-medium text-sm md:text-lg leading-relaxed">{q}</p>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4">
          <button onClick={onBack} className="w-full sm:w-auto text-slate-500 font-medium hover:text-slate-800 flex items-center justify-center gap-1 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-sm md:text-base">
             <ArrowLeft size={18} /> {isHistoryView ? '목록으로 돌아가기' : '이전 단계'}
          </button>
          
          {!isHistoryView && !isMedicalView && (
              <button onClick={() => onSave(questions, chatMessages)} disabled={loadingQuestions || showEmptyState} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all text-sm md:text-lg">
                  <Save size={18} /> 이 기록 저장하고 완료하기
              </button>
          )}
      </div>

      {/* History Timeline */}
      <div className="pt-6 md:pt-8 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History size={14}/> 과거 진료 기록 타임라인
          </h3>
          {userData.history.length === 0 ? (
              <p className="text-slate-400 text-xs md:text-sm">아직 저장된 진료 기록이 없습니다.</p>
          ) : (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {userData.history.map((h) => (
                      <button 
                          key={h.id}
                          onClick={() => onHistoryClick(h)}
                          className={`flex-shrink-0 min-w-[130px] md:min-w-[160px] p-3 md:p-4 rounded-xl border transition-all text-left group
                              ${record?.id === h.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}
                          `}
                      >
                          <div className="text-[10px] md:text-xs opacity-70 mb-1 flex items-center gap-1">
                              <Calendar size={10} /> {h.date}
                          </div>
                          <div className={`text-base md:text-lg font-bold mb-2 ${record?.id === h.id ? 'text-white' : 'text-slate-700'}`}>
                              VAS {h.vasScore}
                          </div>
                          <div className="flex gap-1">
                              <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full ${record?.id === h.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  질문 {h.generatedQuestions.length}개
                              </span>
                          </div>
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl h-[85vh] md:h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
                <div className={`${themeBg} p-4 md:p-6 flex justify-between items-center text-white`}>
                    <div className="flex items-center gap-3">
                        {isMedicalView ? <Stethoscope size={24} /> : <Bot size={24} />}
                        <div>
                            <h3 className="font-bold text-base md:text-lg">{isMedicalView ? '환자 대변인 문진 (AI)' : 'Decision-helper와의 상담'}</h3>
                            <p className={`${isMedicalView ? 'text-teal-100' : 'text-indigo-100'} text-xs`}>
                                {isMedicalView ? 'CRPS기본정보와 환자 데이터를 반영한 AI와 대화합니다.' : '무엇이든 물어보세요. 이 대화는 기록됩니다.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowChatModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'assistant' && (
                              <div className={`w-8 h-8 ${themeLightBg} ${themeText} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                                  <Bot size={16} />
                              </div>
                          )}
                          <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 text-xs md:text-sm leading-relaxed ${
                              msg.role === 'user' 
                              ? `${themeBg} text-white rounded-tr-none` 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                          }`}>
                              {msg.content}
                          </div>
                      </div>
                    ))}
                    {isTyping && (
                         <div className="flex gap-3 justify-start animate-fade-in">
                            <div className={`w-8 h-8 ${themeLightBg} ${themeText} rounded-full flex items-center justify-center flex-shrink-0`}>
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className={`animate-spin ${themeText}`} />
                                <span className="text-xs text-slate-400">답변을 작성 중입니다...</span>
                            </div>
                        </div>
                    )}
                    <div ref={modalChatEndRef} />
                </div>
                {!isHistoryView && (
                <div className="p-3 md:p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                            type="text" 
                            autoFocus
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={isMedicalView ? "문진할 내용을 입력하세요..." : "궁금한 점을 입력하세요..."}
                            className={`flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white transition-all focus:ring-2 focus:ring-${isMedicalView ? 'teal' : 'indigo'}-500 text-sm md:text-base`}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputMessage.trim() || isTyping}
                            className={`disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors ${isMedicalView ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
                )}
            </div>
        </div>
      )}

      {!isMedicalView && !isHistoryView && !showChatModal && !showEmptyState && (
          <button
            onClick={() => setShowChatModal(true)}
            className="fixed bottom-6 right-6 w-12 h-12 md:w-14 md:h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 z-50 animate-bounce-in"
          >
              <MessageSquare size={24} className="md:w-7 md:h-7" />
          </button>
      )}
    </div>
  );
};

export default DecisionTalk;
