
export const highlightCode = (code: string): string => {
  if (!code) return ' ';
  
  const escape = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Tokenizer for Origami/PHP/Generic C-like
  // 1. Strings
  // 2. Comments
  // 3. Variables ($var)
  // 4. Numbers
  // 5. Keywords
  // 6. Types
  // 7. Function calls
  // 8. Whitespace
  // 9. Other
  const tokenRegex = /("(?:[^"\\]|\\.)*")|(\/\/.*|\/\*[\s\S]*?\*\/|#.*)|(\$[a-zA-Z_][a-zA-Z0-9_]*)|(\b\d+\b)|(\b(?:function|fn|let|const|var|struct|class|interface|public|private|protected|import|from|use|return|if|else|match|switch|case|break|continue|for|foreach|while|do|as|in|extern|spawn|defer|echo|print|new|static|final|extends|implements|try|catch|throw|async|await)\b)|(\b(?:int|float|string|bool|void|u8|u64|i32|array|map|list|object|mixed|null|true|false)\b)|([a-zA-Z_][a-zA-Z0-9_]*\s*\()|(\s+)|(.)/g;
  
  let html = '';
  let match;
  
  while ((match = tokenRegex.exec(code)) !== null) {
      const [full, str, comment, variable, num, keyword, type, funcCall, space, other] = match;
      
      if (str) {
          html += `<span class="text-green-400">${escape(str)}</span>`;
      } else if (comment) {
          html += `<span class="text-gray-500 italic">${escape(comment)}</span>`;
      } else if (variable) {
          html += `<span class="text-orange-400">${escape(variable)}</span>`;
      } else if (num) {
           html += `<span class="text-origami-blue">${escape(num)}</span>`;
      } else if (keyword) {
          html += `<span class="text-origami-magenta font-bold">${escape(keyword)}</span>`;
      } else if (type) {
          html += `<span class="text-origami-cyan">${escape(type)}</span>`;
      } else if (funcCall) {
          const parenIndex = funcCall.indexOf('(');
          const name = funcCall.substring(0, parenIndex);
          html += `<span class="text-yellow-200">${escape(name)}</span>(`;
      } else if (space) {
          html += space;
      } else if (other) {
           html += escape(other);
      }
  }
  return html;
};
