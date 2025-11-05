import { AnalysisResult } from '../types/index.js';
import { SectionDetector } from './section-detector.js';
import { QualityEvaluator } from './quality-evaluator.js';

/**
 * ContentAnalyzer - Main analyzer class that coordinates section detection and quality evaluation
 */
export class ContentAnalyzer {
  private sectionDetector: SectionDetector;
  private qualityEvaluator: QualityEvaluator;

  constructor() {
    this.sectionDetector = new SectionDetector();
    this.qualityEvaluator = new QualityEvaluator();
  }

  /**
   * Analyze a prompt and return comprehensive analysis results
   */
  analyze(prompt: string, targetModel?: 'claude' | 'gpt' | 'generic'): AnalysisResult {
    // Detect sections
    const sections = this.sectionDetector.detect(prompt);

    // Evaluate quality
    const quality = this.qualityEvaluator.evaluate(sections);

    // Identify issues
    const issues = this.qualityEvaluator.identifyIssues(sections);

    // Identify missing sections
    const missingSections =
      this.qualityEvaluator.identifyMissingSections(sections);

    // Generate suggestions
    const suggestions = this.qualityEvaluator.generateSuggestions(sections);

    // Generate optimization prompt for Agent
    const optimizationPrompt = this.generateOptimizationPrompt(
      sections,
      quality,
      missingSections,
      targetModel
    );

    return {
      sections,
      quality,
      issues,
      missingSections,
      suggestions,
      optimizationPrompt,
    };
  }

  /**
   * Generate an optimization prompt that can be used by an Agent to improve the prompt
   */
  private generateOptimizationPrompt(
    sections: any,
    quality: any,
    missingSections: string[],
    targetModel?: 'claude' | 'gpt' | 'generic'
  ): string {
    const modelName = targetModel || 'generic';
    let prompt = `To improve this prompt for ${modelName}:\n\n`;

    // Add model-specific recommendations
    if (targetModel === 'claude') {
      prompt += 'Claude-specific recommendations:\n';
      prompt +=
        '- Use XML tags for better structure (<introduction>, <rules>, <examples>)\n';
      prompt +=
        '- Include thinking tags <thinking> for complex reasoning tasks\n';
      prompt += '- Provide clear examples with input/output pairs\n\n';
    } else if (targetModel === 'gpt') {
      prompt += 'GPT-specific recommendations:\n';
      prompt +=
        '- Use Markdown formatting with clear headers (# Role, ## Rules, etc.)\n';
      prompt += '- Separate system prompt from user prompt where applicable\n';
      prompt += '- Use numbered lists for rules and steps\n\n';
    }

    // Add missing sections
    if (missingSections.length > 0) {
      prompt += 'Missing sections to add:\n';
      missingSections.forEach((section) => {
        switch (section) {
          case 'introduction':
            prompt += `- Add a role definition (e.g., "You are a professional...")\n`;
            break;
          case 'rules':
            prompt += `- Add clear rules and constraints\n`;
            break;
          case 'context':
            prompt +=
              '- Add background context if relevant to the task\n';
            break;
          case 'examples':
            prompt += `- Add 1-2 examples showing expected input/output\n`;
            break;
          case 'outputFormat':
            prompt += `- Specify the desired output format\n`;
            break;
          case 'task':
            prompt += `- Add a clear task instruction at the end\n`;
            break;
        }
      });
      prompt += '\n';
    }

    // Add quality-based suggestions
    if (quality.clarityScore < 0.7) {
      prompt += '- Improve clarity by using standard markers (Rule:, Example:, etc.)\n';
    }
    if (quality.structureScore < 0.7) {
      prompt +=
        '- Improve structure by organizing content in a logical order\n';
    }
    if (sections.rules.length < 3 && sections.rules.length > 0) {
      prompt += '- Consider adding more specific rules for better guidance\n';
    }
    if (sections.examples.length === 0) {
      prompt +=
        '- Add examples to illustrate expected behavior and improve model performance\n';
    }

    return prompt.trim();
  }

  /**
   * Quick check to see if a prompt follows conventions
   */
  checkConventions(prompt: string): {
    score: number;
    passedChecks: string[];
    failedChecks: string[];
  } {
    const sections = this.sectionDetector.detect(prompt);
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    // Check for role definition
    if (sections.introduction) {
      passedChecks.push('Has clear role definition');
    } else {
      failedChecks.push('Missing role definition');
    }

    // Check for rules with standard markers
    if (sections.rules.length > 0) {
      const hasStandardMarkers = sections.rules.some((rule) => {
        const lower = rule.toLowerCase();
        return (
          lower.startsWith('rule:') ||
          lower.includes('must') ||
          lower.includes('should')
        );
      });
      if (hasStandardMarkers) {
        passedChecks.push('Rules use standard markers');
      } else {
        failedChecks.push('Rules could use standard markers (Rule:, Must, etc.)');
      }
    }

    // Check for examples with standard markers
    if (sections.examples.length > 0) {
      const hasExampleMarkers = sections.examples.some((ex) => {
        const lower = ex.content.toLowerCase();
        return (
          lower.includes('example:') ||
          lower.includes('input:') ||
          lower.includes('<example>')
        );
      });
      if (hasExampleMarkers) {
        passedChecks.push('Examples are clearly marked');
      } else {
        failedChecks.push('Examples could be marked more clearly');
      }
    }

    // Check for task
    if (sections.task) {
      passedChecks.push('Has clear task instruction');
    } else {
      failedChecks.push('Missing clear task instruction');
    }

    const score = passedChecks.length / (passedChecks.length + failedChecks.length);

    return {
      score,
      passedChecks,
      failedChecks,
    };
  }
}
