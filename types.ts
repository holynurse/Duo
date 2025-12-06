
export enum ViewState {
  ONBOARDING = 'ONBOARDING', // New State for forced login
  HOME = 'HOME',
  MEDICAL_HOME = 'MEDICAL_HOME', // New State for Medical Staff Dashboard
  CHOICE_TALK = 'CHOICE_TALK',
  OPTION_TALK = 'OPTION_TALK',
  BRIDGE = 'BRIDGE',
  DECISION_TALK = 'DECISION_TALK',
  PROFILE = 'PROFILE',
}

export interface ConsultationRecord {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  vasScore: number;
  selectedTreatmentIds: string[]; // IDs of Liked treatments
  customTreatments?: string[]; // Names of custom treatments
  generatedQuestions: string[];
  memo?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[]; // New: Chat history with MY
}

export interface StatusLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  vasScore: number;
  symptoms: string;
  painLocation: string[];
}

export interface TreatmentOption {
  id: string;
  title: string;
  category: 'Medication' | 'Procedure' | 'Rehabilitation' | 'Psychotherapy';
  pros: string[];
  cons: string[];
  evidenceLevel: 'High' | 'Moderate' | 'Low';
  // patientReviewSummary removed as requested
  referenceUrl?: string; // Link to evidence/source
  recommendedTypes: ('TYPE_1' | 'TYPE_2' | 'UNKNOWN')[]; // New: Filters options by CRPS Type
}

export interface Preference {
  treatmentId: string;
  customName?: string; // If the user adds a custom option not in the list
  type: 'LIKE' | 'DISLIKE' | 'WORRY';
  reasons: string[];
}

export interface UserData {
  name: string;
  age: string;
  gender: string;
  vasScore: number; // Current VAS (Latest)
  currentSymptoms?: string; // New: Free text for today's symptoms (Latest)
  durationMonths: number;
  mainSymptoms: string[];
  painLocation: string[]; // New: Selected pain locations (Latest)
  history: ConsultationRecord[]; // Past consultations
  statusLogs: StatusLog[]; // New: History of daily logs
  
  // New Fields for Personalized Persona
  crpsType: 'TYPE_1' | 'TYPE_2' | 'UNKNOWN';
  wantsEmotionalSupport: boolean;
  knowledgeLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  medicalCommunicationSatisfied: boolean;
}

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
/// <reference types="vite/client" />
 
