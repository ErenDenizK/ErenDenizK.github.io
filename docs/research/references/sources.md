# Portfolio design review: concepts and evidence

Research date: 2026-10-12. Each topic has three parts: findings (with sources), what it means for a first-year CE student's portfolio, and confidence.
**Labels:** [V] means verified from a primary or near-primary page I fetched. [S] means a secondary or summary source, or a search snippet only. [R] means my own reasoning. Quotes are kept short, at most one per source.

---

## 1. Hiring: "why should I hire this person?" in seconds

### Key findings
- **First screens are measured in seconds.**
  - [S] Ladders' 2018 update of its recruiter eye-tracking study puts the average initial résumé screen at 7.4 s, up from about 6 s in the 2012 study.
  - [S] What did well: simple layouts with clear sections and headings, and layouts that follow E/F reading patterns, "especially when they utilized bold titles and bulleted accomplishments".
  - [S] What did badly: clutter, little white space, multiple columns and long sentences.
  - Source: [HR Dive summary](https://www.hrdive.com/news/recruiters-spend-74-seconds-looking-at-your-resume/541582/). [S] Search snippets of the Ladders PDF ([copy hosted by BU](https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf)) also say recruiters looked at job titles more than at any other element, and that top performers had an overview or mission statement at the top of page one.
  - Caveat: I could not render the PDF, so these points come from snippets. This is an industry study from a job site, not peer-reviewed, and the sample size is not stated (the 2012 study used 30 recruiters).
- **Scanning follows predictable shapes.**
  - [V] NN/g describes the F-pattern: people read across the top, then a shorter line, then down the left edge. It appears with unformatted "walls of text".
  - [V] NN/g's other scanning patterns: layer-cake (reading headings only), spotted, marking, and commitment.
  - [V] NN/g's fixes: put the key points in the first two paragraphs, start headings with the most informative words, bold key phrases, and use bullets.
  - Source: [NN/g, Pernice 2017, reviewed 2026](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- **Hiring managers rarely read a portfolio in full.**
  - [V] NN/g surveyed 204 UX hiring managers. They want case studies that cover the problem, your role, constraints, process including rejected ideas, impact, and lessons.
  - [V] NN/g recommends 3–5 deep case studies ("quality over quantity") and a scannable layout. Students should pick realistic projects.
  - Source: [NN/g, Krause 2019](https://www.nngroup.com/articles/ux-design-portfolios/), plus the [video version](https://www.nngroup.com/videos/ux-portfolios-hiring/)
  - Caveat: this survey is about UX roles, but the case-study structure carries over to engineering.
- **Project and GitHub work is a strong signal, especially at small companies.**
  - [S] HackerRank's 2018 Developer Skills Report (39k respondents): 84% of CEO/CTO/founder respondents treat GitHub and project work as an important indicator of skill. Portfolio ranked second, after experience. Small companies weight portfolios more heavily than large ones (80% vs 66%).
  - Source: [SD Times](https://sdtimes.com/devexec/job-seeking-developers-skills-outweigh-resume/), [ITPro Today](https://itprotoday.com/it-management/developers-show-your-github-project-to-attract-job-offers)
  - Caveat: the data is from 2018, and HackerRank sells skills assessments.
- **Design-engineering employers ask for craft that is visible.**
  - [S] Linear's Design Engineer (Web & Brand) posting asks for a portfolio showing "a creative use of code" and prototyping skill. Linear also runs paid work trials. Source: [Linear careers](https://linear.app/careers/f04f398b-6320-499d-8a60-290239d62da8)
  - [S] Vercel's Design Engineer postings stress polish, readability, accessibility and performance, plus layout and typography skills. Source: [Built In listing](https://builtin.com/job/design-engineer/2320554)
- **Public, demo-able work gets you found.**
  - [V] Emil Kowalski says that after a rejection he started posting small UI recreations. A video recreating Vercel's tab component led to job offers, and eventually to a message from Vercel's CEO and a design-engineer role there.
  - In his words: "Sharing my work exposed me to opportunities I would never have had otherwise." Source: [emilkowal.ski/ui/animating-in-public](https://emilkowal.ski/ui/animating-in-public)
- **Practitioner checklists (low rigour) agree on the basics.** Put your title and stack visible without scrolling, put projects before a long bio, and give each project a one-liner, its stack, a live link and a code link. They warn against tutorial clones. Source: [Scrimba guide](https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired)
- **Not found:**
  - Stack Overflow or LinkedIn survey data specifically on portfolios.
  - Public "what we look for" posts by Stripe or Figma hiring managers.
  - Gergely Orosz's junior-hiring posts are paywalled.
  - Treat any "73% of hiring managers…" statistic you see on blogs as unverified.

### What it means for the portfolio
- [R] The first screen should answer three things in about 7 s, in this order:
  1. Who and what: name plus a one-line role, e.g. "CE student building X".
  2. What you focus on: 2–3 keywords.
  3. Proof: one or two featured projects, each with a verb-first outcome line and links to the live version and the code.
- [R] Write for layer-cake scanners. Headings should carry the message on their own, each project should start with what it does, and key nouns can be bolded.
- [R] Each project page should be a mini case study: problem, your role (alone or with a team), constraints, decisions and trade-offs, result, and what you learned. A first-year student should state scope honestly.
- [R] Small, polished, demo-able pieces published openly count for more than a long list of tutorial projects.

**Confidence:**
- Medium-high that scanning is fast and selective (NN/g plus several independent sources).
- Medium on the exact 7.4 s figure (single industry study).
- Low-medium on survey percentages (old, vendor-run).

---

## 2. Social: the page as a "who are you, what are you into" card

### Key findings
- [S] **Now pages.** Derek Sivers started the /now page in October 2015: a present-tense page saying what you are focused on now. He uses it to turn down requests without making it personal. The directory [nownownow.com](https://nownownow.com) lists people who keep one. Sources: [sive.rs](https://sive.rs/), [US Chamber Institute piece](https://institute.uschamber.com/now-a-word-that-represents-attention-focus-and-priority/)
- [S] **IndieWeb "home on the web".**
  - The IndieWeb movement treats your own domain as the hub of your online identity, with social profiles as satellites.
  - Tantek Çelik notes that a site with your name on it makes it easier for potential employers to find you and to read about you in your own words.
  - The IndieWeb homepage guidance suggests a short role summary, a way to find more content, and contact info marked up as h-card.
  - Sources: [tantek.com](https://tantek.com/t5Nq1), [IndieWeb homepage (archived)](https://web-archive.nli.org.il/National_Library/20160526010038mp_/https://indiewebcamp.com/homepage), [Ian O'Byrne](https://wiobyrne.com/what-is-indieweb/)
- [S] **Small-page conventions.** Some personal sites use dedicated pages such as /about, /now, /uses and /colophon instead of a heavy nav. These give peers easy "what are you into" hooks. Source: [Matthias Klein](https://www.klein.ruhr/slashes)
- [R] Recruiters and peers ask different questions: "can you do the job?" versus "what are you like, what do we have in common?". One page can serve both if the order is proof first, then personality: a short "Now / currently into" strip, tools, interests, location (Istanbul) and contact.

### What it means for the portfolio
- [R] Add a compact "Now" block on the home page (3–5 lines, dated): what you are learning, building and reading. It also signals that the site is maintained.
- [R] Keep personal details lightweight and skimmable (interest chips, a /uses page). Peers scan for common ground; recruiters skip past it.
- [R] Use one canonical URL for your identity, and point your GitHub, LinkedIn and CV to it.

**Confidence:** Medium. The sources are practitioner and community writing, not research. The /now origin and date are well documented.

---

## 3. Aesthetics and readability

### Key findings
- **Line length.**
  - [S/V-snippet] Baymard Institute recommends 50–75 characters per line for body text. It traces the lower bound to Emil Ruder's 50–60 characters. Long lines feel intimidating and make it hard to find the next line; very short lines break reading rhythm. Source: [Baymard](https://baymard.com/blog/line-length-readability)
- **Type size.**
  - [V] Butterick recommends body text of 15–25 px on websites, and says to reduce line length and line spacing as the point size goes down. Source: [Practical Typography – point size](https://practicaltypography.com/point-size.html)
- **Contrast.**
  - [V/S] WCAG 2.2 SC 1.4.3 (AA) requires 4.5:1 for body text and 3:1 for large text (about 24 px, or about 18.5 px bold). Ratios are not rounded. Pure black on white, or the reverse, is 21:1. Source: [W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- **Dark mode versus light mode.**
  - [V] NN/g (Budiu 2020): for people with normal vision, light mode (positive polarity) performs better, especially with small text. Dark mode helps some low-vision users, for example those with cataracts.
  - [V] NN/g recommends not defaulting everyone to dark mode, offering a toggle, and using the OS setting. The article does not discuss halation or pure black.
  - Source: [NN/g dark mode](https://www.nngroup.com/articles/dark-mode/)
- **Avoid pure black and pure white.**
  - [S] Google's Material dark theme uses #121212 rather than black. The team cites that black backgrounds raise contrast to levels that can increase eye strain.
  - [S] Material sets high-emphasis text at white with 87% opacity and medium-emphasis text at 60%, because pure white "vibrates" against dark backgrounds. It also says saturated colours vibrate on dark backgrounds.
  - Sources: [Android Developers – Dark theme with MDC](https://medium.com/androiddevelopers/dark-theme-with-mdc-4c6fc357d956), [Material dark-theme codelab](https://codelabs.developers.google.com/codelabs/design-material-darktheme/)
- **Halation.**
  - [S] Bright text on black can look blurred or glowing, especially for people with astigmatism. The usual explanation is that the pupil dilates on dark screens, which magnifies optical error.
  - The evidence is mostly design-system and accessibility-blog writing, not controlled studies. Astigmatism prevalence figures (30–50%) are poorly sourced.
  - Sources: [Trimble Modus dark-mode guidance](https://modus.trimble.com/foundations/dark-mode), [a11y with Diana](https://a11ywithdiana.substack.com/p/and)
  - [R] The owner's own experience (pure black and white sites feel tiring) fits this guidance.
- **Scrolling and the fold.**
  - [V] NN/g 2018 (130k fixations, 120 users, 1920×1080): 57% of page-viewing time was above the fold (80% in 2010), 74% in the first two screenfuls and 81% in the first three. Attention still drops sharply below the fold.
  - [V] NN/g's advice: put priority content high, signal that more content exists, and give people a reason to scroll ("people scroll when they expect value").
  - Source: [NN/g Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)
- **False floors.**
  - [V] NN/g's "illusion of completeness": full-screen heroes, strong horizontal dividers and big gaps can make a page look finished. In one cited study, 6 of 8 users missed the content below.
  - [V] NN/g's fix is to let the next section peek above the fold and to avoid full-viewport heroes. Source: [NN/g, Flaherty 2016](https://www.nngroup.com/articles/illusion-of-completeness/)
- **Progressive disclosure.**
  - [V] NN/g: show the core first and put secondary detail one obvious step away, with no more than two levels. Source: [NN/g, Nielsen 2006](https://www.nngroup.com/articles/progressive-disclosure/)
- **Scrollytelling research.**
  - [S] A CHI 2026 study (N=454) compared formats for privacy policies. Scrollytelling gave higher engagement, lower cognitive load and better perceived clarity than plain text, with comprehension about the same. Source: [arXiv 2603.04367](https://arxiv.org/abs/2603.04367)
  - [S] Mittenentzwei et al. 2023 compared slideshows with scrollytelling for data stories. Source: [vis.uib.no](https://vis.uib.no/publications/mittenentzwei2023investigating)
  - Takeaway: scrollytelling helps engagement more than it helps comprehension.

### What it means for the portfolio
- [R] Suggested type settings:
  - Body 17–20 px.
  - `max-width: ~65ch` for prose.
  - Line-height around 1.5–1.6.
- [R] Suggested dark-theme colours:
  - Background in the #111–#1a1a1a range (not #000).
  - Body text around #e6e6e6, or white at about 87% opacity.
  - Secondary text around 60–70%, still meeting 4.5:1.
  - Desaturate accent colours.
  - Respect `prefers-color-scheme`, offer a light theme, and use slightly heavier weights on dark backgrounds.
- [R] Scroll curiosity without gimmicks:
  - Don't let the hero fill the full viewport; let the next section peek in.
  - Give each section one idea, with a heading that makes a claim.
  - Put the strongest project first and progressively disclose deeper detail on project pages.
  - Use motion only when it demonstrates something, and honour `prefers-reduced-motion`.
- [R] Put the proof inside the first 1–2 screens. About three quarters of attention is spent there.

**Confidence:**
- High on line length, contrast thresholds and the scroll data (multiple reputable sources).
- Medium on halation (plausible and widely cited, but thin direct evidence).
- Medium-low on scrollytelling's effect for portfolios specifically.

---

## 4. Marketing concept: "sell the better version of the user"

### Key findings
- **Kathy Sierra, *Badass: Making Users Awesome* (2015), and her Business of Software 2013 talk.**
  - [V] Sierra argues that word of mouth is a side-effect of making users awesome, not of an awesome product.
  - [V] Her test: imagine the ideal review of your product. It should describe what the user can now do, not praise the product.
  - [V] Users want to be good at something bigger than your tool (a great chef rather than a cookbook reader). She also stresses a visible path from novice to expert.
  - Talk summary: "Don't make an impressive product, make your users impressive." Source: [Business of Software](http://businessofsoftware.org/2013/03/kathy-sierra-on-designing-for-badass/)
  - [S] Additional reviews: [Y. Brikman review](https://www.ybrikman.com/blog/2017/02/12/badass-making-users-awesome/), [STC interview](https://www.stc.org/notebook/?p=17262)
- **Samuel Hulick, the Mario and fire-flower analogy.**
  - [V] In a Heavybit interview, Hulick (UserOnboard, *The Elements of User Onboarding*) says companies should explain how the product "makes me the fireball throwing Super Mario" rather than describing the fire flower. Source: [Heavybit](https://www.heavybit.com/library/article/samuel-hulick-elements-of-user-onboarding)
  - [S] His onboarding version: get people shooting fireballs fast, rather than just handing them the flower. Sources: [Userlist podcast](https://userlist.com/podcast/value-paths-fireballs-with-samuel-hulick/), [Beancount summary](https://beancount.io/blog/2026/01/30/samuel-hulick-useronboard-fireball-philosophy-ux-entrepreneur)
- **Correct attribution of the exact line.**
  - [S] "People don't buy products, they buy better versions of themselves" is the title of an essay by **Zander Nethercutt** (Medium, about 2018). It uses the Pepsi Generation campaign as its example.
  - The Indie Hackers post that popularised it gives a hat tip to Hulick and Jack Butcher, so Hulick supplied the Mario imagery, not the sentence. **Do not attribute the quote to Hulick.**
  - Sources: [Indie Hackers](https://www.indiehackers.com/post/people-don-t-buy-products-they-buy-better-versions-of-themselves-f4ff14eaf7), [commonsku podcast reading](https://commonsku.com/skucast/episode-124-people-dont-buy-products-they-buy-better-versions-of-themselves), [Zander Substack](https://zander.substack.com/p/people-dont-buy-products-they-buy)
- **Jobs-to-be-done (Clayton Christensen).**
  - [S] In the milkshake study, morning commuters "hired" a shake to make a long, boring drive bearable and keep them full, not for its flavour. Christensen's point is that demographics correlate with purchases but don't cause them.
  - Primary article: Christensen, Hall, Dillon and Duncan, "Know Your Customers' Jobs to Be Done", *HBR*, Sept 2016 (hbr.org/2016/09/know-your-customers-jobs-to-be-done). I did not fetch it, so it is cited from memory and should be checked.
  - Source: [HBS Working Knowledge](https://hbswk.hbs.edu/item/6496.html)
- **Before–After–Bridge.**
  - [S] A copywriting formula: Before (the current pain), After (the desired state), Bridge (how the product gets you there). It is widely documented, but I found no reliable origin or author.
  - Source: [Campaign Monitor](https://www.campaignmonitor.com/blog/post/4339/increase-email-click-through-copywriting-formula)
- **Apple.**
  - [S] Apple's iPod launch press release (Oct 23, 2001) was headlined "…Puts 1,000 Songs in Your Pocket". It states a user capability rather than "5 GB". Source: [Cult of Mac history](https://www.cultofmac.com/apple-history/first-ipod-launch-date)
  - [S] Analysts describe Apple product pages as benefit headline first, with specs one click deeper. Source: [Practical Ecommerce](https://www.practicalecommerce.com/?p=156305)
- **Dia (The Browser Company).**
  - [V] The diabrowser.com hero reads "More than a browser. A better workday."
  - [V] Sections are written in the second person and lead with actions: "Ask once", "Start your day two steps ahead", "Find the answer without hunting it down", and "Click once and land directly in the right PR".
  - Sources: [diabrowser.com](https://www.diabrowser.com/), [TechCrunch on the June 2025 beta](https://techcrunch.com/2025/06/11/the-browser-company-launches-its-ai-first-browser-dia-in-beta). Josh Miller's "Letter to Arc members 2025" explains the pivot to Dia ([Keeping Tabs](https://browsercompany.substack.com/archive?sort=top)).

### Concrete examples from real product pages
1. **Dia:** "A better workday" (the user's day), not "an AI browser". Each feature is phrased as something you now do: ask once, land in the right PR.
2. **Notion Calendar:** "All of your commitments, now in one place", "See your schedule at a glance", "No more double bookings". These lines are outcomes; they sit next to plainer feature labels such as "Built-in scheduling". ([notion.com/product/calendar](https://www.notion.com/product/calendar))
3. **Apple iPod:** "1,000 songs in your pocket". The capability, not the hard-drive size.
4. **Stripe:** "Financial infrastructure to grow your revenue". The outcome is your revenue, and proof comes from customer stories and scale numbers. ([stripe.com](https://stripe.com/))
5. **Shopify Editions, Winter '26 ("The Renaissance Edition"):** short section taglines aimed at the merchant, e.g. Agentic: sell directly in AI chats. ([shopify.com/editions/winter2026](https://www.shopify.com/editions/winter2026))

### What it means for the portfolio
- [R] Write each project's headline as what the user can now do, then the tech. For example: "Find a free study room on campus in 5 seconds — React Native + Firebase" rather than "Campus room app built with React Native".
- [R] Run Sierra's "ideal review" test on each project blurb. Remove sentences that praise the code; keep ones that describe a user doing something better. Then add one "how" line for engineers (stack, the hard problem you solved).
- [R] Apply the same idea to yourself. The home page should state what a team can do with you (ship a polished front end, prototype quickly, explain clearly), not list adjectives about you.
- [R] Use Before → After → Bridge as the case-study skeleton: the problem, the demo, then how you built it.

**Confidence:**
- High on Sierra and the Hulick analogy (primary or near-primary sources).
- High that the "better versions of themselves" line belongs to Nethercutt, not Hulick.
- Medium on JTBD details (secondary sources; the HBR original was not fetched).
- Low on the origin of BAB.

---

## 5. Product storytelling on a page

### Key findings (page anatomy, from fetching each page on 2026-10-12)
- **diabrowser.com** [V]
  - Hero: a promise, one CTA and a trailer link.
  - Section "Dia reads between the tabs": three numbered capabilities (Morning Brief, Synthesis, Cross-context answers).
  - Section "Built for how you actually work": six feature cards (Profiles, Live Work, Better Meetings, Splits, Decks, Organized Tabs).
  - Then a privacy section showing a mock of the toggles, and a closing CTA ("Ready for a better day?").
  - Pattern: short headline, one line of copy, one product visual per feature.
  - Credits: no public write-up of who built the site. Product design was led by Charlie Deets (ex-Safari), who discusses Dia's craft on [Dive Club](https://rss.com/podcasts/diveclub/3031488/).
- **notion.com/product/calendar** [V]
  - Hero: "It's time." with a looping product video.
  - Four themed sections, e.g. "Time management, simplified" and "Work and life, playing nice". Each contains sub-features, and each sub-feature pairs a short title with a screenshot.
  - The page ends with integrations, a CTA and an FAQ.
  - Headings mix outcome lines and feature lines.
- **animejs.com (v4)** [V]
  - Hero: "All-in-one animation engine.", one tagline and an install command.
  - About nine feature sections (Scroll Observer, staggering, SVG toolset, springs and draggable, Timeline, Scope…). Each has a heading, one line and three links into the docs.
  - Then real code snippets, and a per-module bundle-size breakdown (24.5 KB total) as proof.
  - [R] The library animates its own page, so the page itself is the demo. The text extraction could not confirm the live demos.
  - Credits: built by Julian Garnier. I found no write-up of how the v4 site was made.
- **stripe.com** [V]
  - Hero: an outcome headline and a logo wall.
  - Then product cards with mock UIs, a "backbone of global commerce" stats band (for example 99.999% uptime), and segment sections (enterprise, startups, platforms) built from customer stories.
  - Build write-ups:
    - [V] Stripe blog, *Connect: behind the front-end experience* (Benjamin De Cock, 2017). It covers CSS 3D cubes with JS shading, the Web Animations API (the whole Express demo is about 5 KB), IntersectionObserver to start animations on view, and `prefers-reduced-motion`. Source: [stripe.com/blog/connect-front-end-experience](https://stripe.com/blog/connect-front-end-experience)
    - [V] *To design and develop an interactive globe* (Nick Jones, 2020). The goal was a globe that "inspires a sense of awe, invites people to explore". It covers early full prototypes, Three.js/WebGL shaders, D3 for arcs, a 60 fps target with a static fallback, pausing animation while scrolling, and cutting dots from 60k to 20k. Source: [stripe.com/blog/globe](https://stripe.com/blog/globe)
- **Shopify Editions** [V]
  - Winter '26, "The Renaissance Edition": 150+ updates in 12 category sections (Sidekick, Agentic, Online, Retail…). Each section has a one-word heading and a tagline, featured items get media and a CTA, and there is a sticky category nav.
  - [V] How the Editions sites are made: Shopify's write-up on the Winter '25 "Boring Edition" says it was entirely in-house (design director Maggie Fost; developers embedded from day one). The team prototyped heavily, used Midjourney for concept images, made 150+ videos, and built the Editions sites as Hydrogen stores. Source: [shopify.com/news/how-we-built-boring-edition](https://www.shopify.com/news/how-we-built-boring-edition)
  - [S] Codrops' technical breakdown of the Winter '25 site covers a CRT shader, React Three Fiber/Drei and React Spring. Source: [Codrops](https://tympanus.net/codrops/?p=83842)
  - [S] The team's Webby entry mentions View Transitions and CSS scroll-driven animations, plus aggressive asset compression. Source: [Webby winner story](https://www.webbyawards.com//winner-stories-shopify-editions/)
- **Common principles across the five** [R, grounded in the anatomy above]:
  1. A promise headline plus one sentence plus one CTA.
  2. One idea per block, each with a short headline, one supporting line and one visual or demo.
  3. Show the product working (real UI, live code, video) rather than describing it.
  4. Proof bands: numbers, logos, bundle size, customer stories.
  5. Motion is functional, triggered when it enters the viewport, cheap (WAAPI or CSS), and respects reduced motion (Stripe documents this explicitly).
  6. Long pages are organised by a sticky nav or numbered sections (Shopify, Dia).

### What it means for the portfolio
- [R] Structure the home page like a mini product page:
  1. Hero: who you are and what you do, in one line.
  2. Featured projects: each with a headline, one line, a live visual (looping clip or interactive embed) and links.
  3. A skills and focus strip.
  4. A Now / personal section.
  5. Contact.
- [R] For a design-engineer angle, make one small interaction on the page itself the demo, as anime.js does. Build it with CSS or the Web Animations API, start it with IntersectionObserver, and honour `prefers-reduced-motion`.
- [R] Add a proof band per project: users, stars, a performance number, or a course grade or award where honest.
- [R] Keep it short. Students have 2–4 strong projects, not 150 updates. Two-level progressive disclosure (card, then case study) beats one very long scroll.

**Confidence:**
- High on page anatomy (fetched directly, though text extraction misses visuals and motion).
- High on the Stripe and Shopify build write-ups (first-party).
- Low on how diabrowser.com, Notion Calendar and animejs.com were built (no public case studies found).

---

## Gaps and caveats
- The Ladders 2018 PDF could not be parsed. Field-level claims come from snippets and press coverage.
- I found no first-party "what we look for in portfolios" posts from Stripe, Figma or Vercel hiring managers, only job postings and Emil Kowalski's own story.
- I found no Stack Overflow or LinkedIn survey data specific to portfolios.
- The HBR JTBD article was not fetched, and the origin of BAB is unknown.
- Page structures were captured as text, so motion and visual details are partly inferred.
