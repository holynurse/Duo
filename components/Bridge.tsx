
import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { ArrowLeft, Save, Activity, Clock, CheckCircle2, MessageSquarePlus, MapPin, Check } from 'lucide-react';

interface Props {
  currentUserData: UserData;
  onBack: () => void;
  onSaveLog: (data: UserData, time: string) => void;
}

const Bridge: React.FC<Props> = ({ currentUserData, onBack, onSaveLog }) => {
  const [data, setData] = useState<UserData>(currentUserData);
  const [logTime, setLogTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    setLogTime(timeStr);
    setData(prev => ({ ...prev, ...currentUserData, currentSymptoms: '' }));
  }, [currentUserData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
        onSaveLog(data, logTime);
        setIsSaving(false);
    }, 800); 
  };

  const togglePainLocation = (loc: string) => {
      setData(prev => {
          const exists = prev.painLocation.includes(loc);
          return { ...prev, painLocation: exists ? prev.painLocation.filter(l => l !== loc) : [...prev.painLocation, loc] };
      });
  };

  const painLocations = [
      { id: '상지', label: '상지 (팔/손)' },
      { id: '하지', label: '하지 (다리/발)' },
      { id: '척추', label: '척추 (등/허리)' },
      { id: '전신', label: '전신' },
      { id: '기타', label: '기타 부위' }
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6 md:space-y-8">
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-3">
            {today}
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">오늘의 상태 기록</h2>
        <p className="text-sm text-slate-500 mt-2">
            CRPS 통증은 하루에도 수시로 변할 수 있습니다.<br className="hidden md:inline"/>
            변화하는 통증 강도와 증상을 <strong>시간대별로</strong> 기록해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 space-y-6 md:space-y-8">
        
        {/* Time Selection */}
        <div className="space-y-2">
             <label className="block text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="text-indigo-500" size={20} /> 기록 시간
            </label>
            <input 
                type="time"
                required
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg font-medium"
            />
        </div>

        {/* VAS Score */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
                <label className="block text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-red-500" size={20} /> 
                    통증 점수 (VAS)
                </label>
                <span className={`text-xl md:text-2xl font-bold ${data.vasScore >= 7 ? 'text-red-600' : data.vasScore >= 4 ? 'text-amber-500' : 'text-green-600'}`}>
                    {data.vasScore}점
                </span>
            </div>
            
            <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={data.vasScore}
                onChange={e => setData({...data, vasScore: Number(e.target.value)})}
            />
            <div className="flex justify-between text-[10px] md:text-xs text-slate-400 px-1">
                <span>0 (통증 없음)</span>
                <span>5 (중등도)</span>
                <span>10 (최악의 고통)</span>
            </div>
        </div>

        {/* Pain Location Selector */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
             <label className="block text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-blue-500" size={20} /> 
                현재 통증 부위
            </label>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
                {painLocations.map(loc => {
                    const isSelected = data.painLocation.includes(loc.id);
                    return (
                        <button
                            type="button"
                            key={loc.id}
                            onClick={() => togglePainLocation(loc.id)}
                            className={`p-3 md:p-4 rounded-xl border transition-all text-xs md:text-sm font-bold flex items-center justify-between
                                ${isSelected 
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                                }`}
                        >
                            {loc.label}
                            {isSelected && <Check size={16} />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Free Text Input */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-base md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                <MessageSquarePlus className="text-purple-500" size={20} /> 
                증상 상세 기록
            </label>
            <textarea
                className="w-full h-28 md:h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm md:text-base"
                placeholder="현재 느끼는 통증의 느낌(화끈거림, 찌름 등)이나 특이사항을 자유롭게 적어주세요."
                value={data.currentSymptoms || ''}
                onChange={e => setData({...data, currentSymptoms: e.target.value})}
            />
        </div>

        <div className="pt-4 md:pt-6 flex justify-between items-center gap-3">
            <button 
                type="button"
                onClick={onBack}
                className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-1 text-sm md:text-base"
            >
                <ArrowLeft size={18} /> 이전 단계
            </button>
            <button 
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm md:text-base"
            >
                {isSaving ? '저장 중...' : '기록 저장하기'} <Save size={18} />
            </button>
        </div>
      </form>
    </div>
  );
};

export default Bridge;
