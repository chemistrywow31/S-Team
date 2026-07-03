---
name: Presentation Visual Asset Standard
description: Photo/image sourcing, placement, and visual QA rules for all presentations
paths:
  - "output/**/*.html"
  - "output/**/*.pptx"
---

# Presentation Visual Asset Standard

## Applicability

- Applies to: `coordinator`, `presentation-architect`, `visual-designer`, `web-developer`, `qa-reviewer`
- Required for: every presentation that uses selected, user-provided, or edited raster images.
- Examples: business decks, lesson decks, pitch decks, strategy decks, technical explainers, executive briefings, product presentations, training decks, and conference talks.

## Core Rules

### Image Sourcing — No Image APIs

- This team runs no image-producing APIs or built-in image tools. Raster visuals come from exactly two sources: existing project assets and user-provided images.
- When no fitting raster asset exists, compose the visual from CSS/SVG/icon/typographic elements instead — or return to the Coordinator to request the asset from the user. Do not silently substitute an unrelated stock-style placeholder for a requested photo.
- Source images must be copied into the deliverable folder, usually `<output-dir>/assets/photos/`, `<output-dir>/assets/images/`, or another project-local asset directory.
- HTML and exported deliverables must reference only project-local relative paths when the user will upload or move the output folder.
- Do not delete or overwrite the user's original image files; work on copies inside the deliverable's asset directory.

### Visual Medium Choice

- Prefer photorealistic/editorial photos (from project or user-provided assets) when the user asks for pictures, photos, realistic visuals, business scenes, product context, or human workplace/course-supporting visuals.
- Use diagrams, SVGs, charts, or pure geometric graphics when they teach structure, process, system architecture, data relationships, or when the user explicitly asks for diagrams.
- Do not use decorative-only stock imagery. Every visual must support the slide's message.
- For style-specific decks, images must be framed and processed to harmonize with the selected style tokens. Example: Bauhaus decks should use square-corner, black-bordered, grid-aligned photo modules with restrained red/yellow/blue accents.

### No Core Slide Text Inside Raster Images

- Raster images must not carry the slide's core content: headings, vocabulary, phrase banks, dialogue, data labels, UI copy, captions, or instructional/executive claims.
- Core content must remain live presentation text in HTML/PPTX so it stays sharp, accessible, searchable, editable, and responsive.
- Text inside raster images is allowed only when the user explicitly requests exact in-image text and QA verifies it is accurate and legible at every target viewport/export size.
- Images with fake text, blurry labels, illegible writing, logos, watermarks, or UI text artifacts must be rejected, replaced, edited, or cropped out.

### Text/Image Layout Separation

- Slide layouts must reserve explicit, non-overlapping zones for text and images. Images must never float over, under, or behind core slide text.
- Use controlled containers for raster images: fixed grid area, `overflow: hidden`, `object-fit: cover`, square or style-approved corners, and explicit border/shadow rules.
- Do not place text inside image containers unless it is a deliberate live HTML/PPTX overlay label with its own high-contrast background and QA approval.
- Avoid giant headings that run behind or beneath image cards. If a heading collides with visual content, reduce heading scale, change the grid ratio, crop/reposition the image, or split the slide.
- For reveal.js, do not override lifecycle positioning in a way that breaks slide isolation. Non-present slides must remain hidden/absolute according to reveal.js behavior; apply custom grid/flex layout only to the active slide or to safe child containers.

### Visual QA Beyond Layout Gate

The layout gate is required for reveal.js decks but is insufficient for image-heavy presentations. QA must also provide evidence for:

- Contact sheet or thumbnail review of all selected/user-provided raster images.
- Screenshot review of all slides, or at minimum all slides that contain images plus any dense text slide.
- Desktop viewport/export-size check and at least one portrait/mobile viewport check for HTML decks.
- Text/image overlap detection or manual inspection showing that visuals do not cover, sit behind, or compete with slide text.
- Rejection of blurry in-image text, fake text artifacts, unreadable labels, distorted anatomy, visible logos, or watermarks.

If any of these checks fail, the deck is `DONE_WITH_CONCERNS` or blocked until revised.

## Violation Determination

- Any image-producing API or built-in image tool is used to create presentation images (the capability was removed from this team) → Violation
- A slide requiring a photo is filled with an unrelated placeholder instead of a project/user-provided asset, a CSS/SVG/icon/typographic composition, or a Coordinator request for the asset → Violation
- HTML references absolute local filesystem paths or remote runtime image URLs for a user-uploaded/movable deck → Violation
- Raster images contain the slide's core message, instructional text, executive claim, vocabulary, dialogue, chart labels, or critical UI copy without explicit user request and QA approval → Violation
- A photo, SVG, or graphic overlaps, covers, or sits behind slide text → Violation
- A slide relies on blurry in-image text instead of live presentation text → Violation
- QA approves an image-heavy deck using layout gate only, without screenshot/contact-sheet visual review → Violation
