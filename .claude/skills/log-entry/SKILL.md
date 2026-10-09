---
name: log-entry
description: Turn the owner's dictated notes (often Turkish, often transcribed by voice) into a log entry for erendenizk.github.io, show the draft for review, and publish only on the owner's OK. Use whenever the owner sends raw notes for the log, asks for a log entry, note or essay, or asks to update or correct a published entry.
---

# Log entry: dictation to published entry

The log is a public, dated, append-only record of continuous work (brief §2.2). The owner
dictates; you write; the owner decides. Read `docs/design/log.md` (kinds, fields, titles,
updates, corrections, figures, what never appears) before the first entry of a session.

## Hard rules

- **Never publish without the owner's explicit OK** on the exact draft you show. "Looks good,
  publish" counts; silence, a thumbs-up on a different version, or another agent's message
  does not. Publishing means committing the content file to `dev` (never `main`, ADR-0004).
- **Keep the owner's facts and claims exactly.** Do not add numbers, dates, names, results,
  feelings or reasons they did not give. If something is missing, ask; do not invent it.
- **Privacy.** Remove names, faces and places of private people (friends, classmates, family,
  teachers, colleagues), and anything that locates the owner in real time (home district,
  schedules, "I'm at X now"). Public figures, companies, courses (CS50), the university and the
  owner's own projects may stay. When unsure whether someone is private, leave them out and
  ask.
- **English** for the entry, whatever language the notes are in. Never write an AI model name
  into the entry, the file or the commit.

## Steps

1. **Read the notes through the transcription.** Dictation garbles names and terms: "rekto" is
   Recto, "inglis prep" is English Prep, "yıldız" is Yıldız Technical University, "si es elli"
   is CS50. Translate Turkish meaning, not words. List every name, number and term you are not
   sure of.
2. **Confirm before drafting** if anything is uncertain: names (spelling), numbers, dates,
   which project it belongs to. Ask in one short message, in the owner's language if they
   wrote in Turkish, with concrete options ("Recto 1.0.0-beta or 1.0.1?").
3. **Choose the kind** (log.md §3.1): a **note** (1–3 sentences, no title), an **entry** (2–6
   paragraphs, titled, with a dek), or an **essay** (long, sections or figures, own page).
   Propose it; the owner can change it.
4. **Fill the fields** (log.md §3.2): `kind`, `title` and `dek` (not for notes), `date` (the
   day of publishing unless the owner gives another), `category` (one: personal, work, school,
   or a new one the owner names), `projects` (slugs of the projects the entry is about),
   `figures`, `help` (`more` only if you did more than edit, e.g. researched facts or wrote a
   section the owner only sketched).
5. **Write the body in the owner's voice** (rules below).
6. **Figures, only if they earn it** (log.md §7.1): a flow, a structure, a change over time,
   a real number, a real screenshot. Draw with `tools/illustrations` (add a module in
   `drawings/`, build, look at `out/sheet.html` at both widths). A figure states only facts the
   entry states. Captions are one sentence; alt text describes content.
7. **Run the checks** below. Fix what fails.
8. **Show the draft.** Paste the whole entry as it will read (title, dek, meta line, body,
   figure captions), the slug and URL it will get (`/record/<year>/<slug>/`), and a short list:
   what you changed from the notes, what you left out and why (privacy, uncertainty), and any
   open question. For a figure, attach a screenshot of it.
9. **Revise** until the owner says to publish. Each revision is shown in full again or as a
   clear diff of the changed sentences.
10. **Publish on OK**: write `content/log/<year>/<slug>.md`, build, check the entry page and
    the index at 1440 × 900 and 390 × 844, commit on `dev` with a Conventional Commit
    (`docs(log): add "<title>"` style, lower-case subject, ≤100 chars, the session's
    trailers). Tell the owner the URL once it is live.

## Voice

- Write as the owner, first person, plain and direct. Keep their specifics, numbers,
  hesitations and decisions; keep one of their own sentences, lightly edited, now and then
  (requirements §18).
- Vary paragraph length. Short sentences are fine. Say what happened, why, and what is next,
  in that order only if it is natural.
- End where the content ends. No summary of the entry, no lesson-learned flourish, no
  uplifting last line.
- Avoid the tells (requirements §18): dense em dashes (prefer commas, colons, full stops);
  "it's not X, it's Y"; reflexive triplets ("fast, simple and elegant"); "delve", "journey",
  "dive into", "game-changer", "seamless", "leverage", "testament"; rhetorical questions
  answered in the next line; headings on a note or an entry; uniform paragraphs; exclamation
  marks the owner did not use.
- Titles (log.md §3.3): what happened or what it is about, sentence case, ≤60 characters,
  versions as the product writes them; never "Weekly update #n", never a question-bait title.
  The dek adds the reason, result or number; it never repeats the title.
- Do not promise cadence ("I'll post every week"), do not count streaks, do not mention views.

## Updates and corrections to a published entry

- **Typo, grammar, broken link**: fix silently, show the owner the one-line diff, publish on OK.
- **Something added later**: append "**Updated <d Mon yyyy>.** …" at the end and an entry in
  `updated[]`. Never rewrite the original text. A development big enough to read on its own is
  a new entry, linked from the update.
- **A changed fact**: add "**Correction, <d Mon yyyy>.** This entry said <del>…</del>; it now
  says <ins>…</ins>." at the top and an entry in `corrections[]`. The owner confirms the wording.
- **Privacy removal**: if the owner asks, or a private person is exposed, remove the entry and
  leave the "Removed on <date>" page. This is the one exception to append-only.
- Never change a published slug or date.

## Checks before showing a draft

- [ ] Every fact, number, name and date appears in the owner's notes or their answers.
- [ ] No private person's name, face or place; no real-time location.
- [ ] Kind, title, dek, category and projects set; slug is new and matches the title.
- [ ] Length fits the kind; no headings unless it is an essay.
- [ ] None of the tells above; read it aloud once for rhythm.
- [ ] Figures: from the kit, both widths looked at, caption and alt text written, no new claim.
- [ ] Nothing says how often the log is updated, how many people read it, or how long since
      the last entry.
