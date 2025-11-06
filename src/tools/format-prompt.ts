import { FormatResult, CustomTemplate, FormatOptions } from '../types/index.js';
import { ContentAnalyzer } from '../analyzer/index.js';
import { TemplateEngine } from '../templates/index.js';
import { logger } from '../utils/logger.js';

/**
 * Format Prompt Tool
 * Formats a raw prompt into a structured template
 */
export class FormatPromptTool {
  private analyzer: ContentAnalyzer;
  private templateEngine: TemplateEngine;

  constructor() {
    this.analyzer = new ContentAnalyzer();
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Format a prompt
   */
  async format(
    prompt: string,
    targetFormat: 'claude_xml' | 'gpt_markdown' | 'json' | 'custom' = 'claude_xml',
    customTemplate?: CustomTemplate,
    options?: FormatOptions
  ): Promise<FormatResult> {
    try {
      logger.info(
        `Formatting prompt with target format: ${targetFormat}`
      );

      // Analyze the prompt to detect sections
      const analysis = this.analyzer.analyze(prompt);

      // If custom template is provided, register it
      if (targetFormat === 'custom' && customTemplate) {
        const result = this.templateEngine.registerCustomTemplateFromDefinition(
          'user_custom',
          customTemplate
        );
        if (!result.success) {
          logger.error('Custom template validation failed', result.errors);
          throw new Error(
            `Custom template validation failed: ${result.errors?.join(', ')}`
          );
        }
        targetFormat = 'user_custom' as any;
      }

      // Render the prompt using the template
      const formattedPrompt = this.templateEngine.render(
        targetFormat,
        analysis.sections,
        {
          preserveWhitespace: options?.preserveWhitespace,
          includeEmptySections: false,
        }
      );

      // Calculate confidence score based on detection quality
      const confidenceScore = this.calculateConfidence(analysis);

      // Generate warnings
      const warnings = this.generateWarnings(analysis);

      // Build result
      const result: FormatResult = {
        formattedPrompt,
        detectedSections: {
          introduction: analysis.sections.introduction !== null,
          rules: analysis.sections.rules.length,
          examples: analysis.sections.examples.length,
          outputFormat: analysis.sections.outputFormat !== null,
          task: analysis.sections.task !== null,
        },
        confidenceScore,
        warnings,
      };

      if (options?.includeMetadata) {
        result.metadata = {
          originalLength: prompt.length,
          formattedLength: formattedPrompt.length,
          sectionsDetected: this.countDetectedSections(analysis.sections),
        };
      }

      logger.info(
        `Formatting complete. Confidence: ${confidenceScore.toFixed(2)}`
      );
      return result;
    } catch (error) {
      logger.error('Error formatting prompt', error);
      throw error;
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(analysis: any): number {
    let score = 0;
    let factors = 0;

    // Introduction detected
    if (analysis.sections.introduction) {
      score += 0.2;
    }
    factors++;

    // Rules detected
    if (analysis.sections.rules.length > 0) {
      score += Math.min(0.2, analysis.sections.rules.length * 0.05);
    }
    factors++;

    // Examples detected
    if (analysis.sections.examples.length > 0) {
      score += Math.min(0.2, analysis.sections.examples.length * 0.1);
    }
    factors++;

    // Output format detected
    if (analysis.sections.outputFormat) {
      score += 0.2;
    }
    factors++;

    // Task detected
    if (analysis.sections.task) {
      score += 0.2;
    }
    factors++;

    return score;
  }

  /**
   * Generate warnings based on analysis
   */
  private generateWarnings(analysis: any): string[] {
    const warnings: string[] = [];

    if (!analysis.sections.introduction) {
      warnings.push('No introduction/role definition detected');
    }

    if (analysis.sections.rules.length === 0) {
      warnings.push('No rules detected - consider adding guidelines');
    }

    if (analysis.sections.examples.length === 0) {
      warnings.push(
        'No examples detected - adding examples can improve model performance'
      );
    }

    if (!analysis.sections.outputFormat) {
      warnings.push('No output format specification detected');
    }

    if (!analysis.sections.task) {
      warnings.push('No clear task instruction detected');
    }

    if (analysis.quality.overallScore < 0.5) {
      warnings.push(
        'Overall prompt quality is low - consider reviewing and improving'
      );
    }

    return warnings;
  }

  /**
   * Count detected sections
   */
  private countDetectedSections(sections: any): number {
    let count = 0;
    if (sections.introduction) count++;
    if (sections.rules.length > 0) count++;
    if (sections.context) count++;
    if (sections.examples.length > 0) count++;
    if (sections.outputFormat) count++;
    if (sections.task) count++;
    return count;
  }
}
