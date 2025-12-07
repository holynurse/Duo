
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Preference } from "../types";
import { TREATMENT_OPTIONS } from "../constants";
import { CUSTOM_INSTRUCTIONS, RAG_URL_LIST, CRPS_PROFILES, CRPS_INSIGHT_NEEDS, FAQ_LIST } from "../sources/customData";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

// Helper to create tone instructions based on profile
const getToneInstructions = (userData?: UserData) => {
    if (!userData) return "";

    const knowledgeTone = userData.knowledgeLevel === 'HIGH' 
        ? "전문적인 의학 용어를 적절히 사용하며 깊이 있게 설명하세요."
        : userData.knowledgeLevel === 'LOW'
        ? "초등학생도 이해할 수 있을 만큼 아주 쉬운 용어와 비유를 사용하세요."
        : "일반 성인이 이해하기 쉬운 평이한 용어를 사용하세요.";

    const emotionalTone = userData.wantsEmotionalSupport
        ? "따뜻하고 지지적인 어조를 사용하되, 감정이 과하지 않게 담백하게 표현하세요."
        : "객관적이고 이성적인 정보 전달에 집중하여 신뢰감을 주세요.";
    
    const commTone = !userData.medicalCommunicationSatisfied
        ? "환자가 의료진에게 질문할 때 주눅 들지 않도록 용기를 북돋아주세요."
        : "";

    return `${knowledgeTone}\n${emotionalTone}\n${commTone}`;
};

// 1. Info-Mate (Persona A) & Intro Message
export const generatePersonaMessage = async (
  stage: 'intro' | 'decision' | 'history-view',
  userData?: UserData,
  audience: 'patient' | 'doctor' = 'patient' // New parameter
): Promise<string> => {
  try {
    // Static response for history view to save API calls
    if (stage === 'history-view') {
        return "과거의 기록을 확인하고 있습니다. 당시의 고민과 결정들을 천천히 둘러보세요.";
    }

    let prompt = "";
    if (stage === 'intro') {
      const representativeProfile = CRPS_PROFILES[0]; 
      const representativeInsight = CRPS_INSIGHT_NEEDS[0]; 
      const urlListText = RAG_URL_LIST.join('\n');
      const faqListText = FAQ_LIST.map(cat => `- ${cat.category}: ${cat.items.map(item => item.q).join(', ')}`).join('\n');

      prompt = `당신은 CRPS 환자를 돕는 간호사 '메이트(Mate)'입니다. 당신의 역할은 환자에게 깊은 공감을 표현하고, 유용한 정보를 제공하며, 치료 여정을 함께 계획하는 것입니다.

      당신은 다음 4가지 핵심 정보를 바탕으로 환자와 대화해야 합니다.

      1. **대표 환자 프로필 (공감대 형성용):**
         - 환자 유형: ${representativeProfile.description}
         - 주요 증상: ${representativeProfile.symptoms.join(', ')}
         - 당신은 이 프로필의 환자와 같은 CRPS환자를 아주 잘 알고 그들의 아픔에 충분히 공감하는 한편, 치료계획 설정을 함께할 동료임을 인지해야합니다.

      2. **환자의 숨은 니즈 및 정보 (인사이트 제공용):**
         - 상황: ${representativeInsight.insight}
         - 해결책: 이 상황에 처한 환자에게는 '${representativeInsight.need}'와 같은 도움이 필요합니다. 당신의 첫 메시지에 이 해결책을 자연스럽게 녹여내야 합니다.

      3. **핵심 정보 출처 (신뢰성 확보용):**
         - 당신은 다음의 신뢰할 수 있는 URL들을 주요 정보원으로 사용합니다.
         - 출처를 명확히 확인하는 경우에는 출처링크도 함께 제시하면 좋습니다. 
${urlListText}
      
      4. **주요 FAQ 리스트:**
         - 다른 환자들이 자주 묻는 질문들입니다. 이를 통해 환자의 니즈를 파악할 수 있습니다:
${faqListText}

      **[지시]**
      위 4가지 정보를 모두 활용하여, 앱을 처음 방문한 환자에게 3-4 문장으로 된 첫인사 메시지를 작성하세요.

      **[목표]**
      - "CRPS환자를 잘 알고 있어요" 라며 공감대를 형성하세요 (정보 1 활용).
      - 환자가 미처 생각하지 못했을 만한 유용한 조언이나 정보를 제공하여 전문성을 보여주고 의사결정을 위한 동역자임을 상기시키세요 (정보 2 활용).
      - "함께 잘 헤쳐나갈 수 있다"는 희망적인 메시지를 전달하세요.
      - 따뜻하고 신뢰감 있는 말투를 사용하세요.`;
    } else if (stage === 'decision') {
      // 1. Prepare all data sources
      const representativeProfile = CRPS_PROFILES[0];
      const representativeInsight = CRPS_INSIGHT_NEEDS[0];
      const urlListText = RAG_URL_LIST.join('\n');
      const faqListText = FAQ_LIST.map(cat => `- ${cat.category}: ${cat.items.map(item => item.q).join(', ')}`).join('\n');
      const todayStr = new Date().toLocaleDateString();
      const todayLogs = (userData?.statusLogs || []).filter(l => l.date === todayStr);
      let fluctuationText = "오늘의 상세 상태 기록이 없습니다. (환자가 기록하지 않음)";
      if (todayLogs.length > 0) {
          const scores = todayLogs.map(l => l.vasScore);
          const min = Math.min(...scores);
          const max = Math.max(...scores);
          const times = todayLogs.length;
          fluctuationText = `오늘 총 ${times}회 기록됨. 통증 점수 최저 ${min}점에서 최고 ${max}점까지 변화함.`;
      }

      // 2. Define role based on audience
      let roleDescription = "";
      let specificInstruction = "";
      if (audience === 'patient') {
          roleDescription = `당신은 환자의 상태와 맥락을 완벽히 이해하고, 그의 입장을 대변해주는 든든한 '대변인'입니다. 환자가 자신의 상태를 더 잘 이해하고, 의료진에게 자신감 있게 질문할 수 있도록 쉽고 명확하게 설명해야 합니다.`;
          specificInstruction = `"환자님의 현재 상태를 제가 이렇게 정리했어요" 와 같이, 쉽고 안심시키는 말투를 사용하세요. 환자의 주관적인 호소 내용에 초점을 맞추세요.`;
      } else { // audience === 'doctor'
          roleDescription = `당신은 환자와 의료진 사이의 '의사소통 촉진자'입니다. 환자의 주관적인 경험(UserData)과 객관적인 CRPS 정보(프로필, 인사이트)를 연결하여, 의료진이 환자의 상태를 다각적으로 이해하고 최적의 진료 결정을 내릴 수 있도록 도와야 합니다. 전문적이고 간결한 톤을 사용하세요.`;
          specificInstruction = `"환자분의 상태를 종합적으로 고려할 때, 다음 사항을 논의해볼 수 있겠습니다" 와 같이, 진료 결정을 돕는 전문적인 말투를 사용하세요. 객관적 데이터(통증 변동성 등)와 인사이트를 강조하세요.`
      }

      // 3. Construct the full prompt
      prompt = `[역할 설정]\n${roleDescription}\n\n당신은 다음 정보를 종합하여 메시지를 생성해야 합니다.\n\n[기본 정보]\n1. **대표 환자 프로필 (객관적 맥락):**\n  \n2. **CRPS 인사이트 (전문가 조언):**\n   - 필요한 조언: ${representativeInsight.need}\n3. **핵심 정보 출처 (신뢰성):**\n[추가 분석 정보]\n5. **환자 현재 상태 (실시간 데이터):**\n   - 현재 통증 점수(VAS): ${userData?.vasScore}/10\n   - 오늘의 호소 내용: ${userData?.currentSymptoms || '없음'}\n   - 오늘 통증 변화: ${fluctuationText}\n   - 투병 기간: ${userData.durationMonths}개월\n   - CRPS 유형: ${userData?.crpsType}\n\n**[지시]**\n- 위 정보를 바탕으로, 당신의 역할(${audience === 'patient' ? '대변인' : '의사소통 촉진자'})에 맞는 3-4문장의 메시지를 생성하세요.\n- ${specificInstruction}\n- **핵심:** 더 정확하고 원활한 대변을 위해 "매일매일 상태 체크를 기록하는 것"이 중요하다고 권유하는 내용을 반드시 포함하세요.`;
      prompt = `[역할 설정]\n${roleDescription}\n\n당신은 다음 정보를 종합하여 메시지를 생성해야 합니다.\n\n[기본 정보]\n1. **대표 환자 프로필 (객관적 맥락):**\n   - 환자 유형: ${representativeProfile.description}\n   - 주요 증상: ${representativeProfile.symptoms.join(', ')}\n2. **CRPS 인사이트 (전문가 조언):**\n   - 필요한 조언: ${representativeInsight.need}\n3. **핵심 정보 출처 (신뢰성):**\n${urlListText}\n\n[추가 분석 정보]\n5. **환자 현재 상태 (실시간 데이터):**\n   - 현재 통증 점수(VAS): ${userData?.vasScore}/10\n   - 오늘의 호소 내용: ${userData?.currentSymptoms || '없음'}\n   - 오늘 통증 변화: ${fluctuationText}\n   - 투병 기간: ${userData.durationMonths}개월\n   - CRPS 유형: ${userData?.crpsType}\n\n**[지시]**\n- 위 정보를 바탕으로, 당신의 역할(${audience === 'patient' ? '대변인' : '의사소통 촉진자'})에 맞는 3-4문장의 메시지를 생성하세요.\n- ${specificInstruction}\n- **핵심:** 더 정확하고 원활한 대변을 위해 "매일매일 상태 체크를 기록하는 것"이 중요하다고 권유하는 내용을 반드시 포함하세요.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text || "환영합니다. 당신의 치료 의사결정을 돕기 위해 여기 있습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "현재 연결이 원활하지 않지만, 당신을 돕기 위해 최선을 다하겠습니다.";
  }
};

// 2. Decision-helper (Persona B) Birth (Bridge Step) - REFACTORED TO ANALYZE LOG
export const analyzeUserProfile = async (userData: UserData): Promise<string> => {
    try {
        const lastRecord = userData.history.length > 0 ? userData.history[userData.history.length - 1] : null;
        const trendText = lastRecord 
            ? `지난 진료(${lastRecord.date}) 당시 VAS ${lastRecord.vasScore}점에서 현재 ${userData.vasScore}점으로 변화했습니다.`
            : "첫 방문입니다.";
        
        const painLoc = userData.painLocation?.length ? userData.painLocation.join(', ') : "정보 없음";

        const toneInstructions = getToneInstructions(userData);

        const prompt = `
        CRPS 환자 데이터가 입력되었습니다. 이 데이터를 바탕으로 환자의 상태를 요약하고, 앞으로의 치료 방향성을 제시하는 '분석 리포트'를 'Decision-helper'의 입장에서 3~4문장으로 작성해주세요. 당신은 환자의 상태를 깊이 이해하고, 환자가 스스로의 상태를 인지하고 파트너로서 의사결정할 수 있도록 돕는 역할을 합니다. 환자가 입력한 구체적인 증상 내용("${userData.currentSymptoms}")과 통증 양상(${painLoc}, ${userData.vasScore},${trendText})를 반드시 언급하며 분석에 포함하세요. 통증 점수가 낮아졌다면 안심시켜주고, 높아졌다면 대안책을 제시하고 격려해주세요.
        
        데이터:
        - 이름: ${userData.name}
        - 유병 기간: ${userData.durationMonths}개월
        - CRPS 유형: ${userData.crpsType}
        - 현재 통증(VAS): ${userData.vasScore}점
        - 통증 부위: ${painLoc}
        - 오늘의 호소(Symptoms): "${userData.currentSymptoms || '특이사항 없음'}"
        - 변화 추이: ${trendText}
        
        말투 및 태도 설정:
        ${toneInstructions}

        작성 지침:
        - "저 Decision-helper가 분석해보니..."와 같이 자신을 지칭하며 시작하세요.
        - 환자가 입력한 구체적인 증상 내용("${userData.currentSymptoms}")과 통증 양상(${painLoc}, ${userData.vasScore},${trendText})를 반드시 언급하며 분석에 포함하세요.
        - 통증 점수가 낮아졌다면 안심시켜주고, 높아졌다면 대안책을 제시하고 격려해주세요.
        `;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });

        return response.text || "데이터를 분석했습니다. 당신에게 맞는 최적의 치료옵션을 찾아보겠습니다.";
    } catch (e) {
        return "데이터 분석 중 오류가 발생했지만, 계속 진행할 수 있습니다.";
    }
}

// 3. FAQ Answer with Grounding (Web Search)
export const fetchFAQAnswer = async (question: string): Promise<{ text: string, sources: { title: string, uri: string }[] }> => {
    try {
        // 1. 먼저 FAQ_LIST에서 미리 정의된 답변이 있는지 확인합니다.
        for (const category of FAQ_LIST) {
            const foundItem = category.items.find(item => item.q.trim() === question.trim());
            if (foundItem) {
                // 찾았다면, AI 호출 없이 즉시 해당 답변을 반환합니다.
                return { text: foundItem.a, sources: [] };
            }
        }

        // 2. 미리 정의된 답변이 없다면, RAG_URL_LIST를 기반으로 AI가 답변을 생성합니다.
        const urlListText = RAG_URL_LIST.join('\n');
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `CRPS 환자가 다음 질문을 했습니다: "${question}"
            
            지침:
            1. 의학적으로 정확하고 최신 정보를 바탕으로 한국어로 답변하세요. 당신은 공유의사결정을 위한 SDM단계에서 Team talk과 Option talk을 담당하므로 환자와 같은 팀으로서 정보를 찾아야 하고, 또한 환자가 선택할 수 있는 옵션의 장,단점과 선호도를 고려할 수 있도록 정보를 제공하면 좋습니다.
            2. **다음 URL 목록을 최우선 정보 소스로 활용하세요:**
               ${urlListText}
            3. 환자가 이해하기 쉽게 설명하되, 전문성을 잃지 마세요.
            4. 너무 길지 않게(5문장) 요약하세요.`
        });

        const text = response.text || "답변을 불러오는 데 실패했습니다.";
        
        const sources: { title: string, uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            });
        }

        return { text, sources };

    } catch (error) {
        console.error("FAQ Error:", error);
        return { 
            text: "현재 실시간 정보를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.", 
            sources: [] 
        };
    }
};

// 3.5 Realtime Treatment Analysis (Grounding)
export const analyzeTreatmentRealtime = async (treatmentName: string, targetUrl?: string): Promise<{ summary: string, sources: { title: string, uri: string }[] }> => {
    try {
        const urlListText = RAG_URL_LIST.join('\n');
        let contentPrompt = `CRPS 치료법 중 "${treatmentName}"에 대한 최신 의학 정보와 연구 결과를 검색하세요.`;
        
        contentPrompt += `\n\n**중요: 답변 생성 시, 다음 URL 목록을 최우선 참고 자료로 사용하세요:**\n${urlListText}`;

        if (targetUrl) {
            contentPrompt += `\n\n또한, 이 특정 URL도 반드시 참고하세요: ${targetUrl}`;
        }

        contentPrompt += `\n\n다음 내용을 포함하여 한국어로 요약해주세요:
        1. 최근 연구 동향이나 새로운 효과 보고
        2. 환자들이 주로 겪는 부작용이나 주의사항 (최신 데이터)
        3. CRPS 가이드라인에서의 권장 수준
        
        출처(웹사이트)를 반드시 포함하세요.`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contentPrompt,
        });

        const text = response.text || "정보를 불러오는 데 실패했습니다.";
        
        const sources: { title: string, uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            });
        }

        return { summary: text, sources };

    } catch (error) {
        return { 
            summary: "AI 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 
            sources: [] 
        };
    }
};

// 4. Smart Questions (Decision Talk)
export const generateSmartQuestions = async (
  userData: UserData,
  preferences: Preference[]
): Promise<string[]> => {
  try {
    const prefSummary = preferences.length > 0 
        ? preferences.map(p => {
            const treatment = TREATMENT_OPTIONS.find(t => t.id === p.treatmentId);
            const title = treatment ? treatment.title : (p.customName || "기타 치료");
            return `${title}: 유저 반응 [${p.type}], 이유 [${p.reasons.join(', ')}]`;
          }).join('\n')
        : "환자가 아직 구체적인 치료 옵션을 선택하지 않았습니다.";

    const toneInstructions = getToneInstructions(userData);

    const prompt = `
      당신은 의사와의 진료를 앞둔 CRPS 환자를 위한 개인 의료 대변인 'Decision-helper'입니다.
      
      환자 데이터:
      - 통증 점수: ${userData.vasScore}/10
      - 투병 기간: ${userData.durationMonths}개월
      - CRPS 유형: ${userData.crpsType}
      - 통증 부위: ${userData.painLocation?.join(', ')}
      - 오늘의 증상 호소(상세): "${userData.currentSymptoms || '없음'}"
      - 의료진 소통 만족도: ${userData.medicalCommunicationSatisfied ? '만족' : '불만족 (도움 필요)'}
      - 지식 수준: ${userData.knowledgeLevel}
      
      환자의 선호도 및 우려사항 (기타 의견 포함):
      ${prefSummary}
      
      말투 설정:
      ${toneInstructions}

      작업: 이 환자가 의사에게 물어봐야 할 '핵심 질문 3가지'를 한국어로 생성하세요.
      질문은 환자의 구체적인 증상 호소와 우려(부작용, 비용, 효과 등)를 의료적 결정과 연결해야 합니다.
      오늘 환자가 입력한 증상(${userData.currentSymptoms})과 관련된 질문을 반드시 하나 이상 포함하세요.
      
      주의: 만약 환자가 치료 옵션을 선택하지 않았다면, 일반적인 치료 방향이나 진단, 혹은 생활 관리에 대한 질문을 생성해주세요.
      
      반환 형식: 오직 JSON만 반환하세요. 예: { "questions": ["질문 1?", "질문 2?", ...] }
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return ["가장 추천하는 치료법은 무엇인가요?", "부작용은 어떻게 관리하나요?"];
    
    const result = JSON.parse(jsonText);
    return result.questions || ["가장 추천하는 치료법은 무엇인가요?", "부작용은 어떻게 관리하나요?"];

  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      "이 치료를 시작하면 언제쯤 효과를 볼 수 있나요?",
      "현재 복용 중인 약과 함께 진행해도 되나요?",
      "이 방법이 효과가 없다면 다음 대안은 무엇인가요?"
    ];
  }
};

// 5. Chat with Decision-helper (Decision Talk)
export const chatWithDecisionPersona = async (
    userData: UserData, 
    chatHistory: { role: 'user' | 'assistant', content: string }[], 
    userMessage: string,
    isMedical: boolean = false
): Promise<string> => {
    try {
        const toneInstructions = getToneInstructions(userData);
        
        // Construct conversation history for context
        const historyText = chatHistory.map(msg => 
            `${msg.role === 'user' ? (isMedical ? '의료진' : '환자') : (isMedical ? 'Reporter' : 'Decision-helper')}: ${msg.content}`
        ).join('\n');

        let rolePrompt = "";
        if (isMedical) {
            rolePrompt = `당신은 의료진에게 환자의 상태를 객관적으로 전달하는 'Medical Reporter'입니다.
            환자에게 치료계획 뿐만 아니라 정서적 지지까지 할 수 있도록 정확하지만 공감적요소를 포함할 수 있도록 브리핑하세요.
            환자의 호소 내용("${userData.currentSymptoms},${userData.vasScore},${userData.durationMonths},${userData.crpsType},${userData.painLocation?.join(', ')}, ${userData.medicalCommunicationSatisfied ? '만족' : '불만족 (도움 필요)'},${userData.knowledgeLevel}")을 모두 고려해서 의료진이 환자에 대한 충분한 이해를 하도록 도우세요.
            2-3문장 내외로 핵심만 전달하세요. 일반적인 CRPS 정보는 생략하세요.`;
        } else {
            rolePrompt = `당신은 CRPS 환자의 맞춤형 의료 대변인 'Decision-helper'입니다.
            환자의 질문에 대해 명확하고 도움이 되는 답변을 제공하세요.
            위로가 필요하면 공감하고, 정보가 필요하면 정확히 알려주세요.
            의료적 판단(진단/처방)은 "환자를 의사결정의 파트너로 생각하며, 충분한 논의를 하세요"라고 안내하며 선을 지키세요.
            말투 지침: ${toneInstructions}`;
        }

        const prompt = `
        ${rolePrompt}
        
        환자 정보:
        - 이름: ${userData.name}
        - 통증 점수: ${userData.vasScore}/10
        - CRPS 유형: ${userData.crpsType}
        - 오늘의 호소: "${userData.currentSymptoms || '없음'}"
        
        이전 대화 내역:
        ${historyText}
        
        상대방의 새 질문: "${userMessage}"
        `;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });

        return response.text || "죄송해요, 답변을 생성하지 못했습니다.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "네트워크 문제로 답변을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }
}
