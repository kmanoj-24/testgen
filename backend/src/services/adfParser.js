/**
 * Parse Atlassian Document Format (ADF) to extract text
 * Jira stores descriptions in ADF format
 */
export class ADFParser {
  static parse(node) {
    if (!node) return '';
    
    if (typeof node === 'string') return node;
    
    if (node.type === 'text') {
      return node.text || '';
    }
    
    if (node.type === 'hardBreak') {
      return '\n';
    }
    
    if (node.type === 'mention') {
      return `@${node.attrs?.text || ''}`;
    }
    
    if (node.type === 'emoji') {
      return node.attrs?.shortName || '';
    }
    
    // Handle content arrays
    if (node.content && Array.isArray(node.content)) {
      const text = node.content.map(child => this.parse(child)).join('');
      
      // Add formatting based on node type
      switch (node.type) {
        case 'paragraph':
          return text + '\n';
        case 'heading':
          return text + '\n';
        case 'bulletList':
        case 'orderedList':
          return text;
        case 'listItem':
          return '• ' + text;
        case 'codeBlock':
          return '```\n' + text + '\n```\n';
        case 'blockquote':
          return '> ' + text.replace(/\n/g, '\n> ') + '\n';
        case 'panel':
          return `[${node.attrs?.panelType || 'panel'}]\n${text}\n`;
        case 'table':
          return text + '\n';
        case 'tableRow':
          return text + '\n';
        case 'tableCell':
          return text + ' | ';
        default:
          return text;
      }
    }
    
    return '';
  }

  /**
   * Extract acceptance criteria section from parsed text
   */
  static extractAcceptanceCriteria(text) {
    if (!text) return null;
    
    const patterns = [
      /acceptance criteria[:\s]*([\s\S]*?)(?=\n#{1,3}\s|\n---|$)/i,
      /acceptance criteria[:\s]*([\s\S]*)/i,
      /given[:\s]*([\s\S]*?)(?=when|then)/i,
      /(?:^|\n)(?:ac|acceptance criteria)[:\s]*\n([\s\S]*?)(?=\n\n|\n#{1,3}\s|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].trim()) {
        return this.cleanText(match[1].trim());
      }
    }
    
    // Fallback: look for Gherkin-style Given/When/Then
    const gherkinPattern = /(?:given|when|then)[:\s].*/gi;
    const gherkinMatches = text.match(gherkinPattern);
    if (gherkinMatches && gherkinMatches.length > 0) {
      return this.cleanText(gherkinMatches.join('\n'));
    }
    
    return null;
  }

  static cleanText(text) {
    return text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/gm, '')
      .trim();
  }
}