'use client';

import React from 'react';

// Detects code patterns in text
function isCodeLine(line: string): boolean {
  const codePatterns = [
    /^\s*(import |from |def |class |if |elif |else:|for |while |try:|except|return |print\(|with )/,
    /^\s*(df|pd|np|plt|sns|model|app|urlpatterns|views)\./,
    /^\s*[a-zA-Z_]\w*\s*[=]\s*/,
    /^\s*#/,
    /^\s*\{|\s*\}|\s*\[|\s*\]/,
    /^\s*\)/,
    /^\s*\.\w+\(/,
    /^\s*\'|^\s*\"|^\s*f\"/,
    /^\s*@/,
    /^\s*pip install/,
    /^\s*python /,
    /^\s*>>> /,
  ];
  return codePatterns.some(p => p.test(line));
}

function splitTextAndCode(text: string): { type: 'text' | 'code'; content: string }[] {
  const lines = text.split('\n');
  const blocks: { type: 'text' | 'code'; content: string }[] = [];
  let currentType: 'text' | 'code' = 'text';
  let currentLines: string[] = [];

  for (const line of lines) {
    const lineType = isCodeLine(line) ? 'code' : 'text';

    if (lineType !== currentType && currentLines.length > 0) {
      blocks.push({ type: currentType, content: currentLines.join('\n') });
      currentLines = [];
    }
    currentType = lineType;
    currentLines.push(line);
  }

  if (currentLines.length > 0) {
    blocks.push({ type: currentType, content: currentLines.join('\n') });
  }

  // Merge isolated single text lines between code blocks into code
  for (let i = 1; i < blocks.length - 1; i++) {
    if (
      blocks[i].type === 'text' &&
      blocks[i - 1].type === 'code' &&
      blocks[i + 1].type === 'code' &&
      blocks[i].content.split('\n').length <= 2
    ) {
      blocks[i].type = 'code';
    }
  }

  // Merge consecutive same-type blocks
  const merged: typeof blocks = [];
  for (const block of blocks) {
    if (merged.length > 0 && merged[merged.length - 1].type === block.type) {
      merged[merged.length - 1].content += '\n' + block.content;
    } else {
      merged.push({ ...block });
    }
  }

  return merged;
}

export default function QuestionText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  const blocks = splitTextAndCode(text);

  return (
    <div className={`question-text ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <pre
              key={idx}
              className="bg-[#1e293b] text-green-400 text-sm font-mono rounded-lg p-4 my-3 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words"
            >
              {block.content}
            </pre>
          );
        }
        return (
          <p key={idx} className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
