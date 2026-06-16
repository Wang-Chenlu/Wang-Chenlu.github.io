import type { ReactNode } from 'react';

const UNICODE_SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
  '₊': '+',
  '₋': '-',
  '₌': '=',
  '₍': '(',
  '₎': ')',
  'ₐ': 'a',
  'ₑ': 'e',
  'ₕ': 'h',
  'ᵢ': 'i',
  'ⱼ': 'j',
  'ₖ': 'k',
  'ₗ': 'l',
  'ₘ': 'm',
  'ₙ': 'n',
  'ₒ': 'o',
  'ₚ': 'p',
  'ᵣ': 'r',
  'ₛ': 's',
  'ₜ': 't',
  'ᵤ': 'u',
  'ᵥ': 'v',
  'ₓ': 'x',
};

const UNICODE_SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '⁼': '=',
  '⁽': '(',
  '⁾': ')',
  'ⁿ': 'n',
  'ⁱ': 'i',
};

export default function UnicodeScriptText({ text }: { text: string }) {
  const chars = Array.from(text);
  const nodes: ReactNode[] = [];
  let plain = '';
  let script = '';
  let scriptType: 'sub' | 'sup' | null = null;

  const flushPlain = () => {
    if (!plain) return;
    nodes.push(plain);
    plain = '';
  };

  const flushScript = () => {
    if (!script || !scriptType) return;
    const key = `script-${nodes.length}`;
    nodes.push(scriptType === 'sub' ? <sub key={key}>{script}</sub> : <sup key={key}>{script}</sup>);
    script = '';
    scriptType = null;
  };

  chars.forEach((char, index) => {
    const subscript = UNICODE_SUBSCRIPT_MAP[char];
    const superscript = UNICODE_SUPERSCRIPT_MAP[char];
    const type = subscript !== undefined ? 'sub' : superscript !== undefined ? 'sup' : null;
    const value = subscript ?? superscript;

    if (type && value !== undefined) {
      flushPlain();
      if (scriptType && scriptType !== type) {
        flushScript();
      }
      scriptType = type;
      script += value;
      return;
    }

    const next = chars[index + 1];
    const nextContinuesScript =
      scriptType === 'sub'
        ? next !== undefined && UNICODE_SUBSCRIPT_MAP[next] !== undefined
        : scriptType === 'sup'
          ? next !== undefined && UNICODE_SUPERSCRIPT_MAP[next] !== undefined
          : false;

    if (char === '.' && scriptType && nextContinuesScript) {
      script += char;
      return;
    }

    flushScript();
    plain += char;
  });

  flushScript();
  flushPlain();

  return <>{nodes}</>;
}
