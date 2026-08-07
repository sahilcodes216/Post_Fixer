# PostFixer — Infix to Postfix Converter & Trace Table

PostFixer is a lightweight, high-performance static web application that converts infix mathematical expressions into postfix (Reverse Polish) notation. It generates a full textbook **Token / Stack / Postfix** step-by-step trace table used to teach the stack-based conversion algorithm in Data Structures and Algorithms (DSA) courses.

![PostFixer Banner](https://img.shields.io/badge/PostFixer-DSA%20Tool-blue?style=for-the-badge)

## 🌟 Key Features

- **Standard Stack Conversion Engine:** Full implementation of Dijkstra's Shunting-yard algorithm trace supporting standard precedence (`^` highest, `*`/`/` medium, `+`/`-` lowest) and associativity (`^` right-associative).
- **Interactive Step-by-Step Player:** Toggle between viewing the full trace table instantly or stepping through token-by-token with Play, Pause, Next Step, and Previous Step controls.
- **Robust Syntax Validation:** Human-readable inline validation for invalid characters, unbalanced parentheses, adjacent operators (`A++B`), missing operators (`AB`), and empty expressions without clearing previous valid results.
- **Dark & Light Mode:** Seamless theme switcher with OS color scheme detection and `localStorage` persistence.
- **One-Click Copy & Reset:** Fast clipboard copying with confirmation feedback and instant reset controls.
- **Dual Visitor Counter:** Integrated live site visit counter with a automatic browser fallback.
- **Zero-Dependency Static Deploy:** Pure HTML5, CSS3 (custom variables), and vanilla JavaScript (ES6+) — no frameworks, bundlers, or server build step required.

---

## 🧪 Test Cases & Acceptance Criteria

| Input | Expected Postfix | Description / Feature Tested |
|---|---|---|
| `A*B+C/D` | `AB*CD/+` | Standard operator precedence (`*`, `/` over `+`) |
| `(A+B)*(C-D)` | `AB+CD-*` | Parentheses overriding precedence |
| `A+B*C-D` | `ABC*+D-` | Left-associative operator chaining |
| `A^B^C` | `ABC^^` | Exponentiation right-associativity `A^(B^C)` |
| `A` | `A` | Single operand expression |
| `((A+B)` | *Validation Error* | Unbalanced parentheses detection |
| `A++B` | *Validation Error* | Invalid adjacent operator sequence |

---

## 🚀 Quick Start / Local Development

Since PostFixer is built as a pure static web app, no build step or package installations are required!

### Option 1: Direct File Open
Simply double-click `index.html` or open it directly in your browser of choice (Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server
Using any simple HTTP server:

**Using Python:**
```bash
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

**Using Node.js (`npx`):**
```bash
npx serve .
```

---

## 🌐 Deploying to Hosting Platforms

### Vercel ✅ *(Live)*
**Live Demo:** [post-fixer.vercel.app](https://post-fixer.vercel.app/)

This project is already deployed and live on Vercel. To deploy your own copy:
1. Run `npx vercel` in the project root directory or import the Git repository on Vercel.
2. Deployment completes automatically with zero configuration.

---

## 📂 File Structure

```
PostFixer/
├── index.html      # Semantic HTML5 layout & UI structure
├── style.css       # CSS custom properties theme system & responsive styles
├── script.js        # Converter algorithm, validation, step player, and theme logic
└── README.md        # Documentation & deployment guide
```

---
## ✍️ Author
~ Sahil Verma
