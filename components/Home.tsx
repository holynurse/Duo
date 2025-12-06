
import React from 'react';
import { UserData, ConsultationRecord, StatusLog } from '../types';
import { ArrowRight, HeartHandshake, History, BookOpen, TrendingUp, ChevronRight, FileText, Clock, Stethoscope, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from 'recharts';

interface Props {
  userData: UserData;
  onStart: () => void;
  onExplore: () => void;
  onLogStatus: () => void;
  onGenerateReport: () => void;
  onViewHistory: (record: ConsultationRecord) => void;
}

const Home: React.FC<Props> = ({ userData, onStart, onExplore, onLogStatus, onGenerateReport, onViewHistory }) => {
  const sortedLogs = (userData.statusLogs || [])
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  const processChartData = () => {
      const dailyMap = new Map<string, { total: number, count: number }>();
      (userData.statusLogs || []).forEach(log => {
          if (!dailyMap.has(log.date)) dailyMap.set(log.date, { total: 0, count: 0 });
          const entry = dailyMap.get(log.date)!;
          entry.total += log.vasScore;
          entry.count += 1;
      });
      return Array.from(dailyMap.entries()).map(([date, data]) => {
          const avg = parseFloat((data.total / data.count).toFixed(1));
          const record = userData.history.find(h => h.date === date);
          return { date, vas: avg, hasConsultation: !!record, record: record };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = processChartData();

  return (
    <div className="animate-fade-in max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="bg-blue-50 p-3 md:p-4 rounded-full inline-block mb-3 md:mb-4">
          <HeartHandshake className="w-8 h-8 md:w-12 md:h-12 text-blue-600" />
        </div>
        <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">
            {userData.name ? `${userData.name}님, 안녕하세요.` : 'Duo에 오신 것을 환영합니다.'}
        </h1>
        <p className="text-sm md:text-base text-slate-600">
            오늘의 상태를 기록하고, 맞춤형 진료 여정을 시작해보세요.
        </p>
      </div>

      {/* Primary Actions Grid (1 col on mobile, 2 on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* 1. ChoiceTalk */}
          <button 
            onClick={onStart}
            className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between hover:border-blue-300 hover:shadow-md transition-all text-left group h-full"
          >
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="bg-blue-50 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-blue-600">
                    <BookOpen size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 mb-0.5">CRPS 가이드</h2>
                    <p className="text-slate-500 text-xs md:text-sm">믿을 수 있는 의학 정보로<br/>질환을 이해하고 팩트체크하기</p>
                </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors mt-2" size={20} />
          </button>

          {/* 2. OptionTalk */}
          <button 
            onClick={onExplore}
            className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between hover:border-indigo-300 hover:shadow-md transition-all text-left group h-full"
          >
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="bg-indigo-50 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Stethoscope size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 mb-0.5">치료 솔루션</h2>
                    <p className="text-slate-500 text-xs md:text-sm">다양한 치료법과 FAQ, 챗봇으로<br/>나에게 딱 맞는 옵션 찾아보기</p>
                </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-2" size={20} />
          </button>

          {/* 3. Bridge */}
          <button 
            onClick={onLogStatus}
            className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between hover:border-green-300 hover:shadow-md transition-all text-left group h-full"
          >
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="bg-green-50 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-green-600">
                    <ClipboardList size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 mb-0.5">오늘의 기록</h2>
                    <p className="text-slate-500 text-xs md:text-sm">매일 통증과 기분을<br/>시간대별로 기록하기</p>
                </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-green-500 transition-colors mt-2" size={20} />
          </button>

          {/* 4. DecisionTalk */}
          <button 
            onClick={onGenerateReport}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 md:p-6 rounded-3xl shadow-lg shadow-indigo-200 flex items-start justify-between text-white hover:scale-[1.02] transition-transform text-left group h-full"
          >
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white">
                    <FileText size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <h2 className="text-base md:text-lg font-bold mb-0.5">진료 브리핑</h2>
                    <p className="text-indigo-100 text-xs md:text-sm">내 기록을 한눈에 파악하고<br/>의사에게 물어볼 질문 만들기</p>
                </div>
            </div>
            <ArrowRight className="text-indigo-200 group-hover:text-white transition-colors mt-2" size={20} />
          </button>
      </div>

      {/* Log History Timeline */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="text-slate-400" size={18} /> 상세 증상 기록 타임라인 (전체)
          </h3>
          {sortedLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs md:text-sm">아직 기록된 통증 데이터가 없습니다.</p>
                  <p className="text-[10px] md:text-xs mt-1">위의 '오늘의 상태 기록' 버튼을 눌러 기록을 시작하세요.</p>
              </div>
          ) : (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {sortedLogs.map((log) => (
                      <div key={log.id} className="flex-shrink-0 w-48 md:w-56 bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100">
                          <div className="text-[10px] md:text-xs text-slate-400 mb-1">{log.date}</div>
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100">{log.time}</span>
                              <span className={`text-sm md:text-lg font-bold ${log.vasScore >= 7 ? 'text-red-500' : 'text-green-600'}`}>{log.vasScore}점</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{log.symptoms || '증상 메모 없음'}</p>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* History Dashboard */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-slate-400" size={18} /> 통증 변화 추이 (일일 평균)
                </h3>
                <div className="h-48 md:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" tickFormatter={(str) => str.slice(5)} />
                            <YAxis domain={[0, 10]} stroke="#94a3b8" hide />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                            <Line 
                                type="monotone" 
                                dataKey="vas" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                dot={{r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} 
                                activeDot={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    const r = payload.hasConsultation ? 6 : 4;
                                    const fill = payload.hasConsultation ? '#4f46e5' : '#3b82f6';
                                    return (
                                        <circle 
                                            cx={cx} cy={cy} r={r} fill={fill} stroke="#fff" strokeWidth={2}
                                            cursor={payload.hasConsultation ? "pointer" : "default"}
                                            onClick={(e) => {
                                                if(payload.hasConsultation) {
                                                    e.stopPropagation();
                                                    onViewHistory(payload.record as ConsultationRecord);
                                                }
                                            }}
                                        />
                                    );
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <History className="text-slate-400" size={18} /> 저장된 진료 리포트
                </h3>
                {userData.history.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs md:text-sm">
                        저장된 리포트가 없습니다.
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto max-h-48 md:max-h-64 space-y-3 pr-2 custom-scrollbar">
                        {[...userData.history].reverse().map((record) => (
                            <button 
                                key={record.id} 
                                onClick={() => onViewHistory(record)}
                                className="w-full p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition-all group"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-slate-700 text-sm md:text-base">{record.date}</div>
                                    <div className="text-xs text-slate-500 mt-1">평균 VAS: <span className={`font-bold ${record.vasScore >= 7 ? 'text-red-500' : 'text-blue-600'}`}>{record.vasScore}</span></div>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                    <div className="text-[10px] md:text-xs text-slate-400">질문 {record.generatedQuestions.length}개</div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;
