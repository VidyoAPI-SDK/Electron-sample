# Quick start Guide

## First time using, Vidyo Connector Electron Sample ?

Use this guide to learn the basic of , how to communcate with Vidyo Connector Native Add-on using HTML, CSS and Javascript.

## How it works

In the build documentation of building Native Add-on for NodeJS environment we created a binary using Vidyo SDK. To use that Native Add-on from HTML page following diagram depicts the flow of a request that is sent to Native Add-on. 

 

![App Icon](connector/images/img-api-request-flow.jpg?raw=true "Api Request Flow")

**For Example,**  If you wanted to get the vitals of current conference call you’re in on the User interface, here’s a list of steps that you want to added in the program.

1. Create Elements on your user interface.
2. Add a method in ***GetVitalsFromSDK*** in the  **process.js** that encapsulates the API method from **SDKInterface.js**
3. Add button click handler in the **uiChanger.js that calls the GetVitalsFromSDK from process.js**
4. When the request is complete you will be able to get data into **uiChanger.js** that you can add to your user interface.

## Codebase

The entire codebase including Front-end and SDK can be accessed though in-order to tweak around with variety of features that Vidyo Offers, that can be accessed into the **connector** directory in the repository. That includes all the HTML, CSS and JavaScript files.

Please note that you can also access the JavaScript Bindings but since all the bindings are auto-generated it’s advised to not meddle with it to avoid any breaking changes.

![App Icon](connector/images/img-code-base.png?raw=true "Connector Direcotry")


## Front-end view engine

Electron sample uses partial view technique to load .html files into one master/base view.

**sign_call.html** is the base view and using **Jquery .load** method, which can be found in **utility.js.**
```jsx
 $(cointainerName).load(templatePath, null, (res, status)=>{ 
     if(status=="success"){
         accept();
     }     
     else{
         reject();
     }
     });
 });
 ```


Call **loadTempletWithClassName** To load a partical  view into the base view

```jsx
util.loadTempletWithClassName( "right-section", "groupChatWindow.html").then(
    ()=>{
       ....
    }
);
```

And to unload any view call **unLoadTempletWithClassName** 

```jsx
util.unLoadTempletWithClassName( "right-section", "").then(
    ()=>{
       ....
    }
);
```

## Development Guidelines
Electron sample is built using Javascript/Jquery so that developers can easily understand and cusotmize the code.
As we discussed earliers, our codebase is in connector directory in the repository and all the Javascript files to run electron sample can be found at `connector/js/`.
And in the following table depicts the designated use case for each file.


| File Name |  |
| --- | --- |
| uiChanger.js| is used for handling all the front-end /  ui call backs and state update |
| process.js| consist a refined logic for different methods exposed from VidyoAddon.node |
| SDKInterface.js | is the core file that creates a bridge between VidyoAddon.node and the Electron Sample |
| utility.js | to render partical view in the DOM tree, uitility.js have the wrapper code.|


## Debugging

As discussed in the API Request flow diagram, a request from front-end to SDK goes through a tunnel of methods, and to debug any issue on any level. We can use

`console.log` in all the javascript files to captrue any log related to front-end and other request.

For SDK level degbuggin, you can checkout the the **electron.log** file that is created while running the sample

> 2022-03-07 21:35:11.610: INF: VidyoClient: Set audio packet interval: 40 [ [System thread], 4488914432, VidyoEndpointGetAudioPacketInterval, VidyoEndpoint.c:1250 ]
> 

> 2022-03-07 21:35:11.685: INF: VidyoClient: Local window share event: Downloads VIDYO_DEVICESTATE_Added [ Vidyo window capturer manager, 123145664430080, VidyoEndpointDeviceManagerLocalWindowShareEvent, VidyoEndpoint.c:5849 ]
> 

You can also use the [VidyoLogger](https://git.vidyo.io/VidyoLog.html) service to read all the logs
## Sample features 

Vidyo Offers a ton of modern day conferencing features that are easy to develop and customise and also enrich the user experience across it’s products.

This electron samples consist the following features accross WIndows OS and Mac OS

|    |    |    |  |
| --- | --- | --- | --- |
| Instant Call | Conference as Guest | Network Services | High quality content share with Audio |
| Video Settings Customization | Virtual Background | Blurred Background | FECC Camera Support |
| Audio Settings Customization | Monitor Share | Application Share |  |
| Group and Individual Chat | Highly Customizable Moderation Panel | Conference Recording |  and  a lot more... |

## FAQs


### Where can i find the documentation / reference guide for Vidyo APIs ?

You can find the latest documentation about all the features.

[Vidyo Client Reference Guide 21.6.1.1](https://static.vidyo.io/latest/docs/VidyoClientReferenceGuide.html#VidyoDevice)

### Do I require any special access token to use Vidyo APIs?

**No**, at the moment you do not require any access tokens to run this sample.

### How do i start an instant call and invite people in the call ?
**To start an Instant call** :-
* Run the electron sample and enter your name.
* Click on **Start Call** button.
* You will see a pop window having conference link that you can share with other people.
