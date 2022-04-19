## Change Log

|Date|Version|Change|
|---------------|-------|:------|
|01/28/2022|0.1| Initial Document|
|02/10/2022|0.2|* Added torubleshoot section link for common errors <br> * Banuba Error handling for Macos  <br> * Added frameworks repo link to download DLL in windows installation  |
|03/07/2022|0.3| Added reference to quick start guide |

<br><br><br>

# VidyoConnector Electron Sample 
![App Icon](connector/images/img-electron.png?raw=true "App Icon")



## Architecture Overview

![App Icon](connector/images/img-overview.png?raw=true "Architecture Overview")

Above mentioned diagram shows the flow and usage of different components in the VidyoConnector Electron Sample Architecture. Since Electron Application cannot directly communicate with SDK we use a different path to communicate with SDK that involves NodeJS Runtime Add-on and JavaScript Bindings. In this document we will describe the steps to acquire and use different components for the VidyoConnector Electron Sample.
<br><br><br><br><br>
## Index
||**Document Version (0.2)  (10th Feb, 2022)**|
| :-: | :- |



|#|**Steps**|
|-|:- |
|1|:rocket:**Setting Up Environment (Pre-Requisites)**|
|2|:file_folder:**Cloning Repo / Setting up Project Directory**|
|3|:video_camera:**Downloading SDK and WEB SDK**|
|4|:electric_plug:**Adding SDK and WebSDK to Electron Sample**|
|5|:wrench:**Setting Environment Variables (Windows Only)**|
|6|:crystal_ball:**Building VidyoAddon.node (Native Add on / Binary)**|
|7|:pencil2:**Sample Setup**|
|8|:bangbang:**Troubleshooting common errors**|

<br><br><br><br><br>

## 1. Setting up the environment (Pre-Requisites) :rocket:

   1. **Installing [GitBash](https://git-scm.com/downloads)** (Recommended) to run the Node CLI Commands or You can choose Terminal (Mac Os) or Command Prompt (Windows)
   1. **Installing Python version 3.7.9** [Download Link](https://www.python.org/downloads/)
      1. Please make sure that you installed the python `C:\Program Files\Python37`
      1. Make sure that you've added the currect python path in your environment variables
      |Variable Name| Value|
      |:---|:---|
      | `PYTHON` |  `C:\Program Files\Python37\python.exe` |

   1. **Installing Node JS (Version 14 or later)** <https://nodejs.org/en/download/>
      1. To ensure that NodeJs is installed open GitBash and  run > ```node -v``` it will show the version of installed Node Js.

   1. **Installing node-gyp (latest version)** globally
      1. Open GitBash and type following command: <br>
         ```npm install -g node-gyp```
   1. *(Windows only) Installing Microsoft Visual Studio build tools (2017)  [Download Link*](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)*
   1. Installing Visual Studio Code or any other IDE of your choice

<br><br><br>
## 2. Cloning Repo / Setting up Project Directory :file_folder:
   1. For this example, we will use ```D:\code``` directory to work but you can clone repo in any directory in your system just make sure you have read and write access to the folder it needs in the build process.
   1. To clone the repo open git bash and make sure that you are connected to **vpn.enghouse.com** <br>
      ```git clone ssh://git@vidyo-bitbucket.edge.local:7999/vs/samples.git```
   1. Code base of Electron Sample can be found at the following path 
         > D:\code\samples\VidyoConnector\electron\VidyoConnector

   1. Then you can checkout ```feature/Vidyo.io-SDK.2.4``` for latest code.


## 3. Downloading SDK and WEB SDK :video_camera:
   1. Open web browser and go to [Buildbot](http://vidyo-buildbot.edge.local:8010/builds/BRANCH_2_2/ondemand/%3cdesired_SDK_Version) the get a desired copy of Vidyo SDK and WebSDK (JavaScript Bindings).
   1. For Windows ```VidyoClient-WinVS2017SDK-TRINITY```\_XX\_X\_XX\_XX.zip  


   1. For Mac OS (Intel) download ```VidyoClient-macOSSDK-x64-x86-TRINITY```\_XX\_X\_XX\_XX.zip
   1. For Mac Os (M1) download ```VidyoClient-macOSSDK-arm64-TRINITY```\_XX\_X\_XX\_XX.zip
   1. Download the WebSDK Folder ```VidyoClient-WebSDK-TRINITY```\_XX\_X\_XX\_XX.zip
<br><br><br><br>

## 4. Adding SDK and WebSDK to Electron Sample :electric_plug:
   1. Go to the directory where you have download SDK and WebSDK and extract both zip files.

1. Copy `VidyoClient-WinVS2017SDK` which you have extracted in previous step and go to your project directory where you have cloned sample and paste on the following path
   >   D:\code\samples\VidyoConnector\electron\VidyoConnector

1. Copy JavaScript folder from the web SDK from the following path.
   > VidyoClient-WebSDK/webserver/JavaScript

1. Paste the javascript folder on following path

   > D:\code\samples\VidyoConnector\electron\VidyoConnector\connector\lib


1. Make sure that SDK version matches WebSDK version. To change the version you can edit the version in `VidyoClient.js` on the following file 
   > D:\code\samples\VidyoConnector\electron\VidyoConnector\connector\lib\javascript\VidyoClient\VidyoClient.js
1. To attach the downloaded WebSDK to the electron app, you have to make changes in the `SDKInterface.js` file on the following path.
   > D:\code\samples\VidyoConnector\electron\VidyoConnector\connector\js\SDKInterface.js

1. Open the `SDKInterface.js` in Visual Studio Code or Any other editor in your choice.
   1. Search for "*static.vidyo.io*"
   1. Replace the "https://static.vidyo.io/latest" to "lib"

 

<br><br><br>

## 5. Setting up Environment Variables for (Windows only) :wrench:
Follow are the steps to set environment variables using the Windows GUI:

![App Icon](connector/images/img-env-vars.png?raw=true "Environment Variables")

There's two Environment Variables required for Building the Native Addon using SDK for Windows.

|Variable Name| Value|
|:---|:---|
| `VIDYO_CLIENT_INCL_DIR` |  `D:\code\samples\VidyoConnector\electron\VidyoConnector\VidyoClient-WinVS2017SDK\include` |
| `VIDYO_CLIENT_LIB_DIR` | `D:\code\samples\VidyoConnector\electron\VidyoConnector\lib\windows\x64\Release` |


<br><br><br>
## 6. Building VidyoAddon.node ( Node JS Native Add-on / Binary) :crystal_ball:

In this step we will use downloaded SDK to build a [Node Js Native Add-on](https://nodejs.org/api/addons.html) that our application can use. It’s a three step process that 
* 1) sets up the environment variable to use SDK path (For Mac OS only) 
* 2) installs the application modules 
* 3) compile the binary using node-gyp and electron.

### Building VidyoAddon.node on Windows
1. Open the following directory in GitBash 
   > D:\code\samples\VidyoConnector\electron\VidyoConnector
1. Run the following commands 
   1. `npm install`
   1. `npm outdated` to see the **Current** Electron Version (xx.x.xx) that will be used while building in the next command.

      ![img](connector/images/img-npm-outdated.png?raw=true "Environment Variables") 
   1. `node-gyp rebuild --target=xx.x.xx --arch=x64 --dist-url=https://atom.io/download/electron -msvs_version=2017`

### Building VidyoAddon.node on Mac OS 
#### Before we proceed further on Mac Os
|**Disabling Banuba Framework before building the project for mac OS (Background Blur and Background picture tool)**|
| :- |
|Currently Banuba is not integrated with Mac Os so we have to disable it with commenting the framework integration line in the ***binding.gyp*** document
![img](connector/images/img-banuba-disable.png?raw=true "Environment Variables") 
|

<br><br>
**Open the samples path on terminal**
> your_directory/samples/VidyoConnector/electron/VidyoConnector/

1. Add the following variables to attach the SDK path.
   1. `export VIDYO_CLIENT_INCL_DIR=$PWD/VidyoClient-OSXSDK/include`
   1. `export VIDYO_CLIENT_LIB_DIR=$PWD/VidyoClient-OSXSDK/lib/macos `
1. `npm install` for Intel Based Mac
1. `npm install --arch=arm64` for M1 based Mac
1. `npm outdated` to see the **Current** Electron Version (xx.x.xx) that will be used while building in the next command.

      ![img](connector/images/img-npm-outdated.png?raw=true "Environment Variables") 

1. For Intel Based Mac `node-gyp rebuild --target=xx.x.xx --arch=x64 --dist-url=https://atom.io/download/electron `

1. For M1 Based Mac `node-gyp rebuild --target=xx.x.xx --arch=arm64 --dist-url=https://atom.io/download/electron `

#### Please note that :-
1. Use the exact version in the above mentioned command as your electron sample is using. 
1. To check electron version, type the following command in GitBash > `npm outdated`
1. Do not close the GitBash / Termnial window you’re using after step 2 if you accidently closed GitBash you have to add variables again and then proceed to step 3
1. If you’re using Mac Os on M1 in the step three use –arch=arm64

<br>

### A `build` folder will be created after a successful node-gyp command, in case of any error, you can delete the build folder and re-do all the steps. 
### For More details checkout [**Troubleshooting Common Errors**](#TroubleShootingErrors)

<br><br><br>
##  7. Starting the app :pencil2:
1. To Start the Electron App, open the following path and run `npm start`
 > D:\code\samples\VidyoConnector\electron\VidyoConnector

**The application should start and show the self preview and microphone energy**

To check if there's any error, go to view in the electron menu and open developer tools.

![img](connector/images/img-dev-console.png?raw=true "Opening Developer Console") 

### Please refer to our Quick Start Guide for more details on api request flow and features.
[Quick Start Guide](/quick-start-guide.md)

<br><br><br>

## 8. Troubleshooting common errors

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

