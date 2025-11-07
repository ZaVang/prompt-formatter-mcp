import {
  DetectedSections,
  QualityMetrics,
  QualityEvaluationCriteria,
  PromptIssue,
} from '../types/index.js';

/**
 * QualityEvaluator - Evaluates the quality of a prompt based on detected sections
 */
export class QualityEvaluator {
  /**
   * Evaluate prompt quality
   */
  evaluate(sections: DetectedSections): QualityMetrics {
    const criteria = this.evaluateCriteria(sections);
    const scores = this.calculateScores(criteria, sections);

    return scores;
  }

  /**
   * Evaluate criteria
   */
  private evaluateCriteria(
    sections: DetectedSections
  ): QualityEvaluationCriteria {
    return {
      hasIntroduction: sections.introduction !== null,
      hasRules: sections.rules.length > 0,
      hasExamples: sections.examples.length > 0,
      hasOutputFormat: sections.outputFormat !== null,
      hasTask: sections.task !== null,
      usesStandardMarkers: this.checkStandardMarkers(sections),
      hasSectionSeparation: true, // This would require analyzing the raw text
      structureIsOrganized: this.checkStructureOrganization(sections),
    };
  }

  /**
   * Check if standard markers are used
   */
  private checkStandardMarkers(sections: DetectedSections): boolean {
    let markerScore = 0;
    let total = 0;

    // Check introduction
    if (sections.introduction) {
      total++;
      const intro = sections.introduction.toLowerCase();
      if (
        intro.includes('you are') ||
        intro.includes('act as') ||
        intro.includes('<introduction>')
      ) {
        markerScore++;
      }
    }

    // Check rules
    if (sections.rules.length > 0) {
      total++;
      const hasRuleKeywords = sections.rules.some((rule) => {
        const lower = rule.toLowerCase();
        return (
          lower.startsWith('rule:') ||
          lower.includes('must') ||
          lower.includes('should') ||
          lower.includes('<rule>')
        );
      });
      if (hasRuleKeywords) markerScore++;
    }

    // Check examples
    if (sections.examples.length > 0) {
      total++;
      const hasExampleKeywords = sections.examples.some((ex) => {
        const lower = ex.content.toLowerCase();
        return (
          lower.includes('example:') ||
          lower.includes('input:') ||
          lower.includes('<example>')
        );
      });
      if (hasExampleKeywords) markerScore++;
    }

    // Check output format
    if (sections.outputFormat) {
      total++;
      const lower = sections.outputFormat.toLowerCase();
      if (
        lower.includes('output format:') ||
        lower.includes('response format:') ||
        lower.includes('<output')
      ) {
        markerScore++;
      }
    }

    return total > 0 ? markerScore / total >= 0.5 : false;
  }

  /**
   * Check if structure is well organized
   */
  private checkStructureOrganization(sections: DetectedSections): boolean {
    // A well-organized prompt typically has:
    // 1. Introduction at the beginning
    // 2. Rules defined
    // 3. Examples (optional but good)
    // 4. Task at the end

    const hasIntro = sections.introduction !== null;
    const hasRules = sections.rules.length > 0;
    const hasTask = sections.task !== null;

    // At minimum, should have intro and task, or rules and task
    return (hasIntro && hasTask) || (hasRules && hasTask);
  }

  /**
   * Calculate quality scores
   */
  private calculateScores(
    criteria: QualityEvaluationCriteria,
    sections: DetectedSections
  ): QualityMetrics {
    // Clarity score: based on standard markers and organization
    const clarityScore =
      (criteria.usesStandardMarkers ? 0.5 : 0) +
      (criteria.hasSectionSeparation ? 0.25 : 0) +
      (criteria.structureIsOrganized ? 0.25 : 0);

    // Completeness score: based on presence of key sections
    const completenessScore =
      (criteria.hasIntroduction ? 0.2 : 0) +
      (criteria.hasRules ? 0.25 : 0) +
      (criteria.hasExamples ? 0.2 : 0) +
      (criteria.hasOutputFormat ? 0.15 : 0) +
      (criteria.hasTask ? 0.2 : 0);

    // Structure score: based on organization
    const structureScore =
      (criteria.structureIsOrganized ? 0.4 : 0) +
      (criteria.hasIntroduction ? 0.2 : 0) +
      (criteria.hasTask ? 0.2 : 0) +
      (sections.rules.length > 0
        ? Math.min(sections.rules.length * 0.05, 0.2)
        : 0);

    // Overall score: weighted average
    const overallScore =
      clarityScore * 0.3 + completenessScore * 0.4 + structureScore * 0.3;

    return {
      clarityScore: Math.min(clarityScore, 1),
      completenessScore: Math.min(completenessScore, 1),
      structureScore: Math.min(structureScore, 1),
      overallScore: Math.min(overallScore, 1),
    };
  }

  /**
   * Identify issues in the prompt
   */
  identifyIssues(sections: DetectedSections): PromptIssue[] {
    const issues: PromptIssue[] = [];

    // Check for missing introduction
    if (!sections.introduction) {
      issues.push({
        type: 'missing_content',
        severity: 'medium',
        section: 'introduction',
        description: 'No role or introduction section detected',
        suggestion:
          "Add an introduction using 'You are...' or 'Act as...' to define the AI's role",
      });
    }

    // Check for missing rules
    if (sections.rules.length === 0) {
      issues.push({
        type: 'missing_content',
        severity: 'medium',
        section: 'rules',
        description: 'No rules or constraints detected',
        suggestion:
          "Add rules using 'Rule:', 'Must', 'Should', or 'Always' keywords",
      });
    }

    // Check for missing examples
    if (sections.examples.length === 0) {
      issues.push({
        type: 'missing_content',
        severity: 'low',
        section: 'examples',
        description: 'No examples provided',
        suggestion:
          'Add 1-2 examples to illustrate expected behavior using "Example:" or "Input:/Output:" format',
      });
    }

    // Check for missing output format
    if (!sections.outputFormat) {
      issues.push({
        type: 'missing_content',
        severity: 'low',
        section: 'outputFormat',
        description: 'No output format specified',
        suggestion:
          "Add output format requirements using 'Output format:' or 'Return...' keywords",
      });
    }

    // Check for missing task
    if (!sections.task) {
      issues.push({
        type: 'missing_content',
        severity: 'high',
        section: 'task',
        description: 'No clear task or instruction detected',
        suggestion:
          "Add a clear task using 'Task:', 'Please...', or action verbs like 'Translate', 'Analyze', etc.",
      });
    }

    return issues;
  }

  /**
   * Identify missing sections
   */
  identifyMissingSections(sections: DetectedSections): string[] {
    const missing: string[] = [];

    if (!sections.introduction) missing.push('introduction');
    if (sections.rules.length === 0) missing.push('rules');
    if (!sections.context) missing.push('context');
    if (sections.examples.length === 0) missing.push('examples');
    if (!sections.outputFormat) missing.push('outputFormat');
    if (!sections.task) missing.push('task');

    return missing;
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(sections: DetectedSections): string[] {
    const suggestions: string[] = [];
    const issues = this.identifyIssues(sections);

    for (const issue of issues) {
      if (issue.suggestion) {
        suggestions.push(issue.suggestion);
      }
    }

    // Add positive feedback
    if (sections.introduction) {
      suggestions.push(
        'Good: Role definition is present and helps set context'
      );
    }
    if (sections.rules.length >= 3) {
      suggestions.push(
        'Good: Multiple rules defined for clear guidance (' +
          sections.rules.length +
          ' rules)'
      );
    }
    if (sections.examples.length >= 2) {
      suggestions.push(
        'Good: Multiple examples provided (' +
          sections.examples.length +
          ' examples)'
      );
    }

    return suggestions;
  }
}
