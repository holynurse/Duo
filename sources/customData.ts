
// 사용자 정의 지침
import profilesCsv from './crps_profiles.csv?raw'; // vite 기능, ?raw를 붙이면 순수 텍스트로 가져옴
import insightsCsv from './crps_insight_needs.csv?raw';
import ragUrlsCsv from './rag_url_list.csv?raw';
import faqListCsv from './faq_list.csv?raw';

// 사용자 정의 지침
export const CUSTOM_INSTRUCTIONS = `
- 모든 답변은 CRPS 환자 중심으로 답변해야 합니다. 그정보는 CRPS 프로파일과 인사이트, RAG리스트를 기반으로 해야 합니다.
- 긍정적이고 희망적인 어조를 유지하되, 현실적인 기대를 제공해야 합니다.
- 치료 결정은 환자와 의료진의 공유의사결정임을 항상 명시해야 합니다.
`;

/**
 * CSV 문자열을 파싱하여 객체 배열로 변환하는 헬퍼 함수
 * @param csvText CSV 형식의 문자열
 * @returns 객체 배열
 */
function parseCsv<T>(csvText: string): T[] {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
        // 큰따옴표로 묶인 문자열을 고려하여 파싱
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const entry: any = {};
        header.forEach((key, index) => {
            let value = (values[index] || '').trim();
            // 큰따옴표 제거
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            entry[key] = value;
        });
        return entry as T;
    });
    return data;
}

// CRPS 대표 프로필 (CSV 파일로부터 로드)
const rawProfiles = parseCsv<{ id: string; description: string; symptoms: string }>(profilesCsv);
export const CRPS_PROFILES = rawProfiles.map(p => ({
    id: parseInt(p.id, 10),
    description: p.description,
    symptoms: p.symptoms.split(';'), // 세미콜론으로 구분된 증상을 배열로 변환
}));

// CRPS 환자 인사이트 및 니즈 (CSV 파일로부터 로드)
const rawInsights = parseCsv<{ id: string; category: string; insight: string; need: string }>(insightsCsv);
export const CRPS_INSIGHT_NEEDS = rawInsights.map(i => ({
    id: parseInt(i.id, 10),
    category: i.category,
    insight: i.insight,
    need: i.need,
}));

// RAG URL 목록 (CSV 파일로부터 로드)
const rawRagUrls = parseCsv<{ url: string; description: string }>(ragUrlsCsv);
export const RAG_URL_LIST = rawRagUrls.map(r => r.url);

// FAQ 리스트 (Grounding 데이터로 활용)
const rawFaqList = parseCsv<{ category: string; q: string; a: string }>(faqListCsv);

// CSV 데이터를 기존 FAQ_LIST 구조로 변환
const groupedFaqs = rawFaqList.reduce((acc, curr) => {
    // 현재 카테고리가 acc에 없으면 새로 추가
    if (!acc[curr.category]) {
        acc[curr.category] = {
            category: curr.category,
            items: [],
        };
    }
    // 현재 아이템을 해당 카테고리에 추가
    acc[curr.category].items.push({ q: curr.q, a: curr.a });
    return acc;
}, {} as Record<string, { category: string; items: { q: string; a: string }[] }>);

export const FAQ_LIST = Object.values(groupedFaqs);

// ChoiceTalk 요약 뷰에 표시할 FAQ 카테고리 목록
export const SUMMARY_FAQ_CATEGORIES = ["통증 관리", "재활 운동"];
