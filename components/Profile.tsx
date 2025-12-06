import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { User, Calendar, Save, ArrowLeft, Activity, Heart, Brain, MessageCircle } from 'lucide-react';

interface Props {
  userData: UserData;
  onSave: (data: UserData) => void;
  onBack?: () => void;
}

const Profile: React.FC<Props> = ({ userData, onSave, onBack }) => {
  const [form, setForm] = useState<UserData>(userData);
  const [saved, setSaved] = useState(false);

  // Sync local state with prop when userData changes (e.g. forced reset on logout)
  useEffect(() => {
    setForm(userData);
  }, [userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">내 정보 관리</h2>
        <p className="text-slate-500 mt-2">더 정확하고 개인화된 듀오(Duo)를 만나기 위해 정보를 입력해주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">기본 정보</h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <User size={16} /> 이름 (닉네임)
            </label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">나이</label>
                <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="예: 35"
                value={form.age}
                onChange={e => setForm({...form, age: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">성별</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={form.gender}
                    onChange={e => setForm({...form, gender: e.target.value})}
                >
                    <option value="">선택 안 함</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Calendar size={16} /> 투병 기간 (개월)
            </label>
            <input 
              type="number" 
              min="0"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.durationMonths || ''}
              onChange={e => setForm({...form, durationMonths: Number(e.target.value)})}
            />
          </div>
        </div>

        {/* Section 2: Medical Context */}
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">맞춤 설정을 위한 추가 정보</h3>
            
            {/* CRPS Type */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Activity size={16} className="text-blue-500"/> CRPS 유형
                </label>
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setForm({...form, crpsType: 'TYPE_1'})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.crpsType === 'TYPE_1' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                        제1형 (반사성)
                    </button>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, crpsType: 'TYPE_2'})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.crpsType === 'TYPE_2' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                        제2형 (신경손상)
                    </button>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, crpsType: 'UNKNOWN'})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.crpsType === 'UNKNOWN' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                        잘 모름
                    </button>
                </div>
            </div>

            {/* Knowledge Level */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Brain size={16} className="text-purple-500"/> CRPS 지식 수준
                </label>
                <p className="text-xs text-slate-400">AI가 환자분의 지식 수준에 맞춰 대화합니다.</p>
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setForm({...form, knowledgeLevel: 'LOW'})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.knowledgeLevel === 'LOW' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                        잘 몰라요
                    </button>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, knowledgeLevel: 'MEDIUM'})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.knowledgeLevel === 'MEDIUM' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                        보통이에요
                    </button>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, knowledgeLevel: 'HIGH'})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.knowledgeLevel === 'HIGH' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'border-slate-200 text-slate-600'}`}
                    >
                        잘 알아요
                    </button>
                </div>
            </div>

            {/* Emotional Support */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                    <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Heart size={16} className="text-pink-500"/> 정서적 지지 필요
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">사실 정보보다 따뜻한 위로가 더 필요하신가요?</p>
                </div>
                <button 
                    type="button"
                    onClick={() => setForm({...form, wantsEmotionalSupport: !form.wantsEmotionalSupport})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${form.wantsEmotionalSupport ? 'bg-pink-500' : 'bg-slate-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.wantsEmotionalSupport ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

            {/* Medical Communication */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                    <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
                        <MessageCircle size={16} className="text-green-500"/> 현재 의료진 소통 만족도
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">만족스럽지 않다면 소통 팁을 더 드립니다.</p>
                </div>
                 <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setForm({...form, medicalCommunicationSatisfied: true})}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${form.medicalCommunicationSatisfied ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                        만족
                    </button>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, medicalCommunicationSatisfied: false})}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${!form.medicalCommunicationSatisfied ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                        불만족
                    </button>
                 </div>
            </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
            {onBack && (
               <button 
                  type="button" 
                  onClick={onBack}
                  className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50 flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> 취소
                </button>
            )}
            <button 
                type="submit"
                className={`flex-1 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${saved ? 'bg-green-600 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} text-white`}
            >
                {saved ? '저장되었습니다!' : '저장하고 시작하기'} <Save size={18} />
            </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;