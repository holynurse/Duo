
import React, { useState, useEffect, useRef } from 'react';
import { TREATMENT_OPTIONS, CRPS_TYPE_INFO } from '../constants';
import { FAQ_LIST } from '../sources/customData';
import { fetchFAQAnswer, analyzeTreatmentRealtime } from '@/services/geminiService';
import { Preference, TreatmentOption, UserData } from '../types';
import { ThumbsUp, ThumbsDown, AlertCircle, Check, BookOpen, Stethoscope, Loader2, ExternalLink, Plus, MessageCircleQuestion, Send, Bot, User, FileText, Zap, Sparkles, Globe, Info, MessagesSquare, CheckCircle2 } from 'lucide-react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  userData: UserData; 
  initialPreferences: Preference[]; 
  onBack: () => void;
  onNext: (preferences: Preference[]) => void;
  isMedicalView?: boolean;
}

type Tab = 'TREATMENTS' | 'FAQ';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string, uri: string }[];
}

const OptionTalk: React.FC<Props> = ({ userData, initialPreferences, onBack, onNext, isMedicalView = false }) => {
  const [activeTab, setActiveTab] = useState<Tab>('TREATMENTS');
  const [preferences, setPreferences] = useState<Preference[]>(initialPreferences || []);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeReasonModal, setActiveReasonModal] = useState<{ id: string, customName?: string, type: 'LIKE' | 'DISLIKE' | 'WORRY' } | null>(null);
  const [medicalSelectedType, setMedicalSelectedType] = useState<'TYPE_1' | 'TYPE_2' | 'UNKNOWN'>('TYPE_1');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ id: string, text: string, sources: any[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeType = isMedicalView ? medicalSelectedType : userData.crpsType;
  const typeInfo = CRPS_TYPE_INFO[activeType] || CRPS_TYPE_INFO['UNKNOWN'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();

    // 탭이 변경되면 선택된 카테고리 초기화
    if (activeTab !== 'FAQ') {
        setSelectedFaqCategory(null);
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
      if (initialPreferences) {
          setPreferences(initialPreferences);
      }
  }, [initialPreferences]);

  const handlePreference = (treatmentId: string, type: 'LIKE' | 'DISLIKE' | 'WORRY', customName?: string) => {
    setActiveReasonModal({ id: treatmentId, customName, type });
  };

  const confirmPreference = (reasons: string[]) => {
    if (!activeReasonModal) return;
    setPreferences(prev => {
      const filtered = prev.filter(p => p.treatmentId !== activeReasonModal.id);
      return [...filtered, { 
          treatmentId: activeReasonModal.id, 
          customName: activeReasonModal.customName,
          type: activeReasonModal.type, 
          reasons 
      }];
    });
    setActiveReasonModal(null);
    setShowCustomInput(false);
    setCustomInputText("");
  };

  const handleAddCustomOption = () => {
      if (!customInputText.trim()) return;
      const tempId = `custom-${Date.now()}`;
      handlePreference(tempId, 'LIKE', customInputText);
  };

  const removeCustomPreference = (id: string) => {
      setPreferences(prev => prev.filter(p => p.treatmentId !== id));
  };

  const handleAiAnalysis = async (treatmentId: string, treatmentTitle: string) => {
      if (isAnalyzing) return;
      setAiAnalysisResult(null);
      setIsAnalyzing(true);
      const result = await analyzeTreatmentRealtime(treatmentTitle);
      setAiAnalysisResult({
          id: treatmentId,
          text: result.summary,
          sources: result.sources
      });
      setIsAnalyzing(false);
  };

  const handleSendMessage = async (text: string) => {
      if (!text.trim()) return;
      const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
      setChatMessages(prev => [...prev, newUserMsg]);
      setInputMessage("");
      setIsTyping(true);
      
      // 이제 fetchFAQAnswer가 내부적으로 FAQ_LIST 확인과 AI 호출을 모두 처리합니다.
      const result = await fetchFAQAnswer(text);
      
      setChatMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.text,
          sources: result.sources
      }]);
      setIsTyping(false);
  };

  const getReasonOptions = (type: 'LIKE' | 'DISLIKE' | 'WORRY', treatment?: TreatmentOption) => {
    if (!treatment) {
        if (type === 'LIKE') return ['평소 관심 있었음', '지인이 추천함', '인터넷에서 정보를 봄', '의사와 상의하고 싶음'];
        if (type === 'WORRY') return ['효과가 불확실함', '비용이 걱정됨', '부작용 정보가 부족함'];
        return ['나에게 맞지 않을 것 같음'];
    }
    if (type === 'LIKE') return [...treatment.pros, '높은 증거 수준', '긍정적인 환자 후기'];
    if (type === 'DISLIKE') return [...treatment.cons, '너무 침습적임(수술 등)', '치료 빈도가 부담됨'];
    if (type === 'WORRY') return ['부작용 걱정', '비용/보험 문제', '장기적인 위험', '시술 중 통증'];
    return [];
  };

  const getPreferenceStatus = (id: string) => preferences.find(p => p.treatmentId === id);

  const sortedTreatments = [...TREATMENT_OPTIONS].sort((a, b) => {
    const targetType = activeType;
    const aRec = a.recommendedTypes.includes(targetType);
    const bRec = b.recommendedTypes.includes(targetType);
    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    if (a.evidenceLevel === 'High' && b.evidenceLevel !== 'High') return -1;
    if (a.evidenceLevel !== 'High' && b.evidenceLevel === 'High') return 1;
    return 0;
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in relative max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-2">
        {isMedicalView ? (
            <>
                <h2 className="text-lg md:text-2xl font-bold text-slate-800">CRPS 임상 데이터베이스 (Clinical Resource)</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                     CRPS 가이드라인 기반의 치료 옵션을 조회하고, AI 페르소나와 질의응답을 진행할 수 있습니다.
                </p>
            </>
        ) : (
            <>
                <h2 className="text-lg md:text-2xl font-bold text-slate-800">치료법 탐색</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                     {userData.name}님의 <span className="text-blue-600 font-bold">{typeInfo.title.split(':')[0]}</span>에 맞춰 최적화된 정보를 제공합니다.
                </p>
            </>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white p-1 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex mb-6 md:mb-8 relative z-0 overflow-hidden">
          <button 
            onClick={() => setActiveTab('TREATMENTS')}
            className={`flex-1 py-3 md:py-4 rounded-lg md:rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 relative z-10 
              ${activeTab === 'TREATMENTS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <Stethoscope size={16} className="md:w-5 md:h-5" /> 치료 옵션 목록
          </button>
          <button 
            onClick={() => setActiveTab('FAQ')}
            className={`flex-1 py-3 md:py-4 rounded-lg md:rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 relative z-10
              ${activeTab === 'FAQ' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <MessagesSquare size={16} className="md:w-5 md:h-5" /> 
            <span>상세 FAQ</span>
            {activeTab !== 'FAQ' && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-200 ml-1 whitespace-nowrap hidden sm:inline-block">AI Chat</span>
            )}
          </button>
      </div>

      {activeTab === 'TREATMENTS' && (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            {isMedicalView && (
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                     {(['TYPE_1', 'TYPE_2', 'UNKNOWN'] as const).map(type => (
                         <button
                            key={type}
                            onClick={() => setMedicalSelectedType(type)}
                            className={`px-3 md:px-5 py-2 rounded-full font-bold text-xs transition-all border ${
                                medicalSelectedType === type 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'
                            }`}
                         >
                             {type === 'TYPE_1' ? '제1형' : type === 'TYPE_2' ? '제2형' : '미상'}
                         </button>
                     ))}
                </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 md:p-6 rounded-2xl shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                        <Zap size={20} className="md:w-6 md:h-6"/>
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-slate-800">{typeInfo.title}</h3>
                        <p className="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed">{typeInfo.description}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">주요 증상</h4>
                        <div className="flex flex-wrap gap-2">
                            {typeInfo.symptoms.map((s, i) => (
                                <span key={i} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-blue-500 uppercase mb-2">추천 치료 키워드</h4>
                        <div className="flex flex-wrap gap-2">
                             {typeInfo.keywords.map((k, i) => (
                                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold">
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-100 text-right">
                    <p className="text-[10px] md:text-xs text-slate-400">출처: 대한통증학회 및 국제 CRPS 가이드라인 (RSDSA)</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 px-1">
                <div className="flex justify-between items-center">
                    <h3 className="text-base md:text-lg font-bold text-slate-800">상세 치료 옵션</h3>
                    {!isMedicalView && <span className="text-xs md:text-sm text-slate-500 font-medium">선택됨: {preferences.length}개</span>}
                </div>
                {!isMedicalView && (
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 leading-relaxed">
                    <Info size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
                    <p>
                        <strong>추천 기준:</strong> 회원님의 <strong>CRPS 유형</strong>에 대한 적합성과 <strong>의학적 근거 수준</strong>을 종합하여 추천됩니다.
                    </p>
                </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
            {sortedTreatments.map((option) => {
                const pref = getPreferenceStatus(option.id);
                const isExpanded = isMedicalView || expandedCard === option.id;
                const isRecommended = option.recommendedTypes.includes(activeType) && activeType !== 'UNKNOWN';

                return (
                <div key={option.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden relative
                    ${pref ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'}
                    ${isRecommended ? 'ring-2 ring-indigo-100' : ''}
                `}>
                    {isRecommended && (
                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 md:px-3 rounded-bl-xl flex items-center gap-1">
                            <Sparkles size={10} /> {isMedicalView ? '해당 유형 추천' : '회원님 맞춤 추천'}
                        </div>
                    )}

                    <div className="p-4 md:p-5">
                        <div className="flex flex-col gap-2">
                            <div>
                                <span className="text-[10px] md:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1 block">{option.category}</span>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h3 className="text-base md:text-xl font-semibold text-slate-800 break-keep">
                                        {option.title}
                                    </h3>
                                     {!isMedicalView && pref && (
                                        <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 self-start sm:self-auto
                                        ${pref.type === 'LIKE' ? 'bg-green-100 text-green-700' : 
                                            pref.type === 'DISLIKE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {pref.type === 'LIKE' ? <ThumbsUp size={10}/> : pref.type === 'DISLIKE' ? <ThumbsDown size={10}/> : <AlertCircle size={10}/>}
                                        {pref.type === 'LIKE' ? '선호함' : pref.type === 'DISLIKE' ? '비선호' : '걱정됨'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 flex gap-4 text-xs md:text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-900">근거 수준:</span> 
                                <span className={`px-1.5 py-0.5 rounded text-[10px] md:text-xs ${option.evidenceLevel === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{option.evidenceLevel === 'High' ? '높음' : '보통'}</span>
                            </div>
                        </div>

                        {!isMedicalView && (
                        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2">
                            <button onClick={() => handlePreference(option.id, 'LIKE')} className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${pref?.type === 'LIKE' ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 hover:bg-green-50 text-slate-600'}`}>
                                <ThumbsUp size={14} /> 좋아요
                            </button>
                            <button onClick={() => handlePreference(option.id, 'WORRY')} className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${pref?.type === 'WORRY' ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 hover:bg-amber-50 text-slate-600'}`}>
                                <AlertCircle size={14} /> 걱정돼요
                            </button>
                            <button onClick={() => handlePreference(option.id, 'DISLIKE')} className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${pref?.type === 'DISLIKE' ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 hover:bg-red-50 text-slate-600'}`}>
                                <ThumbsDown size={14} /> 싫어요
                            </button>
                        </div>
                        )}

                        {!isMedicalView && (
                        <button 
                            onClick={() => {
                                setExpandedCard(isExpanded ? null : option.id);
                                setAiAnalysisResult(null); 
                            }}
                            className="w-full mt-4 text-center text-xs md:text-sm text-blue-600 font-medium hover:underline flex justify-center items-center gap-1"
                        >
                            {isExpanded ? '간략히 보기' : '상세 정보 및 위험성 보기'} {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        )}
                    </div>

                    {isExpanded && (
                    <div className={`px-4 md:px-5 pb-5 pt-0 bg-slate-50 border-t border-slate-100 animate-fade-in ${isMedicalView ? 'mt-0' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1"><Check size={14}/> 긍정적 효과 (Pros)</h4>
                            <ul className="list-disc pl-5 text-xs md:text-sm text-slate-600 space-y-1">
                            {option.pros.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1"><AlertCircle size={14}/> 부작용 및 단점 (Cons)</h4>
                            <ul className="list-disc pl-5 text-xs md:text-sm text-slate-600 space-y-1">
                            {option.cons.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
                            {option.referenceUrl && (
                                <a 
                                    href={option.referenceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors w-full sm:w-auto"
                                >
                                    <FileText size={14} />
                                    <span>의학 근거 보기</span>
                                    <ExternalLink size={12} />
                                </a>
                            )}
                            
                            <button 
                                onClick={() => handleAiAnalysis(option.id, option.title)}
                                disabled={isAnalyzing && !aiAnalysisResult}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-xs md:text-sm font-medium hover:shadow-md transition-all disabled:opacity-70 w-full sm:w-auto"
                            >
                                {isAnalyzing && aiAnalysisResult?.id !== option.id ? <Loader2 size={14} className="animate-spin"/> : <Globe size={14} />}
                                <span>✨ AI 최신 분석</span>
                            </button>
                        </div>

                        {(isAnalyzing || aiAnalysisResult?.id === option.id) && (
                            <div className="mt-4 p-4 bg-white border border-purple-100 rounded-xl shadow-sm animate-fade-in">
                                {isAnalyzing && !aiAnalysisResult ? (
                                    <div className="flex flex-col items-center justify-center py-4 text-purple-600">
                                        <Loader2 size={24} className="animate-spin mb-2" />
                                        <p className="text-xs">최신 의학 정보를 검색하고 있습니다...</p>
                                    </div>
                                ) : (
                                    aiAnalysisResult && (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bot size={16} className="text-purple-600" />
                                                <h4 className="text-sm font-bold text-purple-800">AI 실시간 분석 리포트</h4>
                                            </div>
                                            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                {aiAnalysisResult.text}
                                            </div>
                                            {aiAnalysisResult.sources.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100">
                                                    <p className="text-xs font-bold text-slate-400 mb-1">참고 출처</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {aiAnalysisResult.sources.map((s, i) => (
                                                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-50 hover:bg-slate-100 text-blue-500 px-2 py-1 rounded">
                                                                <ExternalLink size={10} /> {s.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                    )}
                </div>
                );
            })}

            {!isMedicalView && preferences.filter(p => p.treatmentId.startsWith('custom-')).map(p => (
                 <div key={p.treatmentId} className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase">직접 입력</span>
                        <h3 className="text-base font-bold text-indigo-900">{p.customName}</h3>
                        <p className="text-xs text-indigo-700 mt-0.5">이유: {p.reasons.join(', ')}</p>
                    </div>
                    <button onClick={() => removeCustomPreference(p.treatmentId)} className="text-slate-400 hover:text-red-500 p-2 self-end sm:self-auto">
                        <span className="text-xs underline">삭제</span>
                    </button>
                 </div>
            ))}
            
            {!isMedicalView && (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center">
                <MessageCircleQuestion className="w-8 h-8 text-slate-400 mb-3" />
                <h3 className="font-bold text-slate-700 text-sm md:text-base">원하는 치료법이 없나요?</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-4">리스트에 없는 치료법이나, 의사 선생님께 물어보고 싶은 다른 옵션을 직접 적어주세요.</p>
                
                {!showCustomInput ? (
                    <button 
                        onClick={() => setShowCustomInput(true)}
                        className="bg-white border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} /> 직접 입력하기
                    </button>
                ) : (
                    <div className="w-full max-w-md space-y-3 animate-fade-in">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="예: 비타민 수액 요법, 한방 치료 등"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={customInputText}
                            onChange={e => setCustomInputText(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowCustomInput(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm">취소</button>
                            <button onClick={handleAddCustomOption} disabled={!customInputText.trim()} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm">
                                추가하기
                            </button>
                        </div>
                    </div>
                )}
            </div>
            )}
            </div>
        </div>
      )}

      {activeTab === 'FAQ' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[450px] md:h-[600px] animate-fade-in">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {chatMessages.length === 0 && (
                   <div className="space-y-6 max-w-2xl mx-auto py-8">
                       <div className="text-center mb-6">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                               <Bot className="text-indigo-600" size={24} />
                           </div>
                           <h3 className="text-base md:text-lg font-bold text-slate-800">무엇이 궁금하신가요?</h3>
                           <p className="text-slate-500 text-xs md:text-sm">아래 주제 중 선택하거나 직접 물어보세요.</p>
                       </div>

                       <div className="flex flex-wrap gap-2 md:gap-3">
                           {FAQ_LIST.map((category, idx) => (
                               <button
                                   key={idx}
                                   onClick={() => setSelectedFaqCategory(category.category)}
                                   className="bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-md px-4 py-3 rounded-xl text-sm md:text-base text-slate-700 transition-all text-left font-bold"
                               >
                                   {category.category}
                               </button>
                           ))}
                       </div>

                       {selectedFaqCategory && (
                           <div className="mt-6 pt-6 border-t border-slate-200 animate-fade-in">
                                <h4 className="text-sm md:text-base font-bold text-indigo-700 mb-3">{selectedFaqCategory} 관련 질문</h4>
                                <div className="flex flex-wrap gap-2">
                                    {FAQ_LIST.find(cat => cat.category === selectedFaqCategory)?.items.map((item, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSendMessage(item.q)}
                                            className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800 hover:shadow-sm px-3 py-2 rounded-lg text-xs md:text-sm text-indigo-800 transition-all text-left"
                                        >
                                            {item.q}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setSelectedFaqCategory(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-4 underline">
                                    다른 카테고리 보기
                                </button>
                           </div>
                       )}
                   </div>
                )}

                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={14} className="text-indigo-600 md:w-4 md:h-4" />
                            </div>
                        )}
                        <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 text-xs md:text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                        }`}>
                            {msg.content}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">참고 출처</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((s, i) => (
                                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-50 hover:bg-slate-100 text-blue-500 px-2 py-1 rounded">
                                                <ExternalLink size={10} /> {s.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex gap-2 justify-start animate-fade-in">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-indigo-600" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-indigo-500" />
                            <span className="text-xs text-slate-400">답변을 생성하고 있습니다...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white border-t border-slate-200">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
                    className="flex gap-2"
                >
                    <input 
                        type="text" 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="궁금한 점을 입력하세요..."
                        className="flex-1 px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm md:text-base"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputMessage.trim() || isTyping}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 md:p-3 rounded-xl transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
      )}

      {!isMedicalView && (
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md p-4 -mx-4 border-t border-slate-200 flex justify-between items-center shadow-lg mt-6 md:mt-8 z-10">
        <button onClick={onBack} className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-1 text-sm md:text-base">
           <ArrowLeft size={18} /> <span className="hidden sm:inline">뒤로가기</span>
        </button>
        <button 
          onClick={() => onNext(preferences)}
          className={`px-5 py-3 md:px-6 md:py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg text-white text-sm md:text-base ${preferences.length > 0 ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-slate-300 cursor-not-allowed'}`}
        >
          <span className="hidden sm:inline">오늘의 기록 남기기</span> <span className="sm:hidden">기록하기</span> <ArrowRight size={18} />
        </button>
      </div>
      )}

      {activeReasonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 md:p-6 animate-scale-in">
            <h3 className="text-lg font-bold mb-4">
                {activeReasonModal.customName ? `'${activeReasonModal.customName}'에 대해` : '어떤 점이 그렇게 느껴지시나요?'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">해당되는 이유를 모두 선택해주세요.</p>
            
            <ReasonSelector 
              options={getReasonOptions(activeReasonModal.type, TREATMENT_OPTIONS.find(t => t.id === activeReasonModal.id))}
              onConfirm={confirmPreference}
              onCancel={() => {
                  setActiveReasonModal(null);
                  if (activeReasonModal.customName) {
                      setShowCustomInput(true);
                  }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ReasonSelector = ({ options, onConfirm, onCancel }: { options: string[], onConfirm: (reasons: string[]) => void, onCancel: () => void }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (opt: string) => setSelected(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {options.map(opt => (
          <button 
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${selected.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm">취소</button>
        <button onClick={() => onConfirm(selected)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">저장하기</button>
      </div>
    </div>
  );
}

export default OptionTalk;
