const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const tempBuildRoot = path.join(os.tmpdir(), "PounceBuild");

const packageInfoPath = path.join(tempBuildRoot, "package-info.json");

const outputDirectory = path.join(rootDir, "dist", "installer");

const setupIcon = path.join(rootDir, "assets", "icons", "pounce.ico");

const loadingGif = path.join(
  rootDir,
  "assets",
  "installer",
  "pounce-loading.gif",
);

const packageJson = require(path.join(rootDir, "package.json"));

function cleanDirectory(directory) {
  fs.rmSync(directory, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 300,
  });
}

function getPackagedAppDirectory() {
  if (!fs.existsSync(packageInfoPath)) {
    throw new Error(
      "No packaged Pounce build was found. Run npm run package:win first.",
    );
  }

  const packageInfo = JSON.parse(fs.readFileSync(packageInfoPath, "utf8"));

  if (!packageInfo.appPath) {
    throw new Error(
      "The package information file does not contain an appPath.",
    );
  }

  const appDirectory = path.resolve(packageInfo.appPath);

  const executablePath = path.join(appDirectory, "Pounce.exe");

  if (!fs.existsSync(executablePath)) {
    throw new Error(
      `Packaged Pounce executable was not found: ${executablePath}`,
    );
  }

  return appDirectory;
}

async function createInstaller() {
  const { createWindowsInstaller } = await import("electron-winstaller");

  const appDirectory = getPackagedAppDirectory();

  if (!fs.existsSync(setupIcon)) {
    throw new Error(`Installer icon was not found: ${setupIcon}`);
  }

  if (!fs.existsSync(loadingGif)) {
    throw new Error(`Installer loading animation was not found: ${loadingGif}`);
  }

  console.log("");
  console.log("Creating Pounce Windows installer...");
  console.log("");

  cleanDirectory(outputDirectory);

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  await createWindowsInstaller({
    appDirectory,

    outputDirectory,

    authors: "Joe B.",

    owners: "Joe B.",

    title: "Pounce",

    name: "Pounce",

    description: packageJson.description,

    version: packageJson.version,

    exe: "Pounce.exe",

    setupExe: "Pounce-Setup.exe",

    setupIcon,

    /*
      Replace Squirrel's generic green
      installer animation with our own
      original Pounce-branded animation.
    */
    loadingGif,

    noMsi: true,
  });

  const setupPath = path.join(outputDirectory, "Pounce-Setup.exe");

  if (!fs.existsSync(setupPath)) {
    throw new Error("Pounce-Setup.exe was not created.");
  }

  console.log("");
  console.log("Pounce installer created successfully.");
  console.log("");

  console.log(setupPath);

  console.log("");
}

createInstaller().catch((error) => {
  console.error("");
  console.error("Windows installer creation failed.");

  console.error("");
  console.error(error);

  process.exitCode = 1;
});
