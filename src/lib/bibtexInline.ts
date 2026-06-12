import type { BibTeXInlineNode } from '@/types/publication';

const commandTypes: Record<string, Exclude<BibTeXInlineNode['type'], 'text'>> = {
  emph: 'em',
  textit: 'em',
  textbf: 'strong',
  textsc: 'smallCaps',
  textsuperscript: 'sup',
  textsubscript: 'sub',
};

const accentMarks: Record<string, string> = {
  '"': '\u0308',
  "'": '\u0301',
  '`': '\u0300',
  '^': '\u0302',
  '~': '\u0303',
  '=': '\u0304',
  '.': '\u0307',
  u: '\u0306',
  v: '\u030c',
  H: '\u030b',
  c: '\u0327',
  k: '\u0328',
  r: '\u030a',
  b: '\u0331',
  d: '\u0323',
};

interface ParseResult {
  nodes: BibTeXInlineNode[];
  index: number;
}

export interface ParsedBibTeXInline {
  plainText: string;
  nodes: BibTeXInlineNode[];
}

function normalizeBibTeXInput(value: string): string {
  return value
    .replace(/^["']|["']$/g, '')
    .replace(/\{\$\^\{?\\circ\}?\$\}/g, '°')
    .replace(/\$\^\{?\\circ\}?\$/g, '°')
    .replace(/\\textdegree\b/g, '°')
    .replace(/``/g, '\u201c')
    .replace(/''/g, '\u201d')
    .replace(/---/g, '\u2014')
    .replace(/--/g, '\u2013');
}

function pushText(nodes: BibTeXInlineNode[], text: string) {
  if (!text) return;

  const last = nodes[nodes.length - 1];
  if (last?.type === 'text') {
    last.text += text;
    return;
  }

  nodes.push({ type: 'text', text });
}

function readCommand(value: string, index: number): { command: string; index: number } {
  let cursor = index;
  let command = '';

  while (cursor < value.length && /[A-Za-z]/.test(value[cursor])) {
    command += value[cursor];
    cursor += 1;
  }

  if (!command && cursor < value.length) {
    command = value[cursor];
    cursor += 1;
  }

  return { command, index: cursor };
}

function composeAccent(command: string, text: string): string {
  const accent = accentMarks[command];
  if (!accent || !text) {
    return text;
  }

  return `${text[0]}${accent}`.normalize('NFC') + text.slice(1);
}

function tryParseAccent(value: string, command: string, afterCommand: number): { text: string; index: number } | null {
  if (!accentMarks[command]) {
    return null;
  }

  if (value[afterCommand] === '{') {
    const parsedGroup = parseGroup(value, afterCommand);
    if (parsedGroup) {
      return {
        text: composeAccent(command, flattenBibTeXInlineNodes(parsedGroup.nodes)),
        index: parsedGroup.index,
      };
    }
  }

  if (afterCommand < value.length) {
    return {
      text: composeAccent(command, value[afterCommand]),
      index: afterCommand + 1,
    };
  }

  return null;
}

function parseGroup(value: string, index: number): ParseResult | null {
  if (value[index] !== '{') {
    return null;
  }

  return parseNodes(value, index + 1, true);
}

function parseNodes(value: string, startIndex: number, stopAtBrace: boolean): ParseResult {
  const nodes: BibTeXInlineNode[] = [];
  let index = startIndex;

  while (index < value.length) {
    const char = value[index];

    if (char === '}' && stopAtBrace) {
      return { nodes, index: index + 1 };
    }

    if (char === '{') {
      const parsedGroup = parseGroup(value, index);
      if (parsedGroup) {
        nodes.push(...parsedGroup.nodes);
        index = parsedGroup.index;
        continue;
      }
    }

    if (char === '\\') {
      const { command, index: afterCommand } = readCommand(value, index + 1);

      if (command === 'cite') {
        const citationGroup = parseGroup(value, afterCommand);
        index = citationGroup?.index ?? afterCommand;
        continue;
      }

      const parsedAccent = tryParseAccent(value, command, afterCommand);
      if (parsedAccent) {
        pushText(nodes, parsedAccent.text);
        index = parsedAccent.index;
        continue;
      }

      const nodeType = commandTypes[command];
      if (nodeType && value[afterCommand] === '{') {
        const parsedGroup = parseGroup(value, afterCommand);
        if (parsedGroup) {
          nodes.push({ type: nodeType, children: parsedGroup.nodes });
          index = parsedGroup.index;
          continue;
        }
      }

      pushText(nodes, command ? command : '\\');
      index = afterCommand;
      continue;
    }

    if (char === '~') {
      pushText(nodes, ' ');
      index += 1;
      continue;
    }

    pushText(nodes, char);
    index += 1;
  }

  return { nodes, index };
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function flattenBibTeXInlineNodes(nodes: BibTeXInlineNode[]): string {
  return nodes.map((node) => {
    if (node.type === 'text') {
      return node.text;
    }
    return flattenBibTeXInlineNodes(node.children);
  }).join('');
}

export function parseBibTeXInline(value?: string): ParsedBibTeXInline {
  if (!value) {
    return { plainText: '', nodes: [] };
  }

  const parsed = parseNodes(normalizeBibTeXInput(value), 0, false);
  const plainText = compactWhitespace(flattenBibTeXInlineNodes(parsed.nodes));

  return {
    plainText,
    nodes: parsed.nodes,
  };
}
