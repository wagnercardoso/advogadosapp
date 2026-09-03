import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to get GoogleGenAI client with dynamic key
function getGenAI(customKey?: string): GoogleGenAI | null {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "dummy-key" || apiKey.includes("MY_GEMINI_API_KEY")) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn("Could not initialize GoogleGenAI with key:", err);
    return null;
  }
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Tec Justiça Lite", version: "2.0" });
});

// Endpoint: Generate legal strategy, laws, and defense storyline
app.post("/api/legal/strategy", async (req, res) => {
  try {
    const { caseData, profile, newCircumstances, customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-key'] as string;
    const effectiveKey = customApiKey || headerKey || process.env.GEMINI_API_KEY;

    if (!caseData || !caseData.title || !caseData.facts) {
      return res.status(400).json({ error: "Dados essenciais do caso (título e fatos) são obrigatórios." });
    }

    const lawyerName = profile?.name ? profile.name.trim() : "Advogado(a)";
    const lawyerSpecialty = profile?.specialty ? profile.specialty.trim() : "Direito Geral";

    const ai = getGenAI(effectiveKey);

    // If no valid key is present on server, return a structured response indicating fallback usage
    if (!ai) {
      return res.status(200).json({
        useClientFallback: true,
        message: "Chave Gemini não configurada no servidor; utilizando Motor Jurídico Inteligente integrado.",
      });
    }

    const prompt = `
Você é o assistente jurídico sênior de inteligência artificial do aplicativo "Tec Justiça Lite".
Você está prestando consultoria estratégica e técnica exclusivamente para o(a) ilustre Dr(a). ${lawyerName}, cuja especialidade e campo de atuação é ${lawyerSpecialty}.

DADOS DO CASO/PROCESSO:
- Título/Identificação da Causa: ${caseData.title}
- Número do Processo / CNJ: ${caseData.processNumber || "Não informado / Fase Pré-Processual"}
- Cliente: ${caseData.clientName || "Não informado"}
- Parte Contrária: ${caseData.opponentName || "Não informada"}
- Tribunal/Vara: ${caseData.courtOrVara || "Não informado"}
- Área / Ramo do Direito: ${caseData.specialty || lawyerSpecialty}
- Fatos e Circunstâncias Apresentados: ${caseData.facts}
- Pedidos / Objetivos Almejados: ${caseData.objectives || "Defesa técnica e resguardo de direitos"}
- Novas Circunstâncias / Fatos Adicionais (se houver): ${newCircumstances || caseData.circumstances || "Nenhuma circunstância adicional"}

SUA TAREFA:
1. Cumprimente o(a) Dr(a). ${lawyerName} cordialmente e de forma personalizada, valorizando sua atuação na área de ${lawyerSpecialty}.
2. Forneça uma análise minuciosa com:
   - Resumo conciso do caso com ênfase nos pontos controvertidos.
   - Leis e Artigos Aplicáveis (Códigos Brasileiros ex: CPC, CP, CPP, CLT, CC, CF/88, CDC, Súmulas Vinculantes, STJ e STF relevantes) e explique detalhadamente a relevância de cada um.
   - Enredo e Tese de Defesa ("defenseStoryline"): Estruture o roteiro passo a passo com Fatos incontroversos, Teses Preliminares (se houver ex: prescrição, decadência, inépcia, ilegitimidade), Teses Principais e de Mérito, Teses Subsidiárias e Conclusão dos Pedidos.
   - Dicas Estratégicas e Técnicas para o caso (provas a requerer, postura em audiência, questionamentos a testemunhas, jurisprudência favorável).
   - Riscos Processuais e Alertas de Atenção (pontos fracos da tese, teses contrárias prováveis).
   - Checklist de Ações Recomendadas imediatas (prazos a cumprir, documentos a juntar).

Leve sempre em consideração a legislação brasileira vigente e a melhor jurisprudência dos Tribunais Superiores (STF/STJ/TST). Responda em Português do Brasil com rigor técnico e formatação limpa.
`;

    // Try models with fallback
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.7-flash"];
    let responseText = "";

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                lawyerGreeting: {
                  type: Type.STRING,
                  description: "Saudação personalizada e profissional citando o nome do(a) advogado(a) e sua especialidade.",
                },
                summaryOfCase: {
                  type: Type.STRING,
                  description: "Resumo executivo do caso e foco estratégico.",
                },
                applicableLaws: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      codeOrLaw: {
                        type: Type.STRING,
                        description: "Nome da lei e artigo específico (ex: Art. 300 do CPC, Art. 186 do CC, Art. 5º, LV da CF/88)",
                      },
                      articleDescription: {
                        type: Type.STRING,
                        description: "Breve explicação do conteúdo normativo.",
                      },
                      relevance: {
                        type: Type.STRING,
                        description: "Como aplicar este dispositivo a favor do cliente neste caso.",
                      },
                    },
                    required: ["codeOrLaw", "articleDescription", "relevance"],
                  },
                },
                defenseStoryline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phase: {
                        type: Type.STRING,
                        description: "Fase da argumentação (ex: Preliminar de Mérito, Tese Principal, Tese Subsidiária, Dos Pedidos)",
                      },
                      argumentTitle: {
                        type: Type.STRING,
                        description: "Título da tese ou argumento.",
                      },
                      details: {
                        type: Type.STRING,
                        description: "Desenvolvimento substancial da tese para peticionamento ou sustentação oral.",
                      },
                      jurisprudenceTip: {
                        type: Type.STRING,
                        description: "Indicação de súmula, precedente ou orientação dos tribunais aplicável.",
                      },
                    },
                    required: ["phase", "argumentTitle", "details"],
                  },
                },
                strategicTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de dicas estratégicas e táticas para a condução do processo.",
                },
                risksAndAlerts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Alertas sobre pontos fracos, prazos críticos ou teses contrárias.",
                },
                actionChecklist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Passos práticos e imediatos a serem executados pelo advogado.",
                },
              },
              required: [
                "lawyerGreeting",
                "summaryOfCase",
                "applicableLaws",
                "defenseStoryline",
                "strategicTips",
                "risksAndAlerts",
                "actionChecklist",
              ],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`Attempt with ${modelName} failed, trying next model...`);
      }
    }

    if (!responseText) {
      return res.status(200).json({ useClientFallback: true });
    }

    const parsed = JSON.parse(responseText);
    parsed.generatedAt = new Date().toISOString();
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error generating legal strategy:", err);
    return res.status(200).json({ useClientFallback: true });
  }
});

// Endpoint: Dynamic query / Advice on new circumstances
app.post("/api/legal/advice", async (req, res) => {
  try {
    const { caseData, profile, question, customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-key'] as string;
    const effectiveKey = customApiKey || headerKey || process.env.GEMINI_API_KEY;

    const lawyerName = profile?.name ? profile.name.trim() : "Advogado(a)";
    const lawyerSpecialty = profile?.specialty ? profile.specialty.trim() : "Direito Geral";

    const ai = getGenAI(effectiveKey);

    if (!ai) {
      return res.json({
        answer: `Dr(a). ${lawyerName}, analisando sua dúvida sob a ótica do ${caseData?.specialty || lawyerSpecialty}: recomenda-se juntar provas documentais pertinentes, atentar-se aos prazos processuais e invocar as garantias do contraditório e da ampla defesa (Art. 5º, LV da CF/88).`,
      });
    }

    const prompt = `
Você é o consultor jurídico de IA do "Tec Justiça Lite", assessorando o(a) Dr(a). ${lawyerName} (${lawyerSpecialty}).
CASO: ${caseData?.title || "Caso em andamento"}
FATOS DO CASO: ${caseData?.facts || "Não especificados"}
PERGUNTA / NOVA DÚVIDA DO ADVOGADO: ${question}

Forneça uma resposta consultiva, direta, precisa e fundamentada na legislação e jurisprudência brasileira, sempre se dirigindo ao(à) Dr(a). ${lawyerName}.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (err: any) {
    console.error("Error in advice endpoint:", err);
    res.json({
      answer: "Recomenda-se analisar a legislação aplicável ao caso e instruir o processo com as provas documentais e testemunhais disponíveis.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tec Justiça Lite server running on http://localhost:${PORT}`);
  });
}

startServer();
