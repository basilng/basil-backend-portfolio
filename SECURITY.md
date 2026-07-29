# Security policy

## Supported version

Only the latest version deployed from the `main` branch is supported.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Contact the repository owner privately through the email address listed on the portfolio.

Include:

- the affected URL or file;
- reproduction steps;
- expected and actual behaviour;
- potential impact;
- any suggested mitigation.

## Security model

This project is a statically generated website. It deliberately contains no authentication, database, server-side contact form, third-party analytics, advertising scripts or runtime secrets.

Security controls include:

- a restrictive Content Security Policy;
- anti-framing and MIME-sniffing protection;
- minimal permissions policy;
- locked dependencies and automated dependency review;
- CodeQL analysis;
- npm vulnerability auditing;
- no inline client JavaScript in the baseline implementation.
