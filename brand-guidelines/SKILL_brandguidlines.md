---
name: antigravity-brand-skill
version: 1.0
description: Deterministic brand styling and visual identity skill for Antigravity artifacts. Applies approved colors, typography, hierarchy, and visual logic without modifying semantic content.
license: See LICENSE.txt
scope: styling | formatting | visual-identity | post-processing
---

# Antigravity Brand Styling Skill

## 1. Objective

This skill enforces Antigravity’s official visual identity across eligible artifacts by applying standardized typography, color systems, spacing, and hierarchy.

This is a **styling-only skill**.  
Content, logic, and structure must remain unchanged unless explicitly instructed.

---

## 2. Application Criteria (Hard Rules)

Apply this skill **only if all conditions are met**:

1. The artifact is presentation-grade or customer-facing  
2. Visual consistency or branding is desired or implied  
3. The artifact benefits from typographic or color hierarchy  

### Eligible Artifact Types
- Markdown documents
- Presentations (PPT / PDF)
- One-pagers and briefs
- Product documentation
- Visual specifications (non-code)

### Explicit Exclusions
- Source code or config files
- Logs, transcripts, or raw dumps
- Legal contracts unless branding is explicitly requested

---

## 3. Antigravity Color System (Authoritative)

### Core Palette

| Role | Hex | Usage |
|----|----|----|
| Primary Dark | `#141413` | Primary text, dark backgrounds |
| Primary Light | `#faf9f5` | Light backgrounds, inverted text |
| Neutral Mid | `#b0aea5` | Secondary text, dividers |
| Neutral Light | `#e8e6dc` | Subtle panels, background fills |

### Accent Palette (Controlled Emphasis)

| Accent | Hex | Usage Rules |
|----|----|----|
| Gravity Orange | `#d97757` | Primary emphasis, CTAs |
| Orbital Blue | `#6a9bcc` | Secondary emphasis, links |
| Vector Green | `#788c5d` | Status, confirmation, tertiary use |

**Accent Constraints**
- One accent per section maximum
- Never use accents for body copy
- Accents must not overpower neutrals

---

## 4. Typography System

### Font Stack

| Role | Font | Fallback |
|----|----|----|
| Headings (H1–H3) | Poppins | Arial |
| Subheadings (H4–H6) | Poppins | Arial |
| Body Text | Lora | Georgia |
| Captions / Footnotes | Lora | Georgia |

### Typography Rules
- Preserve original heading structure
- Do not invent new hierarchy
- Prioritize legibility over decoration
- Use weight, not color, for emphasis

---

## 5. Deterministic Styling Logic

When executing this skill:

1. Do not rewrite or summarize content  
2. Do not reorder sections  
3. Do not collapse or expand lists  
4. Apply styles strictly by semantic role  
5. Maintain whitespace and alignment  

### Contrast Rules
- Ensure readable contrast (WCAG AA where possible)
- Dark text on light backgrounds preferred
- Avoid pure black or pure white

---

## 6. Shapes, Dividers, and Visual Elements

- Non-text shapes may use accent colors
- Dividers should default to neutral mid or light
- Avoid decorative flourishes

---

## 7. Fallback and Degradation Strategy

If platform limitations exist:

- Fonts unavailable → use defined fallbacks
- Colors restricted → preserve hierarchy and contrast
- Layout constrained → prioritize readability

Graceful degradation is mandatory.

---

## 8. Conflict Resolution

Priority order:
1. Explicit user instructions
2. Semantic integrity of the artifact
3. Antigravity brand styling rules

If a conflict arises, **do not override user intent**.

---

## 9. Non-Goals

This skill does NOT:
- Improve copywriting
- Change tone or voice
- Add marketing language
- Modify technical meaning
- Enforce brand messaging

---

## 10. Output Standard

A correctly styled artifact should:
- Be visually identifiable as Antigravity
- Preserve original structure and intent
- Require no additional formatting
