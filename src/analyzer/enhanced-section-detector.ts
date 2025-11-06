import {
  DetectedSections,
  SectionDetectionResult,
  PatternMatch,
} from '../types/index.js';
import {
  enhancedDetectionPatterns,
} from './enhanced-patterns.js';
import { extractMatches } from './patterns.js';
import { HeuristicSegmenter } from './heuristic-segmenter.js';

/**
 * Enhanced Section Detector
 *
 * Detection strategy (in priority order):
 * 1. XML tags (highest confidence)
 * 2. Explicit keyword patterns (English/Chinese)
 * 3. Heuristic segmentation (colon-based, lists, paragraphs)
 * 4. Position-based guessing (fallback)
 */
export class EnhancedSectionDetector {
  private heuristicSegmenter: HeuristicSegmenter;

  constructor() {
    this.heuristicSegmenter = new HeuristicSegmenter();
  }

  /**
   * Detect all sections in a prompt with enhanced multilingual support
   */
  detect(prompt: string): DetectedSections {
    // First, try pattern-based detection
    const patternResults = this.detectWithPatterns(prompt);

    // Check if pattern detection was successful
    const hasGoodDetection = this.evaluateDetectionQuality(patternResults);

    if (hasGoodDetection) {
      return patternResults;
    }

    // If pattern detection failed, use heuristic fallback
    return this.detectWithHeuristics(prompt, patternResults);
  }

  /**
   * Detect using enhanced patterns
   */
  private detectWithPatterns(prompt: string): DetectedSections {
    const introduction = this.detectIntroduction(prompt);
    const rules = this.detectRules(prompt);
    const context = this.detectContext(prompt);
    const examples = this.detectExamples(prompt);
    const outputFormat = this.detectOutputFormat(prompt);
    const task = this.detectTask(prompt);

    return {
      introduction: introduction.content,
      rules: rules,
      context: context.content,
      examples: examples,
      outputFormat: outputFormat.content,
      task: task.content,
      rawSections: {
        introduction: introduction.content || '',
        context: context.content || '',
        outputFormat: outputFormat.content || '',
        task: task.content || '',
      },
    };
  }

  /**
   * Detect using heuristic fallback
   */
  private detectWithHeuristics(
    prompt: string,
    patternResults: DetectedSections
  ): DetectedSections {
    const segments = this.heuristicSegmenter.segment(prompt);

    // Merge heuristic results with pattern results
    const merged: DetectedSections = {
      introduction: patternResults.introduction,
      rules: [...patternResults.rules],
      context: patternResults.context,
      examples: [...patternResults.examples],
      outputFormat: patternResults.outputFormat,
      task: patternResults.task,
      rawSections: { ...patternResults.rawSections },
    };

    // Fill in missing sections from heuristic results
    for (const segment of segments) {
      const category = segment.suggestedCategory;
      if (!category || category === 'unknown') continue;

      switch (category) {
        case 'introduction':
          if (!merged.introduction) {
            merged.introduction = segment.content;
            merged.rawSections!.introduction = segment.content;
          }
          break;

        case 'rules':
          // Add to rules if confidence is reasonable
          if (segment.confidence >= 0.5) {
            // Check if this is a list
            if (segment.metadata?.listItems) {
              merged.rules.push(...segment.metadata.listItems);
            } else {
              merged.rules.push(segment.content);
            }
          }
          break;

        case 'context':
          if (!merged.context) {
            merged.context = segment.content;
            merged.rawSections!.context = segment.content;
          }
          break;

        case 'examples':
          if (segment.confidence >= 0.5) {
            merged.examples.push({
              content: segment.content,
            });
          }
          break;

        case 'outputFormat':
          if (!merged.outputFormat) {
            merged.outputFormat = segment.content;
            merged.rawSections!.outputFormat = segment.content;
          }
          break;

        case 'task':
          if (!merged.task) {
            merged.task = segment.content;
            merged.rawSections!.task = segment.content;
          }
          break;
      }
    }

    return merged;
  }

  /**
   * Evaluate if pattern detection was successful
   */
  private evaluateDetectionQuality(sections: DetectedSections): boolean {
    let score = 0;

    // Award points for each detected section
    if (sections.introduction) score += 2;
    if (sections.rules.length > 0) score += 2;
    if (sections.context) score += 1;
    if (sections.examples.length > 0) score += 2;
    if (sections.outputFormat) score += 1;
    if (sections.task) score += 2;

    // If we detected at least 3 sections, consider it successful
    return score >= 3;
  }

  /**
   * Detect introduction/role section
   */
  private detectIntroduction(prompt: string): SectionDetectionResult {
    const pattern = enhancedDetectionPatterns.introduction;
    const matches = extractMatches(prompt, pattern);

    if (matches.length === 0) {
      return { found: false, content: null, matches: [], confidence: 0 };
    }

    // Prefer XML tags if present
    const xmlMatch = matches.find((m) => m[0].includes('<introduction>'));
    if (xmlMatch) {
      const content = xmlMatch[1] || xmlMatch[0];
      return {
        found: true,
        content: content.trim(),
        matches: this.convertToPatternMatches(matches, prompt),
        confidence: 0.95,
      };
    }

    // Otherwise, take the first match
    const firstMatch = matches[0];
    return {
      found: true,
      content: firstMatch[0].trim(),
      matches: this.convertToPatternMatches(matches, prompt),
      confidence: 0.8,
    };
  }

  /**
   * Detect rules section
   */
  private detectRules(prompt: string): string[] {
    const pattern = enhancedDetectionPatterns.rules;
    const matches = extractMatches(prompt, pattern);

    if (matches.length === 0) {
      return [];
    }

    const rules: string[] = [];

    // Check for XML <rules> block
    const rulesBlockMatch = prompt.match(/<rules>([\s\S]*?)<\/rules>/i);
    if (rulesBlockMatch) {
      const rulesBlock = rulesBlockMatch[1];
      const ruleMatches = rulesBlock.matchAll(/<rule>([\s\S]*?)<\/rule>/gi);
      for (const match of ruleMatches) {
        rules.push(match[1].trim());
      }
      if (rules.length > 0) {
        return rules;
      }
    }

    // Extract individual rules
    for (const match of matches) {
      const rule = match[0].trim();
      // Skip if it's the <rules> tag itself
      if (!rule.startsWith('<rules>') && !rule.startsWith('</rules>')) {
        rules.push(rule);
      }
    }

    return rules;
  }

  /**
   * Detect context section
   */
  private detectContext(prompt: string): SectionDetectionResult {
    const pattern = enhancedDetectionPatterns.context;
    const matches = extractMatches(prompt, pattern);

    if (matches.length === 0) {
      return { found: false, content: null, matches: [], confidence: 0 };
    }

    // Prefer XML tags
    const xmlMatch = matches.find(
      (m) => m[0].includes('<context>') || m[0].includes('<background>')
    );
    if (xmlMatch) {
      const content = xmlMatch[1] || xmlMatch[0];
      return {
        found: true,
        content: content.trim(),
        matches: this.convertToPatternMatches(matches, prompt),
        confidence: 0.9,
      };
    }

    const firstMatch = matches[0];
    return {
      found: true,
      content: firstMatch[0].trim(),
      matches: this.convertToPatternMatches(matches, prompt),
      confidence: 0.75,
    };
  }

  /**
   * Detect examples section
   */
  private detectExamples(prompt: string): Array<{
    content: string;
    input?: string;
    output?: string;
  }> {
    const pattern = enhancedDetectionPatterns.examples;
    const matches = extractMatches(prompt, pattern);

    if (matches.length === 0) {
      return [];
    }

    const examples: Array<{
      content: string;
      input?: string;
      output?: string;
    }> = [];

    // Check for XML examples block
    const examplesBlockMatch = prompt.match(
      /<examples?>([\s\S]*?)<\/examples?>/gi
    );
    if (examplesBlockMatch) {
      for (const blockMatch of examplesBlockMatch) {
        const exampleMatches = blockMatch.matchAll(
          /<example>([\s\S]*?)<\/example>/gi
        );
        for (const match of exampleMatches) {
          const content = match[1].trim();
          const inputMatch = content.match(/input[:：]\s*(.+?)(?:\n|output[:：])/i);
          const outputMatch = content.match(/output[:：]\s*(.+?)(?:\n|$)/i);

          examples.push({
            content,
            input: inputMatch ? inputMatch[1].trim() : undefined,
            output: outputMatch ? outputMatch[1].trim() : undefined,
          });
        }
      }
      if (examples.length > 0) {
        return examples;
      }
    }

    // Extract individual examples
    for (const match of matches) {
      const content = match[0].trim();
      const inputMatch = content.match(/input[:：]\s*(.+?)(?:\n|output[:：])/i);
      const outputMatch = content.match(/output[:：]\s*(.+?)(?:\n|$)/i);

      examples.push({
        content,
        input: inputMatch ? inputMatch[1].trim() : undefined,
        output: outputMatch ? outputMatch[1].trim() : undefined,
      });
    }

    return examples;
  }

  /**
   * Detect output format section
   */
  private detectOutputFormat(prompt: string): SectionDetectionResult {
    const pattern = enhancedDetectionPatterns.outputFormat;
    const matches = extractMatches(prompt, pattern);

    if (matches.length === 0) {
      return { found: false, content: null, matches: [], confidence: 0 };
    }

    // Prefer XML tags
    const xmlMatch = matches.find((m) => m[0].includes('<output'));
    if (xmlMatch) {
      const content = xmlMatch[1] || xmlMatch[0];
      return {
        found: true,
        content: content.trim(),
        matches: this.convertToPatternMatches(matches, prompt),
        confidence: 0.9,
      };
    }

    const firstMatch = matches[0];
    return {
      found: true,
      content: firstMatch[0].trim(),
      matches: this.convertToPatternMatches(matches, prompt),
      confidence: 0.8,
    };
  }

  /**
   * Detect task section
   */
  private detectTask(prompt: string): SectionDetectionResult {
    const pattern = enhancedDetectionPatterns.task;
    const matches = extractMatches(prompt, pattern);

    if (matches.length === 0) {
      return { found: false, content: null, matches: [], confidence: 0 };
    }

    // Prefer XML tags
    const xmlMatch = matches.find((m) => m[0].includes('<task>'));
    if (xmlMatch) {
      const content = xmlMatch[1] || xmlMatch[0];
      return {
        found: true,
        content: content.trim(),
        matches: this.convertToPatternMatches(matches, prompt),
        confidence: 0.95,
      };
    }

    // Task usually appears at the end, so prefer later matches
    const lastMatch = matches[matches.length - 1];
    return {
      found: true,
      content: lastMatch[0].trim(),
      matches: this.convertToPatternMatches(matches, prompt),
      confidence: 0.85,
    };
  }

  /**
   * Convert RegExpMatchArray to PatternMatch
   */
  private convertToPatternMatches(
    matches: RegExpMatchArray[],
    fullText: string
  ): PatternMatch[] {
    return matches.map((match) => {
      const matchText = match[0];
      const startIndex = fullText.indexOf(matchText);
      return {
        pattern: matchText,
        match,
        confidence: 0.8,
        position: {
          start: startIndex,
          end: startIndex + matchText.length,
        },
      };
    });
  }
}
