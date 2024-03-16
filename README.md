
# VidyoConnector Electron Sample 

## Architecture Overview

![App Icon](connector/images/img-overview.png?raw=true "Architecture Overview")

Above mentioned diagram shows the flow and usage of different components in the VidyoConnector Electron Sample Architecture. Since Electron Application cannot directly communicate with Vidyo SDK we use a different path to communicate with Vidyo SDK that involves NodeJS Runtime Add-on and JavaScript Bindings. In this document we will describe the steps to acquire and use different components for the VidyoConnector Electron Sample.
<br><br><br>


## Installing Pre-requisites :rocket: 

Electron Sample built upon multiple components. When you install the Electron Sample Node JS application it compiles a NodeJs Runtime Addon using VidyoSDK, which requires NodeJS, node-gyp, Python and Microsoft Build Tools to compile.

|Component|Windows|Mac OS|
|---------------|-------|:------|
|Node JS (Version 14 or above)|[Download](https://nodejs.org/dist/v18.12.1/node-v18.12.1-x64.msi)|[Download](https://nodejs.org/dist/v18.12.1/node-v18.12.1-x64.msi)|
|Python (Version 3.7.9)|[Download](https://www.python.org/ftp/python/3.7.9/python-3.7.9-amd64.exe)|[Download](https://www.python.org/ftp/python/3.7.9/python-3.7.9-macosx10.9.pkg)|
|Microsoft Visual Studio build tools (2017)|[Download](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)|NA|
|Git Bash (Optional)|[Download](https://git-scm.com/downloads)|`brew install git`|
|node-gyp (NPM Package)|`npm install -g node-gyp`|`npm install -g node-gyp`|


<br>

#### Microsoft Build Tools are required to be configured with Node JS to be able to compile the NodeJs Native Runtime Add-on in *Windows*
#### `npm config set msvs_version 2017`
#### ```npm config set msbuild_path "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe```

 <br>

## Installing Sample App :crystal_ball: 

 When you install this Electron Sample application it downloads the latest SDK and compiles the Native Add-on. 
<br>
 Run any of the following command based on the operating system.

 |Windows & Mac OS|Mac OS (M1)|
|-------------------|:------|
|`npm install`|`npm install --arch=arm64`|

  <br><br>

## Starting Sample App :arrow_forward: 

1. Open he GitBash or any CLI tool in sample root directory.
1. Type in `npm start` and hit enter.
1. The application should start and show the self preview and microphone energy.
1. Type in your name and click *Start Call* to create an instant call.

#### You can refer to our [Quick Start Guide](/quick-start-guide.md) for more details on api request flow and features.

<br><br>
#### If you don't see the self preview you have to check for errors in the *Developer Tools*
![img](connector/images/img-dev-console.png?raw=true "Opening Developer Console") 

### Last updated on
|Version|Date|
|--------|----|
|23.1.1|30th Oct 2023|
