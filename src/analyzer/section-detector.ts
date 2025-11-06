import {
  DetectedSections,
  SectionDetectionResult,
  PatternMatch,
} from '../types/index.js';
import {
  detectionPatterns,
  extractMatches,
  matchesPattern,
} from './patterns.js';

/**
 * SectionDetector - Detects different sections in a prompt using pattern matching
 */
export class SectionDetector {
  /**
   * Detect all sections in a prompt
   */
  detect(prompt: string): DetectedSections {
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
   * Detect introduction/role section
   */
  private detectIntroduction(prompt: string): SectionDetectionResult {
    const pattern = detectionPatterns.introduction;
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
    const pattern = detectionPatterns.rules;
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
    const pattern = detectionPatterns.context;
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
    const pattern = detectionPatterns.examples;
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
          const inputMatch = content.match(/input:\s*(.+?)(?:\n|output:)/i);
          const outputMatch = content.match(/output:\s*(.+?)(?:\n|$)/i);

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
      const inputMatch = content.match(/input:\s*(.+?)(?:\n|output:)/i);
      const outputMatch = content.match(/output:\s*(.+?)(?:\n|$)/i);

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
    const pattern = detectionPatterns.outputFormat;
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
    const pattern = detectionPatterns.task;
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
