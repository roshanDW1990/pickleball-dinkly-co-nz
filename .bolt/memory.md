# Project memory

## Product intent & audience

- "Dinkly" is a sports league management web app built with Vite + React.
- Public pages: Home, Upcoming Leagues, Standings, Results, Match History, info pages.
- Member features: account creation, sign-in, league entry payment, match result submission, member dashboard.
- Admin area exists separately.
- Contact form present.
- Target audience: league players/members and visitors browsing league info.
- Likely New Zealand-based or NZ-focused (NZ privacy rules referenced).

## Brand personality & voice

- Friendly but tidy and trustworthy tone.
- Prioritizes user trust via transparency (cookie consent, privacy policies).

## Visual design & UX direction

- Styling via Tailwind CSS; icons via lucide-react.
- Cookie notice planned as a small, tidy banner with Accept/Decline buttons matching Dinkly's style.
- Footer intended to include links (e.g., cookie preference management, policy links).
- Component patterns should align with existing Dinkly visual language (inferred, not yet documented).

## Decisions, constraints & rationale

- Google Analytics (GA4) planned with Measurement ID: G-QN4NDD66D4.
- GA to run on live site only, not in Bolt preview/testing.
- Admin area excluded from tracking to avoid inflating metrics.
- Cookie consent gate: GA loads only after visitor accepts; choice remembered for future visits.
- No PII (names, emails, phone numbers) sent to GA.
- Planned GA events: account creation, sign-in, payment start, payment complete, match result submission.
- Existing Cookies Policy currently states analytics are NOT used — must be updated alongside Privacy Policy before enabling GA.
- No additional UI/icon packages to be installed beyond the starter's Tailwind + lucide-react stack.
- Republish step required after deploy for analytics to activate live.

## Open questions & assumptions

- Cookie notice vs. always-on GA: awaiting user decision; consent banner recommended as safer option.
- Whether signed-in members' dashboard visits should be tracked, or only public pages.
- Whether additional events (e.g., contact form submissions) should be tracked beyond the current planned list.
- Database may currently be disconnected; sign-up/payment event tracking will only be observable once DB is reconnected and auth flows are live.