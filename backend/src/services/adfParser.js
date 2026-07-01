/**
 * Parse Atlassian Document Format (ADF) to extract text
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

  static extractAcceptanceCriteria(text) {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    // Look for explicit "Acceptance Criteria" header
    const patterns = [
      // Standard header formats
      /acceptance criteria[:\s]*\n?([\s\S]*?)(?=\n#{1,3}\s|\n---|\n\n\n|$)/i,
      /acceptance criteria[:\s]*([\s\S]*)/i,
      
      // Jira common format: h2 "Acceptance Criteria" followed by list
      /(?:^|\n)#{1,2}\s*acceptance criteria\s*\n([\s\S]*?)(?=\n#{1,3}\s|\n---|$)/i,
      
      // AC abbreviation
      /(?:^|\n)#{1,2}\s*ac\s*\n([\s\S]*?)(?=\n#{1,3}\s|\n---|$)/i,
      
      // Definition of Done section sometimes contains AC
      /(?:^|\n)#{1,2}\s*definition of done\s*\n([\s\S]*?)(?=\n#{1,3}\s|\n---|$)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 20) {
        return this.cleanText(match[1].trim());
      }
    }
    
    // Fallback: look for Gherkin-style Given/When/Then anywhere
    const gherkinPattern = /(?:given|when|then|and|but)\s+[\w\s]+/gi;
    const gherkinMatches = text.match(gherkinPattern);
    if (gherkinMatches && gherkinMatches.length > 2) {
      return this.cleanText(gherkinMatches.join('\n'));
    }
    
    // Last resort: if description is reasonably short, use it all
    if (text.length > 50 && text.length < 2000) {
      return this.cleanText(text);
    }
    
    // Extract first meaningful paragraph as fallback
    const firstPara = text.split(/\n\s*\n/)[0];
    if (firstPara && firstPara.length > 50) {
      return this.cleanText(firstPara);
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