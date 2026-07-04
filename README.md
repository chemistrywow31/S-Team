<div align="center">

**[English](#english)** · **[繁體中文](#zh-tw)**

</div>

---

<a id="english"></a>

# S-Team — the Slide Team 🎬

> [跳到繁體中文版 ↓](#zh-tw)

**A multi-agent presentation studio that treats every slide deck like a shipped product: researched, designed, built, gated, and reviewed — by a team, not a prompt.**

## Why S-Team?

Ask a single AI to "make me a deck" and you'll get the same thing everyone gets: a generic gradient theme, statistics nobody can trace, a layout that explodes the moment someone opens it on a phone, and a cheerful *"I checked it in the browser, looks great!"* — which nobody actually checked.

We shipped decks like that. Then we audited them. Three out of three had defects that "visual inspection" had waved through: slides overflowing their frames, a deck that rendered **completely blank from page 2 onward** while every geometry check passed, PPTX shapes that turned to garbage in LibreOffice, and hand-estimated accessibility numbers that were simply wrong.

S-Team is the fix. It splits the work the way a real studio does — researcher, domain expert, architect, writer, designer, developer, two reviewers — and then refuses to believe any of them without **machine evidence**. No agent may say "trust me." Every claim needs a source. Every layout needs a passing gate report. Every "done" gets verified by a fresh pair of eyes that never saw the producer's excuses.

The result: presentations that survive contact with a projector, a phone, a fact-checker, and a skeptical audience.

## What you get

- 🕵️ **Verified research, not vibes.** An Investigative Researcher builds a Source Registry with 1–5 credibility ratings. Claims below the bar are corroborated or cut. The QA Reviewer rejects any deck with an unsourced statistic.
- 🎨 **A real design system.** Four built-in styles — `tech-mystery`, `minimal-modern`, `editorial`, `bauhaus` — each a 300–500 line design-token spec (palette, type scale, motion policy, slide skeletons, hard don'ts). Or grow your own with the token-design skill, where WCAG contrast is **computed, never estimated** (the validator caught all four built-ins shipping wrong hand-made numbers — including a fake AAA).
- 🚦 **Mechanical quality gates.** Four automated gates produce JSON evidence that humans and agents must cite:

  | Gate | Catches |
  |---|---|
  | **Layout Gate** | overflow at 6 viewports (incl. phone portrait) + text/image collisions |
  | **Render Gate** | slides that render blank — the incident class geometry checks can't see |
  | **PPTX Gate** | broken shapes, dropped slides, blank pages; emits a one-look contact sheet |
  | **Bundle Gate** | CDN dependencies that die offline; proves the deck opens with the network cable unplugged |

- ✨ **Premium visuals with a leash.** Glass morphism, rotating glow borders, particles, SVG line-draw — every effect GPU-accelerated, 60fps-tested, `prefers-reduced-motion` accessible, and governed by the chosen style's motion policy. No confetti. Ever.
- 📦 **Every format that matters.** reveal.js HTML decks, PowerPoint (.pptx), PDF, and working Web POC prototypes — from one research base, so the numbers never drift between formats.
- 🧾 **A paper trail you can audit.** Every phase writes `references → findings → decisions` to a worklog. Disagree with a design choice six weeks later? The reasoning, the alternatives, and the evidence are all on disk.
- 🙅 **An anti-sycophancy clause.** Agents are contractually forbidden from "that could work" and "both options have merit". Every recommendation carries a position, evidence, and the condition that would falsify it.

## How it works

> 💡 **Runs best in Claude Code cowork.** This team is built for Claude Code's cowork mode — the Coordinator holds the main session and coworks with the nine specialists as subagents. Driving it that way beats asking a single model, solo, in one prompt.

One **Coordinator** runs in your main session and dispatches nine specialists, each in a fresh context, through a phased pipeline with hard gates between phases:

```
Phase 1   Requirements Intake        → Coordinator (+ mandatory style pick)
Phase 2   Research (parallel)        → Investigative Researcher ∥ Domain Expert
Phase 3   Architecture Planning      → Presentation Architect + Technical Architect
Phase 4   Content Writing            → Presentation Writer
Phase 5   Visual & Build (parallel)  → Visual Designer ∥ Web Developer
Phase 6   Quality Review             → QA Reviewer (Pass A: gates · Pass B: deep review)
Phase 6.5 Process Review             → Process Reviewer (how the team worked)
Phase 7   Revision & Delivery        → routed back by review findings
```

No phase advances on a producer's self-claim: acceptance is performed by a fresh-context verifier that receives only the criteria and the artifacts — never the producer's reasoning.

## Quick start

```bash
git clone <this-repo> && cd presentation-studio
npm install          # puppeteer, reveal.js, pptxgenjs

# open Claude Code in the repo, then:
/boss
```

Tell the boss what you need ("a 20-slide technical keynote on X for a developer audience"), pick a style when asked, answer the intake questions — the team does the rest. Deliverables land in `output/<project-name>/`, gate reports included.

### Environment

| Tool | Needed for |
|---|---|
| Node.js ≥ 18 + `npm install` | gates, bundling, reveal.js builds |
| LibreOffice (`soffice`) + poppler (`pdftoppm`) | PPTX visual gate |
| Python 3 + `python-pptx` | PPTX authoring/editing |

## Project anatomy

```
.claude/
├── agents/          # the 10 team members (coordinator + 9 specialists)
├── rules/           # the law: execution contract, gates, fact-check, anti-sycophancy…
├── skills/          # the tools: gates, style-create, deck-bundle, visual-effects…
└── styles/          # the design systems: 4 built-ins + yours
.worklog/            # evidence chain per project (gitignored)
output/              # deliverables (gitignored)
```

## Design principles

1. **Evidence over attestation.** A JSON gate report beats "I looked at it" every time.
2. **Producers never grade their own homework.** Fresh-context verification, always.
3. **Style is a contract, not a theme color.** Tokens, policies, and don'ts — enforced at QA.
4. **Write it down or it didn't happen.** The worklog is the team's memory and its audit log.
5. **Say the uncomfortable thing.** A flaw spotted and unspoken is a rule violation, not politeness.

---

<a id="zh-tw"></a>

# S-Team — 投影片製作團隊 🎬

> [Back to English ↑](#english)

**一個把每份簡報當成正式產品來出貨的多代理簡報工作室:有研究、有設計、有實作、有閘門、有審查——由一支團隊完成,而不是一句 prompt。**

## 為什麼需要 S-Team?

叫一個 AI「幫我做份簡報」,你會得到人人都拿到的那種東西:千篇一律的漸層模板、來源不明的統計數字、手機一打開就爆版的排版,以及一句愉快的 *「我在瀏覽器看過了,沒問題!」*——實際上根本沒人看過。

我們就出過這種貨。然後我們回頭稽核,三份抽三份都有「目視檢查」放行的缺陷:內容溢出畫面、一份**從第 2 頁起全部渲染成空白**卻通過所有幾何檢查的簡報、在 LibreOffice 裡碎成馬賽克的 PPTX 圖形,還有純手估、而且估錯的無障礙對比度數字。

S-Team 就是為此而生。它把工作拆成真實工作室的分工——研究員、領域專家、架構師、寫手、設計師、工程師、兩位審查員——然後**拒絕在沒有機器證據的情況下相信任何人**。沒有代理可以說「相信我」:每個論述要有來源,每個排版要有通過的閘門報告,每個「完成」都由一雙沒看過製作者任何辯解的新眼睛重新驗收。

結果是:一份能扛得住投影機、手機、事實查核員、以及台下懷疑眼神的簡報。

## 你會得到什麼

- 🕵️ **查證過的研究,不是感覺。** 調查研究員建立含 1–5 可信度評級的來源登記表(Source Registry)。低於門檻的來源要嘛補強佐證、要嘛刪除。QA 審查員會直接退回任何帶有無來源數據的簡報。
- 🎨 **真正的設計系統。** 四個內建風格——`tech-mystery`(科技神秘)、`minimal-modern`(簡約現代)、`editorial`(編輯風)、`bauhaus`(包浩斯)——每個都是 300–500 行的 design token 規格書(色彩、字級、動效政策、投影片骨架、明確禁區)。也可以用 token 設計 skill 打造自己的風格:WCAG 對比度**一律實算、絕不手估**(這個驗證器一上線就抓到四個內建風格全都寫錯手估數字,其中一筆還是假 AAA)。
- 🚦 **機械化品質閘門。** 四道自動閘門產出 JSON 證據,人和代理都必須引用:

  | 閘門 | 抓什麼 |
  |---|---|
  | **Layout Gate** | 6 種視窗(含手機直式)的溢出 + 圖文重疊碰撞 |
  | **Render Gate** | 渲染成空白的投影片——幾何檢查看不見的事故類型 |
  | **PPTX Gate** | 破圖形、掉頁、空白頁;附一張看完全部的 contact sheet |
  | **Bundle Gate** | 離線就掛掉的 CDN 依賴;證明拔掉網路線簡報照樣能開 |

- ✨ **有韁繩的高級視覺。** 玻璃擬態、旋轉光暈邊框、粒子背景、SVG 線繪——每個效果都 GPU 加速、通過 60fps 測試、支援 `prefers-reduced-motion` 無障礙,並受所選風格的動效政策管制。永遠不會有彩帶特效。
- 📦 **所有重要格式。** reveal.js HTML 簡報、PowerPoint(.pptx)、PDF、可運行的 Web POC 原型——全部出自同一個研究基礎,數字不會在格式之間漂移。
- 🧾 **可稽核的紙本軌跡。** 每個階段都把 `references → findings → decisions` 寫進 worklog。六週後不同意某個設計決定?推理過程、被否決的替代方案、支持證據,全都在磁碟上。
- 🙅 **反奉承條款。** 代理被合約禁止說「這可能行得通」「兩個方案各有優點」。每個建議都必須帶立場、帶證據、帶會推翻此立場的條件。

## 運作方式

> 💡 **搭配 Claude Code cowork 效果最佳。** 這套團隊是為 Claude Code 的 cowork 模式打造的 —— Coordinator 佔住主 session,與九位專家以 subagent 協作(cowork)。這樣跑,勝過用一句 prompt 單打獨鬥。

一位 **Coordinator** 在你的主 session 運行,把九位專家各自派進全新 context,走一條階段之間有硬閘門的流水線:

```
Phase 1   需求訪談                → Coordinator(+ 必選風格)
Phase 2   研究(平行)            → 調查研究員 ∥ 領域專家
Phase 3   架構規劃                → 簡報架構師 + 技術架構師
Phase 4   內容撰寫                → 簡報寫手
Phase 5   視覺與實作(平行)      → 視覺設計師 ∥ Web 工程師
Phase 6   品質審查                → QA 審查員(Pass A:閘門稽核 · Pass B:深度審查)
Phase 6.5 流程審查                → 流程審查員(審的是團隊怎麼合作)
Phase 7   修訂與交付              → 依審查發現路由回對應專家
```

任何階段都不會因為製作者自稱完成而放行:驗收由 fresh-context 驗證者執行,它只拿得到驗收標準和產出物——拿不到製作者的任何說詞。

## 快速開始

```bash
git clone <this-repo> && cd presentation-studio
npm install          # puppeteer、reveal.js、pptxgenjs

# 在 repo 裡打開 Claude Code,然後:
/boss
```

告訴老闆你要什麼(「給開發者聽眾的 20 頁 X 技術主題演講」),被問到時選一個風格、回答訪談問題——剩下交給團隊。交付物會出現在 `output/<專案名>/`,閘門報告一併附上。

### 環境需求

| 工具 | 用途 |
|---|---|
| Node.js ≥ 18 + `npm install` | 閘門、離線打包、reveal.js 建置 |
| LibreOffice(`soffice`)+ poppler(`pdftoppm`) | PPTX 視覺閘門 |
| Python 3 + `python-pptx` | PPTX 產生與編輯 |

## 專案結構

```
.claude/
├── agents/          # 10 位團隊成員(coordinator + 9 位專家)
├── rules/           # 法律:執行合約、閘門、事實查核、反奉承……
├── skills/          # 工具:各閘門、style-create、deck-bundle、visual-effects……
└── styles/          # 設計系統:4 個內建風格 + 你自己的
.worklog/            # 每個專案的證據鏈(gitignored)
output/              # 交付物(gitignored)
```

## 設計原則

1. **證據勝於口頭保證。** 一份 JSON 閘門報告永遠贏過「我看過了」。
2. **製作者不改自己的考卷。** 一律 fresh-context 驗收。
3. **風格是合約,不是主題色。** Token、政策、禁區——QA 逐項稽核。
4. **沒寫下來就等於沒發生。** Worklog 是團隊的記憶,也是稽核日誌。
5. **把不舒服的話說出口。** 看到缺陷不講,是違規,不是禮貌。

---

<div align="center">

**[English](#english)** · **[繁體中文](#zh-tw)**

*Built on [Claude Code](https://claude.com/claude-code) multi-agent orchestration.*

</div>
