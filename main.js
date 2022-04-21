require("dotenv").config();
const electron = require('electron')
const checkIfRemoteModuleDeprecated = () => {
  const electronVersion = process.versions.electron.toString();
  const isRemoteDeprecated = (parseInt(electronVersion.split(".")[0].toString(),10)>=14);
  if(isRemoteDeprecated){
    try {
      //checking if the official recommended bridge is installed.
      console.log(require.resolve("@electron/remote"));
      return isRemoteDeprecated;
    } catch(e) {
      console.log(`You're using electron version ${electronVersion} . Please install and intergrated the @electron/remote to continue.`)
        return;
    }
   }
}

if(checkIfRemoteModuleDeprecated()){
  require("@electron/remote/main").initialize();
}

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

if( process.env.LOCAL_SDK==="1" && process.env.DEV_MODE==="Debug"){
  process.env.VIDYO_MODULE = './build/Debug/VidyoAddon';
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let deeplinkingUrl

const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock) {
  app.on("second-instance", (e, argv) => {
    if (process.platform == "win32") {
      deeplinkingUrl = argv.slice(1);
      mainWindow.webContents.send('vidyo-join-link', deeplinkingUrl)
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('open-url', (event, url) => {
    //dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    deeplinkingUrl = url
    mainWindow.webContents.send('vidyo-join-link', deeplinkingUrl)
  })

} else {
  app.quit();
}
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 900, minWidth: 884, minHeight: 570, webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
    contextIsolation: false
}})

  mainWindow.loadFile('connector/index.html');
  if(checkIfRemoteModuleDeprecated()){
    require("@electron/remote/main").enable(mainWindow.webContents);
  }

  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1)
  }

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  //mainWindow.webContents.openDevTools({mode:"undocked"})

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('vidyo-join-link', deeplinkingUrl)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

if (!app.isDefaultProtocolClient('vidyoconnector')) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('vidyoconnector')
}

app.on('will-finish-launching', function() {
  // Protocol handler for osx
  app.on('open-url', function(event, url) {
    event.preventDefault()
    deeplinkingUrl = url
  })
})


// Disable hardware acceleration
// in order to work around the Windows 10 rendering problem
// introduced in Windows 10, version 1709.
app.disableHardwareAcceleration();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
