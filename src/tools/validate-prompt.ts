import { ValidationResult } from '../types/index.js';
import { ConventionValidator } from '../validators/index.js';
import { logger } from '../utils/logger.js';

/**
 * Validate Prompt Tool
 * Validates if a prompt follows the recommended conventions
 */
export class ValidatePromptTool {
  private validator: ConventionValidator;

  constructor() {
    this.validator = new ConventionValidator();
  }

  /**
   * Validate a prompt
   */
  async validate(prompt: string): Promise<ValidationResult> {
    try {
      logger.info('Validating prompt against conventions');

      // Perform validation
      const result = this.validator.validate(prompt);

      logger.info(
        `Validation complete. Compliance score: ${result.complianceScore.toFixed(2)}`
      );
      logger.info(
        `Checks passed: ${result.checks.filter((c) => c.passed).length}/${result.checks.length}`
      );

      return result;
    } catch (error) {
      logger.error('Error validating prompt', error);
      throw error;
    }
  }
}
