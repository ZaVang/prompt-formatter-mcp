/**
 * Heuristic Segmenter - Fallback mechanism for unstructured prompts
 *
 * When explicit patterns don't match, use heuristics to segment the prompt:
 * 1. Paragraph-based segmentation (double newlines)
 * 2. Colon-based detection (xxx: content)
 * 3. List-based detection (numbered or bulleted)
 * 4. Position-based heuristics (first para = intro, last = task)
 */

export interface HeuristicSegment {
  content: string;
  startLine: number;
  endLine: number;
  type: 'paragraph' | 'colon-section' | 'list' | 'unknown';
  suggestedCategory?:
    | 'introduction'
    | 'rules'
    | 'context'
    | 'examples'
    | 'outputFormat'
    | 'task'
    | 'unknown';
  confidence: number;
  metadata?: {
    colonPrefix?: string; // For colon-section: the part before ':'
    listType?: 'numbered' | 'bulleted'; // For list
    listItems?: string[]; // Individual items
  };
}

export class HeuristicSegmenter {
  /**
   * Segment prompt by paragraphs (double newlines)
   */
  segmentByParagraphs(prompt: string): HeuristicSegment[] {
    // Split by double newlines (or more)
    const paragraphs = prompt.split(/\n\s*\n+/);
    const segments: HeuristicSegment[] = [];

    let currentLine = 0;
    for (const para of paragraphs) {
      if (para.trim().length === 0) continue;

      const lineCount = para.split('\n').length;
      segments.push({
        content: para.trim(),
        startLine: currentLine,
        endLine: currentLine + lineCount - 1,
        type: 'paragraph',
        suggestedCategory: this.guessCategory(para, segments.length),
        confidence: 0.5,
      });

      currentLine += lineCount + 2; // +2 for the double newline
    }

    return segments;
  }

  /**
   * Detect colon-based sections (xxx: content)
   *
   * Examples:
   * - "规则: 必须使用中文"
   * - "Requirements: Use JSON format"
   * - "举例: 输入 -> 输出"
   */
  detectColonSections(prompt: string): HeuristicSegment[] {
    const segments: HeuristicSegment[] = [];
    const lines = prompt.split('\n');

    let currentSection: HeuristicSegment | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check if this is a colon-based section header
      // Pattern: word characters followed by colon, with content after
      const colonMatch = trimmedLine.match(/^([^:：\n]{1,50}?)[:：]\s*(.+)/);

      if (colonMatch) {
        // Save previous section if exists
        if (currentSection) {
          segments.push(currentSection);
        }

        const prefix = colonMatch[1].trim();
        const content = colonMatch[2].trim();

        currentSection = {
          content: content,
          startLine: index,
          endLine: index,
          type: 'colon-section',
          suggestedCategory: this.categorizePrefixByColon(prefix),
          confidence: 0.7,
          metadata: {
            colonPrefix: prefix,
          },
        };
      } else if (currentSection && trimmedLine.length > 0) {
        // Continue current section
        currentSection.content += '\n' + trimmedLine;
        currentSection.endLine = index;
      } else if (currentSection && trimmedLine.length === 0) {
        // Empty line ends current section
        segments.push(currentSection);
        currentSection = null;
      }
    });

    // Don't forget the last section
    if (currentSection) {
      segments.push(currentSection);
    }

    return segments;
  }

  /**
   * Detect list-based sections (numbered or bulleted)
   */
  detectLists(prompt: string): HeuristicSegment[] {
    const segments: HeuristicSegment[] = [];
    const lines = prompt.split('\n');

    let currentList: HeuristicSegment | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check for numbered list: "1. ", "1) ", "1、"
      const numberedMatch = trimmedLine.match(/^(\d+)[.)、．]\s+(.+)/);
      // Check for bulleted list: "- ", "* ", "• "
      const bulletedMatch = trimmedLine.match(/^[-*•]\s+(.+)/);

      if (numberedMatch || bulletedMatch) {
        const itemContent = numberedMatch
          ? numberedMatch[2]
          : bulletedMatch![1];
        const listType = numberedMatch ? 'numbered' : 'bulleted';

        if (!currentList) {
          // Start new list
          currentList = {
            content: itemContent,
            startLine: index,
            endLine: index,
            type: 'list',
            suggestedCategory: this.guessListCategory(itemContent),
            confidence: 0.6,
            metadata: {
              listType,
              listItems: [itemContent],
            },
          };
        } else if (currentList.metadata?.listType === listType) {
          // Continue current list
          currentList.content += '\n' + itemContent;
          currentList.endLine = index;
          currentList.metadata!.listItems!.push(itemContent);
        } else {
          // Different list type, save and start new
          segments.push(currentList);
          currentList = {
            content: itemContent,
            startLine: index,
            endLine: index,
            type: 'list',
            suggestedCategory: this.guessListCategory(itemContent),
            confidence: 0.6,
            metadata: {
              listType,
              listItems: [itemContent],
            },
          };
        }
      } else if (currentList && trimmedLine.length === 0) {
        // Empty line ends list
        segments.push(currentList);
        currentList = null;
      }
    });

    if (currentList) {
      segments.push(currentList);
    }

    return segments;
  }

  /**
   * Combine all heuristic methods
   */
  segment(prompt: string): HeuristicSegment[] {
    // Try colon-based first (highest confidence)
    const colonSegments = this.detectColonSections(prompt);
    if (colonSegments.length > 0) {
      return colonSegments;
    }

    // Then try list detection
    const listSegments = this.detectLists(prompt);
    if (listSegments.length > 0) {
      return listSegments;
    }

    // Finally, fall back to paragraph segmentation
    return this.segmentByParagraphs(prompt);
  }

  /**
   * Guess category based on position and content
   */
  private guessCategory(
    content: string,
    position: number
  ):
    | 'introduction'
    | 'rules'
    | 'context'
    | 'examples'
    | 'outputFormat'
    | 'task'
    | 'unknown' {
    const lower = content.toLowerCase();

    // First paragraph is often introduction
    if (position === 0) {
      return 'introduction';
    }

    // Check for implicit indicators
    if (
      lower.includes('must') ||
      lower.includes('should') ||
      lower.includes('必须') ||
      lower.includes('应该') ||
      lower.includes('不要')
    ) {
      return 'rules';
    }

    if (
      lower.includes('example') ||
      lower.includes('e.g.') ||
      lower.includes('举例') ||
      lower.includes('比如') ||
      lower.includes('input') ||
      lower.includes('output') ||
      lower.includes('输入') ||
      lower.includes('输出')
    ) {
      return 'examples';
    }

    if (
      lower.includes('format') ||
      lower.includes('return') ||
      lower.includes('格式') ||
      lower.includes('返回')
    ) {
      return 'outputFormat';
    }

    if (
      lower.includes('background') ||
      lower.includes('context') ||
      lower.includes('背景') ||
      lower.includes('上下文')
    ) {
      return 'context';
    }

    return 'unknown';
  }

  /**
   * Categorize based on colon prefix
   */
  private categorizePrefixByColon(
    prefix: string
  ):
    | 'introduction'
    | 'rules'
    | 'context'
    | 'examples'
    | 'outputFormat'
    | 'task'
    | 'unknown' {
    const lower = prefix.toLowerCase();

    // Rules/Requirements
    if (
      lower.includes('rule') ||
      lower.includes('requirement') ||
      lower.includes('constraint') ||
      lower.includes('guideline') ||
      lower.includes('规则') ||
      lower.includes('要求') ||
      lower.includes('约束') ||
      lower.includes('限制')
    ) {
      return 'rules';
    }

    // Examples
    if (
      lower.includes('example') ||
      lower.includes('sample') ||
      lower.includes('demonstration') ||
      lower.includes('举例') ||
      lower.includes('示例') ||
      lower.includes('样例') ||
      lower.includes('比如')
    ) {
      return 'examples';
    }

    // Output format
    if (
      lower.includes('output') ||
      lower.includes('format') ||
      lower.includes('response') ||
      lower.includes('输出') ||
      lower.includes('格式') ||
      lower.includes('返回')
    ) {
      return 'outputFormat';
    }

    // Context
    if (
      lower.includes('context') ||
      lower.includes('background') ||
      lower.includes('scenario') ||
      lower.includes('背景') ||
      lower.includes('上下文') ||
      lower.includes('场景')
    ) {
      return 'context';
    }

    // Task
    if (
      lower.includes('task') ||
      lower.includes('instruction') ||
      lower.includes('goal') ||
      lower.includes('objective') ||
      lower.includes('任务') ||
      lower.includes('指令') ||
      lower.includes('目标')
    ) {
      return 'task';
    }

    // Introduction
    if (
      lower.includes('role') ||
      lower.includes('system') ||
      lower.includes('you are') ||
      lower.includes('角色') ||
      lower.includes('系统') ||
      lower.includes('你是')
    ) {
      return 'introduction';
    }

    return 'unknown';
  }

  /**
   * Guess list category based on first item
   */
  private guessListCategory(
    firstItem: string
  ):
    | 'introduction'
    | 'rules'
    | 'context'
    | 'examples'
    | 'outputFormat'
    | 'task'
    | 'unknown' {
    return this.guessCategory(firstItem, -1);
  }
}
