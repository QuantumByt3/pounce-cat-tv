# Security Policy

Pounce is a small local Windows desktop application, but security reports are still taken seriously.

## Supported versions

Pounce is currently in pre-release development.

| Version                    | Supported |
| -------------------------- | --------- |
| 0.1.x                      | Yes       |
| Earlier development builds | No        |

Only the latest published release is supported for security fixes.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a suspected security vulnerability.

Use GitHub's **Private Vulnerability Reporting** feature for this repository when available.

If private vulnerability reporting is temporarily unavailable, do not post exploit details, credentials, secrets, or proof-of-concept material publicly. Wait for a private reporting channel to be restored.

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

Please remove unrelated personal information, credentials, tokens, and private data before submitting evidence.

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
- installer or update behavior that creates a security risk;
- dependency or supply-chain vulnerabilities that affect Pounce;
- path traversal or local file access outside the intended application files;
- sensitive information unintentionally included in a release; and
- reproducible crashes that create a meaningful security impact.

The following are generally not security vulnerabilities by themselves:

- cosmetic defects;
- animation issues;
- ordinary application crashes without a security impact;
- feature requests;
- performance problems;
- Windows SmartScreen or reputation warnings for an unsigned development build;
- unsupported operating systems; and
- vulnerabilities that exist only in modified third-party builds of Pounce.

These issues may still be reported through normal GitHub issues when the repository is public.

## Current security design

Pounce currently uses several defensive controls, including:

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
- no runtime npm dependencies;
- pinned direct development dependencies;
- dependency auditing; and
- secret scanning before release.

Security controls are reviewed as the application evolves.

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
