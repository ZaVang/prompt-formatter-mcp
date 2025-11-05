import { DetectionPattern, DetectionPatterns } from '../types/index.js';

/**
 * Detection patterns for identifying different sections of a prompt
 * Based on conventions defined in CONVENTIONS.md
 */

// Introduction / Role definition patterns
const introductionPattern: DetectionPattern = {
  name: 'introduction',
  patterns: [
    /^you are (a|an) .+/im,
    /^act as (a|an) .+/im,
    /^your role is .+/im,
    /^as (a|an) .+/im,
    /^you're (a|an) .+/im,
    /^<introduction>([\s\S]*?)<\/introduction>/im,
  ],
  keywords: ['you are', 'act as', 'your role', 'as a', 'as an'],
  priority: 1,
};

// Rules and constraints patterns
const rulesPattern: DetectionPattern = {
  name: 'rules',
  patterns: [
    /^rule[s]?:\s*.+/gim,
    /^(?:you )?(?:must|should|always|never)\s+.+/gim,
    /^(?:do not|don't|avoid)\s+.+/gim,
    /^(?:ensure|make sure|verify)\s+.+/gim,
    /^important:\s*.+/gim,
    /^critical:\s*.+/gim,
    /^note:\s*.+/gim,
    /^(?:\d+\.\s+)?(?:must|should|always|never)\s+.+/gim,
    /^-\s*(?:must|should|always|never|do not|don't|avoid|ensure)\s+.+/gim,
    /^<rule>([\s\S]*?)<\/rule>/gim,
    /^<rules>([\s\S]*?)<\/rules>/im,
  ],
  keywords: [
    'rule:',
    'rules:',
    'must',
    'should',
    'always',
    'never',
    'do not',
    "don't",
    'avoid',
    'ensure',
    'make sure',
    'important:',
    'critical:',
  ],
  priority: 2,
};

// Context / Background patterns
const contextPattern: DetectionPattern = {
  name: 'context',
  patterns: [
    /^context:\s*.+/im,
    /^background:\s*.+/im,
    /^given that\s+.+/im,
    /^scenario:\s*.+/im,
    /^setting:\s*.+/im,
    /^situation:\s*.+/im,
    /^<context>([\s\S]*?)<\/context>/im,
    /^<background>([\s\S]*?)<\/background>/im,
  ],
  keywords: [
    'context:',
    'background:',
    'given that',
    'scenario:',
    'setting:',
    'situation:',
  ],
  priority: 3,
};

// Examples patterns
const examplesPattern: DetectionPattern = {
  name: 'examples',
  patterns: [
    /^examples?:\s*.+/gim,
    /^for example,?\s*.+/gim,
    /^e\.g\.?,?\s*.+/gim,
    /^sample[s]?:\s*.+/gim,
    /^instance[s]?:\s*.+/gim,
    /^<examples?>([\s\S]*?)<\/examples?>/gim,
    /input:\s*.+\s+output:\s*.+/gim,
    /(?:^|\n)(?:\d+\.\s+)?input:\s*.+/gim,
  ],
  keywords: [
    'example:',
    'examples:',
    'for example',
    'e.g.',
    'sample:',
    'samples:',
    'instance:',
    'input:',
    'output:',
  ],
  priority: 4,
};

// Output format patterns
const outputFormatPattern: DetectionPattern = {
  name: 'outputFormat',
  patterns: [
    /^output format:\s*.+/im,
    /^response format:\s*.+/im,
    /^format (?:the output|your response) (?:as|in|using)\s+.+/im,
    /^return\s+.+\s+(?:as|in)\s+.+/im,
    /^provide (?:the )?result in\s+.+/im,
    /^structure your response (?:as|in)\s+.+/im,
    /^<output[_\s]?format>([\s\S]*?)<\/output[_\s]?format>/im,
    /^your (?:output|response) should be\s+.+/im,
  ],
  keywords: [
    'output format:',
    'response format:',
    'format the output',
    'format your response',
    'return',
    'provide the result',
    'structure your response',
  ],
  priority: 5,
};

// Task / Main instruction patterns
const taskPattern: DetectionPattern = {
  name: 'task',
  patterns: [
    /^task:\s*.+/im,
    /^your task is\s+.+/im,
    /^please\s+(?:translate|analyze|generate|create|write|review|evaluate|summarize)\s+.+/im,
    /^(?:translate|analyze|generate|create|write|review|evaluate|summarize)\s+(?:the following|the|this)\s+.+/im,
    /^<task>([\s\S]*?)<\/task>/im,
    /^now,?\s+(?:please\s+)?(?:translate|analyze|generate|create)\s+.+/im,
  ],
  keywords: [
    'task:',
    'your task',
    'please',
    'translate',
    'analyze',
    'generate',
    'create',
    'write',
    'review',
    'evaluate',
  ],
  priority: 6,
};

/**
 * Complete set of detection patterns
 */
export const detectionPatterns: DetectionPatterns = {
  introduction: introductionPattern,
  rules: rulesPattern,
  context: contextPattern,
  examples: examplesPattern,
  outputFormat: outputFormatPattern,
  task: taskPattern,
};

/**
 * Helper function to check if text matches any pattern
 */
export function matchesPattern(
  text: string,
  pattern: DetectionPattern
): boolean {
  return pattern.patterns.some((regex) => regex.test(text));
}

/**
 * Helper function to check if text contains any keyword
 */
export function containsKeyword(
  text: string,
  pattern: DetectionPattern
): boolean {
  if (!pattern.keywords) return false;
  const lowerText = text.toLowerCase();
  return pattern.keywords.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * Extract all matches for a given pattern
 */
export function extractMatches(
  text: string,
  pattern: DetectionPattern
): RegExpMatchArray[] {
  const matches: RegExpMatchArray[] = [];

  for (const regex of pattern.patterns) {
    if (regex.global) {
      const globalMatches = text.matchAll(regex);
      for (const match of globalMatches) {
        matches.push(match);
      }
    } else {
      const match = text.match(regex);
      if (match) {
        matches.push(match);
      }
    }
  }

  return matches;
}
