
import React, { useState } from 'react';
import { STANDARD_STATS } from '../constants';
import { FAQ_LIST, SUMMARY_FAQ_CATEGORIES } from '../sources/customData';
import { Stethoscope, ArrowRight, HelpCircle, User, MapPin } from 'lucide-react';

interface Props {
  onNext: () => void;
  isMedicalView?: boolean;
}

const ChoiceTalk: React.FC<Props> = ({ onNext, isMedicalView }) => {
  const [personaMessage] = useState<string>(
      "안녕하세요. CRPS 가이드, 인포-메이트(Info-Mate)예요. 저는 수많은 환자분들의 실제 치료 데이터와 가장 궁금해하시는 질문들을 바탕으로 생성되었습니다. 인터넷의 넘치는 정보 속에서 길을 잃지 않도록, 검증된 의학 자료를 통해 꼭 필요한 정보만 전해 드릴게요. 우리는 이제 통증을 함께 이겨낼 하나의 팀이에요."
  );
  
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const getStat = (labelPart: string) => STANDARD_STATS.find(s => s.label.includes(labelPart));

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* Mate Section - Hide in Medical View */}
      {!isMedicalView && (
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-lg shadow-blue-50 border border-blue-100 flex flex-col md:flex-row gap-5 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 md:p-4 rounded-2xl flex-shrink-0 shadow-md z-10 self-start">
          <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <div className="z-10">
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            인포-메이트 (Info-Mate) <span className="text-[10px] md:text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AI Caregiver</span>
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{personaMessage}</p>
        </div>
      </div>
      )}

      {/* Aesthetic Infographic Section */}
      <div className="space-y-4 md:space-y-6">
        <div className="px-1 md:px-2">
            <h3 className="text-lg md:text-2xl font-bold text-slate-800">CRPS 환자 데이터 인사이트</h3>
            <p className="text-sm text-slate-500 mt-1">상급종합병원 환자들의 임상 데이터를 시각화했습니다.</p>
        </div>
        
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-slate-50 to-transparent opacity-50 pointer-events-none"></div>

            {/* 1. Hero Metrics - Responsive Grid */}
            <div className="relative grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 mb-8 md:mb-10 pb-8 border-b border-slate-100">
                {/* 1. Pain Score */}
                <div className="flex flex-col items-center justify-center text-center group cursor-default col-span-2 md:col-span-1">
                     <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-rose-500 transition-colors">평균 통증</span>
                     <div className="relative">
                        <span className="text-4xl sm:text-5xl font-black text-rose-500 tracking-tight group-hover:scale-110 transition-transform duration-300 block">
                            {getStat('통증 점수')?.value.split('점')[0]}
                        </span>
                        <span className="absolute -top-1 -right-8 text-xs md:text-sm font-bold text-rose-300">VAS</span>
                     </div>
                     <div className="mt-2 w-12 h-1 bg-rose-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* 2. Duration */}
                <div className="flex flex-col items-center justify-center text-center group cursor-default md:border-x md:border-slate-100">
                     <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-indigo-500 transition-colors">평균 투병</span>
                     <div className="relative">
                        <span className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight group-hover:scale-110 transition-transform duration-300 block">
                            {getStat('투병')?.value.replace('년', '')}
                        </span>
                        <span className="absolute -top-1 -right-6 text-xs md:text-sm font-bold text-slate-400">년</span>
                     </div>
                     <div className="mt-2 w-12 h-1 bg-indigo-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* 3. Main Cause */}
                <div className="flex flex-col items-center justify-center text-center group cursor-default">
                     <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-amber-500 transition-colors">주된 원인</span>
                     <div className="relative">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight group-hover:scale-110 transition-transform duration-300 block break-keep">
                            {getStat('원인')?.value}
                        </span>
                     </div>
                     <div className="mt-2 w-12 h-1 bg-amber-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>

            {/* 2. Context Flow */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10 text-center md:text-left">
                {/* Age */}
                <div className="w-full md:w-auto bg-slate-50 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center md:justify-start gap-3 md:gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-500">
                        <User size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-0.5">첫 진단 평균 나이</div>
                        <div className="text-base md:text-lg font-bold text-slate-700">{getStat('나이')?.value}</div>
                    </div>
                </div>
                
                <div className="hidden md:block text-slate-300">
                    <ArrowRight />
                </div>

                {/* Location */}
                <div className="w-full md:w-auto bg-slate-50 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center md:justify-start gap-3 md:gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-0.5">주된 통증 부위</div>
                        <div className="text-base md:text-lg font-bold text-slate-700">{getStat('부위')?.value}</div>
                    </div>
                </div>
            </div>

            {/* 3. Symptom Cloud */}
            <div className="relative">
                 <h4 className="text-center text-xs font-bold text-slate-400 mb-4 md:mb-6 uppercase tracking-wider">주요 동반 증상 및 양상</h4>
                 <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-3xl mx-auto">
                    {/* Pain Types */}
                    {getStat('통증 유형')?.value.split(', ').map((item, i) => (
                        <span key={`pain-${i}`} className="px-3 py-1.5 md:px-4 md:py-2 bg-rose-50 text-rose-700 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-sm border border-rose-100 hover:-translate-y-0.5 transition-transform cursor-default">
                            ⚡ {item}
                        </span>
                    ))}
                    {/* Physical */}
                    {getStat('신체 증상')?.value.split(', ').map((item, i) => (
                        <span key={`phy-${i}`} className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-700 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-sm border border-blue-100 hover:-translate-y-0.5 transition-transform cursor-default">
                            💧 {item}
                        </span>
                    ))}
                    {/* Psychological */}
                    {getStat('심리 증상')?.value.split(', ').map((item, i) => (
                        <span key={`psy-${i}`} className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-50 text-purple-700 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-sm border border-purple-100 hover:-translate-y-0.5 transition-transform cursor-default">
                            🧠 {item}
                        </span>
                    ))}
                 </div>
            </div>
        </div>
      </div>

      {/* Categorized FAQ */}
      <div className="space-y-4 md:space-y-6 pt-4 md:pt-6">
        <div className="px-1 md:px-2">
            <h3 className="text-lg md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 md:w-7 md:h-7 text-blue-500" /> 자주 묻는 질문 (요약)
            </h3>
            <p className="text-sm text-slate-500 mt-1">다른 환자분들이 가장 많이 궁금해했던 질문들을 모았습니다.</p>
        </div>
        
        <div className="space-y-4 md:space-y-8">
            {FAQ_LIST.filter(cat => SUMMARY_FAQ_CATEGORIES.includes(cat.category)).map((category, idx) => (
                <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4 border-b border-slate-50 pb-2">{category.category}</h4>
                    <div className="flex flex-wrap gap-2">
                        {category.items.map((item, i) => {
                            const isSelected = selectedQuestion === item.q;
                            return (
                                <div key={i} className="flex flex-col w-full md:w-auto">
                                    <button 
                                        onClick={() => setSelectedQuestion(isSelected ? null : item.q)}
                                        className={`px-4 py-3 rounded-xl md:rounded-2xl text-left text-sm font-medium transition-all duration-300 ${
                                            isSelected 
                                            ? 'bg-slate-800 text-white shadow-lg scale-[1.01] md:scale-[1.02]' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        {item.q}
                                    </button>
                                    
                                    {isSelected && (
                                        <div className="mt-2 md:mt-3 mb-2 p-4 md:p-5 bg-blue-50/50 rounded-xl md:rounded-2xl text-slate-700 text-sm leading-relaxed animate-fade-in border border-blue-100">
                                            <span className="font-bold text-blue-600 block mb-1">Answer</span>
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        <div className="text-center pt-2 px-2">
            <p className="text-xs md:text-sm text-slate-400">더 자세한 의학 정보와 치료 옵션은 다음 단계에서 확인할 수 있습니다.</p>
        </div>
      </div>

      {!isMedicalView && (
      <div className="flex justify-end pt-6 pb-8 md:pb-12">
        <button 
          onClick={onNext}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg px-6 py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1"
        >
          치료 솔루션 살펴보기 <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
      )}
    </div>
  );
};

export default ChoiceTalk;
