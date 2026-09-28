const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses");

const rootDir = path.resolve(__dirname, "..");

const tempBuildRoot = path.join(os.tmpdir(), "PounceBuild");

const outputDir = path.join(tempBuildRoot, "package");

const packageInfoPath = path.join(tempBuildRoot, "package-info.json");

const iconPath = path.join(rootDir, "assets", "icons", "pounce.ico");

const packageJson = require(path.join(rootDir, "package.json"));

function cleanDirectory(directory) {
  fs.rmSync(directory, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 300,
  });
}

async function hardenExecutable(appPath) {
  const executablePath = path.join(appPath, "Pounce.exe");

  if (!fs.existsSync(executablePath)) {
    throw new Error(`Packaged executable was not found: ${executablePath}`);
  }

  console.log("Applying Electron security fuses...");

  await flipFuses(executablePath, {
    version: FuseVersion.V1,

    strictlyRequireAllFuses: true,

    [FuseV1Options.RunAsNode]: false,

    [FuseV1Options.EnableCookieEncryption]: false,

    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,

    [FuseV1Options.EnableNodeCliInspectArguments]: false,

    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,

    [FuseV1Options.OnlyLoadAppFromAsar]: true,

    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,

    [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,

    [FuseV1Options.WasmTrapHandlers]: true,
  });

  console.log("Electron security fuses applied.");
}

async function buildWindows() {
  const { packager, defaultSanitizePackageJson } =
    await import("@electron/packager");

  console.log("");
  console.log("Building Pounce for Windows...");
  console.log("");

  /*
    Build outside the VS Code workspace
    so generated app.asar files are not
    locked by the editor or extensions.
  */
  cleanDirectory(outputDir);

  fs.mkdirSync(outputDir, {
    recursive: true,
  });

  const appPaths = await packager({
    dir: rootDir,

    name: "Pounce",

    executableName: "Pounce",

    platform: "win32",

    arch: "x64",

    out: outputDir,

    overwrite: true,

    asar: true,

    prune: true,

    icon: iconPath,

    appVersion: packageJson.version,

    appCopyright: "Copyright © 2026 Joe B.",

    win32metadata: {
      CompanyName: "QuantumByt3",

      FileDescription: "Pounce — Cat TV",

      ProductName: "Pounce",

      InternalName: "Pounce",

      OriginalFilename: "Pounce.exe",

      "requested-execution-level": "asInvoker",
    },

    /*
        Include only actual runtime
        application content.

        Installer artwork is used during
        packaging but is not needed by the
        installed Pounce application.
      */
    ignore: [
      /[\\/]node_modules([\\/]|$)/,

      /[\\/]scripts([\\/]|$)/,
      /[\\/]dist([\\/]|$)/,

      /[\\/]\.github([\\/]|$)/,
      /[\\/]\.vscode([\\/]|$)/,

      /[\\/]\.editorconfig$/,
      /[\\/]\.gitattributes$/,
      /[\\/]\.gitignore$/,

      /[\\/]\.prettierignore$/,
      /[\\/]\.prettierrc(\..+)?$/,

      /[\\/]package-lock\.json$/,

      /[\\/]README\.md$/,
      /[\\/]SECURITY\.md$/,
      /[\\/]CONTRIBUTING\.md$/,
      /[\\/]CHANGELOG\.md$/,
      /[\\/]PRIVACY\.md$/,
      /[\\/]CODE_OF_CONDUCT\.md$/,
      /[\\/]SUPPORT\.md$/,

      /*
          Build/design-only assets.
        */
      /[\\/]assets[\\/]icons[\\/]pounce-icon\.svg$/,
      /[\\/]assets[\\/]installer([\\/]|$)/,
    ],

    sanitizePackageJson: [
      defaultSanitizePackageJson,

      (bundledPackageJson) => {
        delete bundledPackageJson.allowScripts;
        delete bundledPackageJson.engines;
        delete bundledPackageJson.keywords;

        return bundledPackageJson;
      },
    ],
  });

  if (appPaths.length !== 1) {
    throw new Error(
      `Expected one packaged application, but received ${appPaths.length}.`,
    );
  }

  const appPath = appPaths[0];

  await hardenExecutable(appPath);

  /*
    Record the exact temporary package
    location for the installer script.
  */
  fs.mkdirSync(tempBuildRoot, {
    recursive: true,
  });

  fs.writeFileSync(
    packageInfoPath,

    `${JSON.stringify(
      {
        version: packageJson.version,

        appPath,
      },
      null,
      2,
    )}\n`,

    "utf8",
  );

  console.log("");
  console.log("Pounce package created and hardened successfully.");

  console.log("");
  console.log(appPath);

  console.log("");
}

buildWindows().catch((error) => {
  console.error("");
  console.error("Windows packaging failed.");

  console.error("");
  console.error(error);

  process.exitCode = 1;
});
