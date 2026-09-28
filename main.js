const { app, BrowserWindow, net, protocol, session } = require("electron");

const path = require("node:path");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const APP_SCHEME = "pounce";
const APP_HOST = "app";
const APP_URL = `${APP_SCHEME}://${APP_HOST}/index.html`;

const ALLOWED_EXTENSIONS = new Set([".html", ".css", ".js", ".svg", ".ico"]);

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,

    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      codeCache: true,
    },
  },
]);

/*
  Squirrel.Windows launches the application
  with special command-line arguments during
  installation, update, uninstall, and cleanup.

  Handling those events directly keeps Pounce
  free of runtime npm dependencies.
*/
function runSquirrelUpdate(args, done) {
  const updateExe = path.resolve(
    path.dirname(process.execPath),
    "..",
    "Update.exe",
  );

  let finished = false;

  const finish = () => {
    if (finished) {
      return;
    }

    finished = true;
    done();
  };

  try {
    const child = spawn(updateExe, args, {
      detached: true,
      windowsHide: true,
      stdio: "ignore",
    });

    child.once("close", finish);

    child.once("error", finish);
  } catch {
    finish();
  }
}

function handleSquirrelStartup() {
  if (process.platform !== "win32") {
    return false;
  }

  const command = process.argv[1];

  const target = path.basename(process.execPath);

  if (command === "--squirrel-install" || command === "--squirrel-updated") {
    runSquirrelUpdate(
      [`--createShortcut=${target}`],

      () => {
        app.quit();
      },
    );

    return true;
  }

  if (command === "--squirrel-uninstall") {
    runSquirrelUpdate(
      [`--removeShortcut=${target}`],

      () => {
        app.quit();
      },
    );

    return true;
  }

  if (command === "--squirrel-obsolete") {
    app.quit();

    return true;
  }

  return false;
}

const squirrelStartup = handleSquirrelStartup();

if (!squirrelStartup) {
  app.enableSandbox();

  app.setAppUserModelId("com.quantumbyt3.pounce");

  function isTrustedAppUrl(value) {
    try {
      const parsed = new URL(value);

      return parsed.protocol === `${APP_SCHEME}:` && parsed.host === APP_HOST;
    } catch {
      return false;
    }
  }

  function registerAppProtocol() {
    protocol.handle(
      APP_SCHEME,

      (request) => {
        if (request.method !== "GET") {
          return new Response("Method Not Allowed", {
            status: 405,
          });
        }

        let parsedUrl;

        try {
          parsedUrl = new URL(request.url);
        } catch {
          return new Response("Bad Request", {
            status: 400,
          });
        }

        if (parsedUrl.host !== APP_HOST) {
          return new Response("Not Found", {
            status: 404,
          });
        }

        let pathname;

        try {
          pathname = decodeURIComponent(parsedUrl.pathname);
        } catch {
          return new Response("Bad Request", {
            status: 400,
          });
        }

        const relativePath =
          pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");

        const filePath = path.resolve(__dirname, relativePath);

        const relativeToApp = path.relative(__dirname, filePath);

        const escapesApp =
          relativeToApp.startsWith("..") || path.isAbsolute(relativeToApp);

        if (escapesApp) {
          return new Response("Forbidden", {
            status: 403,
          });
        }

        const extension = path.extname(filePath).toLowerCase();

        if (!ALLOWED_EXTENSIONS.has(extension)) {
          return new Response("Not Found", {
            status: 404,
          });
        }

        return net.fetch(pathToFileURL(filePath).toString());
      },
    );
  }

  function configurePermissions() {
    const ses = session.defaultSession;

    ses.setPermissionCheckHandler(
      (webContents, permission, requestingOrigin) => {
        return (
          permission === "screen-wake-lock" && isTrustedAppUrl(requestingOrigin)
        );
      },
    );

    ses.setPermissionRequestHandler(
      (webContents, permission, callback, details) => {
        const requestingUrl = details?.requestingUrl || webContents.getURL();

        const allowed =
          permission === "screen-wake-lock" && isTrustedAppUrl(requestingUrl);

        callback(allowed);
      },
    );
  }

  function createWindow() {
    const iconPath = path.join(__dirname, "assets", "icons", "pounce.ico");

    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,

      minWidth: 900,
      minHeight: 600,

      title: "Pounce — Cat TV",

      icon: iconPath,

      backgroundColor: "#081522",

      autoHideMenuBar: true,

      show: true,

      webPreferences: {
        nodeIntegration: false,

        contextIsolation: true,

        sandbox: true,

        webSecurity: true,

        allowRunningInsecureContent: false,

        experimentalFeatures: false,

        webviewTag: false,
      },
    });

    mainWindow.webContents.on(
      "did-fail-load",

      (event, errorCode, errorDescription, validatedURL) => {
        console.error("Pounce failed to load:", {
          errorCode,
          errorDescription,
          validatedURL,
        });
      },
    );

    mainWindow.webContents.on(
      "render-process-gone",

      (event, details) => {
        console.error("Pounce renderer process ended:", details);
      },
    );

    mainWindow.webContents.setWindowOpenHandler(() => {
      return {
        action: "deny",
      };
    });

    mainWindow.webContents.on(
      "will-navigate",

      (event) => {
        event.preventDefault();
      },
    );

    mainWindow.loadURL(APP_URL).catch((error) => {
      console.error("Unable to load Pounce:", error);
    });
  }

  app.whenReady().then(() => {
    registerAppProtocol();

    configurePermissions();

    createWindow();

    app.on(
      "activate",

      () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      },
    );
  });

  app.on(
    "window-all-closed",

    () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    },
  );
}
