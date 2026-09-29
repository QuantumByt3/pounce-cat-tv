# Security Policy

Pounce is a small local Windows desktop application, but security reports are taken seriously.

## Supported versions

Only the latest published release is supported for security fixes.

| Version                            | Supported |
| ---------------------------------- | --------- |
| 1.x                                | Yes       |
| 0.x and earlier development builds | No        |

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a suspected security vulnerability.

Use this repository's **Private Vulnerability Reporting** feature from the GitHub **Security** tab.

Do not post exploit details, credentials, secrets, proof-of-concept material, or other sensitive information in a public issue.

## What to include

A useful report should include:

- a clear description of the issue;
- the affected Pounce version;
- the Windows version and architecture used for testing;
- exact reproduction steps;
- expected behavior;
- observed behavior;
- the security impact;
- relevant logs or screenshots; and
- a proof of concept when one is necessary to demonstrate the issue.

Remove unrelated personal information, credentials, tokens, and private data before submitting evidence.

## Security scope

Examples of issues that are in scope include:

- arbitrary code execution;
- privilege escalation;
- sandbox escape;
- unintended Node.js access from the renderer;
- bypass of the Content Security Policy;
- unsafe navigation or external-content execution;
- unauthorized permission access;
- ASAR integrity bypass;
- installer behavior that creates a security risk;
- dependency or supply-chain vulnerabilities that affect Pounce;
- path traversal or unintended local-file access;
- sensitive information unintentionally included in a release; and
- reproducible crashes that create a meaningful security impact.

The following are generally not security vulnerabilities by themselves:

- cosmetic defects;
- animation issues;
- ordinary application crashes without a security impact;
- feature requests;
- performance problems;
- Windows SmartScreen or reputation warnings caused by an unsigned release;
- unsupported operating systems; and
- vulnerabilities that exist only in modified third-party builds of Pounce.

These non-security issues may be reported through the repository's normal GitHub issue forms.

## Current application security design

Pounce currently uses defensive controls including:

- Electron renderer sandboxing;
- Node integration disabled in the renderer;
- context isolation;
- a restrictive Content Security Policy;
- a custom local `pounce://app/` protocol instead of `file://`;
- blocked renderer navigation and new-window creation;
- explicit permission handling;
- Electron security fuses;
- ASAR integrity validation;
- `OnlyLoadAppFromAsar`;
- zero runtime npm dependencies; and
- pinned direct development dependencies.

## Repository security controls

The repository also uses:

- GitHub Actions validation;
- npm vulnerability auditing;
- CodeQL analysis;
- Dependabot alerts and update pull requests;
- secret scanning;
- push protection;
- private vulnerability reporting; and
- an active protection ruleset for `main`.

Security controls are reviewed as the application and repository evolve.

## Disclosure

Please allow reasonable time to investigate and correct a confirmed vulnerability before publishing technical details publicly.

After a fix is available, the project may publish a security advisory, release notes, or other documentation describing the issue and remediation.

## Safe-harbor intent

Good-faith security research intended to identify and responsibly report vulnerabilities is welcome.

Do not:

- access data that does not belong to you;
- disrupt systems or services;
- use social engineering;
- perform denial-of-service testing against third parties;
- retain or distribute sensitive information; or
- exceed what is reasonably necessary to demonstrate a vulnerability.

This policy applies only to Pounce project code and official project releases.
