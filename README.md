## Change Log

|Date|Version|Change|
|---------------|-------|:------|
|01/28/2022|0.1| Initial Document|
|02/10/2022|0.2|* Added torubleshoot section link for common errors <br> * Banuba Error handling for Macos  <br> * Added frameworks repo link to download DLL in windows installation  |
|03/07/2022|0.3| Added reference to quick start guide |
|05/05/2022|0.4| Updated setup instructions |
|05/05/2022|0.5| Updated the Readme Document for GITHUB |

<br><br><br>

# VidyoConnector Electron Sample 

## Architecture Overview

![App Icon](connector/images/img-overview.png?raw=true "Architecture Overview")

Above mentioned diagram shows the flow and usage of different components in the VidyoConnector Electron Sample Architecture. Since Electron Application cannot directly communicate with SDK we use a different path to communicate with SDK that involves NodeJS Runtime Add-on and JavaScript Bindings. In this document we will describe the steps to acquire and use different components for the VidyoConnector Electron Sample.
<br><br><br>


## Installing Pre-requisites :rocket: 

 1. Git Bash  [Download Link](https://git-scm.com/downloads)
 1. Node JS (Version 14.8.2) [Download Link](https://nodejs.org/download/release/v14.18.2/)
 1. Python (Version 3.7.9) [Download Link](https://www.python.org/downloads/)
    1. Please make sure to add the PYTHON environment variable in Windows
 1. Node-gyp (NPM Package) (Installed Globally) `npm install -g node-gyp`
 1. (Windows only) Installing Microsoft Visual Studio build tools (2017) [Download Link](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?
sku=BuildTools&rel=16)
 1. Installing Visual Studio Code or any other IDE of your choice

<br>

#### Configuring node-gyp and build tools (For Windows Only)
1. Set the downloaded build tools version using 
```npm config set msvs_version 2017```

1. Set the MSBuild.exe an path using
`npm config set msbuild_path "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe`

 <br><br>
## Installing Sample App :crystal_ball: 
 To install this sample application and compile the Native Add-on, run the desired command based on the operating system.
  #### Installing on Windows and Mac Os
  `npm install`
  #### Installing on M1 Processor based Mac Os
  `npm install --arch=arm64`
  
  
  <br><br>

## Starting Sample App :arrow_forward: 

Open the Git Bash in the VidyoConnector Electron Sample Project Path and Run `npm start`.

**The application should start and show the self preview and microphone energy**

If you don't see the self preview you have to check for errors in the *Developer Tools*

![img](connector/images/img-dev-console.png?raw=true "Opening Developer Console") 

#### Please refer to our [Quick Start Guide](/quick-start-guide.md) for more details on api request flow and features.