
import { TreatmentOption, UserData } from './types';

// Information specific to CRPS Types (Reflecting Medical Guidelines)
export const CRPS_TYPE_INFO = {
  'TYPE_1': {
    title: '제1형: 반사성 교감신경 위축증 (RSD)',
    description: '팔다리의 골절, 염좌, 또는 수술과 같은 부상 후에 발생하지만, 신경이 직접 손상된 흔적이 없는 유형입니다. 교감신경계의 이상 반응이 주된 원인으로 추정됩니다.',
    symptoms: ['광범위한 통증', '스치기만 해도 아픔(이질통)', '피부색 변화(붉거나 푸름)', '피부온도 차이(차갑거나 뜨거움)', '땀 분비 이상', '부종', '운동 범위 제한'],
    keywords: ['재활 및 물리치료', '탈감작요법(감각둔화시키기)', '약물치료']
  },
  'TYPE_2': {
    title: '제2형: 작열통 (Causalgia)',
    description: '사고나 수술 등으로 인해 신경이 손상된 후에 발생하는 유형입니다. 손상된된 신경 부위를 중심으로 불타는 듯한 통증이 나타납니다.',
    symptoms: ['손상된 신경 경로를 따라 퍼지는 작열통(불타는 통증)', '스치기만 해도 아픔(이질통)', '피부색 변화(붉거나 푸름)', '피부온도 차이(차갑거나 뜨거움)', '부종', '땀 분비 이상', '운동 범위 제한', '손톱/털 성장 변화'],
    keywords: ['신경 차단술', '척수 자극술', '약물 치료']

  },
  'UNKNOWN': {
    title: '유형 미상 (상세 불명)',
    description: '아직 정확한 유형 진단을 받지 않았거나 모르는 상태입니다.',
    symptoms: ['극심하고 비정상적인 통증', '스치기만 해도 아픔(이질통)', '부종', '피부 온도 및 색 변화', '운동 범위 제한', '땀 분비 이상'],
    keywords: ['약물치료', '물리치료 및 감각 재활', '정확한 진단 필요', '중재적 시술']
  }
};

// 유형별 리스트(여기에 원하는 옵션만 하드코드)
export const TREATMENT_OPTIONS_BY_TYPE: Record<'TYPE_1' | 'TYPE_2' | 'UNKNOWN', TreatmentOption[]> = {
  TYPE_1: [
    {
      id: 't1a',
      title: '재활 및 물리치료',
      category: 'Rehabilitation',
      pros: ['관절 가동 범위 회복', '혈액 순환 개선', '비침습적임'],
      cons: ['초기 재활 시 통증 심할 수 있음', '장기간의 꾸준한 노력 필요'],
      evidenceLevel: 'High',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },
    {
      id: 't1b',
      title: '약물치료 : 뼈 보호제 ',
      category: 'Medication',
      pros: ['골감소증 및 골다공증 예방', '초기 환자의 통증 및 부종 감소 효과'],
      cons: ['속 쓰림, 위장 장애 발생 가능', '장기 복용 시 부작용 주의'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },
    {
      id: 't1c',
      title: '거울 치료 및 상상 요법',
      category: 'Rehabilitation',
      pros: ['통증 없이 훈련 가능', '필요한 자원 없음', '비침습적이고 안전함'],
      cons: ['어지럽거나 메스꺼울 수 있음', '만성인 경우 효과 떨어짐'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },
    {
      id: 't1d',
      title: '신경차단술 ',
      category: 'Procedure',
      pros: ['즉각적인 통증 완화', '재활 운동을 시작할 기회를 제공', '통증의 원인이 교감신경계에 있는지 확인 가능'],
      cons: ['효과가 일시적일 수 있음', '반복 시술 필요', '주사 부위의 출혈, 감염, 일시적 신경 마비 위험'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },
    {
      id: 't1e',
      title: '약물치료 : 신경통 완화제 ',
      category: 'Medication',
      pros: ['간편한 복용', '찌릿하거나 타는 듯한 통증 완화', '불면증 및 우울감 개선'],
      cons: ['졸음, 어지러움, 입 마름, 부종 발생 가능', '맞는 용량을 찾기까지 적응 기간 필요'],
      evidenceLevel: 'High',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },
    {
      id: 't1f',
      title: '심리치료 ',
      category: 'Rehabilitation',
      pros: ['두려움을 줄여 움직임 촉진', '우울, 불안 관리 및 수면 질 향상'],
      cons: ['환자가 거부감을 느낄 수 있음', '상담 비용 부담', '전문 인력 접근성 문제'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },
    {
      id: 't1g',
      title: '척수자극술',
      category: 'Procedure',
      pros: ['시험적 시술을 통해 효과를 미리 체험할 수 있음', '마약성 진통제 사용량 감소', '삶의 질 개선 가능'],
      cons: ['침습적임', '높은 초기 비용', '보험 적용 조건 확인 필요', '배터리 충전/교체 관리', '기기 관련 합병증(감염, 전극 이동) 위험'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_1'],
    },

    // ...추가
  ],
  TYPE_2: [
    {
      id: 't2a',
      title: '약물치료 : 신경통 완화제 ',
      category: 'Medication',
      pros: ['간편한 복용', '찌릿하거나 타는 듯한 통증 완화', '불면증 및 우울감 개선'],
      cons: ['졸음, 어지러움, 입 마름, 부종 발생 가능', '맞는 용량을 찾기까지 적응 기간 필요'],
      evidenceLevel: 'High',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    {
      id: 't2b',
      title: '척수자극술',
      category: 'Procedure',
      pros: ['시험적 시술을 통해 효과를 미리 체험할 수 있음', '마약성 진통제 사용량 감소', '삶의 질 개선 가능'],
      cons: ['높은 초기 비용', '보험 적용 조건 확인 필요', '배터리 충전/교체 관리', '기기 관련 합병증(감염, 전극 이동) 위험'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    {
      id: 't2c',
      title: '신경차단술 ',
      category: 'Procedure',
      pros: [' 즉각적인 통증 완화', '재활 운동을 시작할 기회를 제공', '통증의 원인이 교감신경계에 있는지 확인 가능'],
      cons: ['효과가 일시적일 수 있음', '반복 시술이 필요할 수 있음', '주사 부위의 출혈, 감염, 일시적 신경 마비 위험'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    {
      id: 't2d',
      title: '재활 및 물리치료',
      category: 'Rehabilitation',
      pros: ['관절 가동 범위 회복', '혈액 순환 개선', '비침습적'],
      cons: ['초기 재활 시 통증 심할 수 있음', '장기간의 꾸준한 노력 필요'],
      evidenceLevel: 'High',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    {
      id: 't2e',
      title: '약물치료 : 뼈 보호제 ',
      category: 'Medication',
      pros: ['골감소증 및 골다공증 예방', '초기 환자의 통증 및 부종 감소 효과'],
      cons: ['속 쓰림, 위장 장애 발생 가능', '장기 복용 시 부작용 주의'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    {
      id: 't2f',
      title: '거울 치료 및 상상 요법',
      category: 'Rehabilitation',
      pros: ['통증 없이 훈련 가능', '필요한 자원 없음', '비침습적이고 안전함'],
      cons: ['어지럽거나 메스꺼울 수 있음', '만성인 경우 효과 떨어짐'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    {
      id: 't2g',
      title: '심리치료 ',
      category: 'Rehabilitation',
      pros: ['두려움을 줄여 움직임 촉진', '우울, 불안 관리 및 수면 질 향상'],
      cons: ['환자가 거부감을 느낄 수 있음', '상담 비용 부담', '전문 인력 접근성 문제'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['TYPE_2'],
    },
    // ...추가
  ],
  UNKNOWN: [
    // 공통/기본 옵션 (필요 없으면 빈 배열 [])
    {
      id: 'u1',
      title: '재활 및 물리치료',
      category: 'Rehabilitation',
      pros: ['관절 가동 범위 회복', '혈액 순환 개선', '비침습적'],
      cons: ['초기 재활 시 통증 심할 수 있음', '장기간의 꾸준한 노력 필요'],
      evidenceLevel: 'High',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },
    {
      id: 'u2',
      title: '약물치료 : 신경통 완화제 ',
      category: 'Medication',
      pros: ['간편한 복용', '찌릿하거나 타는 듯한 통증 완화', '불면증 및 우울감 개선'],
      cons: ['졸음, 어지러움, 입 마름, 부종 발생 가능', '맞는 용량을 찾기까지 적응 기간 필요'],
      evidenceLevel: 'High',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },
    {
      id: 'u3',
      title: '심리치료 ',
      category: 'Rehabilitation',
      pros: ['두려움을 줄여 움직임 촉진', '우울, 불안 관리 및 수면 질 향상'],
      cons: ['환자가 거부감을 느낄 수 있음', '상담 비용 부담', '전문 인력 접근성 문제'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },
    {
      id: 'u4',
      title: '척수자극술',
      category: 'Procedure',
      pros: ['시험적 시술을 통해 효과를 미리 체험할 수 있음', '마약성 진통제 사용량 감소', '삶의 질 개선'],
      cons: ['높은 초기 비용', '보험 적용 조건 확인 필요', '배터리 충전/교체 관리', '기기 관련 합병증(감염, 전극 이동) 위험'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },
    {
      id: 'u5',
      title: '신경차단술 ',
      category: 'Procedure',
      pros: ['즉각적인 통증 완화', '재활 운동을 시작할 기회를 제공', '통증의 원인이 교감신경계에 있는지 확인 가능'],
      cons: ['효과가 일시적일 수 있음', '반복 시술 필요', '주사 부위의 출혈, 감염, 일시적 신경 마비 위험'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },

    {
      id: 'u6',
      title: '약물치료 : 뼈 보호제 ',
      category: 'Medication',
      pros: ['골감소증 및 골다공증 예방', '초기 환자의 통증 및 부종 감소 효과'],
      cons: ['속 쓰림, 위장 장애 발생 가능', '장기 복용 시 부작용 주의'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },
    {
      id: 'u7',
      title: '거울 치료 및 상상 요법',
      category: 'Rehabilitation',
      pros: ['통증 없이 훈련 가능', '필요한 자원 없음', '비침습적이고 안전함'],
      cons: ['어지럽거나 메스꺼울 수 있음', '만성인 경우 효과 떨어짐'],
      evidenceLevel: 'Moderate',
      referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35687369/',
      recommendedTypes: ['UNKNOWN'],
    },

  ],
};

// 기존 이름을 쓰는 코드(DécisionTalk, geminiService) 깨지지 않도록 합쳐서 export
export const TREATMENT_OPTIONS: TreatmentOption[] = Object.values(TREATMENT_OPTIONS_BY_TYPE).flat();


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
