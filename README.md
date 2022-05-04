
# VidyoConnector Electron Sample 

## Architecture Overview

![App Icon](connector/images/img-overview.png?raw=true "Architecture Overview")

Above mentioned diagram shows the flow and usage of different components in the VidyoConnector Electron Sample Architecture. Since Electron Application cannot directly communicate with SDK we use a different path to communicate with SDK that involves NodeJS Runtime Add-on and JavaScript Bindings. In this document we will describe the steps to acquire and use different components for the VidyoConnector Electron Sample.
  
  *VidyoConnector Electron Sample runs on NodeJS environment, that requires few components to be installed*
   ### 1. Installing Pre-Requisite componentss
   1. Git Bash  [Download Link](https://git-scm.com/downloads)
   1. Node JS (Version 14) [Download Link](https://nodejs.org/download/release/v14.18.2/)
   1. Python (Version 3.7.9) [Download Link](https://www.python.org/downloads/)
      1. Please make sure to add the PYTHON environment variable in Windows
   1. Node-gyp (NPM Package) (Installed Globally) `npm install -g node-gyp`
   1. (Windows only) Installing Microsoft Visual Studio build tools (2017) [Download Link](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)
   1. Installing Visual Studio Code or any other IDE of your choice.
   <br/><br/><br/>
   ### 2. Installing Electron Sample application
   To install and compile the sample application run the desired command based on the operating system.
   #### Installing on Windows
   `npm install`

   #### Installing on Mac Os (Intel Based)
  `npm install`

   #### Installing on Mac Os (M1)
   `npm install --arch=arm64`
   <br/><br/><br/>
###  3. Starting the app :pencil2:

Open the Git Bash in the VidyoConnector Electron Sample Project Path and Run `npm start`.

**The application should start and show the self preview and microphone energy**

If you don't see the self preview you have to check for errors in the *Developer Tools*

![img](connector/images/img-dev-console.png?raw=true "Opening Developer Console") 

### Please refer to our Quick Start Guide for more details on api request flow and features.
[Quick Start Guide](/quick-start-guide.md)
