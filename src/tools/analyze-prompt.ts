import { AnalysisResult } from '../types/index.js';
import { ContentAnalyzer } from '../analyzer/index.js';
import { logger } from '../utils/logger.js';

/**
 * Analyze Prompt Tool
 * Analyzes prompt structure and quality, returns suggestions for Agent to optimize
 */
export class AnalyzePromptTool {
  private analyzer: ContentAnalyzer;

  constructor() {
    this.analyzer = new ContentAnalyzer();
  }

  /**
   * Analyze a prompt
   */
  async analyze(
    prompt: string,
    targetModel?: 'claude' | 'gpt' | 'generic'
  ): Promise<AnalysisResult> {
    try {
      logger.info(
        `Analyzing prompt for target model: ${targetModel || 'generic'}`
      );

      // Perform analysis
      const result = this.analyzer.analyze(prompt, targetModel);

      logger.info(
        `Analysis complete. Overall quality score: ${result.quality.overallScore.toFixed(2)}`
      );
      logger.info(
        `Detected sections: ${Object.keys(result.sections).filter((k) => result.sections[k as keyof typeof result.sections]).length}`
      );

      return result;
    } catch (error) {
      logger.error('Error analyzing prompt', error);
      throw error;
    }
  }
}
