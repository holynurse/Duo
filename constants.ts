
import { TreatmentOption, UserData } from './types';

// Information specific to CRPS Types (Reflecting Medical Guidelines)
export const CRPS_TYPE_INFO = {
  'TYPE_1': {
    title: '제1형: 반사성 교감신경 위축증 (RSD)',
    description: '명확한 신경 손상이 관찰되지 않는 유형입니다. 교감신경계의 이상 반응이 주된 원인으로 추정됩니다.',
    symptoms: ['혈관 운동 불안정(피부 색/온도 변화)', '땀 분비 이상(발한/무한)', '부종(붓기) 및 피부 위축', '스치기만 해도 아픈 통각 과민'],
    keywords: ['교감신경 차단술', '비스포스포네이트', '물리치료 및 감각 재활', '스테로이드 요법']
  },
  'TYPE_2': {
    title: '제2형: 작열통 (Causalgia)',
    description: '외상이나 수술 등으로 인한 명확한 말초 신경 손상이 동반된 유형입니다.',
    symptoms: ['손상된 신경 경로를 따라 퍼지는 작열통(불타는 통증)', '이질통(Allodynia)', '감각 저하 또는 과민', '손톱/털 성장 변화'],
    keywords: ['신경 차단술', '척수 자극술 (SCS)', '약물 치료 (가바펜틴/프레가발린)', '말초신경 감압/박리술']
  },
  'UNKNOWN': {
    title: '유형 미상 (상세 불명)',
    description: '아직 정확한 유형 진단을 받지 않았거나 모르는 상태입니다.',
    symptoms: ['지속적인 만성 통증', '감각 이상', '운동 범위 제한', '피부 변화'],
    keywords: ['페인 스크램블러 (Pain Scrambler)', '물리치료 및 감각 재활', '정확한 진단 필요', '약물 치료 (가바펜틴/프레가발린)']
  }
};

export const TREATMENT_OPTIONS: TreatmentOption[] = [
  {
    id: 't1',
    title: '척수 자극술 (SCS)',
    category: 'Procedure',
    pros: ['마약성 진통제 의존도 감소', '시험적 시술(Trial)로 효과 미리 확인 가능', '통증 부위에 직접적인 자극 조절'],
    cons: ['감염, 출혈 등 시술 관련 위험', '기기 배터리 충전 및 관리 필요', '높은 초기 비용 (보험 적용 조건 확인 필요)'],
    evidenceLevel: 'High',
    referenceUrl: 'https://www.pain.org/treatments/spinal-cord-stimulation/',
    recommendedTypes: ['TYPE_1', 'TYPE_2']
  },
  {
    id: 't2',
    title: '물리치료 및 감각 재활',
    category: 'Rehabilitation',
    pros: ['비침습적(수술 없음)', '관절 가동 범위 및 기능 회복', '약물 부작용 없음'],
    cons: ['초기 재활 시 통증이 심할 수 있음', '장기간의 꾸준한 노력이 필요', '즉각적인 효과보다는 서서히 호전됨'],
    evidenceLevel: 'High',
    referenceUrl: 'https://rsds.org/living-with-crps/treatments/physical-therapy/',
    recommendedTypes: ['TYPE_1', 'TYPE_2', 'UNKNOWN']
  },
  {
    id: 't3',
    title: '약물 치료 (가바펜틴/프레가발린)',
    category: 'Medication',
    pros: ['가장 표준적인 1차 치료법', '접근성이 좋고 복용이 간편함', '신경병증성 통증 완화 입증'],
    cons: ['졸음, 어지러움 발생 가능', '체중 증가 및 부종', '브레인 포그(멍한 느낌)'],
    evidenceLevel: 'Moderate',
    referenceUrl: 'https://www.mayoclinic.org/diseases-conditions/crps/diagnosis-treatment/drc-20371156',
    recommendedTypes: ['TYPE_1', 'TYPE_2', 'UNKNOWN']
  },
  {
    id: 't5',
    title: '교감신경 차단술',
    category: 'Procedure',
    pros: ['제1형(RSD) 환자의 교감신경 과흥분 억제', '진단적 목적으로도 사용 가능', '비교적 간단한 시술'],
    cons: ['일시적인 효과일 수 있음', '반복 시술 필요', '저혈압 등의 부작용'],
    evidenceLevel: 'Moderate',
    referenceUrl: 'https://rsds.org/living-with-crps/treatments/sympathetic-nerve-blocks/',
    recommendedTypes: ['TYPE_1']
  },
  {
    id: 't4',
    title: '케타민 주입 요법',
    category: 'Procedure',
    pros: ['극심한 통증 발작 시 빠른 효과', '중추신경계 과민화(Sensitization) 초기화', '수주에서 수개월간 효과 지속 가능'],
    cons: ['주입 중 환각 등 해리 증상', '비급여 항목으로 비용 부담이 클 수 있음', '반복적인 시술 필요'],
    evidenceLevel: 'Moderate',
    referenceUrl: 'https://rsds.org/living-with-crps/treatments/ketamine-infusions/',
    recommendedTypes: ['TYPE_1', 'TYPE_2']
  },
  {
      id: 't6',
      title: '비스포스포네이트',
      category: 'Medication',
      pros: ['제1형 환자의 골 밀도 감소 예방', '염증성 통증 완화 효과', '비교적 안전한 약물'],
      cons: ['위장 장애 발생 가능', '턱뼈 괴사 등 드문 부작용', '장기 복용 시 주의 필요'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5408339/',
      recommendedTypes: ['TYPE_1']
  },
  {
      id: 't7',
      title: '스테로이드 요법',
      category: 'Medication',
      pros: ['발병 초기(급성기)의 강력한 항염증 효과', '부종 감소', '단기 사용 시 빠른 호전'],
      cons: ['장기 사용 시 심각한 부작용(당뇨, 골다공증 등)', '만성기에는 효과가 제한적일 수 있음'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://rsds.org/living-with-crps/treatments/medications/',
      recommendedTypes: ['TYPE_1', 'TYPE_2', 'UNKNOWN']
  },
  {
      id: 't8',
      title: '말초신경 감압/박리술',
      category: 'Procedure',
      pros: ['명확한 신경 눌림이 원인일 경우 근본적 치료 가능', '통증의 극적인 감소 기대', '약물 의존도 감소'],
      cons: ['수술적 위험(감염, 신경 손상)', '진단이 불명확할 경우 효과 없음', '회복 기간 필요'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4467812/',
      recommendedTypes: ['TYPE_2']
  },
  {
      id: 't9',
      title: '페인 스크램블러 (Pain Scrambler)',
      category: 'Procedure',
      pros: ['비침습적이고 통증이 없는 치료', '약물 부작용이 없음', '통증 신호를 무통증 신호로 교란'],
      cons: ['보험 적용 여부에 따라 비용 부담', '모든 환자에게 효과가 있지는 않음', '반복 치료 필요'],
      evidenceLevel: 'Low',
      referenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5931149/',
      recommendedTypes: ['TYPE_1', 'TYPE_2', 'UNKNOWN']
  }
];

export const STANDARD_STATS = [
  { label: '평균 투병 기간', value: '6.6년' },
  { label: '첫 진단 평균 나이', value: '35세' },
  { label: '평균 통증 점수', value: '7점 (VAS)' },
  { label: '주된 발병 원인', value: '교통사고' },
  { label: '주된 통증 부위', value: '발 (하지)' },
  { label: '주된 통증 유형', value: '통각과민, 전기 통증, 보행 시 악화' },
  { label: '주요 신체 증상', value: '부종 (붓기)' },
  { label: '주요 심리 증상', value: '우울감, PTSD, 수면 장애' },
];

export const INITIAL_USER_DATA: UserData = {
  name: '',
  age: '',
  gender: '',
  vasScore: 5,
  durationMonths: 0,
  mainSymptoms: [],
  painLocation: [],
  history: [],
  statusLogs: [],
  
  // Default values
  crpsType: 'UNKNOWN',
  wantsEmotionalSupport: true,
  knowledgeLevel: 'MEDIUM',
  medicalCommunicationSatisfied: true,
};
