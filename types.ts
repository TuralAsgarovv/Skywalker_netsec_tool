
export enum View {
  DASHBOARD = 'DASHBOARD',
  HEADER_AUDIT = 'HEADER_AUDIT',
  OWASP_ADVISOR = 'OWASP_ADVISOR',
  AI_CHAT = 'AI_CHAT',
  VULN_EXPLAINER = 'VULN_EXPLAINER',
  SETTINGS = 'SETTINGS',
  CVE_HUB = 'CVE_HUB',
  EXPLOIT_ARCHITECT = 'EXPLOIT_ARCHITECT'
}

export interface SecurityScore {
  category: string;
  score: number;
  fullMark: number;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  remediation: string;
}

export interface HeaderFinding {
  header: string;
  status: 'Pass' | 'Fail' | 'Warning';
  impact: string;
  recommendation: string;
  remediationSnippet?: string;
  category: 'Security' | 'Information' | 'Performance' | 'Privacy';
}

export interface HeaderAnalysisResult {
  score: number;
  missingHeaders: string[];
  findings: HeaderFinding[];
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
}
