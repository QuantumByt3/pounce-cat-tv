# Pounce

Pounce is a lightweight Windows desktop screen toy for cats. It animates interactive targets across the screen for visual enrichment and play.

Current release status: **pre-release (v0.1.0)**.

## For Windows users

The normal user does **not** need Node.js, npm, Visual Studio Code, or a web browser.

When a release is published:

1. Open the repository's **Releases** page.
2. Download `Pounce-Setup.exe`.
3. Run the installer.
4. Launch **Pounce** from the Windows Start Menu.
5. Select a target and press **Start the show**.

Pounce currently targets **64-bit Windows 11**.

> The current development installer is not yet code-signed. Windows may show an Unknown Publisher or reputation warning until release signing is implemented.

## Features

- Six interactive targets:
  - Mouse
  - Bug
  - Fish
  - Bird
  - Windows-style cursor
  - Laser
- One, two, or three targets at once.
- Three movement speeds: Calm, Normal, and Zoomies.
- Optional synthesized sound effects.
- Fullscreen mode.
- Pause and resume without closing the application.
- Catch counter for clicks or taps.
- Controls automatically fade during play.
- Animated original SVG bird artwork.
- Custom Pounce application and installer branding.
- Offline operation after installation.
- No account, analytics, advertising, or telemetry.

## Controls

| Action             | Control |
| ------------------ | ------- |
| Mouse              | `1`     |
| Bug                | `2`     |
| Fish               | `3`     |
| Bird               | `4`     |
| Cursor             | `5`     |
| Laser              | `6`     |
| Fullscreen         | `F`     |
| Hide/show controls | `H`     |
| Pause/resume       | `P`     |

The on-screen controls provide the same target, pace, count, sound, pause, and fullscreen options.

## Privacy

Pounce is designed to work locally and offline.

The application:

- does not require an account;
- does not collect personal information;
- does not include analytics or telemetry;
- does not contain advertising;
- does not send application data to external services; and
- does not require camera, microphone, location, notification, USB, serial, or local-network permissions.

The only browser-style permission intentionally allowed by the Electron application is **screen wake lock**, which is used to help keep the display awake during play.

See [PRIVACY.md](PRIVACY.md) for the project privacy statement.

## Security

The desktop application is intentionally hardened for a small local Electron application.

Current controls include:

- Electron renderer sandbox enabled.
- Node integration disabled in the renderer.
- Context isolation enabled.
- Restrictive Content Security Policy.
- Custom `pounce://app/` local application protocol instead of `file://`.
- New-window creation denied.
- Renderer navigation denied.
- Permission requests denied except screen wake lock from the trusted Pounce origin.
- ASAR packaging with integrity validation enabled.
- Electron configured to load application code only from `app.asar`.
- `ELECTRON_RUN_AS_NODE` disabled.
- Node environment and inspector command-line features disabled in the packaged executable.
- Extra `file://` privileges disabled.
- Zero runtime npm dependencies.
- Direct development dependencies pinned to exact versions.
- npm vulnerability auditing included in the verification workflow.
- Secret scanning performed before publication.

Security issues should be reported according to [SECURITY.md](SECURITY.md).

## Development requirements

Development and packaging currently use:

- Windows 11
- Node.js `>=22.12.0`
- npm
- Electron `44.4.5`
- `@electron/packager` `20.3.0`
- `electron-winstaller` `5.4.4`
- `@electron/fuses` `2.1.3`
- Prettier

Install the exact dependency tree recorded in `package-lock.json`:

```powershell
npm ci
```

Start Pounce in development mode:

```powershell
npm start
```

## Verification

Run the project verification gate before packaging:

```powershell
npm run verify
```

This currently performs JavaScript syntax checks and an npm security audit.

A successful run should finish with:

```text
found 0 vulnerabilities
```

## Build the Windows application

Create the hardened temporary Windows package:

```powershell
npm run package:win
```

The intermediate packaged application is written outside the repository under the current user's Windows temporary directory:

```text
%TEMP%\PounceBuild\
```

This keeps generated Electron runtime files outside the source workspace and avoids editor file-lock problems.

Create the Windows installer:

```powershell
npm run installer:win
```

The user-facing installer is written to:

```text
dist\installer\Pounce-Setup.exe
```

Run both verification and packaging steps with:

```powershell
npm run dist:win
```

Generated `dist/` content and `node_modules/` are excluded from Git.

## Release verification

Before publishing an installer:

1. Run `npm run verify`.
2. Build the Windows package.
3. Verify Electron security fuses.
4. Inspect the packaged `app.asar` contents.
5. Build the installer.
6. Install from a clean folder outside the repository.
7. Launch Pounce from the Start Menu.
8. Smoke-test the application controls.
9. Uninstall Pounce.
10. Reinstall from the same installer.
11. Calculate and publish the installer's SHA-256 hash.

Example:

```powershell
Get-FileHash .\dist\installer\Pounce-Setup.exe -Algorithm SHA256
```

## Project structure

```text
pounce-cat-tv/
├── .github/                 # GitHub workflows and repository templates
├── assets/
│   ├── birds/               # Original SVG bird animation frames
│   ├── icons/               # Application icon source and Windows icon
│   └── installer/           # Installer loading artwork
├── scripts/
│   ├── build-windows.js     # Windows packaging and Electron fuse hardening
│   └── create-installer.js  # Windows installer creation
├── index.html               # Application interface
├── main.js                  # Electron main process and security controls
├── script.js                # Target movement, drawing, sound, and controls
├── style.css                # Application styling
├── package.json             # Project metadata and npm commands
├── package-lock.json        # Reproducible dependency lockfile
└── LICENSE                  # MIT License
```

## Contributing

Contributions should remain focused on simplicity, reliability, privacy, security, and useful cat enrichment.

Before submitting a change:

```powershell
npm ci
npm run verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow.

## License

Pounce is released under the [MIT License](LICENSE).

Copyright © 2026 Joe B.
