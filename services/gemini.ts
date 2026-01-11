
import { GoogleGenAI, Type } from "@google/genai";

export interface ExploitOptions {
  injectionPoint?: string;
  evasionTechnique?: string;
  customContext?: string;
}

export interface ThreatReport {
  title: string;
  summary: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  date: string;
  tags: string[];
}

export interface CVEInfo {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvss: number;
  affected: string;
  datePublished: string;
}

export const analyzeHeaders = async (rawHeaders: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a Senior Security Compliance Engineer. 
    Analyze these HTTP headers for security posture, privacy leaks, and best practices.
    
    Headers to analyze:
    ---
    ${rawHeaders}
    ---

    Provide a professional analysis including:
    1. A security score (0-100).
    2. A list of critical missing headers.
    3. Detailed findings for existing headers, categorized by "Security", "Information", "Performance", or "Privacy".
    4. For each finding, provide the status (Pass/Fail/Warning), a clear impact statement, a technical recommendation, and where applicable, a remediation code snippet (e.g., Nginx or Apache config).
    5. An overall summary and risk level assessment.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          riskLevel: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
          summary: { type: Type.STRING },
          missingHeaders: { type: Type.ARRAY, items: { type: Type.STRING } },
          findings: {
            type: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  header: { type: Type.STRING },
                  status: { type: Type.STRING, description: "Pass, Fail, or Warning" },
                  impact: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  remediationSnippet: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Security, Information, Performance, or Privacy" }
                },
                required: ["header", "status", "impact", "recommendation", "category"]
              }
            }
          }
        },
        required: ["score", "riskLevel", "summary", "missingHeaders", "findings"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getLiveCVEData = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a Global Cybersecurity Intelligence Node. 
    Use Google Search to find the 15 most recent and critical CVEs (Common Vulnerabilities and Exposures) published in the last 7 days.
    
    For each CVE, provide:
    1. The CVE ID (e.g., CVE-2025-XXXXX)
    2. A technical title
    3. A brief description of the vulnerability and attack vector
    4. Severity level (Critical, High, Medium, Low)
    5. CVSS Score (estimate if not final)
    6. Affected software, hardware, or components
    7. Date published or last updated
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cves: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, description: "One of: Critical, High, Medium, Low" },
                cvss: { type: Type.NUMBER },
                affected: { type: Type.STRING },
                datePublished: { type: Type.STRING }
              },
              required: ["id", "title", "description", "severity", "cvss", "affected", "datePublished"]
            }
          }
        },
        required: ["cves"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

  return {
    cves: JSON.parse(response.text).cves as CVEInfo[],
    sources
  };
};

export const analyzeDomain = async (domain: string, modules: string[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const moduleFocus = modules.length > 0 
    ? `Heavily focus your analysis on these specific attack vectors: ${modules.join(', ')}.` 
    : "Perform a broad security posture analysis across common web attack vectors.";

  const prompt = `
    Act as a high-level Penetration Tester and OSINT Specialist.
    Perform an advanced security audit for: ${domain}.
    
    Reconnaissance Instructions:
    1. Use Google Search to find subdomains, hidden paths, and exposed files (e.g., .env, .git, config.php).
    2. Check for technology signatures and associated CVEs.
    3. Evaluate DNS records and email security (SPF, DKIM, DMARC).
    
    ${moduleFocus}
    
    CRITICAL: You MUST provide scores (0-100) for exactly these 6 categories: 
    "Network", "Application", "Authentication", "Encryption", "Data Privacy", and "API Security".
    
    Structure the response to include technical reconnaissance assets and identified risks.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          categoryScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "One of: Network, Application, Authentication, Encryption, Data Privacy, API Security" },
                score: { type: Type.NUMBER }
              },
              required: ["category", "score"]
            }
          },
          summary: { type: Type.STRING },
          reconnaissance: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                value: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["type", "value", "status"]
            }
          },
          topRisks: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                severity: { type: Type.STRING },
                category: { type: Type.STRING },
                cve: { type: Type.STRING }
              },
              required: ["name", "severity", "category"]
            } 
          },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          remediation: { type: Type.STRING }
        },
        required: ["score", "categoryScores", "summary", "reconnaissance", "topRisks", "technologies", "remediation"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

  return {
    ...JSON.parse(response.text),
    sources
  };
};

export const generateVulnerabilityDeepDive = async (vulnName: string, domain?: string, options?: ExploitOptions) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tuningPrompt = options ? `
    Tailor the technical details using these parameters:
    - Target Injection Point: ${options.injectionPoint || 'Standard'}
    - evasion Technique: ${options.evasionTechnique || 'None'}
    - Additional Context: ${options.customContext || 'General'}
  ` : '';

  const prompt = `
    Act as a Master Security Researcher. Provide a technical deep dive for the vulnerability: "${vulnName}"${domain ? ` as it applies to ${domain}` : ''}.
    ${tuningPrompt}
    Explain the underlying mechanism, provide a sample research payload, list clear POC steps, and detailed remediation.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          payload: { type: Type.STRING },
          pocSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          remediation: { type: Type.STRING }
        },
        required: ["explanation", "payload", "pocSteps", "remediation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateExecutiveSummary = async (vulnName: string, diveData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a Chief Information Security Officer (CISO). 
    Convert this technical vulnerability report into a professional 3-sentence executive summary.
    Focus on business risk, technical root cause, and the primary strategic remediation step.
    Keep it strictly professional and suitable for board-level reporting.

    Vulnerability: ${vulnName}
    Explanation: ${diveData.explanation}
    Remediation: ${diveData.remediation}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};

export const generateComplianceAdvice = async (standardRank: string, standardTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a Senior Compliance Auditor and AppSec Specialist.
    Provide a high-precision mitigation guide for the OWASP Standard: ${standardRank} - ${standardTitle}.
    
    Structure the response into:
    1. Technical Root Cause (Deep Dive)
    2. Testing Procedures (How to verify if you are vulnerable)
    3. Technical Mitigations (Code/Infrastructure solutions)
    4. Compliance Impact (PCI-DSS, HIPAA, SOC2 relevance)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rootCause: { type: Type.STRING },
          testingProcedures: { type: Type.ARRAY, items: { type: Type.STRING } },
          mitigations: { type: Type.ARRAY, items: { type: Type.STRING } },
          complianceImpact: { type: Type.STRING }
        },
        required: ["rootCause", "testingProcedures", "mitigations", "complianceImpact"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getLatestThreatIntel = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Using Google Search, find the 10 most critical cybersecurity threat reports, zero-days, or data breaches from the last 72 hours. Provide a structured summary for each.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threats: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                date: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "summary", "impact", "date"]
            } 
          }
        },
        required: ["threats"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

  const data = JSON.parse(response.text);
  return {
    threats: data.threats as ThreatReport[],
    sources
  };
};

export const analyzeThreatImpact = async (report: ThreatReport) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze the following threat intelligence report and provide a detailed technical impact assessment and defensive strategy:
  
  Title: ${report.title}
  Summary: ${report.summary}
  Impact: ${report.impact}
  Date: ${report.date}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
  });

  return response.text;
};

export const chatWithAdvisor = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are Skywalker AI, a world-class Cybersecurity Assistant. Use Google Search to provide factual, up-to-date security information. Speak with technical precision and professionalism."
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

  return {
    text: response.text,
    sources
  };
};

export const explainVulnerability = async (vulnName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a Security Researcher. Explain ${vulnName} technically and professionally. Include historical context and modern variants.`,
  });

  return response.text;
};
