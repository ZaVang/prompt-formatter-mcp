/**
 * Detected sections from prompt analysis
 */
export interface DetectedSections {
  introduction: string | null;
  rules: string[];
  context: string | null;
  examples: Array<{
    content: string;
    input?: string;
    output?: string;
  }>;
  outputFormat: string | null;
  task: string | null;
  rawSections: {
    [key: string]: string;
  };
}

/**
 * Quality metrics for a prompt
 */
export interface QualityMetrics {
  clarityScore: number; // 0-1
  completenessScore: number; // 0-1
  structureScore: number; // 0-1
  overallScore: number; // 0-1
}

/**
 * Issues detected in a prompt
 */
export interface PromptIssue {
  type: 'missing_content' | 'ambiguity' | 'structure' | 'formatting';
  severity: 'low' | 'medium' | 'high';
  section?: string;
  description: string;
  suggestion?: string;
}

/**
 * Result of prompt analysis
 */
export interface AnalysisResult {
  sections: DetectedSections;
  quality: QualityMetrics;
  issues: PromptIssue[];
  missingSections: string[];
  suggestions: string[];
  optimizationPrompt?: string;
}

/**
 * Options for formatting
 */
export interface FormatOptions {
  preserveWhitespace?: boolean;
  strictMode?: boolean;
  includeMetadata?: boolean;
}

/**
 * Result of formatting operation
 */
export interface FormatResult {
  formattedPrompt: string;
  detectedSections: {
    introduction: boolean;
    rules: number;
    examples: number;
    outputFormat: boolean;
    task: boolean;
  };
  confidenceScore: number; // 0-1
  warnings: string[];
  metadata?: {
    originalLength: number;
    formattedLength: number;
    sectionsDetected: number;
  };
}

/**
 * Validation check result
 */
export interface ValidationCheck {
  check: string;
  passed: boolean;
  found?: string;
  suggestion?: string;
}

/**
 * Result of prompt validation
 */
export interface ValidationResult {
  isValid: boolean;
  complianceScore: number; // 0-1
  checks: ValidationCheck[];
  recommendations: string[];
}
