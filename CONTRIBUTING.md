# Contributing to Pounce

Thank you for considering a contribution to Pounce.

Pounce is intentionally kept small, simple, local, and privacy-focused. Contributions should preserve those goals.

## Guiding principles

Changes should improve one or more of the following:

- reliability;
- usability;
- accessibility;
- security;
- privacy;
- maintainability;
- cat enrichment value; or
- Windows installation and release quality.

Avoid adding complexity without a clear user benefit.

## Before you begin

Please review:

- [README.md](README.md)
- [SECURITY.md](SECURITY.md)
- [PRIVACY.md](PRIVACY.md)
- [LICENSE](LICENSE)

Security vulnerabilities should not be reported through public issues. Follow the process in `SECURITY.md`.

## Development environment

Current development targets:

- Windows 11
- Node.js `>=22.12.0`
- npm
- Electron `44.4.5`

Install the dependency tree recorded in `package-lock.json`:

```powershell
npm ci
```

Start the application in development mode:

```powershell
npm start
```

## Verification

Before submitting a contribution, run:

```powershell
npm run verify
```

This currently performs:

- JavaScript syntax checks; and
- npm vulnerability auditing.

A successful verification run should end with:

```text
found 0 vulnerabilities
```

## Formatting

Pounce uses Prettier for source formatting.

Format the primary source files with:

```powershell
npx prettier --write .
```

Do not manually introduce formatting styles that conflict with the existing project.

## Windows packaging

Build the hardened Windows application with:

```powershell
npm run package:win
```

The intermediate application package is created under:

```text
%TEMP%\PounceBuild\
```

Create the Windows installer with:

```powershell
npm run installer:win
```

The installer is written to:

```text
dist\installer\Pounce-Setup.exe
```

Generated build output under `dist/` must not be committed to Git.

## Security expectations

Changes must not weaken existing security controls without a documented and justified reason.

Important controls currently include:

- renderer sandboxing;
- `nodeIntegration: false`;
- context isolation;
- restrictive Content Security Policy;
- custom `pounce://app/` application protocol;
- blocked renderer navigation;
- blocked new-window creation;
- explicit permission handling;
- ASAR integrity validation;
- Electron security fuses;
- zero runtime npm dependencies; and
- exact direct development dependency versions.

Do not introduce:

- remote scripts;
- remote images;
- analytics;
- advertising;
- telemetry;
- unnecessary permissions;
- unnecessary IPC;
- shell execution;
- embedded credentials;
- API keys; or
- additional runtime dependencies

without clear technical justification and review.

## Privacy expectations

Pounce is designed to operate locally and offline.

A change that introduces network communication, persistent user data, analytics, crash reporting, cloud functionality, automatic updates, or similar behavior must also update `PRIVACY.md` before release.

## Pull requests

A pull request should:

- describe what changed;
- explain why the change is useful;
- identify any security or privacy impact;
- include relevant testing results;
- keep the scope focused; and
- pass `npm run verify`.

For visual or behavioral changes, include screenshots or a concise description of the observed behavior when useful.

## Issues

Use issues for:

- reproducible bugs;
- feature proposals;
- accessibility improvements;
- documentation improvements; and
- installation or compatibility problems.

Before opening an issue, check whether a similar issue already exists.

## Generated files

Do not commit:

- `node_modules/`;
- `dist/`;
- temporary build directories;
- locally installed application files;
- editor-specific workspace files; or
- secrets and credentials.

`package-lock.json` should be committed because it supports reproducible dependency installation.

## Licensing

By contributing code or documentation to this repository, you agree that your contribution may be distributed under the repository's MIT License.

## Keep Pounce simple

The preferred implementation is usually the smallest clear solution that preserves security, privacy, usability, and maintainability.

If two approaches solve the same problem, prefer the one that introduces fewer moving parts.
