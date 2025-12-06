
import React from 'react';
import { UserData } from '../types';
import { UserCircle2, ClipboardList, Activity, Calendar, ArrowRight, Stethoscope, BookOpen, Search } from 'lucide-react';

interface Props {
  patients: UserData[]; 
  onSelectPatient: (data: UserData) => void;
  onStart: () => void;
  onExplore: () => void;
}

const MedicalDashboard: React.FC<Props> = ({ patients, onSelectPatient, onStart, onExplore }) => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-10">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
        <div className="bg-teal-50 p-3 rounded-full text-teal-600">
           <Stethoscope size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">의료진 대시보드</h1>
          <p className="text-slate-500">환자들의 진료 리포트를 확인하고 문진을 진행하세요.</p>
        </div>
      </div>

      {/* Resource Shortcuts */}
      <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
             <BookOpen size={20} /> 의학 정보 리소스
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button 
                onClick={onStart}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                  <div className="flex items-center gap-4 mb-2">
                      <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                          <BookOpen size={24} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">CRPS 지식 가이드</h3>
                  </div>
                  <p className="text-sm text-slate-500 pl-[3.75rem]">CRPS 통계 및 질환 정보 </p>
              </button>

              <button 
                onClick={onExplore}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left group"
              >
                  <div className="flex items-center gap-4 mb-2">
                      <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                          <Search size={24} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">치료 솔루션 </h3>
                  </div>
                  <p className="text-sm text-slate-500 pl-[3.75rem]">치료 옵션 목록 및 상세 FAQ </p>
              </button>
          </div>
      </div>

      {/* Patient List */}
      <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
             <ClipboardList size={20} /> 담당 환자 리스트
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((p, i) => (
                  <button 
                    key={i}
                    onClick={() => onSelectPatient(p)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-left group"
                  >
                      <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                  <UserCircle2 size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 text-lg">{p.name || '이름 없음'}</h3>
                                  <p className="text-xs text-slate-500">{p.gender === 'male' ? '남성' : '여성'} / {p.age}세</p>
                              </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.vasScore >= 7 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              VAS {p.vasScore}
                          </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                              <Activity size={14} className="text-slate-400"/>
                              <span>{p.crpsType === 'TYPE_1' ? '제1형 (반사성)' : p.crpsType === 'TYPE_2' ? '제2형 (신경손상)' : '유형 미상'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400"/>
                              <span>투병 기간 {p.durationMonths}개월</span>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-teal-600 font-medium text-sm group-hover:text-teal-700">
                          <span>리포트 보기</span>
                          <ArrowRight size={16} />
                      </div>
                  </button>
              ))}
          </div>
          
          {patients.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <p>등록된 환자가 없습니다.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default MedicalDashboard;
