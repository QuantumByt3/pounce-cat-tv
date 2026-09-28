# Privacy Policy

Pounce is designed as a local, offline Windows desktop application for cat enrichment.

The project is intentionally built to collect as little information as possible.

## Information Pounce collects

Pounce does **not** collect, transmit, sell, or share personal information.

The application does not require:

- an account;
- a name;
- an email address;
- a phone number;
- a location;
- a login;
- analytics consent; or
- advertising identifiers.

## Network activity

Pounce does not require an internet connection for normal use.

The application does not intentionally:

- contact external application servers;
- send telemetry;
- send analytics;
- load advertisements;
- load remote scripts;
- load remote images; or
- transmit application usage data.

The Electron renderer uses a restrictive Content Security Policy that blocks network connections from the application interface.

## Permissions

Pounce intentionally permits only the browser-style **screen wake lock** permission from its trusted local application origin.

This permission is used to help keep the display awake while Pounce is actively running.

Pounce does not request access to:

- camera;
- microphone;
- geolocation;
- notifications;
- USB devices;
- serial devices;
- Bluetooth devices; or
- local-network resources.

## Local application data

Pounce does not currently maintain user profiles or a persistent user database.

Application state such as the catch counter and current target selection exists only while the application is running and is reset when a new session begins.

Pounce does not currently use application analytics, tracking cookies, or persistent advertising identifiers.

## Sound

Pounce sound effects are generated locally by the application.

The application does not record audio and does not request microphone access.

## Installer and operating-system records

Windows may independently maintain normal operating-system records related to installing, launching, updating, or removing applications.

Examples can include installation history, security logs, application-control events, crash information, or other Windows diagnostic data.

Those records are created and controlled by Windows or other software installed on the computer, not by Pounce itself.

## Third-party development tools

The Pounce source project uses development and packaging tools such as Electron, npm, Electron Packager, and electron-winstaller.

These tools are used to build the application and are not runtime tracking services within Pounce.

The installed Pounce application currently has **zero runtime npm dependencies**.

## Future changes

If a future Pounce version introduces functionality that changes its privacy behavior, this document should be updated before that version is released.

Examples could include:

- online services;
- cloud synchronization;
- automatic update services;
- persistent user preferences;
- crash reporting; or
- analytics.

Such features should not be introduced silently.

## Questions and reports

Privacy-related concerns may be reported through the repository's normal GitHub issue system unless they involve a security vulnerability.

Potential security vulnerabilities should instead follow the private reporting process described in [SECURITY.md](SECURITY.md).

## Summary

Pounce is designed to operate locally, offline, and without collecting personal information.
