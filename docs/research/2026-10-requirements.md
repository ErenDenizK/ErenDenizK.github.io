# Research: what the site must contain, and how (2026-10-08)

**Status:** current, with owner overrides. Use it for the reader analysis and §18 (the AI tells).
The owner overrode: email (no email, 2026-10-09), the CV link (no CV on 2026-10-08; About is now a
mini CV, document open, 2026-10-10), both themes (dark only, 2026-10-08), and no "now" page has been
asked for.

Twenty questions a portfolio has to answer for its three readers: hiring (recruiters,
hiring managers, Microsoft), engineers, and friends. Each answer says how strong its ground
is:

- **E** evidence: a study, dataset or official document.
- **P** practitioner: a named engineer, recruiter or hiring manager writing publicly.
- **F** folklore: guides, vendors, forums. Used only where nothing better exists.
- **M** measured: our own survey of 20 engineers' sites, built locally from their public
  repos (live sites were unreachable from the research sandbox; repos may lag the live site).

Several official pages (careers.microsoft.com among them) could not be fetched; claims about
them come from search extracts and reposts and must be checked against the live posting.

---

## A. Who reads it, and for how long

### 1. Does a portfolio matter for big-tech hiring at all?

Indirectly. At Microsoft-scale companies the CV, the applicant system and coding interviews
decide (F; no official source says reviewers open portfolios). The site earns its keep in
the moments around that funnel: a referrer forwards it, an interviewer opens it before "tell
me about a project", a cold message carries it. Smaller companies read more, and recruiters
trust signals that are cheap to verify over CV claims (E: Marlow & Dabbish, CSCW 2013). A
portfolio does not replace an internship (F, and contested).

**For the site:** it is a credibility amplifier for the CV and for people Eren already
talks to (brief §2.1). Put its URL on the CV; design it for the curious second look.

### 2. How long does the first look last?

Seconds. CV eye-tracking: about 6 s (2012) and 7.4 s (2018), with attention on name, titles,
dates and education (E, weak: a vendor study, small sample). Recruiters judging engineering
CVs did only "a bit better than a coin flip" (E: interviewing.io / Learning Collider). No
portfolio-specific study exists; "15–30 s" is folklore.

**For the site:** the first screen must answer, without scrolling or loading: who, what they
build, where the best work is. No loader, no intro animation on the critical path (M: the 3D
student site we measured showed only a loading screen above the fold).

### 3. What does Microsoft actually offer a student in Türkiye?

- **Explore** (1st/2nd-year interns) requires enrolment in the US, Canada or Mexico in its US
  form; no track for students in Türkiye was found (E, older listing; treat as unavailable
  unless a posting says otherwise).
- **EMEA engineering internships** exist in Prague, Dublin and Belgrade (Microsoft
  Development Center Serbia, which has listed FPGA and embedded R&D tracks). Postings require
  legal authorisation to work in that country (F: reposts of official postings). No
  engineering internship programme in Microsoft Türkiye was found.
- The cycle for July 2027 appears to be open now (postings around 2026-09-30); offers roll
  from October to December (F).
- General rule: at least one term must remain after the internship (E).

**For the site:** work authorisation, not year of study, is the binding constraint. The site
should make location and status unambiguous. The realistic path is a first internship
anywhere, then Microsoft EMEA (Belgrade fits the low-level interest best), then full-time or
a master's route. The site has years to mature before it is used in earnest (brief §2.3).

### 4. What do engineers judge a personal site by?

Content over decoration (P: Dan Luu, Julia Evans, Simon Willison as exemplars). In our survey
9 of 12 established engineers' sites lead with dated writing or a short bio, not a hero (M).
Credibility comes from specific, checkable work: what you decided and why. Cringe comes from
skill bars, 25-logo walls, "passionate, results-driven" bios, custom cursors and heavy
animation (P/F, consistent across sources).

### 5. What makes friends share it?

The link preview and one "wait, that's cool" moment that shows skill rather than decorates
(P). Themed gimmicks win peers but confuse recruiters (P, anecdotal), so keep the playful layer
off the path to projects and CV (F). The glass object of ADR-0003 is that moment; it must
never stand between a reader and the content.

## B. Identity

### 6. How should the name and headline read?

Use one name form everywhere: CV, site, GitHub, LinkedIn (P/F). Recruiters and applicant
systems expect the full legal name on the CV (F). Headline formulas we measured, most common
first: bare name; "I'm [name], a [role] [at/from]"; name plus a playful line; site named after
the work (M). "Hi there 👋 / Welcome to my portfolio" and typewriter effects appear only on
student sites (M).

**For the site:** name, then one concrete sentence about the work and the current focus.
Owner decision needed: full surname or "K." (see questions).

### 7. What about location, nationality and work authorisation?

Say "Istanbul, Türkiye". Microsoft EMEA postings filter on legal authorisation, so ambiguity
wastes everyone's time; a clear line such as "Turkish citizen; needs sponsorship outside
Türkiye; open to relocation" is recommended over vague phrases (F, CV guides; placement
disputed). This line belongs on the CV and possibly the About, not on the first screen.

### 8. Is the AA in the prep-school exam worth showing?

Briefly. It is not an internationally recognised credential, so state it in one line
("YTÜ English Proficiency Exam, top band") or map it to CEFR if YTÜ publishes a mapping; IELTS
or TOEFL count if a posting asks for proof (F). The stronger English signal is the site's own
writing.

### 9. Photo, age, personal details: what to share and hold back?

- **Share:** professional name, city, university, degree and expected graduation year
  (instead of age), optionally one photo.
- **Hold back:** birthdate, phone, home district, real-time location or schedules, personal
  Gmail, photos of friends without consent, names of private people in log entries.
- European CV norms drop photo, birthdate and marital status (F). None of the measured
  engineers' sites lead with a photo (M).

The log is where leaks happen: the editing agent strips third-party names and places.

## C. Projects

### 10. How many projects, and in what form?

Median about 7 shown on established sites, with a "show more" for the rest (M). Three real
projects beat fifteen tutorials (P/F). Eren has three, which is the right number to lead with.

A fixed record per project (it doubles as the content schema, ADR-0002):

- required: title, one line on what it is and for whom, **role**, **dates**, **status**,
  one outcome or number;
- optional: live link, code link, one image or short demo, tags (rarely useful).

Best practice from the survey: role and outcome in prose ("I created X with Y in 2019; led
it for five years", M), outcomes over stacks (M: "6,000 students across 32 countries").

### 11. What should the deep layer of a case study contain?

Three layers (P synthesis; postmortem practice):

1. **30 seconds:** what it is and for whom, a short demo, links, status and version, role.
2. **3–5 minutes:** problem and constraints, one architecture diagram, three to five
   decisions with the alternatives and the reason (Recto and English Prep already have real
   ADRs to link), one or two hard bugs or measured numbers.
3. **Deep:** ADRs, changelog, roadmap, and "what I'd do differently" written as
   decision → hindsight → change.

Hiring managers want the problem, your role, trade-offs, verification and numbers; red flags
are overstated responsibility and buzzword lists (P: McDowell; hiring-manager panels).

### 12. How should unfinished work be shown?

Honestly and as data (P synthesis):

- a status label: Live, In development, Paused, Archived;
- a version (English Prep's 0.x is itself a credible signal);
- "last updated" generated from git or the changelog, never typed;
- "next:" from the roadmap;
- stated limits as engineering maturity (Recto's read-only phone edition, ADR-0033).

A silent "coming soon" is worse than "Paused, because…".

### 13. Built with AI agents: disclose it, and how?

Disclose plainly. Microsoft's candidate code asks for honest self-representation "from
resumes… to pre-onboarding" and expects interviews without AI unless instructed (E). Company
positions in 2025–26 range from AI being "core to every role" (Microsoft DevDiv memo, E via
press) and "a baseline expectation" (Shopify, E) to AI-required interviews (Canva) and bans
(Amazon, reported). Being found out costs more than saying it.

How to make it credible: the case study shows the human work, which is the real skill: specs
and acceptance criteria, architecture choices, review and rejection of agent output, tests,
diagnosed bugs, measurements. Willison's line between vibe coding and code that was
"reviewed, tested, and understood" (P), and Osmani's "70 % problem" (P) give the framing.
Risk: interviewers ask about decisions the portfolio implies, without the tool.

### 14. Does the site need hand-written, low-level work too?

Yes, for the stated goal. Low-level and embedded reviewers discount web apps (F) and look for
register-level C, an RTOS task with a timing budget, a board brought up from a datasheet, an
emulator or a tiny CPU (CHIP-8, RISC-V, an RV32I core on an FPGA), and upstream contributions
(Zephyr, QEMU, Linux), which are among the few GitHub signals recruiters found reliable (E:
Marlow & Dabbish). Make invisible work visible: scope captures, timing numbers, demo video.

**For the site:** a second project group, "by hand", for low-level work as it appears (brief
§4.1 already foresees an AI-built vs hand-written split). Even CS50 problem sets count while
it fills.

## D. The log

### 15. Does writing in public help a career?

There is no rigorous study; the evidence is anecdotal but consistent (P: Patrick McKenzie,
swyx, Julia Evans, Simon Willison). The reason the log matters here is the brief's own: a
public record that shows continuous work over years (brief §2.2).

### 16. How do we stop it looking abandoned?

The risk is a visible date trail that peters out, not inactivity itself (P: Ask a Manager;
F). Design against it (P synthesis, M):

- never make "latest post: date" a hero element, and never promise "weekly" in the UI;
- let freshness come from work that happens anyway: project versions, changelog-style
  entries, a "now" line, a footer "Updated <date>";
- allow entries of any length so a busy month still yields one line (Willison's TILs took
  under 10 minutes each);
- tie entries to projects as progress reports (M: Smolka, phil-opp).

### 17. How should entries be listed and shaped?

Measured pattern: date, then title, sometimes a one-line dek (M). The best show time in the
structure: year headers with short dates, the year once per group, a quiet age cue (M:
Smolka, Rauch, overreacted). Worth reading means something learned or decided, with the
reason, a concrete artifact (screenshot, diff, number) and honest dead ends (P).

Three lengths: a note (one or two lines), an entry (a few paragraphs), an essay (with
figures). Each links to the project it belongs to.

### 18. Entries drafted by an AI from dictation: disclose, and keep the voice how?

Disclosure lowers perceived trust and effort in experiments, most for personal writing, less
for readers with high AI literacy (E: Nakano et al. 2025, n=261). Readers say they want
labels and then rate labelled text lower (E, summarised by NN/g). The common pattern is one
site-wide "how this is written" note, plus a per-entry note only when AI did more than edit
(P). Here the disclosure is on-brand: directing agents is part of the site's thesis.

Voice: keep Eren's specifics, numbers, hesitations and decisions; keep a sentence of their own
now and then; show every draft before publishing (CLAUDE.md). Avoid the tells: dense
em-dashes, "it's not X, it's Y", reflexive triplets, "delve", "journey", uplifting endings,
uniform paragraphs, headings on a short note (F, each weak alone).

## E. Practical

### 19. CV, contact and analytics

- **CV:** link a one-page PDF from the site, and put the site URL on the CV (F; standard for
  students in US and EU). Thin experience: education first, projects as the main section,
  grouped skills (not rated), any work, clubs, competitions such as Teknofest (P: Explore
  ambassadors; E: NACE 2025 on what employers seek). A CV link appears only on job-seeking
  sites (M), so make it a quiet link, not a button.
- **Contact:** plain email is the norm; we found no contact forms on engineers' sites (M).
  Use a dedicated address, not the personal Gmail, with light obfuscation (HTML entities stop
  little; splitting and assembling the address works better, E: Mortensen 2025). Set GitHub's
  "keep my email private" so commits don't leak it (E: GitHub docs).
- **Analytics:** KVKK's cookie guidance (2022) requires explicit prior consent for analytics
  cookies (E via secondary coverage). Simplest compliant choice: none, or a cookieless counter
  (GoatCounter, Cloudflare Web Analytics; their no-banner claim is a vendor claim, F). No
  Google Analytics without a real consent banner.

### 20. Discoverability, link previews and the technical floor

- **Own-name search:** a unique name used in title, heading and About, plus links from your
  own profiles, usually ranks first (F). `WebSite` and `ProfilePage`/`Person` JSON-LD with
  `sameAs` to GitHub and LinkedIn label and disambiguate; they are not promised ranking
  factors (E: Google docs). Add `rel="me"` to profile links.
- **Previews:** one 1200×630 JPG under 300 KB per page with full Open Graph tags; LinkedIn
  wants at least 1200×627 (E: LinkedIn help); WhatsApp wants an absolute HTTPS URL and a small
  image (F: third-party mirror). Projects and long entries get their own card.
- **RSS/Atom:** every writing-led site we surveyed has one (M: 11 of 12); still used by
  developers in 2026 (E, single site). Near-zero cost.
- **Floor:** writing-led sites weigh 7–137 KB with almost no JS; design sites 0.4–1.5 MB;
  the 3D student site 4.4 MB (M). Budget: under about 150 KB before the glass object, which
  loads lazily after first paint. Viewport meta (one site we measured lacked it and broke on
  phones, M), 16–20 px body text, 65–75 character measure, both themes, a footer with name,
  email, feed and "Updated <date>".

---

## Requirements this implies

Content (each is data, ADR-0002):

1. Person: name form, one-line headline, current focus, city, university and expected
   graduation, links (GitHub, LinkedIn, email, CV), optional photo.
2. Project record: title, one-liner, role, dates, status, version, outcome, links, image or
   demo, group ("with agents" / "by hand"), three layers of depth, linked ADRs and log
   entries, "next".
3. Log entry: date, length (note / entry / essay), title, dek, project link, body, figures.
4. Now: one dated line or short list.
5. Site notes: how the site and the log are made (AI disclosure), colophon.

Pages: home (who, what, the work, recent log), each project, the log (year-grouped) and each
entry, about (with CV link), now, 404. RSS/Atom, sitemap, JSON-LD, per-page OG images.

Non-negotiables: first screen complete with no loader; content without JS or WebGL; both
themes; reduced motion; phone first-class; no analytics without consent; no third-party
personal data in the log.

## Sources

Hiring: Microsoft internship eligibility and candidate code of conduct (careers.microsoft.com,
via search extracts); Prague, Dublin and Belgrade intern postings (reposts on Anitab,
jointaro, eurotoptech, 2025-09 to 2026-09); Explore listing (AIHEC PDF; NCSU 2023); Ladders
eye-tracking 2012/2018 (Onrec, recruiter.com); interviewing.io "Are recruiters better than a
coin flip?"; Marlow & Dabbish, CSCW 2013; UFMG 2024 recruiter study; NACE Job Outlook 2025;
SignalFire State of Talent 2025; U of Toronto Explore ambassadors 2023; Fortune 2025-07-21
(Anthropic policy); The Register 2025-06-11 (Canva); Shopify CEO memo 2025-04; Simon Willison
on vibe coding (2025); Addy Osmani in The Pragmatic Engineer; relocate.me on EU CVs.

Engineers and readers: Simon Willison, "What to blog about" (2022) and "One year of TILs"
(2021); Julia Evans, "Blogging principles" (2017), "Blog about what you've struggled with"
(2021), "Some blogging myths" (2023); swyx, "Learn in Public"; Patrick McKenzie (podcast
summary); Ask a Manager (2013); Derek Sivers, /now; Nakano et al., arXiv 2510.24011 (2025);
Fang, Wen & Lee, arXiv 2604.27129 (FAccT '26); NN/g on AI disclosure; Spencer Mortensen,
"Email obfuscation: what works in 2025"; GitHub docs on private email; KVKK
"Çerez Uygulamaları Hakkında Rehber" (2022-06-20, via alomaliye and NTV); Google Search docs
on site names and ProfilePage; LinkedIn Help on share images; idiallo.com on RSS (2025).

Measured sites (from public repos): zserge, nelhage, binji, raphlinus, travisdowns,
awesomekling, gekkio, jsmolka, phil-opp blog_os, skeeto, eatonphil, bchiang7 v4,
simonw, gaearon overreacted, antfu, shuding, rauchg, pacocoursey, soumyajit4419,
ishaantek.
