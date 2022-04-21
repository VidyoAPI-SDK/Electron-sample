
# VidyoConnector Electron Sample 

## Architecture Overview

![App Icon](connector/images/img-overview.png?raw=true "Architecture Overview")

Above mentioned diagram shows the flow and usage of different components in the VidyoConnector Electron Sample Architecture. Since Electron Application cannot directly communicate with SDK we use a different path to communicate with SDK that involves NodeJS Runtime Add-on and JavaScript Bindings. In this document we will describe the steps to acquire and use different components for the VidyoConnector Electron Sample.
<br/>
<br/>
<br/>
<br/>
|#|**Steps**|
|-|:- |
|1|:rocket: **Setting Up Environment (Pre-Requisites)**|
|2|:crystal_ball: **Compiling C++ Native Add-on for NodeJS Runtime**|
|3|:pencil2: **Starting VidyoConnector Electron Setup**|
|4|:bangbang: **Troubleshooting common errors**|

<br/>
<br/>
<br/>
<br/>

## 1. Setting up the environment (Pre-Requisites) :rocket:
  
  VidyoConnector Electron Sample runs on NodeJS environment, that requires few components to be installed.
  
  1. we have to ensure few components are downloadded and installed on development local machine to setup the development environment.
  1. Downloaded VidyoConnector SDK (based on your sytem i.e. Windows/MacOs) and Javascript bindings.
  1. Placed the VidyoConnector SDK and JavaScript Bindings in the project directory
  1. Environment variables are added mapping the VidyoConnector SDK for compliation of NodeJS Native Add-On
   
   ### A. Installing componentss
   1. Git Bash  [Download Link](https://git-scm.com/downloads)
   1. Node JS (Version 14) [Download Link](https://nodejs.org/download/release/v14.18.2/)
   1. Python (Version 3.7.9) [Download Link](https://www.python.org/downloads/)
      1. Please make sure to add the PYTHON environment variable in Windows
   1. Node-gyp (NPM Package) (Installed Globally) `npm install -g node-gyp`
   1. (Windows only) Installing Microsoft Visual Studio build tools (2017) [Download Link](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)
   1. Installing Visual Studio Code or any other IDE of your choice

<br/>

   ### B. Downloading VidyoConnector SDK and Javascript bindings.
   1. Download VidyoConnector SDK [Download Link](https://developer.vidyo.io/#/packages)
   1. Download VidyoConnector JavaScript Bindings [Download Link](https://developer.vidyo.io/#/packages)
     
<br/>

   ### C. Placing SDK and JavaScript bindings in the VidyoConnector Electron Sample
   1. Place the VidyoConnectorSDK folder in the **root** of VidyoConnector Electron Sample.
   1. Place the Javascript bindings folder in `connector/lib/` of VidyoConnector Electron Sample.
   1. To attach the downloaded Javascript Bindings to the electron app, you have to make changes in the `SDKInterface.js` file on the following path.
      `connector\js\SDKInterface.js`
       1. Search for "*static.vidyo.io*"
       1. Replace the "https://static.vidyo.io/latest" to "lib"
   1. Make sure that SDK version matches JavaScript Bindings version in  `connector/lib/javascript/VidyoClient/VidyoClient.js`.

*For Example* if you have cloned this repo in `C:\code\VidyoConnector-Electron-Sample\` then add 
1. VidyoConnectorSDK in `C:\code\VidyoConnector-Electron-Sample\VidyoConnectorSDK\`
1. Javascript Bindings in `C:\code\VidyoConnector-Electron-Sample\connector\lib\`

<br/>

### D. Setting up Environment Variables for (Windows only) :wrench:
Follow are the steps to set environment variables using the Windows GUI:

![App Icon](connector/images/img-env-vars.png?raw=true "Environment Variables")

There's two Environment Variables required for Building the Native Addon using VidyoConnector SDK for Windows.

|Variable Name| Value|
|:---|:---|
| VIDYO_CLIENT_INCL_DIR | < path-to-your-project-dir >\VidyoClient-WinVS2017SDK\include |
| VIDYO_CLIENT_LIB_DIR | < path-to-your-project-dir >\VidyoClient-WinVS2017SDK\lib\windows\x64\Release |

*For Example* if you have cloned this repo in `C:\code\VidyoConnector-Electron-Sample\` then the environment variables should look like this.

|Variable Name| Value|
|:---|:---|
| VIDYO_CLIENT_INCL_DIR | C:\code\VidyoConnector-Electron-Sample\VidyoClient-WinVS2017SDK\include |
| VIDYO_CLIENT_LIB_DIR | C:\code\VidyoConnector-Electron-Sample\VidyoClient-WinVS2017SDK\lib\windows\x64\Release |

<br/>
<br/>
<br/>
<br/>

## 2. Compiling C++ Native Add-on for NodeJS Runtime :crystal_ball:
### A. Compliling on Windows 
Open the Git Bash in the VidyoConnector Electron Sample Project Path and Run the following commands in the same order.
   1. ```npm install```
   1. `npm outdated` to see the **Current** Electron Version (xx.x.xx) that will be used while building in the next command.

      ![img](connector/images/img-npm-outdated.png?raw=true "Environment Variables") 
   1. `node-gyp rebuild --target=xx.x.xx --arch=x64 --dist-url=https://atom.io/download/electron -msvs_version=2017`

<br/>
<br/>

### B. Compliling on Mac Os 

#### Before we proceed further on Mac Os We need to disable Banuba (Background Blur and Background picture tool) Framework before compliation

Currently Banuba is not integrated with Mac Os so we have to disable it with commenting the framework integration line in the ***binding.gyp*** file.

![img](connector/images/img-banuba-disable.png?raw=true "Environment Variables")

<br><br>
Open the Git Bash in the VidyoConnector Electron Sample Project Path and Run the following commands in the same order.

1. Add the following variables to attach the SDK path.

   1. `export VIDYO_CLIENT_INCL_DIR=$PWD/VidyoClient-OSXSDK/include`
   1. `export VIDYO_CLIENT_LIB_DIR=$PWD/VidyoClient-OSXSDK/lib/macos `

1. Install the VidyoConnector Electron Sample Setup
   1. ```npm install```  for Intel Based Macs
   1. ```npm install --arch=arm64```  for M1 (ARM) based Mac

1. Check the currently used node-gyp-electron version (xx.x.xx) support.
   1. ```npm outdated```

     ![img](connector/images/img-npm-outdated.png?raw=true "Environment Variables") 
1. Compliing NodeJS Native Addon using **node-gyp** on, Intel or M1 (ARM) based Mac.
   1. ```node-gyp rebuild --target=xx.x.xx --arch=x64 --dist-url=https://atom.io/download/electron``` 
   1. ```node-gyp rebuild --target=xx.x.xx --arch=arm64 --dist-url=https://atom.io/download/electron```

<br/>
<br/>

#### Please note that :-
1. Use the exact version in the above mentioned command as your electron sample is using. 
1. To check electron version, type the following command in GitBash > `npm outdated`
1. Do not close the GitBash / Termnial window you’re using after step 2 if you accidently closed GitBash you have to add variables again and then proceed to step 3
1. If you’re using Mac Os on M1 in the step three use –arch=arm64
1. If you miss any step just delete the build and node_modules folder to and you can compile again.
1. There's no need to compile unless using different VidyoConnector SDK Version

<br/>

### The compilation process should end without any errors and a new direcotry `build` should be created in your project path.
### For More details checkout [**Troubleshooting Common Errors**](#TroubleShootingErrors)
<br/>
<br/>
<br/>
<br/>

##  3. Starting the app :pencil2:

Open the Git Bash in the VidyoConnector Electron Sample Project Path and Run `npm start`.

**The application should start and show the self preview and microphone energy**

If you don't see the self preview you have to check for errors in the *Developer Tools*

![img](connector/images/img-dev-console.png?raw=true "Opening Developer Console") 

### Please refer to our Quick Start Guide for more details on api request flow and features.
[Quick Start Guide](/quick-start-guide.md)

<br/>
<br/>
<br/>
<br/>

## 4. Troubleshooting common errors

#### 1. Invalid or missing environment variables

![img](connector/images/img-env-error.png?raw=true "Environment Variables Error") 

Aforementioned error occurs when there are no environment variables are set  we’re trying to run `npm install` or `node-gyp rebuild ..`.

#### Resolution : -
1. Add environment variables again with the exact path where you have placed the SDK.
1. Try and run **npm install** if there’s build folder already exists then run **node-gyp** command

<br><br><br>

#### 2. Electron Version Mis-match

![img](connector/images/img-version-error.png?raw=true "Environment Variables Error") 

Aforementioned error is the node-gyp-to-electron version bridge error. It’s common and may occur on first build and it can be rectifyied by re-building the app with exact electron version used in the sample app.

#### Resolution :- 
Type in GitBash / Terminal `npm outdated` to see the **Current** Electron Version (xx.x.xx) that will be used while building in the next command.

   ![img](connector/images/img-npm-outdated.png?raw=true "Environment Variables") 


(Command for windows)

`node-gyp rebuild --target=14.2.4--arch=x64 --dist-url=https://atom.io/download/electron -msvs\_version=2017`

(Command For Mac) 

`node-gyp rebuild --target=14.2.4 --arch=x64 --dist-url=https://atom.io/download/electron`

