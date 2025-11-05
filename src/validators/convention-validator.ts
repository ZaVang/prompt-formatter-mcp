import { ValidationResult, ValidationCheck } from '../types/index.js';
import { ContentAnalyzer } from '../analyzer/index.js';

/**
 * ConventionValidator - Validates if a prompt follows the recommended conventions
 */
export class ConventionValidator {
  private analyzer: ContentAnalyzer;

  constructor() {
    this.analyzer = new ContentAnalyzer();
  }

  /**
   * Validate a prompt against conventions
   */
  validate(prompt: string): ValidationResult {
    const checks: ValidationCheck[] = [];

    // Run all checks
    checks.push(this.checkRoleDefinition(prompt));
    checks.push(this.checkRuleMarkers(prompt));
    checks.push(this.checkExampleMarkers(prompt));
    checks.push(this.checkSectionSeparation(prompt));
    checks.push(this.checkOutputFormat(prompt));
    checks.push(this.checkTaskDefinition(prompt));

    // Calculate compliance score
    const passedCount = checks.filter((c) => c.passed).length;
    const complianceScore = passedCount / checks.length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(checks);

    return {
      isValid: complianceScore >= 0.6, // Pass if >= 60% checks pass
      complianceScore,
      checks,
      recommendations,
    };
  }

  /**
   * Check for clear role definition
   */
  private checkRoleDefinition(prompt: string): ValidationCheck {
    const lowerPrompt = prompt.toLowerCase();
    const hasRoleMarkers =
      lowerPrompt.includes('you are') ||
      lowerPrompt.includes('act as') ||
      lowerPrompt.includes('your role') ||
      lowerPrompt.includes('<introduction>');

    if (hasRoleMarkers) {
      const match =
        prompt.match(/you are (a |an )?([^\n.!]+)/i) ||
        prompt.match(/act as (a |an )?([^\n.!]+)/i) ||
        prompt.match(/<introduction>([\s\S]*?)<\/introduction>/i);

      return {
        check: 'Has clear role definition',
        passed: true,
        found: match ? match[0] : 'Role definition found',
      };
    }

    return {
      check: 'Has clear role definition',
      passed: false,
      suggestion:
        "Start with a role definition using 'You are...' or 'Act as...'",
    };
  }

  /**
   * Check if rules use standard markers
   */
  private checkRuleMarkers(prompt: string): ValidationCheck {
    const lowerPrompt = prompt.toLowerCase();
    const hasRuleKeywords =
      lowerPrompt.includes('rule:') ||
      lowerPrompt.includes('rules:') ||
      lowerPrompt.includes('must') ||
      lowerPrompt.includes('should') ||
      lowerPrompt.includes('always') ||
      lowerPrompt.includes('never') ||
      lowerPrompt.includes('<rule>');

    if (hasRuleKeywords) {
      return {
        check: 'Rules use standard markers',
        passed: true,
        found: 'Standard rule markers detected',
      };
    }

    return {
      check: 'Rules use standard markers',
      passed: false,
      suggestion:
        "Use 'Rule:', 'Must', 'Should', 'Always', or 'Never' keywords for rules",
    };
  }

  /**
   * Check if examples are marked clearly
   */
  private checkExampleMarkers(prompt: string): ValidationCheck {
    const lowerPrompt = prompt.toLowerCase();
    const hasExampleKeywords =
      lowerPrompt.includes('example:') ||
      lowerPrompt.includes('examples:') ||
      lowerPrompt.includes('for example') ||
      lowerPrompt.includes('e.g.') ||
      lowerPrompt.includes('input:') ||
      lowerPrompt.includes('<example>');

    if (hasExampleKeywords) {
      return {
        check: 'Examples are marked clearly',
        passed: true,
        found: 'Example markers detected',
      };
    }

    // If no example keywords but might have examples, suggest marking them
    const mightHaveExamples = prompt.includes('→') || prompt.includes('-->');
    if (mightHaveExamples) {
      return {
        check: 'Examples are marked clearly',
        passed: false,
        suggestion:
          "Mark examples explicitly with 'Example:' or 'Input:/Output:' format",
      };
    }

    return {
      check: 'Examples are marked clearly',
      passed: true, // Don't penalize if no examples
      found: 'No examples needed or examples not detected',
    };
  }

  /**
   * Check for section separation (blank lines between sections)
   */
  private checkSectionSeparation(prompt: string): ValidationCheck {
    // Look for blank lines (two consecutive newlines)
    const hasBlankLines = /\n\s*\n/.test(prompt);

    if (hasBlankLines) {
      return {
        check: 'Uses blank lines to separate sections',
        passed: true,
        found: 'Blank lines detected for section separation',
      };
    }

    // If prompt is very short, don't penalize
    if (prompt.split('\n').length <= 5) {
      return {
        check: 'Uses blank lines to separate sections',
        passed: true,
        found: 'Prompt is short, separation not critical',
      };
    }

    return {
      check: 'Uses blank lines to separate sections',
      passed: false,
      suggestion: 'Add blank lines between different sections for better readability',
    };
  }

  /**
   * Check for output format specification
   */
  private checkOutputFormat(prompt: string): ValidationCheck {
    const lowerPrompt = prompt.toLowerCase();
    const hasOutputFormat =
      lowerPrompt.includes('output format:') ||
      lowerPrompt.includes('response format:') ||
      lowerPrompt.includes('format the output') ||
      lowerPrompt.includes('return') ||
      lowerPrompt.includes('<output');

    if (hasOutputFormat) {
      return {
        check: 'Specifies output format',
        passed: true,
        found: 'Output format specification detected',
      };
    }

    return {
      check: 'Specifies output format',
      passed: false,
      suggestion:
        "Add output format requirements using 'Output format:' or 'Return...' keywords",
    };
  }

  /**
   * Check for clear task definition
   */
  private checkTaskDefinition(prompt: string): ValidationCheck {
    const lowerPrompt = prompt.toLowerCase();
    const hasTaskMarkers =
      lowerPrompt.includes('task:') ||
      lowerPrompt.includes('please') ||
      lowerPrompt.includes('translate') ||
      lowerPrompt.includes('analyze') ||
      lowerPrompt.includes('generate') ||
      lowerPrompt.includes('create') ||
      lowerPrompt.includes('<task>');

    if (hasTaskMarkers) {
      return {
        check: 'Has clear task instruction',
        passed: true,
        found: 'Task instruction detected',
      };
    }

    return {
      check: 'Has clear task instruction',
      passed: false,
      suggestion:
        "Add a clear task using 'Task:', 'Please...', or action verbs",
    };
  }

  /**
   * Generate recommendations based on failed checks
   */
  private generateRecommendations(checks: ValidationCheck[]): string[] {
    const recommendations: string[] = [];

    for (const check of checks) {
      if (!check.passed && check.suggestion) {
        recommendations.push(check.suggestion);
      }
    }

    // Add general recommendations
    if (recommendations.length > 0) {
      recommendations.push(
        'See CONVENTIONS.md for detailed prompt writing guidelines'
      );
    } else {
      recommendations.push(
        'Good! Your prompt follows the recommended conventions'
      );
    }

    return recommendations;
  }
}
