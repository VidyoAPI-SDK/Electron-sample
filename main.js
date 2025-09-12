require("dotenv").config();
const os = require("os");
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

if(process.env.LOCAL_SDK==="1") {
  if(process.env.DEV_MODE==="Debug"){
    process.env.VIDYO_MODULE = './build/Debug/VidyoAddon';
  }
  else if(process.env.DEV_MODE==="Release"){
    process.env.VIDYO_MODULE = './build/Release/VidyoAddon';
  }
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let deeplinkingUrl
let videoOverlay;

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
  mainWindow = new BrowserWindow({width: 1200, height: 725, minWidth: 800, minHeight: 600, webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
    contextIsolation: false
}})
  mainWindow.on('move', function() {
    mainWindow.webContents.send('win-movement', mainWindow.getPosition())
  });

  mainWindow.on('resize', function() {
    mainWindow.webContents.send('win-movement', mainWindow.getPosition())
  });

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
    if(os.platform() === "darwin"){
      const LOG_PATH = app.getPath('userData').toString()+ "/";
      mainWindow.webContents.send('log-path', LOG_PATH )
    }
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
  createWindow();
  CreateVideoOverlay();
})

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
 
electron.ipcMain.on('app_quit', (event, info)=>{
  app.quit();
})

app.on('window-all-closed',()=>{
  app.quit();
})



// Disable hardware acceleration
// in order to work around the Windows 10 rendering problem
// introduced in Windows 10, version 1709.
app.disableHardwareAcceleration();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//// Video Overlay (App Overlay)
const CreateVideoOverlay = () => { 

  videoOverlay  =  new BrowserWindow({
    width:300,
    height:300,
    parent: mainWindow,
    transparent: true,
    frame: false,
    movable: true,
    roundedCorners:false,
    show:false, 
    webPreferences : {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    resizable:false,
    closable:false,
  });

  videoOverlay.on('blur',()=>{
    videoOverlay.hide();
    mainWindow.webContents.send('overlay-hidden', true)
  })
  
}

const RenderOverlayComponent = (component,defaultOptions) => {
  videoOverlay.loadFile('connector/appoverlay.html', {
    query:{
      'load-view':component,
      'default-options':JSON.stringify(defaultOptions)
    }
  })
};
const ResizeOverlay = (location) => {
  const { left, top, width, height } = location;
  const [x, y] = mainWindow.getPosition();
  if (process.platform == "win32") {
    videoOverlay.setBounds({
      x: (x + left + 20) < 100 ? 100 : x + left + 20, // Screen edge detection
      y: y + top ,
      width: width,
      height: height,
    });
  } else {
    videoOverlay.setBounds({
      x: (x + left + 4 ) < 100 ? 100 : x + left + 4,
      y: y + top - 16,
      width: width,
      height: height,
    });
  }
};



electron.ipcMain.handle("toggle-overlay", async (event, ...args) => {
  return new Promise(async (resolve, reject) => {
    try {

      const [isVisible, atLocation, componentToRender, options] = args;
      if (isVisible === "show") {
       
        await ResizeOverlay(atLocation);
        await RenderOverlayComponent(componentToRender,options);
        setTimeout(() => {
          videoOverlay.show();
        }, 200);
   
      } else {
        videoOverlay.hide();
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
});

electron.ipcMain.handle('resize-overlay', async (event,...args) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [atLocation] = args;
      await ResizeOverlay(atLocation);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
})

electron.ipcMain.handle('set-viewmode', async (events, ...args)=>{
  const [viewMode,participantCount] = args;
  const options = {
    viewMode,
    participantCount
  }
  mainWindow.webContents.send('update-viewmode', options);
})


electron.ipcMain.handle('cameraControl-command', async (events, ...args)=>{
  const [direction, type] = args;
  mainWindow.webContents.send('cameraControl-movement', {direction,type});
})
