# Pounce

Pounce is a lightweight Windows desktop screen toy for cats. It animates interactive targets across the screen for visual enrichment and play.

## Download and install

For normal use, download Pounce from the repository's official [Releases](https://github.com/QuantumByt3/pounce-cat-tv/releases) page.

1. Download `Pounce-Setup.exe` from the latest release.
2. Optionally verify the installer's SHA-256 hash against the value published in the release notes.
3. Run `Pounce-Setup.exe`.
4. Launch **Pounce** from the Windows Start Menu.
5. Select a target and press **Start the show**.

Pounce is currently tested on **64-bit Windows 11**. Other Windows versions are not currently claimed as supported.

> **Windows security notice:** The direct-download installer is currently not Authenticode code-signed. Windows may display an **Unknown Publisher** or reputation warning. Only install Pounce when it was downloaded from this repository's official Releases page, and verify the published SHA-256 hash when you want to confirm file integrity.

If no release is currently published, developers can build Pounce from source using the instructions below.

## Features

- Six interactive targets:
  - Mouse
  - Bug
  - Fish
  - Bird
  - Windows-style cursor
  - Laser
- One, two, or three simultaneous targets.
- Three movement speeds: Calm, Normal, and Zoomies.
- Optional locally generated sound effects.
- Fullscreen mode.
- Pause and resume without closing the application.
- Catch counter for clicks or taps.
- Controls that automatically fade during play.
- Original animated SVG bird artwork.
- Custom Pounce application and installer branding.
- Offline operation after installation.
- No account, advertising, analytics, or telemetry.

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
- does not send application usage data to external services; and
- does not request camera, microphone, location, notification, USB, serial, Bluetooth, or local-network access.

The only browser-style permission intentionally allowed by the Electron application is **screen wake lock**, which helps keep the display awake during active play.

See [PRIVACY.md](PRIVACY.md) for the full project privacy statement.

## Security

Pounce uses a deliberately small Electron attack surface.

Current application controls include:

- renderer sandboxing;
- `nodeIntegration: false`;
- context isolation;
- a restrictive Content Security Policy;
- a custom local `pounce://app/` protocol instead of `file://`;
- blocked renderer navigation and new-window creation;
- permission requests denied except screen wake lock from the trusted Pounce origin;
- ASAR packaging with embedded integrity validation;
- `OnlyLoadAppFromAsar`;
- `ELECTRON_RUN_AS_NODE` disabled;
- Node environment-option and inspector command-line features disabled in the packaged executable;
- unnecessary extra `file://` privileges disabled;
- zero runtime npm dependencies; and
- direct development dependencies pinned to exact versions.

Repository security controls include automated validation, npm vulnerability auditing, CodeQL analysis, Dependabot, secret scanning, push protection, private vulnerability reporting, and protection rules for `main`.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and security-support information.

## Build from source

### Requirements

- 64-bit Windows 11
- Git
- Node.js `>=22.12.0`
- npm

Clone the repository:

```powershell
git clone https://github.com/QuantumByt3/pounce-cat-tv.git
cd pounce-cat-tv
```

Install the exact dependency tree recorded in `package-lock.json`:

```powershell
npm ci
```

Start Pounce in development mode:

```powershell
npm start
```

### Verify the source

Run:

```powershell
npm run verify
```

This performs JavaScript syntax checks and an npm security audit.

Check formatting with:

```powershell
npx prettier --check .
```

### Build the Windows installer

Create the complete Windows distribution with:

```powershell
npm run dist:win
```

That command:

1. runs the verification gate;
2. creates the hardened Windows application package;
3. applies the configured Electron security fuses; and
4. creates the Windows installer.

The intermediate Electron application is built outside the repository under:

```text
%TEMP%\PounceBuild\
```

The final installer is written to:

```text
dist\installer\Pounce-Setup.exe
```

Generated `dist/` content and `node_modules/` are intentionally excluded from Git.

You can also run the packaging stages individually:

```powershell
npm run package:win
npm run installer:win
```

## Verify an installer hash

Published releases should include the SHA-256 hash of `Pounce-Setup.exe`.

To calculate it locally:

```powershell
Get-FileHash .\dist\installer\Pounce-Setup.exe -Algorithm SHA256
```

Compare the result with the hash published in the corresponding GitHub release.

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

Contributions should remain focused on simplicity, reliability, privacy, security, accessibility, maintainability, and useful cat enrichment.

Before submitting a change:

```powershell
npm ci
npm run verify
npx prettier --check .
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow.

## License

Pounce is released under the [MIT License](LICENSE).

Copyright © 2026 Joe B.
