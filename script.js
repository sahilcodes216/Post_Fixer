/**
 * PostFixer — Main Application Logic
 * Standard Stack Infix-to-Postfix Converter & Trace Table Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeToggleBtn = document.getElementById('theme-toggle');
  const visitorCountEl = document.getElementById('visitor-count');

  const expressionInput = document.getElementById('expression-input');
  const clearInputBtn = document.getElementById('clear-input-btn');
  const convertBtn = document.getElementById('convert-btn');
  const postfixForm = document.getElementById('postfix-form');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const exampleChips = document.querySelectorAll('.example-chip');

  const resultsSection = document.getElementById('results-section');
  const currentExprTag = document.getElementById('current-expr-tag');
  const traceTbody = document.getElementById('trace-tbody');
  const finalPostfixEl = document.getElementById('final-postfix');
  const resetBtn = document.getElementById('reset-btn');

  // Step Player Controls
  const modeAllBtn = document.getElementById('mode-all-btn');
  const modeStepBtn = document.getElementById('mode-step-btn');
  const stepPlayerBar = document.getElementById('step-player-bar');
  const stepPrevBtn = document.getElementById('step-prev-btn');
  const stepPlayBtn = document.getElementById('step-play-btn');
  const stepNextBtn = document.getElementById('step-next-btn');
  const stepIndicator = document.getElementById('step-indicator');
  const playIcon = stepPlayBtn.querySelector('.play-icon');
  const pauseIcon = stepPlayBtn.querySelector('.pause-icon');

  // Application State
  let currentRows = [];
  let currentFinalPostfix = '';
  let currentExpr = '';
  let displayMode = 'all'; // 'all' | 'step'
  let currentStepIndex = 0;
  let playInterval = null;

  // --------------------------------------------------------------------------
  // 1. Theme Management
  // --------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem('postfixer_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('postfixer_theme', newTheme);
  });

  initTheme();

  // --------------------------------------------------------------------------
  // 2. Visitor Counter System (Dual-mode API + Local Fallback)
  // --------------------------------------------------------------------------
  async function initVisitorCounter() {
    let count = 0;
    try {
      // Try hit counter API with fresh key
      const res = await fetch('https://api.counterapi.dev/v1/postfixer-tool-v2/visits/up', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.count === 'number') {
          count = data.count;
        }
      }
    } catch (e) {
      // Silent fallback to local visits count
    }

    if (!count) {
      let localVisits = parseInt(localStorage.getItem('postfixer_visits_v2') || '0', 10);
      localVisits += 1;
      localStorage.setItem('postfixer_visits_v2', localVisits.toString());
      count = localVisits;
    }

    visitorCountEl.textContent = count.toLocaleString();
  }

  initVisitorCounter();

  // --------------------------------------------------------------------------
  // 3. Tokenizer & Validation Engine
  // --------------------------------------------------------------------------
  function tokenizeInfix(rawExpr) {
    const tokens = [];
    let i = 0;
    
    while (i < rawExpr.length) {
      const ch = rawExpr[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Multi-digit numbers (e.g. 14, 100, 7)
      if (/[0-9]/.test(ch)) {
        let num = '';
        while (i < rawExpr.length && /[0-9]/.test(rawExpr[i])) {
          num += rawExpr[i];
          i++;
        }
        tokens.push(num);
        continue;
      }

      // Identifier / letter operands (e.g. A, B, var1)
      if (/[a-zA-Z]/.test(ch)) {
        let id = '';
        while (i < rawExpr.length && /[a-zA-Z0-9_]/.test(rawExpr[i])) {
          id += rawExpr[i];
          i++;
        }
        tokens.push(id);
        continue;
      }

      // Operators & Parentheses
      if (/[+\-*/^()]/.test(ch)) {
        tokens.push(ch);
        i++;
        continue;
      }

      // Invalid character
      tokens.push({ invalid: true, char: ch, pos: i + 1 });
      i++;
    }

    return tokens;
  }

  function validateInfixExpression(rawExpr) {
    const tokens = tokenizeInfix(rawExpr);

    if (tokens.length === 0) {
      return { valid: false, message: 'Please enter an infix expression (e.g. 14/7*3-4+9/2 or A*B+C/D).' };
    }

    for (let i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object' && tokens[i].invalid) {
        return {
          valid: false,
          message: `Invalid character '${tokens[i].char}' at position ${tokens[i].pos}. Accepted: letters A-Z, digits 0-9, and operators + - * / ^ ( ).`
        };
      }
    }

    let parenDepth = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '(') parenDepth++;
      if (tokens[i] === ')') parenDepth--;
      if (parenDepth < 0) {
        return { valid: false, message: `Unbalanced parentheses: unexpected closing ')' at token ${i + 1}.` };
      }
    }
    if (parenDepth > 0) {
      return { valid: false, message: `Unbalanced parentheses: missing ${parenDepth} closing ')' ${parenDepth === 1 ? 'parenthesis' : 'parentheses'}.` };
    }

    const isOperator = (t) => ['+', '-', '*', '/', '^'].includes(t);
    const isOperand = (t) => !isOperator(t) && t !== '(' && t !== ')';

    if (isOperator(tokens[0])) {
      return { valid: false, message: `Expression cannot start with an operator '${tokens[0]}'.` };
    }

    if (isOperator(tokens[tokens.length - 1])) {
      return { valid: false, message: `Expression cannot end with an operator '${tokens[tokens.length - 1]}'.` };
    }

    for (let i = 0; i < tokens.length - 1; i++) {
      const curr = tokens[i];
      const next = tokens[i + 1];

      if (isOperand(curr) && isOperand(next)) {
        return { valid: false, message: `Missing operator between operands '${curr}' and '${next}'.` };
      }
      if (isOperand(curr) && next === '(') {
        return { valid: false, message: `Missing operator between operand '${curr}' and '('.` };
      }
      if (curr === ')' && isOperand(next)) {
        return { valid: false, message: `Missing operator between ')' and operand '${next}'.` };
      }
      if (curr === ')' && next === '(') {
        return { valid: false, message: `Missing operator between ')' and '('.` };
      }
      if (curr === '(' && next === ')') {
        return { valid: false, message: `Empty parentheses '()' found.` };
      }
      if (curr === '(' && isOperator(next)) {
        return { valid: false, message: `Unexpected operator '${next}' directly after '('.` };
      }
      if (isOperator(curr) && next === ')') {
        return { valid: false, message: `Unexpected operator '${curr}' directly before ')'.` };
      }
      if (isOperator(curr) && isOperator(next)) {
        return { valid: false, message: `Adjacent operators '${curr}' and '${next}' found.` };
      }
    }

    return { valid: true };
  }

  function formatPostfix(postfixArr) {
    if (!postfixArr || postfixArr.length === 0) return '';
    const hasMultiCharOrNumeric = postfixArr.some(t => t.length > 1 || /\d/.test(t));
    return hasMultiCharOrNumeric ? postfixArr.join(' ') : postfixArr.join('');
  }

  // --------------------------------------------------------------------------
  // 4. Infix to Postfix Conversion Algorithm (Textbook Sentinel Mode)
  // --------------------------------------------------------------------------
  function convertInfixToPostfix(rawExpr) {
    const tokens = tokenizeInfix(rawExpr);
    const stack = [];
    const postfix = [];
    const rows = [];

    const precedence = (op) => {
      if (op === '^') return 3;
      if (op === '*' || op === '/') return 2;
      if (op === '+' || op === '-') return 1;
      if (op === '(') return 0;
      return -1;
    };

    const associativity = (op) => (op === '^' ? 'right' : 'left');
    const isOperator = (t) => ['+', '-', '*', '/', '^'].includes(t);
    const isOperand = (t) => !isOperator(t) && t !== '(' && t !== ')';

    // Lipschutz / Textbook Sentinel convention:
    stack.push('(');
    rows.push({
      token: '(',
      type: 'paren',
      stack: [...stack],
      postfix: [...postfix]
    });

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      if (isOperand(tok)) {
        postfix.push(tok);
        rows.push({
          token: tok,
          type: 'operand',
          stack: [...stack],
          postfix: [...postfix]
        });
      } else if (tok === '(') {
        stack.push(tok);
        rows.push({
          token: tok,
          type: 'paren',
          stack: [...stack],
          postfix: [...postfix]
        });
      } else if (tok === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          postfix.push(stack.pop());
        }
        if (stack.length > 0) stack.pop();
        rows.push({
          token: tok,
          type: 'paren',
          stack: [...stack],
          postfix: [...postfix]
        });
      } else {
        // Operator: + - * / ^
        while (
          stack.length > 0 &&
          stack[stack.length - 1] !== '(' &&
          (precedence(stack[stack.length - 1]) > precedence(tok) ||
            (precedence(stack[stack.length - 1]) === precedence(tok) &&
              associativity(tok) === 'left'))
        ) {
          postfix.push(stack.pop());
        }
        stack.push(tok);
        rows.push({
          token: tok,
          type: 'operator',
          stack: [...stack],
          postfix: [...postfix]
        });
      }
    }

    // Sentinel ')' processing
    while (stack.length > 0 && stack[stack.length - 1] !== '(') {
      postfix.push(stack.pop());
    }
    
    rows.push({
      token: ')',
      type: 'paren',
      stack: [...stack],
      postfix: [...postfix]
    });

    if (stack.length > 0) stack.pop();

    rows.push({
      token: 'End',
      type: 'end',
      stack: [...stack],
      postfix: [...postfix]
    });

    return {
      rows,
      finalPostfix: formatPostfix(postfix)
    };
  }

  // --------------------------------------------------------------------------
  // 5. Rendering Engine
  // --------------------------------------------------------------------------
  function renderTraceTable(rows, maxStepIndex = rows.length - 1) {
    traceTbody.innerHTML = '';

    rows.forEach((row, idx) => {
      if (idx > maxStepIndex) return;

      const tr = document.createElement('tr');
      if (displayMode === 'step' && idx === maxStepIndex) {
        tr.classList.add('active-step');
      }

      // Step Number
      const tdStep = document.createElement('td');
      tdStep.className = 'col-step';
      tdStep.textContent = idx + 1;

      // Token Cell
      const tdToken = document.createElement('td');
      tdToken.className = 'col-token';
      if (row.token === 'End') {
        const emptyToken = document.createElement('span');
        emptyToken.className = 'token-empty';
        emptyToken.textContent = '';
        tdToken.appendChild(emptyToken);
      } else {
        const tokenBadge = document.createElement('span');
        tokenBadge.className = `token-badge token-${row.type}`;
        tokenBadge.textContent = row.token;
        tdToken.appendChild(tokenBadge);
      }

      // Stack Cell (Bottom -> Top)
      const tdStack = document.createElement('td');
      tdStack.className = 'col-stack';
      if (row.stack.length === 0) {
        const emptySpan = document.createElement('span');
        emptySpan.className = 'stack-empty';
        emptySpan.textContent = 'ϕ (empty)';
        tdStack.appendChild(emptySpan);
      } else {
        const stackWrapper = document.createElement('div');
        stackWrapper.className = 'stack-display';
        stackWrapper.textContent = row.stack.join('');
        tdStack.appendChild(stackWrapper);
      }

      // Postfix Cell
      const tdPostfix = document.createElement('td');
      tdPostfix.className = 'col-postfix';
      const postfixSpan = document.createElement('span');
      postfixSpan.className = 'postfix-display';
      postfixSpan.textContent = formatPostfix(row.postfix);
      tdPostfix.appendChild(postfixSpan);

      tr.appendChild(tdStep);
      tr.appendChild(tdToken);
      tr.appendChild(tdStack);
      tr.appendChild(tdPostfix);

      traceTbody.appendChild(tr);
    });

    // Update Output Callout Result
    const currentStepRow = rows[Math.min(maxStepIndex, rows.length - 1)];
    const finalVal = currentStepRow ? formatPostfix(currentStepRow.postfix) : '';
    finalPostfixEl.textContent = finalVal || '';
  }

  function updateStepPlayerUI() {
    if (!currentRows || currentRows.length === 0) return;

    stepIndicator.textContent = `Step ${currentStepIndex + 1} / ${currentRows.length}`;
    stepPrevBtn.disabled = currentStepIndex === 0;
    stepNextBtn.disabled = currentStepIndex === currentRows.length - 1;

    renderTraceTable(currentRows, currentStepIndex);

    // Scroll active step row into view if needed
    const activeRow = traceTbody.querySelector('.active-step');
    if (activeRow) {
      activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function stopAutoPlay() {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');

    playInterval = setInterval(() => {
      if (currentStepIndex < currentRows.length - 1) {
        currentStepIndex++;
        updateStepPlayerUI();
      } else {
        stopAutoPlay();
      }
    }, 900);
  }

  // --------------------------------------------------------------------------
  // 6. Action Handlers & Event Listeners
  // --------------------------------------------------------------------------
  function handleConvert() {
    const rawExpr = expressionInput.value;
    const validation = validateInfixExpression(rawExpr);

    if (!validation.valid) {
      errorText.textContent = validation.message;
      errorMessage.classList.remove('hidden');
      return;
    }

    // Hide error banner on valid input
    errorMessage.classList.add('hidden');

    const cleanExpr = rawExpr.replace(/\s+/g, '');
    const result = convertInfixToPostfix(cleanExpr);

    currentRows = result.rows;
    currentFinalPostfix = result.finalPostfix;
    currentExpr = cleanExpr;

    currentExprTag.textContent = `Infix: ${cleanExpr}`;
    resultsSection.classList.remove('hidden');

    if (displayMode === 'all') {
      currentStepIndex = currentRows.length - 1;
      renderTraceTable(currentRows);
    } else {
      currentStepIndex = 0;
      updateStepPlayerUI();
    }

    // Smooth scroll to trace table
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Input events
  expressionInput.addEventListener('input', () => {
    if (expressionInput.value.trim().length > 0) {
      clearInputBtn.classList.remove('hidden');
    } else {
      clearInputBtn.classList.add('hidden');
    }
  });

  clearInputBtn.addEventListener('click', () => {
    expressionInput.value = '';
    clearInputBtn.classList.add('hidden');
    expressionInput.focus();
  });

  postfixForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleConvert();
  });

  // Example Chips Click
  exampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const expr = chip.getAttribute('data-expr');
      expressionInput.value = expr;
      clearInputBtn.classList.remove('hidden');
      handleConvert();
    });
  });

  // Mode Toggle (All Rows vs Step-by-Step)
  modeAllBtn.addEventListener('click', () => {
    displayMode = 'all';
    modeAllBtn.classList.add('active');
    modeStepBtn.classList.remove('active');
    stepPlayerBar.classList.add('hidden');
    stopAutoPlay();
    if (currentRows.length > 0) {
      currentStepIndex = currentRows.length - 1;
      renderTraceTable(currentRows);
    }
  });

  modeStepBtn.addEventListener('click', () => {
    displayMode = 'step';
    modeStepBtn.classList.add('active');
    modeAllBtn.classList.remove('active');
    stepPlayerBar.classList.remove('hidden');
    if (currentRows.length > 0) {
      currentStepIndex = 0;
      updateStepPlayerUI();
    }
  });

  // Step Player Controls
  stepPrevBtn.addEventListener('click', () => {
    stopAutoPlay();
    if (currentStepIndex > 0) {
      currentStepIndex--;
      updateStepPlayerUI();
    }
  });

  stepNextBtn.addEventListener('click', () => {
    stopAutoPlay();
    if (currentStepIndex < currentRows.length - 1) {
      currentStepIndex++;
      updateStepPlayerUI();
    }
  });

  stepPlayBtn.addEventListener('click', () => {
    if (playInterval) {
      stopAutoPlay();
    } else {
      if (currentStepIndex >= currentRows.length - 1) {
        currentStepIndex = 0;
      }
      startAutoPlay();
    }
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    stopAutoPlay();
    expressionInput.value = '';
    clearInputBtn.classList.add('hidden');
    errorMessage.classList.add('hidden');
    resultsSection.classList.add('hidden');
    currentRows = [];
    currentFinalPostfix = '';
    currentExpr = '';
    expressionInput.focus();
  });
});
