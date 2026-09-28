# Changelog

All notable changes to Pounce will be documented in this file.

The format follows the general principles of Keep a Changelog, and the project uses semantic versioning for releases.

## [0.1.0] - Unreleased

Initial Windows pre-release candidate.

### Added

- Native Windows desktop application using Electron.
- Windows installer generated with Squirrel.Windows.
- Custom Pounce application icon.
- Custom Pounce-branded installer loading animation.
- Six interactive targets:
  - Mouse
  - Bug
  - Fish
  - Bird
  - Windows-style cursor
  - Laser
- Original SVG bird artwork with multiple animated wing positions.
- One, two, or three simultaneous targets.
- Calm, Normal, and Zoomies movement speeds.
- Optional locally generated sound effects.
- Catch counter.
- Fullscreen mode.
- Pause and resume controls.
- Automatically fading controls during play.
- Screen wake-lock support during active play.
- Keyboard shortcuts for major controls.
- Windows Start Menu installation and uninstall support.

### Accessibility

- Added semantic toolbar and control-group information.
- Added `aria-pressed` state handling for selectable controls.
- Added live-region support for the catch counter.
- Hidden visual canvas content from assistive technology.
- Prevented hidden controls from remaining keyboard-focusable.
- Improved state synchronization for fullscreen, sound, pause, and target controls.

### Security

- Enabled Electron renderer sandboxing.
- Disabled Node.js integration in the renderer.
- Enabled context isolation.
- Added a restrictive Content Security Policy.
- Replaced `file://` rendering with the local `pounce://app/` protocol.
- Restricted local protocol access to approved application file types.
- Added path-traversal protection to the local protocol handler.
- Blocked renderer navigation.
- Blocked creation of additional renderer windows.
- Denied browser-style permissions except screen wake lock from the trusted Pounce origin.
- Enabled ASAR integrity validation.
- Enabled `OnlyLoadAppFromAsar`.
- Disabled `ELECTRON_RUN_AS_NODE`.
- Disabled Node environment-option support in the packaged executable.
- Disabled Node inspector command-line arguments.
- Disabled unnecessary extra `file://` privileges.
- Configured the Windows application to run as the invoking user rather than requesting administrator privileges.
- Removed all runtime npm dependencies.
- Pinned direct development dependencies to exact versions.

### Build and release

- Added reproducible dependency installation through `package-lock.json`.
- Added JavaScript syntax verification.
- Added npm vulnerability auditing.
- Added Electron fuse verification.
- Moved intermediate Electron package output outside the VS Code workspace.
- Excluded development, repository, and editor files from the packaged application.
- Reduced packaged `app.asar` contents to runtime-required files only.
- Added Windows installer SHA-256 verification workflow.
- Validated install, launch, uninstall, and reinstall behavior on Windows 11.

### Documentation

- Rewrote the README for end users and developers.
- Added a security policy.
- Added a privacy policy.
- Added contribution guidelines.
- Added repository hygiene files for Git, editors, and line endings.

### Known release limitation

- The Windows installer is not yet code-signed. Public release signing should be addressed before treating the installer as a fully trusted production distribution.
