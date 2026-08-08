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

  // Postfix Evaluation DOM Elements
  const evalSection = document.getElementById('eval-section');
  const evalTbody = document.getElementById('eval-tbody');
  const evalFinalVal = document.getElementById('eval-final-val');
  const evalToggleBtn = document.getElementById('eval-toggle-btn');
  const evalContent = document.getElementById('eval-content');

  if (evalToggleBtn && evalContent) {
    evalToggleBtn.addEventListener('click', () => {
      const isExpanded = evalToggleBtn.getAttribute('aria-expanded') === 'true';
      evalToggleBtn.setAttribute('aria-expanded', !isExpanded);
      evalContent.classList.toggle('hidden', isExpanded);
      evalSection.classList.toggle('collapsed', isExpanded);
    });
  }

  // Step Player Controls
  const modeAllBtn = document.getElementById('mode-all-btn');
  const modeStepBtn = document.getElementById('mode-step-btn');
  const stepPlayerBarTop = document.getElementById('step-player-bar-top');
  const stepPlayerContainerBottom = document.getElementById('step-player-container-bottom');

  const stepPrevBtns = document.querySelectorAll('.step-prev-btn');
  const stepPlayBtns = document.querySelectorAll('.step-play-btn');
  const stepNextBtns = document.querySelectorAll('.step-next-btn');
  const stepIndicators = document.querySelectorAll('.step-indicator');

  // Application State
  let converterMode = 'postfix'; // 'postfix' | 'prefix'
  let currentRows = [];
  let currentFinalPostfix = '';
  let currentExpr = '';
  let displayMode = 'all'; // 'all' | 'step'
  let currentStepIndex = 0;
  let playInterval = null;

  // Dynamic Header & Label Elements
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const traceResultHeader = document.getElementById('trace-result-header');
  const finalResultLabel = document.getElementById('final-result-label');
  const finalResultSub = document.getElementById('final-result-sub');
  const evalCardTitle = document.getElementById('eval-card-title');

  // Prefix Step Card Elements
  const prefixStep1Card = document.getElementById('prefix-step1-card');
  const prefixOrigExpr = document.getElementById('prefix-orig-expr');
  const prefixRevExpr = document.getElementById('prefix-rev-expr');
  const step2Badge = document.getElementById('step2-badge');
  const traceTableTitle = document.getElementById('trace-table-title');
  const prefixStep3Card = document.getElementById('prefix-step3-card');
  const prefixIntermediatePostfix = document.getElementById('prefix-intermediate-postfix');

  // Mode Switcher Buttons
  const modePostfixBtn = document.getElementById('mode-postfix-btn');
  const modePrefixBtn = document.getElementById('mode-prefix-btn');

  function updateConverterModeUI(mode) {
    converterMode = mode;

    if (mode === 'postfix') {
      if (modePostfixBtn) {
        modePostfixBtn.classList.add('active');
        modePostfixBtn.setAttribute('aria-selected', 'true');
      }
      if (modePrefixBtn) {
        modePrefixBtn.classList.remove('active');
        modePrefixBtn.setAttribute('aria-selected', 'false');
      }

      if (prefixStep1Card) prefixStep1Card.classList.add('hidden');
      if (prefixStep3Card) prefixStep3Card.classList.add('hidden');
      if (step2Badge) step2Badge.classList.add('hidden');
      if (traceTableTitle) traceTableTitle.textContent = 'Algorithm Trace Table';

      if (heroTitle) heroTitle.textContent = 'Infix to Postfix Converter';
      if (heroSubtitle) heroSubtitle.innerHTML = 'Convert infix expressions into Postfix with a complete textbook <strong>Token / Stack / Postfix</strong> trace table.';
      if (traceResultHeader) traceResultHeader.textContent = 'Postfix';
      if (finalResultLabel) finalResultLabel.textContent = 'Final Postfix Result';
      if (finalResultSub) finalResultSub.textContent = 'Reverse Polish Notation';
      if (evalCardTitle) evalCardTitle.textContent = 'Verification by Evaluating the Postfix Expression';
    } else {
      if (modePrefixBtn) {
        modePrefixBtn.classList.add('active');
        modePrefixBtn.setAttribute('aria-selected', 'true');
      }
      if (modePostfixBtn) {
        modePostfixBtn.classList.remove('active');
        modePostfixBtn.setAttribute('aria-selected', 'false');
      }

      if (prefixStep1Card) prefixStep1Card.classList.remove('hidden');
      if (prefixStep3Card) prefixStep3Card.classList.remove('hidden');
      if (step2Badge) step2Badge.classList.remove('hidden');
      if (traceTableTitle) traceTableTitle.textContent = 'Convert Reversed Expression to Postfix';

      if (heroTitle) heroTitle.textContent = 'Infix to Prefix Converter';
      if (heroSubtitle) heroSubtitle.innerHTML = 'Convert infix expressions into Prefix with a complete textbook <strong>Token / Stack / Prefix</strong> trace table.';
      if (traceResultHeader) traceResultHeader.textContent = 'Postfix';
      if (finalResultLabel) finalResultLabel.textContent = 'Final Prefix Result';
      if (finalResultSub) finalResultSub.textContent = 'Reverse of Postfix Expression (Polish Notation)';
      if (evalCardTitle) evalCardTitle.textContent = 'Verification by Evaluating the Prefix Expression';
    }

    if (expressionInput.value.trim().length > 0 && resultsSection && !resultsSection.classList.contains('hidden')) {
      handleConvert();
    }
  }

  if (modePostfixBtn) modePostfixBtn.addEventListener('click', () => updateConverterModeUI('postfix'));
  if (modePrefixBtn) modePrefixBtn.addEventListener('click', () => updateConverterModeUI('prefix'));

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
  // 4b. Infix to Prefix Conversion Algorithm (Reversed Sentinel Mode)
  // --------------------------------------------------------------------------
  function convertInfixToPrefix(rawExpr) {
    const tokens = tokenizeInfix(rawExpr);

    const reversedTokens = [];
    for (let i = tokens.length - 1; i >= 0; i--) {
      const tok = tokens[i];
      if (tok === '(') reversedTokens.push(')');
      else if (tok === ')') reversedTokens.push('(');
      else reversedTokens.push(tok);
    }

    const stack = [];
    const prefixRev = [];
    const rows = [];

    const precedence = (op) => {
      if (op === '^') return 3;
      if (op === '*' || op === '/') return 2;
      if (op === '+' || op === '-') return 1;
      if (op === '(') return 0;
      return -1;
    };

    const isOperator = (t) => ['+', '-', '*', '/', '^'].includes(t);
    const isOperand = (t) => !isOperator(t) && t !== '(' && t !== ')';

    stack.push('(');
    rows.push({
      token: '(',
      type: 'paren',
      stack: [...stack],
      postfix: [...prefixRev]
    });

    for (let i = 0; i < reversedTokens.length; i++) {
      const tok = reversedTokens[i];

      if (isOperand(tok)) {
        prefixRev.push(tok);
        rows.push({
          token: tok,
          type: 'operand',
          stack: [...stack],
          postfix: [...prefixRev]
        });
      } else if (tok === '(') {
        stack.push(tok);
        rows.push({
          token: tok,
          type: 'paren',
          stack: [...stack],
          postfix: [...prefixRev]
        });
      } else if (tok === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          prefixRev.push(stack.pop());
        }
        if (stack.length > 0) stack.pop();
        rows.push({
          token: tok,
          type: 'paren',
          stack: [...stack],
          postfix: [...prefixRev]
        });
      } else {
        let isEqualPrecPushed = false;

        while (
          stack.length > 0 &&
          stack[stack.length - 1] !== '(' &&
          (tok === '^'
            ? precedence(stack[stack.length - 1]) >= precedence(tok)
            : precedence(stack[stack.length - 1]) > precedence(tok))
        ) {
          prefixRev.push(stack.pop());
        }

        if (
          stack.length > 0 &&
          stack[stack.length - 1] !== '(' &&
          precedence(stack[stack.length - 1]) === precedence(tok) &&
          tok !== '^'
        ) {
          isEqualPrecPushed = true;
        }

        stack.push(tok);
        rows.push({
          token: tok,
          type: 'operator',
          stack: [...stack],
          postfix: [...prefixRev],
          explanation: isEqualPrecPushed ? '(pushed, not popped)' : null
        });
      }
    }

    while (stack.length > 0 && stack[stack.length - 1] !== '(') {
      prefixRev.push(stack.pop());
    }

    rows.push({
      token: ')',
      type: 'paren',
      stack: [...stack],
      postfix: [...prefixRev]
    });

    if (stack.length > 0) stack.pop();

    const finalPrefixArr = [...prefixRev].reverse();

    rows.push({
      token: 'End',
      type: 'end',
      stack: [...stack],
      postfix: [...prefixRev]
    });

    return {
      rows,
      origInfix: formatPostfix(tokens),
      revInfix: formatPostfix(reversedTokens),
      intermediatePostfix: formatPostfix(prefixRev),
      finalPostfix: formatPostfix(finalPrefixArr)
    };
  }

  // --------------------------------------------------------------------------
  // 5. Rendering Engine
  // --------------------------------------------------------------------------
  let currentResultData = null;

  function renderTraceTable(rows, maxStepIndex = rows.length - 1) {
    traceTbody.innerHTML = '';

    if (converterMode === 'prefix' && currentResultData) {
      if (prefixOrigExpr) prefixOrigExpr.textContent = currentResultData.origInfix || '';
      if (prefixRevExpr) prefixRevExpr.textContent = currentResultData.revInfix || '';
      if (prefixIntermediatePostfix) prefixIntermediatePostfix.textContent = currentResultData.intermediatePostfix || '';
    }

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

        const stackText = document.createTextNode(row.stack.join(''));
        stackWrapper.appendChild(stackText);

        if (converterMode === 'prefix' && row.explanation) {
          const expSpan = document.createElement('span');
          expSpan.className = 'stack-explanation';
          expSpan.textContent = ` ${row.explanation}`;
          stackWrapper.appendChild(expSpan);
        }

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
    const finalVal = converterMode === 'prefix'
      ? (currentResultData ? currentResultData.finalPostfix : '')
      : (currentStepRow ? formatPostfix(currentStepRow.postfix) : '');
    finalPostfixEl.textContent = finalVal || '';

    // Update Evaluation Verification Table (Numeric operands only)
    if (isNumericExpression(currentExpr)) {
      evalSection.classList.remove('hidden');
      if (currentStepRow) {
        let resultTokens;
        if (converterMode === 'prefix') {
          resultTokens = (currentResultData ? currentResultData.finalPostfix : '').split(/\s+/).filter(Boolean);
        } else {
          resultTokens = currentStepRow.postfix;
        }
        renderEvalTable(resultTokens);
      }
    } else {
      evalSection.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // 5b. Evaluation Engine (Numeric Expressions Verification)
  // --------------------------------------------------------------------------
  function isNumericExpression(rawExpr) {
    if (!rawExpr) return false;
    const tokens = tokenizeInfix(rawExpr);
    const isOperator = (t) => ['+', '-', '*', '/', '^'].includes(t);
    const isOperand = (t) => typeof t === 'string' && !isOperator(t) && t !== '(' && t !== ')';
    const operands = tokens.filter(isOperand);
    return operands.length > 0 && operands.every(op => /^\d+(\.\d+)?$/.test(op));
  }

  function evaluatePostfix(postfixTokens) {
    const evalStack = [];
    const evalRows = [];
    const isOperator = (t) => ['+', '-', '*', '/', '^'].includes(t);

    for (let i = 0; i < postfixTokens.length; i++) {
      const tok = postfixTokens[i];

      if (!isOperator(tok)) {
        evalStack.push(parseFloat(tok));
        evalRows.push({
          step: i + 1,
          token: tok,
          type: 'operand',
          stack: [...evalStack]
        });
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        let res = 0;

        if (tok === '+') res = a + b;
        else if (tok === '-') res = a - b;
        else if (tok === '*') res = a * b;
        else if (tok === '/') res = (b !== undefined && b !== 0) ? a / b : NaN;
        else if (tok === '^') res = Math.pow(a, b);

        if (typeof res === 'number' && !Number.isInteger(res) && !isNaN(res)) {
          res = Math.round(res * 10000) / 10000;
        }

        evalStack.push(res);

        const opSymbol = tok === '*' ? '×' : (tok === '/' ? '÷' : tok);
        const explanation = `(popped ${b},${a} → ${a}${opSymbol}${b}=${res})`;

        evalRows.push({
          step: i + 1,
          token: tok,
          type: 'operator',
          stack: [...evalStack],
          explanation: explanation
        });
      }
    }

    const finalValue = evalStack.length > 0 ? evalStack[evalStack.length - 1] : '';

    return {
      rows: evalRows,
      finalValue: finalValue
    };
  }

  function evaluatePrefix(prefixTokens) {
    const evalStack = [];
    const evalRows = [];
    const isOperator = (t) => ['+', '-', '*', '/', '^'].includes(t);

    for (let i = prefixTokens.length - 1; i >= 0; i--) {
      const tok = prefixTokens[i];

      if (!isOperator(tok)) {
        evalStack.push(parseFloat(tok));
        evalRows.push({
          step: prefixTokens.length - i,
          token: tok,
          type: 'operand',
          stack: [...evalStack]
        });
      } else {
        const a = evalStack.pop();
        const b = evalStack.pop();
        let res = 0;

        if (tok === '+') res = a + b;
        else if (tok === '-') res = a - b;
        else if (tok === '*') res = a * b;
        else if (tok === '/') res = (b !== undefined && b !== 0) ? a / b : NaN;
        else if (tok === '^') res = Math.pow(a, b);

        if (typeof res === 'number' && !Number.isInteger(res) && !isNaN(res)) {
          res = Math.round(res * 10000) / 10000;
        }

        evalStack.push(res);

        const opSymbol = tok === '*' ? '×' : (tok === '/' ? '÷' : tok);
        const explanation = `(popped ${a},${b} → ${a}${opSymbol}${b}=${res})`;

        evalRows.push({
          step: prefixTokens.length - i,
          token: tok,
          type: 'operator',
          stack: [...evalStack],
          explanation: explanation
        });
      }
    }

    const finalValue = evalStack.length > 0 ? evalStack[evalStack.length - 1] : '';

    return {
      rows: evalRows,
      finalValue: finalValue
    };
  }

  function renderEvalTable(resultTokens) {
    if (!evalTbody) return;
    evalTbody.innerHTML = '';

    if (!resultTokens || resultTokens.length === 0) {
      evalFinalVal.textContent = '0';
      return;
    }

    const { rows, finalValue } = converterMode === 'prefix'
      ? evaluatePrefix(resultTokens)
      : evaluatePostfix(resultTokens);

    evalFinalVal.textContent = (finalValue !== '' && !isNaN(finalValue)) ? finalValue : '0';

    rows.forEach((row) => {
      const tr = document.createElement('tr');

      // Scanned Token
      const tdToken = document.createElement('td');
      tdToken.className = 'col-token';
      const tokenBadge = document.createElement('span');
      tokenBadge.className = `token-badge token-${row.type}`;
      tokenBadge.textContent = row.token;
      tdToken.appendChild(tokenBadge);

      // Stack
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

        const stackText = document.createTextNode(row.stack.join(','));
        stackWrapper.appendChild(stackText);

        if (row.explanation) {
          const expSpan = document.createElement('span');
          expSpan.className = 'eval-explanation';
          expSpan.textContent = ` ${row.explanation}`;
          stackWrapper.appendChild(expSpan);
        }

        tdStack.appendChild(stackWrapper);
      }

      tr.appendChild(tdToken);
      tr.appendChild(tdStack);

      evalTbody.appendChild(tr);
    });
  }

  function updateStepPlayerUI() {
    if (!currentRows || currentRows.length === 0) return;

    stepIndicators.forEach(ind => {
      ind.textContent = `Step ${currentStepIndex + 1} / ${currentRows.length}`;
    });

    stepPrevBtns.forEach(btn => {
      btn.disabled = currentStepIndex === 0;
    });

    stepNextBtns.forEach(btn => {
      btn.disabled = currentStepIndex === currentRows.length - 1;
    });

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
      stepPlayBtns.forEach(btn => {
        const pIcon = btn.querySelector('.play-icon');
        const paIcon = btn.querySelector('.pause-icon');
        if (pIcon) pIcon.classList.remove('hidden');
        if (paIcon) paIcon.classList.add('hidden');
      });
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    stepPlayBtns.forEach(btn => {
      const pIcon = btn.querySelector('.play-icon');
      const paIcon = btn.querySelector('.pause-icon');
      if (pIcon) pIcon.classList.add('hidden');
      if (paIcon) paIcon.classList.remove('hidden');
    });

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
    const result = converterMode === 'prefix'
      ? convertInfixToPrefix(cleanExpr)
      : convertInfixToPostfix(cleanExpr);

    currentResultData = result;
    currentRows = result.rows;
    currentFinalPostfix = result.finalPostfix;
    currentExpr = cleanExpr;

    currentExprTag.textContent = `Infix: ${cleanExpr}`;
    resultsSection.classList.remove('hidden');

    if (evalToggleBtn && evalContent && evalSection) {
      evalToggleBtn.setAttribute('aria-expanded', 'false');
      evalContent.classList.add('hidden');
      evalSection.classList.add('collapsed');
    }

    if (displayMode === 'all') {
      currentStepIndex = currentRows.length - 1;
      if (stepPlayerBarTop) stepPlayerBarTop.classList.add('hidden');
      if (stepPlayerContainerBottom) stepPlayerContainerBottom.classList.add('hidden');
      renderTraceTable(currentRows);
    } else {
      currentStepIndex = 0;
      if (stepPlayerBarTop) stepPlayerBarTop.classList.remove('hidden');
      if (stepPlayerContainerBottom) stepPlayerContainerBottom.classList.remove('hidden');
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
    if (stepPlayerBarTop) stepPlayerBarTop.classList.add('hidden');
    if (stepPlayerContainerBottom) stepPlayerContainerBottom.classList.add('hidden');
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
    if (stepPlayerBarTop) stepPlayerBarTop.classList.remove('hidden');
    if (stepPlayerContainerBottom) stepPlayerContainerBottom.classList.remove('hidden');
    if (currentRows.length > 0) {
      currentStepIndex = 0;
      updateStepPlayerUI();
    }
  });

  // Step Player Controls
  stepPrevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stopAutoPlay();
      if (currentStepIndex > 0) {
        currentStepIndex--;
        updateStepPlayerUI();
      }
    });
  });

  stepNextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stopAutoPlay();
      if (currentStepIndex < currentRows.length - 1) {
        currentStepIndex++;
        updateStepPlayerUI();
      }
    });
  });

  stepPlayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (playInterval) {
        stopAutoPlay();
      } else {
        if (currentStepIndex >= currentRows.length - 1) {
          currentStepIndex = 0;
        }
        startAutoPlay();
      }
    });
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    stopAutoPlay();
    expressionInput.value = '';
    clearInputBtn.classList.add('hidden');
    errorMessage.classList.add('hidden');
    resultsSection.classList.add('hidden');
    if (stepPlayerBarTop) stepPlayerBarTop.classList.add('hidden');
    if (stepPlayerContainerBottom) stepPlayerContainerBottom.classList.add('hidden');
    if (evalToggleBtn && evalContent && evalSection) {
      evalToggleBtn.setAttribute('aria-expanded', 'false');
      evalContent.classList.add('hidden');
      evalSection.classList.add('collapsed');
      evalSection.classList.add('hidden');
    }
    currentRows = [];
    currentResultData = null;
    currentFinalPostfix = '';
    currentExpr = '';
    expressionInput.focus();
  });
});
