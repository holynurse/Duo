
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

// 유형별 리스트(여기에 원하는 옵션만 하드코드)
export const TREATMENT_OPTIONS_BY_TYPE: Record<'TYPE_1' | 'TYPE_2' | 'UNKNOWN', TreatmentOption[]> = {
  TYPE_1: [
    {
      id: 't1',
      title: 'TYPE1 옵션 1',
      category: 'Procedure',
      pros: ['장점1'],
      cons: ['단점1'],
      evidenceLevel: 'High',
      referenceUrl: '',
      recommendedTypes: ['TYPE_1'],
    },
    // ...추가
  ],
  TYPE_2: [
    {
      id: 't2a',
      title: 'TYPE2 옵션 1',
      category: 'Medication',
      pros: ['장점1'],
      cons: ['단점1'],
      evidenceLevel: 'Moderate',
      referenceUrl: '',
      recommendedTypes: ['TYPE_2'],
    },
    // ...추가
  ],
  UNKNOWN: [
    // 공통/기본 옵션 (필요 없으면 빈 배열 [])
    {
      id: 'u1',
      title: '공통 옵션 1',
      category: 'Rehabilitation',
      pros: ['장점1'],
      cons: ['단점1'],
      evidenceLevel: 'Moderate',
      referenceUrl: '',
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
