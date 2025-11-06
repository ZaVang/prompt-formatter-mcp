/**
 * Detection pattern definition
 */
export interface DetectionPattern {
  name: string;
  patterns: RegExp[];
  keywords?: string[];
  priority?: number;
}

/**
 * Pattern match result
 */
export interface PatternMatch {
  pattern: string;
  match: RegExpMatchArray;
  confidence: number; // 0-1
  position: {
    start: number;
    end: number;
  };
}

/**
 * Section detection result
 */
export interface SectionDetectionResult {
  found: boolean;
  content: string | null;
  matches: PatternMatch[];
  confidence: number; // 0-1
}

/**
 * Detection patterns collection
 */
export interface DetectionPatterns {
  introduction: DetectionPattern;
  rules: DetectionPattern;
  context: DetectionPattern;
  examples: DetectionPattern;
  outputFormat: DetectionPattern;
  task: DetectionPattern;
}

/**
 * Text segment for analysis
 */
export interface TextSegment {
  content: string;
  type: 'paragraph' | 'list' | 'code' | 'xml' | 'markdown' | 'unknown';
  startIndex: number;
  endIndex: number;
  indentLevel?: number;
}

/**
 * Parsed prompt structure
 */
export interface ParsedPrompt {
  raw: string;
  segments: TextSegment[];
  hasXmlTags: boolean;
  hasMarkdownHeaders: boolean;
  lineCount: number;
  wordCount: number;
}

/**
 * Quality evaluation criteria
 */
export interface QualityEvaluationCriteria {
  hasIntroduction: boolean;
  hasRules: boolean;
  hasExamples: boolean;
  hasOutputFormat: boolean;
  hasTask: boolean;
  usesStandardMarkers: boolean;
  hasSectionSeparation: boolean;
  structureIsOrganized: boolean;
}

/**
 * Score calculation weights
 */
export interface ScoreWeights {
  clarity: number;
  completeness: number;
  structure: number;
  examples: number;
}
