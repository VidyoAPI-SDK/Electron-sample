//function with Captial letters will be considerer exported.

let logLevel_ = "Production";

//callback return status
const Status = {
    SUCCESS: "success",
    FAIL: "fail",
    DISCONNECT: "disconnect",
    ADD : "add",
    REMOVE : "remove",
    SELECT : "select",
    STATUS_CHANGED : "status-changed",
    MICROPHONE_ENERGY_CHANGE : "MICROPHONE_ENERGY_CHANGE",
    CAMERA_CAPABLITES_UPDATED : "camera_capablities_update",
    VOICE_PROCESSING_STATUS_CHANGE : "voice_processing_status_change",
    AUTO_GAIN_CONTROL_STATUS_CHANGE: "auto_gain_control_status_change",
    JOINED:"joined",
    LEAVE :"leave",
    LOUDEST_CHANGED :"loudest_change",
    PARTICIPANT_DYNAMICS_CHANGED:"participant_dynamic_changed",
    LWS_PREVIEW_IMAGE: "local_window_share_preview",
    CAMERA_CONTROL_CAPABLITES_UPDATED: "camera_control_capablites_update",
    RECORD_START: "RECORD_START",
    RECORD_PAUSE: "RECORD_PAUSE",
    RECORD_RESUME: "RECORD_RESUME",
    RECORD_STOP: "RECORD_STOP"
}

//device type
const DEVICE_TYPE = {
    CAMERA: "camera",
    MICROPHONE: "microphone",
    SPEAKER: "speaker",
}

const ViewStyle = {
    THEATER : "VIDYO_CONNECTORVIEWSTYLE_Default",
    GRID : "VIDYO_CONNECTORVIEWSTYLE_Tiles"
}

const BackgroundEffectType = {
    VIRTUAL_BACKGROUND: "VIDYO_CONNECTORCAMERAEFFECTTYPE_VirtualBackground",
    BLUR_BACKGROUND: "VIDYO_CONNECTORCAMERAEFFECTTYPE_Blur",
    NONE: "VIDYO_CONNECTORCAMERAEFFECTTYPE_None"
};

let vidyoConnector = null;
let localCamerasList = {};
let localMicrophonesList = {};
let localSpeakersList = {};
let remoteCameraList = [];
let remoteMicroPhoneList = [];
let participantList = [];
let selectedCamera = {id:"0"};
let selectedMicrophone = {id:"0"};
let selectedSpeaker = {};
let localDeviceStatusCallBack = null;
let currentSelectedCameraCapablities = null;
let currentSelectedCameraControlCapablities = null;
let voiceProcesingStatus = false;
let autoGainControlStatus = false;
let participantcount = 0;
let VidyoConnectorStartParam = {
    viewerId:"renderer",
    renderLayout:"VIDYO_CONNECTORVIEWSTYLE_Default",
    remoteParticipants:8, //maximum participant to render
    logFileFilter:"warning info@VidyoClient info@VidyoConnector info@VidyoNetworkService info@LmiPortalSession info@LmiPortalMembership info@LmiResourceManagerUpdates info@LmiPace info@LmiAudioProcessing",
}
let endPointStats = {};
let logFileFilter = {
    production:"warning info@VidyoClient info@VidyoConnector info@VidyoNetworkService info@LmiPortalSession info@LmiPortalMembership info@LmiResourceManagerUpdates info@LmiPace info@LmiAudioProcessing",
    debug:"warning debug@VidyoClient debug@VidyoConnector info@VidyoNetworkService info@LmiAudioProcessing all@LmiPortalSession all@LmiPortalMembership debug@LmiResourceManager info@LmiResourceManagerUpdates info@LmiPace all@LmiIce all@LmiSignaling",
    advanced:""
}
let minRoomPin =4;
let maxRoomPin = 12;

let connectorOption = {
    'microphoneMaxBoostLevel': 10,
    'micExclusiveMode': false,
    'micSpeakerExclusiveMode': false,
    'audioShareMode': true,
    'audioCodecPriority': "",
    'AudioPacketInterval': 20,
    'AudioPacketLossPercentage': 0,
    'AudioBitrateMultiplier': 1,
    'sampleTime':5,
    'responseTime':30,
    'lowBandwidthThreshold':100,
    'autoReconnect':false,
    'reconnectAttempts':3,
    'reconnectBackOff':5,
}
let localWindowShareList  = [];
let localMonitorShareList = [];
let remoteShare = null;
var path = require("path");
var absolutePath = path.resolve("./connector/banuba_effects_and_resources");
let backgroundOption = {
    token: "",
    effectType: null,
    pathToResources: absolutePath+"/bnb-resources/",
    pathToBlurEffect: absolutePath+"/effects/blurred-background/",
    pathToVirtualBackgroundEffect: absolutePath+"/effects/virtual-background/",
    virtualBackgroundPicture: "",
    blurIntensity: 5,
}

var activeFeccPresetList = [];
var userPresetList =[];

getBanubaToken = () =>{
    const fs = require("fs");
    const tokenPath = path.resolve("./Banuba-Token.json");
    const data = JSON.parse(fs.readFileSync(tokenPath));
    backgroundOption.token = data.token;
}

getBanubaToken();

function GetDefaultParam(){
    return VidyoConnectorStartParam;
}

let library_load_callback = null;

function onVidyoClientLoaded(status) {
    switch (status.state) {
        case "READY":    // The library is operating normally
              // Native (Plugin or Electron)
              const useTranscodingWebRTC = false;
              const performMonitorShare = true;
              const webrtcExtensionPath = "";
              const configParams = {};
            // After the VidyoClient is successfully initialized a global VC object will become available
            // All of the VidyoConnector gui and logic is implemented in VidyoConnector.js
            startVidyoConnector(VC, useTranscodingWebRTC, performMonitorShare, webrtcExtensionPath, configParams);

            break;
        case "RETRYING": // The library operating is temporarily paused
           //todo: is to inform UI
            break;
        case "FAILED":   // The library operating has stopped
               console.error("need to handle failed case")
            break;
        case "FAILEDVERSION":   // The library operating has stopped
           console.error("failed version to be handled");
            break;
        case "NOTAVAILABLE": // The library is not available
        console.error("not available to be handled");
            break;
        case "TIMEDOUT":   // Transcoding Inactivity Timeout
            console.error("need to handle timeout case")
            break;
    }
    return true; // Return true to reload the plugins if not available
}

// Run StartVidyoConnector when the VidyoClient is successfully loaded
async function startVidyoConnector(VC, useTranscodingWebRTC, performMonitorShare, webrtcExtensionPath, configParams) {
   
    vidyoConnector =  await VC.CreateVidyoConnector({
        viewId: VidyoConnectorStartParam.viewerId,                            // Div ID where the composited video will be rendered, see VidyoConnector.html
        viewStyle: VidyoConnectorStartParam.renderLayout, // Visual style of the composited renderer
        remoteParticipants: VidyoConnectorStartParam.remoteParticipants,                         // Maximum number of participants to render
        logFileFilter: VidyoConnectorStartParam.logFileFilter,
        logFileName:"electron_app.log",
        userData:""
    });

    enableDisableGoogleAnaylatics(false);
    //TODO: check load callback and success of above function call
    library_load_callback(Status.SUCCESS);
}


function ResizeRendering(x, y, w, h){
    vidyoConnector.ShowViewAtPoints({viewId: VidyoConnectorStartParam.viewerId, x: x, y: y, width: w, height:h});
}

function HideView(){
    vidyoConnector.HideView({viewId: VidyoConnectorStartParam.viewerId})
}

function RerenderView(x, y, w, h){
    ResizeRendering(x, y, w, h)
}

function SetCameraPrivacy(privacy){
    vidyoConnector.SetCameraPrivacy({
        privacy: privacy
    }).then(function() {

    }).catch(function() {
        console.error("SetCameraPrivacy Failed");
    });
}

//todo: paramaetes of this will be considerer, soon, when 
//some more functionalities be identified.
/*
statusCallBack = (Status, info)=>{}
*/
function Initialize( param, statusCallBack) {
    VidyoConnectorStartParam = param;
    library_load_callback = statusCallBack;
    //We need to ensure we're loading the VidyoClient library and listening for the callback.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'lib/javascript/VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded';
 document.getElementsByTagName('head')[0].appendChild(script);
}

function makeCallbackObject( statusCallBack){
   return {
        // Define handlers for connection events.
        onSuccess: () => {
            // Connected
            statusCallBack(Status.SUCCESS);
        },
        onFailure: (reason) => {
            // Failed
            console.error("vidyoConnector.Connect : onFailure callback received");
            statusCallBack(Status.FAIL, reason);
        },
        onDisconnected: (reason) => {
            // Disconnecte
            statusCallBack(Status.DISCONNECT, reason);
        }
    }
}

/*
statusCallBack = (Status, info)=>{}
*/
async function ConnectToConference(host, token, displayName, roomkey, statusCallBack) {
    const status = await vidyoConnector.Connect({
        // Take input from options form
        host,
        token,
        displayName,
        resourceId: roomkey,
         ...makeCallbackObject(statusCallBack)
       
    });


    statusCallBack(status ? Status.SUCCESS : Status.FAIL)

}

async function ConnectToConferceAsGuest(host, displayName, roomkey,roomPin, statusCallBack){
    try{
        const status = await vidyoConnector.ConnectToRoomAsGuest({
                host, 
                displayName,
                roomKey: roomkey,
                 roomPin:roomPin, //todo: find out how UI going to send roomPin
                 ...makeCallbackObject(statusCallBack)
            });

        //statusCallBack(status ? Status.SUCCESS : Status.FAIL)
        }catch(err){
            //console.error("error occur ", err)
            statusCallBack(Status.FAIL, err);
        }
        
}

async function ConnectconferenceWithKey(host, userName, password, roomKey, roomPin,statusCallBack){
    try{
        const status = await vidyoConnector.ConnectToRoomWithKey({
                host, 
                userName,
                password,
                roomKey: roomKey,
                 roomPin:roomPin, //todo: find out how UI going to send roomPin
                 ...makeCallbackObject(statusCallBack)
            });
    
        //statusCallBack(status ? Status.SUCCESS : Status.FAIL)
        }catch(err){
            //console.error("error occur ", err)
            statusCallBack(Status.FAIL, err);
        }
}

async function DisconnectFromConference(){
    const status =  await vidyoConnector.Disconnect();
    return status;
}

/*  onAdded - callback function
    onRemoved - callback function
*/
function SetRegisterNetworkInterfaceEvent(onAdded, onRemoved)
{
    return vidyoConnector.RegisterNetworkInterfaceEventListener({  
        onAdded: onAdded,
        onRemoved: onRemoved,
        onSelected: function(networkInterface, transportType) { /* Network interface was selected for a specific transport type */ },
        onStateUpdated: function(networkInterface, state) { /* Network interface state was updated */ }
    });
}

function SelectNetworkInterfaceForSignaling(networkInterface)
{
    vidyoConnector.SelectNetworkInterfaceForSignaling(networkInterface).then(function(){
   
    }).catch(function(){
        console.error('Select NetworkInterface For Signaling Failed');
    });
}

function SelectNetworkInterfaceForMedia(networkInterface)
{
    vidyoConnector.SelectNetworkInterfaceForMedia(networkInterface).then(function(){
    
    }).catch(function(){
        console.error('Select NetworkInterface For Media Failed');
    });
  
}

function GetCpuTradeOffProfile()
{
    return vidyoConnector.GetCpuTradeOffProfile();
}
/*
val: String (VIDYO_CONNECTORTRADEOFFPROFILE_Low, VIDYO_CONNECTORTRADEOFFPROFILE_Medium, VIDYO_CONNECTORTRADEOFFPROFILE_High)
*/
function SetCpuTradeOffProfile(val)
{
    vidyoConnector.SetCpuTradeOffProfile(val).then(function(){
     
    }).catch(function(){
        console.error('Set CPU Profile Failed');
    });
       
}
/*
val: Boolean
*/
function SetAutoReconnect(val)
{
    vidyoConnector.SetAutoReconnect({enable:val}).then(function(){
       
    }).catch(function(){
        console.error('Set Auto Reconnect Failed');
    });
        
    
}
/*
val: Number
*/
function SetAutoReconnectMaxAttempts(val)
{
    
    vidyoConnector.SetAutoReconnectMaxAttempts({maxAttempts:val}).then(function(){
       
    }).catch(function(){
        console.error('Set Auto Reconnect Max Attempt Failed');
    });
        

    
}
/*
val: Number
*/
function SetAutoReconnectAttemptBackOff(val)
{
    vidyoConnector.SetAutoReconnectAttemptBackOff({backOff:val}).then(function(){
        
    }).catch(function(){
        console.error('Set Auto Reconnect Attempt BackOff Failed');
    });
}

const onReconnecting = ( attemptObj,attemptTimeoutObj,reasonObj) => {
   
    const reconnectResponse ={
        attempt:attemptObj,
        nextAttemptIn:attemptTimeoutObj
    }
    reconnectingHandler("onReconnecting",reconnectResponse);
};
const onReconnected = () => {
    reconnectingHandler("onReconnected");
};
const onConferenceLost = (reasonObj) => {
    reconnectingHandler("onConferenceLost");
};
const  reconnectCallbcks = {
    onReconnecting,
    onReconnected,
    onConferenceLost

}
const RegisterReconnectEventListener = () => {
    vidyoConnector.RegisterReconnectEventListener(reconnectCallbcks).then(function(){
    }).catch(function(){
        console.error('Register ReconnectEventListener Failed');
    })
};

function UnregisterReconnectEventListener()
{
    vidyoConnector.UnregisterReconnectEventListener().then(function(){

    }).catch(function(){
        console.error('Unregister ReconnectEventListener Failed');
    })
        
}


RegisterDeviceListner =()=>{
    localCamerasList[0]     = null;
    localMicrophonesList[0] = null;
    localSpeakersList[0]    = null;
    vidyoConnector.RegisterLocalCameraEventListener({
        onAdded:  (localCamera)=> {
            // New camera is available
            localCamerasList[window.btoa(localCamera.id)] = localCamera;
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.ADD, localCamera);
        },
        onRemoved: (localCamera)=> {
            // Existing camera became unavailable
            delete localCamerasList[window.btoa(localCamera.id)];
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.REMOVE, localCamera);
        },
        onSelected: (localCamera)=> {
            // Camera was selected/unselected by you or automatically
            if(localCamera) {
                selectedCamera = localCamera;
                getSelectedCameraCapabilites();
                cameraControlCapabilitesSDK(selectedCamera).then(function(capablities){
                    currentSelectedCameraControlCapablities = capablities;
                    sendLocalDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.CAMERA_CONTROL_CAPABLITES_UPDATED, {capabilities : currentSelectedCameraControlCapablities});
                })
                sendLocalDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.SELECT, localCamera);
            }else{
                selectedCamera = {};
                selectedCamera.id = "0"
            }
        },
        onStateUpdated: function(localCamera, state) {
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.STATUS_CHANGED, state);
            // Camera state was updated
        }
    }).then(function() {
    }).catch(function() {
        console.error("RegisterLocalCameraEventListener Failed");
    });


    // Handle appearance and disappearance of microphone devices in the system
    vidyoConnector.RegisterLocalMicrophoneEventListener({
        onAdded: function(localMicrophone) {
            // New microphone is available
            localMicrophonesList[window.btoa(localMicrophone.id)] = localMicrophone;
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE ,Status.ADD, localMicrophone);
        },
        onRemoved: function(localMicrophone) {
            // Existing microphone became unavailable
            delete localMicrophonesList[window.btoa(localMicrophone.id)];
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE ,Status.REMOVE, localMicrophone);
        },
        onSelected: function(localMicrophone) {
            // microphone was selected/unselected by you or automatically
            if(localMicrophone) {
                selectedMicrophone = localMicrophone;
                GetVoiceProcesingStatus();
                sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE ,Status.SELECT, localMicrophone);
            }else{
                    selectedMicrophone = {};
                    selectedMicrophone.id = "0"
            }
        },
        onStateUpdated: function(localMicrophone, state) {
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE ,Status.STATUS_CHANGED, state);
            // microphone state was updated
        }
    }).then(function() {
    
    }).catch(function() {
        console.error("RegisterLocalMicrophoneEventListener Failed");
    });

    // Handle appearance and disappearance of speaker devices in the system
    vidyoConnector.RegisterLocalSpeakerEventListener({
        onAdded: function(localSpeaker) {
            // New speaker is available
            localSpeakersList[window.btoa(localSpeaker.id)] = localSpeaker;
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.SPEAKER ,Status.ADD, localSpeaker);
        },
        onRemoved: function(localSpeaker) {
            // Existing speaker became unavailable
            delete localSpeakersList[window.btoa(localSpeaker.id)];
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.SPEAKER ,Status.REMOVE, localSpeaker);
        },
        onSelected: function(localSpeaker) {
            // Speaker was selected/unselected by you or automatically
            if(localSpeaker){
                selectedSpeaker = localSpeaker
                sendLocalDeviceStatusCallBack(DEVICE_TYPE.SPEAKER ,Status.SELECT, localSpeaker);
            }else{
                selectedSpeaker = {};
                selectedSpeaker.id = "0"
            }
        },
        onStateUpdated: function(localSpeaker, state) {
            // Speaker state was updated
        }
    }).then(function() {
      
    }).catch(function() {
        console.error("RegisterLocalSpeakerEventListener Failed");
    });

    vidyoConnector.RegisterLocalMicrophoneEnergyListener(
        {
            onEnergy : function (VidyoLocalMicrophoneObj,audioEnergyObj){
                sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE ,Status.MICROPHONE_ENERGY_CHANGE, audioEnergyObj);
            }
        }
    ).then(status=>{
       
    });


    //getCameraDetails();
}

getSelectedCameraCapabilites = () =>{
    if(selectedCamera.id !== "0"){
        cameraCapablities(selectedCamera,(capablities)=>{
            currentSelectedCameraCapablities = capablities;
            sendLocalDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.CAMERA_CAPABLITES_UPDATED, {capabilities : currentSelectedCameraCapablities , cameraInfo : endPointStats.localCameraStats[0]});
        
        })
    }
}

SelectLocalCamera =(camera)=>{
    vidyoConnector.SelectLocalCamera({
        localCamera: camera
    }).then(function() {
       
    }).catch(function() {
        console.error("SelectCamera Failed");
    });
}

SelectLocalMicrophone =(microphone) =>{
    vidyoConnector.SelectLocalMicrophone({
        localMicrophone: microphone
    }).then(function() {
      
    }).catch(function() {
        console.error("SelectMicrophone Failed");
    });
}

SelectLocalSpeaker = (speaker)=>{
    vidyoConnector.SelectLocalSpeaker({
        localSpeaker: speaker
    }).then(function() {
    }).catch(function() {
        console.error("SelectSpeaker Failed");
    });
}

GetLocalCamerasList =()=>{
    return localCamerasList;
}

GetLocalSpeakersList =()=>{
    return localSpeakersList;
}

GetLocalMicrophonesList =()=>{
    return localMicrophonesList;
}

GetCurrentLocalCamera = () => {
    return selectedCamera;
}

cameraCapablities = (cameraObject,callback) => {
    vidyoConnector.GetStatsJson().then((data)=>{
        endPointStats = JSON.parse(data);
    }).catch(err=>{
        console.error("CameraCapabilities Errorr ", err)
    })
    return cameraObject.GetVideoCapabilitiesAsync(callback);
}

cameraControlCapabilitesSDK = async (cameraObject,callback) => {
    return await cameraObject.GetControlCapabilities();
}


GetVoiceProcesingStatus = () => {
    if (selectedMicrophone.id !== "0") {
    selectedMicrophone.GetVoiceProcessing().then((status) => {
        sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE, Status.VOICE_PROCESSING_STATUS_CHANGE, status);
    })
    }
}

RegisterModerationCommandEventListenerSDK =(callBack)=>{
    vidyoConnector.RegisterModerationCommandEventListener({onModerationCommand: function(deviceType, moderationType,State){
        callBack(deviceType, moderationType,State);
    }}).then((status)=>{
        if(!status){
            console.error("RegisterModerationCommandEventListener Failed")
        }
    })
}
SetVoiceProcesing = async (status) => {
    const Status = await selectedMicrophone.SetVoiceProcessing({ voiceProcessing: status, mode: "VIDYO_VOICEPROCESSINGMODE_Default" });
    return Status;
}
SetAutoGainControl = async (enable) => {
    const status = await selectedMicrophone.SetAutoGain({ autoGain: enable });
    return status;
}
GetAutoGainStatus = () => {
    if (selectedMicrophone.id !== "0") {
    selectedMicrophone.GetAutoGain().then((status) => {
        sendLocalDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE, Status.AUTO_GAIN_CONTROL_STATUS_CHANGE, status);
    })
    }
}


GetCameraCapablities = () =>{
    let cameraCapabilties = {};
    getSelectedCameraCapabilites();
    if(endPointStats.localCameraStats && endPointStats.localCameraStats[0] ){
        cameraCapabilties = endPointStats.localCameraStats[0];
    }
    return {capabilities : currentSelectedCameraCapablities , cameraInfo : cameraCapabilties};
}

GetCameraControlCapablities = () => {
    return {capabilities : currentSelectedCameraControlCapablities};
}

SetDisableVideoOnLowBandwidthSDK = enable => {
    vidyoConnector.SetDisableVideoOnLowBandwidth({enable:enable}).then(function() {
    }).catch(function() {
        console.error("Set disable Video on low bandwidth failed");
    });
}

SetDisableVideoOnLowBandwidthResponseTimeSDK = (value) => {
    return vidyoConnector.SetDisableVideoOnLowBandwidthResponseTime({responseTime:value})
 }

SetDisableVideoOnLowBandwidthSampleTimeSDK = (value) => {
    return vidyoConnector.SetDisableVideoOnLowBandwidthSampleTime({sampleTime:value})
}

SetDisableVideoOnLowBandwidthThresholdSDK = (value) => {
    return vidyoConnector.SetDisableVideoOnLowBandwidthThreshold({kbps:value})
}


SetDisableVideoOnLowBandwidthAudioStreamsSDK = (value) => {
    return vidyoConnector.SetDisableVideoOnLowBandwidthAudioStreams({audioStreams:value})
}

GetConnectorOptions = async () => {
    const data = JSON.parse(await vidyoConnector.GetOptions());
    if (data) {
        for (let key in data) {
            switch (key) {
                case "microphoneMaxBoostLevel":
                    connectorOption.microphoneMaxBoostLevel = data[key];
                    break;
                case "audioSharedModeBoth":
                    connectorOption.audioShareMode = data[key];
                    break;
                    case "audioExclusiveModeBoth":
                    connectorOption.micSpeakerExclusiveMode = data[key];
                    break;
                    case "audioExclusiveModeMic":
                    connectorOption.micExclusiveMode = data[key];
                    break;
                case "preferredAudioCodec":
                    connectorOption.audioCodecPriority = data[key];
                    break;
                case "AudioPacketInterval":
                    connectorOption.AudioPacketInterval = data[key];
                    break;
                case "AudioPacketLossPercentage":
                    connectorOption.AudioPacketLossPercentage = data[key];
                    break;
                case "AudioBitrateMultiplier":
                    connectorOption.AudioBitrateMultiplier = data[key];
                    break;
                case "sampleTime":
                    connectorOption.sampleTime = data[key];
                    break;
                case "responseTime":
                    connectorOption.responseTime = data[key];
                    break;
                case "lowBandwidthThreshold":
                    connectorOption.lowBandwidthThreshold = data[key];
                    break;
                case "autoReconnect":
                    connectorOption.autoReconnect = data[key];
                    break;
                case "reconnectAttempts":
                    connectorOption.reconnectAttempts = data[key];
                    break;
                case "reconnectBackOff":
                    connectorOption.reconnectBackOff = data[key];
                    break;
                    }
        };
    }
    return connectorOption;

}

let isEmptyObject = (_obj) => {
    if (_obj == null) return true; // null and undefined are "empty"
    if (Object.keys(_obj).length > 0) return false;
    if (Object.keys(_obj).length === 0) return true;
    for (var key in _obj) {
        if (Object.hasOwnProperty.call(_obj, key)) return false;
    }
    return true;
}


SetAudioDeviceUsageModeToShareFromSDK = () => {
    let optionItem = {
        "audioSharedModeBoth": true,
    };
    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {
       
    });  
}

SetAudioDeviceUsageModeToMicExclusiveFromSDK = () => {
    let optionItem = {
        "audioExclusiveModeMic": true,
    };
    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {
     
    });  
}
SetAudioDeviceUsageModeToMicSpeakerExclusiveFromSDK = () => {
    let optionItem = {
        "audioExclusiveModeBoth": true,
    };
    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {
    });
}

SetAudioCodecPreferenceFromSDK = (value) => {
    let optionItem = {
        "preferredAudioCodec": value,
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {

        if (status) {
            connectorOption.audioCodecPriority = value;
        }
    });
}

SetAudioPacketIntervalFromSDK = (value) => {
    let optionItem = {
        "AudioPacketInterval": parseInt(value),
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {

        if (status) {
            connectorOption.AudioPacketInterval = value;
        }
    });
}

SetAudioPacketLossPercentageFromSDK = (value) => {
    let optionItem = {
        "AudioPacketLossPercentage": parseInt(value),
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {

        if (status) {
            connectorOption.AudioPacketLossPercentage = value;
        }
    });
}

SetBitrateMultiplierFromSDK = (value) => {
    let optionItem = {
        "AudioBitrateMultiplier": parseInt(value),
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {

        if (status) {
            connectorOption.AudioBitrateMultiplier = value;
        }
    });
}

SetAudioMaxBoostFromSDK = (value) => {
    let optionItem = {
        "microphoneMaxBoostLevel": parseInt(value),
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {
       
        if (status) {
            connectorOption.microphoneMaxBoostLevel = value;
        }
    });
}

enableDisableGoogleAnaylatics = (value) => {
    let optionItem = {
        "enableGoogleAnalytics": value,
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {
        
        if (status) {
            console.log("enableGoogleAnalytics status", value);
        }
    });
}

GetWhiteListDeviceListFromSDK = async (callBack) => {
    const result = await vidyoConnector.GetWhitelistedAudioDevices({
        onGetCallback: callBack
    })
    return result;
}

AddAudioDeviceToWhitelistFromSDK = async (deviceName) =>{
    const result = await vidyoConnector.AddAudioDeviceToWhitelist({
        deviceName: deviceName
    })
   
    return result;
}

RemoveAudioDeviceFromWhitelistFromSDK = async (deviceName) =>{
    const result = await vidyoConnector.RemoveAudioDeviceFromWhitelist({
        deviceName: deviceName
    })

    return result;
}

SetWhitelistedAudioDevicesFromSDK = (value) => {
    let optionItem = {
        "audioWhitelistedItems": value,
    };

    vidyoConnector.SetOptions({ options: JSON.stringify(optionItem) }).then((status) => {
   
        if (status) {
            connectorOption.audioWhitelistedItems = value;
        }
    });
}
GetMaxSendBitRate =(callBack)=>{
    vidyoConnector.GetMaxSendBitRate().then((value)=>{
        callBack(value/1000);
    });
}

SetMaxSendBitRate =(value)=>{
    vidyoConnector.SetMaxSendBitRate({bitRate : value}).then((status)=>{
      
    });
}

GetMaxReceiveBitRate =(callBack)=>{
     vidyoConnector.GetMaxReceiveBitRate().then((value)=>{
        callBack(value/1000);
     });
        
}

SetMaxReceiveBitRate =(value)=>{
     vidyoConnector.SetMaxReceiveBitRate({bitRate : value}).then((status)=>{
    });;
}

setMaxConstraintForCamera = (maxHeight , maxWidth) =>{

    // frame interval set to 0 for setting max possible frame rate
    selectedCamera.SetMaxConstraint({width:maxWidth , height : maxHeight , frameInterval: 0}).then((status)=>{
        if(status){
       
        }else{
            console.error("Max constraint set for camera failed") 
        }
    })
}

sendLocalDeviceStatusCallBack = (deviceType, status, data) => {
    if (localDeviceStatusCallBack) {
        localDeviceStatusCallBack(deviceType, status, data);
    }
}
AddDeviceCallBack = (callBack) => {
    localDeviceStatusCallBack = callBack;
}

let networkService = null;
/**
 * requestHeader structure 
 * requestUrl
 * requestNumber 
 * requestPayload 
 * webProxyUserName
 * webProxyUserPassword
 * userAuthToken
 * userAuthUserName
 * userAuthUserPassword
 * requestMethod
 * requestContentType
 * 
 * CAinfo Structure
 * caFileContent 
 * caFilePath
 * 
 */
SendNetworkServiceRequest = async(requestHeader , CAinFo , responseCallBack)=>{
    if (!networkService) {
        networkService = await VC.CreateVidyoNetworkService({ caInfo: CAinFo });
    }
    networkService.HttpRequestASync(requestHeader, responseCallBack, 1).then(res => {
    });        
}

async function SetMicUnMute(){
    const r = await vidyoConnector.SetMicrophonePrivacy({privacy:false})  
    return r
}

async function SetMicMute(){
    const r = await vidyoConnector.SetMicrophonePrivacy({privacy:true})  
    return r
}

async function SetLocalCameraOFF(){
    const r = await vidyoConnector.SetCameraPrivacy({privacy:true})
    return r
}

async function SetLocalCameraON(){
    const r = await  vidyoConnector.SetCameraPrivacy({privacy:false})
    return r
}

async function SetSpeakerON(){
    const r = await vidyoConnector.SetSpeakerPrivacy({privacy:false})
    return r
}

async function SetSpeakerOFF(){
    const r = await vidyoConnector.SetSpeakerPrivacy({privacy:true})
    return r
}


async function SetViewLayout(style, participantCount){
    const r = await vidyoConnector.AssignViewToCompositeRenderer(
        {viewId:VidyoConnectorStartParam.viewerId, viewStyle:style, remoteParticipants:participantCount}
    );
    
} 


registerParticipantListiner = (callBacks) => {
    // Report local participant in RegisterParticipantEventListener.
    vidyoConnector.ReportLocalParticipantOnJoined({
        reportLocalParticipant: true
    }).then(function() {
    
    }).catch(function() {
        console.error("ReportLocalParticipantOnJoined Failed");
    });

    vidyoConnector.RegisterParticipantEventListener({ ...makeCallbackForPartiicpant(callBacks) }).then(function () {
    
    }).catch(function () {
        console.error("RegisterParticipantEventListener Failed");
    });
}

registerRemoteDeviceListner = ()=>{
    vidyoConnector.RegisterRemoteCameraEventListener({...makeCallbackForRemoteCamera()}).then(function(){
 
    }).catch(function(){
        console.error("RegisterRemoteCameraEventListener Failed");
    });

    vidyoConnector.RegisterRemoteMicrophoneEventListener({...makeCallBackForRemoteMicrophone()}).then(function(){
     
    }).catch(function(){
        console.error("RegisterRemoteMicrophoneEventListener Failed");
    }); 

}

const cameraPresetSuccess =(result)=>{
    console.log("RegisterPresetEventListener > success" , result)
}
const cameraPresetFail =(result)=>{
    console.log("RegisterPresetEventListener > fail" , result)
}

const addUserPresetList = (participantId,list) => { 
    var alreadyExists = userPresetList.filter(item=>{
        return item.userId === participantId
    });
    if(alreadyExists.length===0){
        userPresetList.push({
            userId:participantId,
            presetList:list
        })
    }
}

const removeUserPresetList = (participantId) => { 
    userPresetList = userPresetList.filter(item=>{
        return item.userId !== participantId;
    })
 }

const getActiveUserPresetList = (participantId)=>{
    let activeUser = userPresetList.filter(item=>{
        return item.userId === participantId;
    })[0].presetList;
    return activeUser;
}

makeCallbackForRemoteCamera = ()=>{
    return{
        onAdded: function(camera, participant) {
            if(participant && camera){
                addDataToParticpantList(participant);
              participantList[participant.userId].camera.data = camera;
              participantList[participant.userId].camera.state = true;
              remoteCameraList[window.btoa(participant.id)] = participant;
              remoteDeviceStatusCallBack(DEVICE_TYPE.CAMERA,Status.ADD , participant);
              cameraControlCapabilitesSDK(camera).then(function(capablities){
                  const remoteCameraControlCapablities = capablities;
                  participantList[participant.userId].camera.isFECCSuported = (remoteCameraControlCapablities.panTiltHasNudge && remoteCameraControlCapablities.zoomHasNudge) || remoteCameraControlCapablities.hasPresetSupport ;
                  participantList[participant.userId].camera.presetSupport = remoteCameraControlCapablities.hasPresetSupport;
                  if(remoteCameraControlCapablities.hasPresetSupport)
                  {
                    camera
                      .RegisterPresetEventListener({
                        onPresetUpdated: (presetList) => {
                          addUserPresetList(participant.userId, presetList);
                        },
                      })
                      .then(cameraPresetSuccess)
                      .catch(cameraPresetFail);
                    
                  }
                  remoteDeviceStatusCallBack(DEVICE_TYPE.CAMERA ,Status.CAMERA_CONTROL_CAPABLITES_UPDATED, {capabilities : remoteCameraControlCapablities, particpant : participant});
              })
            }
        },
        onRemoved: function(camera, participant) {
            participantList[participant.userId].camera = {};
            participantList[participant.userId].camera.isFECCSuported = false;
            delete remoteCameraList[window.btoa(participant.id)];
            remoteDeviceStatusCallBack(DEVICE_TYPE.CAMERA,Status.REMOVE , participant);
            removeUserPresetList(participant.userId)
        },
        onStateUpdated: function(camera,participant,state) {
            if(participant && camera){
                addDataToParticpantList(participant);
            participantList[participant.userId].camera.data = camera;
            participantList[participant.userId].camera.state = state=== "VIDYO_DEVICESTATE_Paused" ? false : true;
            remoteCameraList[window.btoa(participant.id)].state = state;
            remoteDeviceStatusCallBack(DEVICE_TYPE.CAMERA,Status.STATUS_CHANGED , participant , state);
            }
        }
    }

}

GetRemoteCameraListFromSDK = () =>{
    return remoteCameraList;
}

addRemoteDeviceCallBack =(callBack)=>{
    remoteDeviceCallBack = callBack;
}

addDataToParticpantList =(particpantData)=>{
    if(participantList[particpantData.userId]){
        participantList[particpantData.userId.toString()].participantData = particpantData;
    }else{
        participantList[particpantData.userId.toString()] = {};
        participantList[particpantData.userId.toString()].participantData = particpantData;
        participantList[particpantData.userId.toString()].pin = false;
        participantList[particpantData.userId.toString()].camera = {};
        participantList[particpantData.userId.toString()].microphone = {};
        participantList[particpantData.userId.toString()].micHardMute = false;
        participantList[particpantData.userId.toString()].camHardMute = false;
    }
}

makeCallBackForRemoteMicrophone = ()=>{
    return{
        onAdded: function(microphone, participant) {
            if(participant && microphone){
            addDataToParticpantList(participant);
            participantList[participant.userId].microphone.data = microphone;
            remoteMicroPhoneList[window.btoa(participant.id)] = participant;
            remoteDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE, Status.ADD , participant);
            }
        },
        onRemoved: function(microphone, participant) {
            participantList[participant.userId].microphone = {};
            delete remoteMicroPhoneList[window.btoa(participant.id)];
            remoteDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE,Status.REMOVE , participant);
        },
        onStateUpdated: function(microphone,participant,state) {
            if(participant && microphone){
            addDataToParticpantList(participant);
            participantList[participant.userId].microphone.data = microphone;
            participantList[participant.userId].microphone.state = state === "VIDYO_DEVICESTATE_Paused" ? false : true;
            remoteMicroPhoneList[window.btoa(participant.id)].state = state;
            remoteDeviceStatusCallBack(DEVICE_TYPE.MICROPHONE,Status.STATUS_CHANGED , participant , state);
            }
        }
    }
}
remoteDeviceCallBack = null;
remoteDeviceStatusCallBack = (deviceType, status, participantData, state = "") => {
    if (remoteDeviceCallBack !== null) {
        remoteDeviceCallBack(deviceType, status, participantData, state);
    }
}
GetRemoteMicroPhoneListFromSDK = () =>{
    return remoteMicroPhoneList;
}

let localUserId = "";
let localUserName = ""
let isRoleModerator = false;
GetLocalUserName = () =>{
    return localUserName;
}

getLocalUserID =()=>{
    return localUserId;
}
setLocalParticipantData = (localParticpantObj) => {
    localUserId = localParticpantObj.userId;
    localUserName = localParticpantObj.name;
}

getLocalUserClearenceType =()=>{
    return participantList[localUserId].clearenceType;
}

isModerationAllowed = () => {
  if (localUserId !== "" && participantList[localUserId]) {
    const LocalUserClearenceType = participantList[localUserId].clearenceType;

    if (
      isRoleModerator ||
      LocalUserClearenceType === "Host" ||
      LocalUserClearenceType === "Administrator" ||
      LocalUserClearenceType === "Moderator"
    ) {
      return true;
    }
  }
  return false;
};

makeCallbackForPartiicpant = (callBack) => {
    return {
        onJoined: function (participant) {
                participant.IsLocal().then(function (isLocal) {
                if (isLocal) {
                    setLocalParticipantData(participant);
                }
           addDataToParticpantList(participant);
            participantcount += 1;
            participant.status = 'Active';
            chatParticipants.set(participant.id, participant);
            GetParticpiantClearenceFromSDK(participant)
            callBack(Status.JOINED, participant);
            });

        },
        onLeft: function (participant) {
            participantcount -= 1;
            participant.status = 'InActive';
            chatParticipants.set(participant.id, participant);
            delete participantList[participant.userId.toString()];
            callBack(Status.LEAVE, participant)
            isRoleModerator = false
        },
        onDynamicChanged: function (participants) {
            // Order of participants changed
        },
        onLoudestChanged: function (participant, audioOnly) {
            callBack(Status.LOUDEST_CHANGED, participant)
        }
    }
}

GetParticipantCountFromSDK =()=>{
    return participantcount;
}
GetParticipantListFromSDK = ()=>{
    return participantList;
}

GetParticpiantNameFromSDK =(participantObj , cb)=>{
    participantObj.GetName().then(function(name) {
        cb(name);
    }).catch(function() {
        cb("GetNameFailed");
    });
}

GetParticpiantClearenceFromSDK =(participantObj , cb = null)=>{
    participantObj.GetClearanceType().then((name)=> {
        const clearenceType = getClearenceType(name)
        participantList[participantObj.userId].clearenceType = clearenceType;

        cb ? cb(clearenceType) : console.log("no cllback present for GetParticpiantClearenceFromSDK");
    }).catch((err)=> {
        cb ? cb("GetClearenceFailed") : console.log("GetClearenceFailed"); ;
    });
}

getClearenceType = (type) => {
    clearenceType = ""
    switch (type) {
        case "VIDYO_PARTICIPANT_CLEARANCETYPE_None":
            clearenceType = "Guest";
            break;

        case "VIDYO_PARTICIPANT_CLEARANCETYPE_Member":
            clearenceType = "Member";
            break;

        case "VIDYO_PARTICIPANT_CLEARANCETYPE_Owner":
            clearenceType = "Host";
            break;

        case "VIDYO_PARTICIPANT_CLEARANCETYPE_Admin":
            clearenceType = "Administrator";
            break;

        case "VIDYO_PARTICIPANT_CLEARANCETYPE_Moderator":
            clearenceType = "Moderator";
            break;
    }
    return clearenceType;
}

PinParticpantFromSDK = async (participantId ,updatePinState)=>{
    unPinParticipant(participantId)
    const particpantData = participantList[participantId.toString()].participantData;
    const isPin = participantList[participantId].pin;
   
   await vidyoConnector.PinParticipant({participant:particpantData, pin: !isPin}).then((status)=>{
        if(status){
            participantList[participantId].pin = !participantList[participantId].pin;
            updatePinState(participantList[participantId])
         
        }else{
            console.error("paricpant is pinned failed");
        }
    })
}

const unPinParticipant = (pinParticipantReqId) => { 
    const idList = Object.keys(participantList);
    idList.forEach(id => {
        if(id !==pinParticipantReqId)
        {
            participantList[id].pin =false
        }
    });
}

function UnregisterParticipantEventListener()
{
    /*Unregisters participant event notifications.*/
    vidyoConnector.UnregisterParticipantEventListener().then(function(){
     
    }).catch(function(){
        console.error('Unregister ParticipantEventListener Failed');
    })
}

function registerChatMessageEventListener(callBack)
{
    /*Registers to get notified about message events.*/
    vidyoConnector.RegisterMessageEventListener({
        onChatMessageReceived: function(VidyoParticipantObj,VidyoChatMessageObj) {
            callBack(Status.SUCCESS, VidyoChatMessageObj)
        }
    }).then(function(){
       
    }).catch(function(){
        console.error("RegisterRemoteCameraEventListener Failed");
    });
    
}

function UnregisterMessageEventListener()
{
    /*Unregisters message event notifications.*/
    vidyoConnector.UnregisterMessageEventListener().then(function(){
     
    }).catch(function(){
        console.error('Unregister MessageEvent Failed');
    })
}

function SendPrivateChatMessage(participant, message)
{
    
    return vidyoConnector.SendPrivateChatMessage({participant:participant, message:message})
}

const requestId = "moderatorAppId"

async function RequestConfernceModeration(pin){
    //is API provides the ability to request moderator privilege for the regular user.
    // If the room is owned by this user or user is Admin/operator moderator pin can be empty string
    return new Promise( (accept, reject)=>{
       
        vidyoConnector.RequestModeratorRole({moderatorPIN:pin, onRequestModeratorRoleResult:(result)=>{
          
            if(result === "VIDYO_CONNECTORMODERATIONRESULT_OK"){
                isRoleModerator = true;
            }else{
                isRoleModerator = false;
            }
            //todo: find out if not allowed moderator
            accept(result);
        }})
    });
}

//TODO : Usecase to self-revoke moderation control. 
const onRemoveModeratorRoleResult =(resultObject)=>{
  
}
const RevokeModerationControl = () => {
    return new Promise(async (accept,reject)=>{
        
        const r = await vidyoConnector.RemoveModeratorRole({onRemoveModeratorRoleResult});
        accept(r);
    })
}


const MODERATION_REQ = {
    EMPTY_CALLBACK: (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{console.log("empty callback  for moderation result called for ", requestIdObj)},
    LECTURE_START : { ID : "startlecture", callback:this.EMPTY_CALLBACK},
    SOFT_VIDEO_MUTE_ALL:{ID:"softvideomuteAll", callback:this.EMPTY_CALLBACK},
    SOFT_AUDIO_MUTE_ALL:{ID:"softaudiomuteAll", callback:this.EMPTY_CALLBACK},
    HARD_VIDEO_MUTE_ALL:{ID:"hardvideomuteall", callback:this.EMPTY_CALLBACK},
    HARD_AUDIO_MUTE_ALL:{ID:"hardaudiomuteall", callback:this.EMPTY_CALLBACK},
    STOP_LECTURE :{ID:"stoplecture", callback:this.EMPTY_CALLBACK},
    UNRAISE_HAND:{ID:"unraiseHand",callback:this.EMPTY_CALLBACK},
    SOFT_VIDEO_MUTE_PARTICIPANT:{ID:"softvideomuteParticipant", callback:this.EMPTY_CALLBACK},
    SOFT_AUDIO_MUTE_PARTICIPANT:{ID:"softaudiomutePARTICIPANT", callback:this.EMPTY_CALLBACK},
    HARD_VIDEO_MUTE_PARTICIPANT:{ID:"hardvideomutePARTICIPANT", callback:this.EMPTY_CALLBACK},
    HARD_AUDIO_MUTE_PARTICIPANT:{ID:"hardaudiomutePARTICIPANT", callback:this.EMPTY_CALLBACK},
    SET_PRESENTER:{ID:"setPresenter",callback:this.EMPTY_CALLBACK},
    REMOVE_PRESENTER:{ID:"removePresenter",callback:this.EMPTY_CALLBACK},
    REMOVE_MODERATOR_PIN:{ID:"removeModeratorPin",callback:this.EMPTY_CALLBACK},
    SET_MODERATOR_PIN:{ID:"setModeratorPin",callback:this.EMPTY_CALLBACK},
    RAISE_HAND_REQUEST:{ID:"raiseHandRequest",callback:this.EMPTY_CALLBACK},
    UNRAISE_HAND_REQUEST:{ID:"unraiseHandRequest",callback:this.EMPTY_CALLBACK},
    APPROVAL_RAISE_HAND:{ID:"approveRaiseHand",callback: this.EMPTY_CALLBACK},
    DISMISS_RAISE_HAND:{ID:"dismissRaisedHand",callback: this.EMPTY_CALLBACK},
};

function OnModerationResult(VidyoParticipantObj,resultObj,actionObj,requestIdObj){
    switch(requestIdObj){
        case MODERATION_REQ.LECTURE_START.ID:
        MODERATION_REQ.LECTURE_START.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.SOFT_VIDEO_MUTE_ALL.ID:
        MODERATION_REQ.SOFT_VIDEO_MUTE_ALL.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.SOFT_AUDIO_MUTE_ALL.ID:
        MODERATION_REQ.SOFT_AUDIO_MUTE_ALL.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.HARD_VIDEO_MUTE_ALL.ID:
        MODERATION_REQ.HARD_VIDEO_MUTE_ALL.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.HARD_AUDIO_MUTE_ALL.ID:
        MODERATION_REQ.HARD_AUDIO_MUTE_ALL.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.SOFT_VIDEO_MUTE_PARTICIPANT.ID:
        MODERATION_REQ.SOFT_VIDEO_MUTE_PARTICIPANT.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.SOFT_AUDIO_MUTE_PARTICIPANT.ID:
        MODERATION_REQ.SOFT_AUDIO_MUTE_PARTICIPANT.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.HARD_VIDEO_MUTE_PARTICIPANT.ID:
        MODERATION_REQ.HARD_VIDEO_MUTE_PARTICIPANT.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.HARD_AUDIO_MUTE_PARTICIPANT.ID:
        MODERATION_REQ.HARD_AUDIO_MUTE_PARTICIPANT.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.STOP_LECTURE.ID:
        MODERATION_REQ.STOP_LECTURE.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.UNRAISE_HAND.ID:
        MODERATION_REQ.UNRAISE_HAND.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.SET_PRESENTER.ID:
        MODERATION_REQ.SET_PRESENTER.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.REMOVE_PRESENTER.ID:
        MODERATION_REQ.REMOVE_PRESENTER.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.RAISE_HAND_REQUEST.ID:
        raiseHandRequestHandler(resultObj, actionObj)
        break;
        case MODERATION_REQ.UNRAISE_HAND_REQUEST.ID:
        raiseHandRequestHandler(resultObj, actionObj)
        break;
        case MODERATION_REQ.APPROVAL_RAISE_HAND.ID:
            MODERATION_REQ.APPROVAL_RAISE_HAND.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.DISMISS_RAISE_HAND.ID:
            MODERATION_REQ.DISMISS_RAISE_HAND.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj);
        break;
        case MODERATION_REQ.SET_MODERATOR_PIN.ID:
            MODERATION_REQ.SET_MODERATOR_PIN.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj)
            break;
        case MODERATION_REQ.REMOVE_MODERATOR_PIN.ID:
            MODERATION_REQ.REMOVE_MODERATOR_PIN.callback(VidyoParticipantObj,resultObj,actionObj,requestIdObj)
            break;
        default:
            console.log("handle this request ID ",requestIdObj )
    }
}

//Todo: need to fix this function, as it required underlaying a callback which 
//will provide information on the moderation result.
async function RegisterModerationResultEventListener(){
    const r = await vidyoConnector.RegisterModerationResultEventListener({onModerationResult:OnModerationResult})
    return r
}


async function UnregisterModerationResultEventListener(){
    const r = await vidyoConnector.UnregisterModerationResultEventListener()
    return r
}

async function  StartLectureMode(to_start){
    return new Promise( async (accept, reject)=>{

        if(to_start){
            MODERATION_REQ.LECTURE_START.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
                //todo check here response for lecture mode
                accept(true);//todo send true or false depending
            }
            const r = await vidyoConnector.StartLectureMode({requestId:MODERATION_REQ.LECTURE_START.ID});   
            if(!r){
                accept(false);
            }
        }else{
            MODERATION_REQ.STOP_LECTURE.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
                //todo check here response for lecture mode
                accept(true);//todo send true or false depending
            }
            const r = await vidyoConnector.StopLectureMode({requestId:MODERATION_REQ.STOP_LECTURE.ID})

           if(!r){
               accept(false);
           }
        }

    });

}

async function SoftVideoMuteAllParticipants() {
    return new Promise(async (accept, reject)=>{
        MODERATION_REQ.SOFT_VIDEO_MUTE_ALL.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            //todo check there response for soft video mute all participant
            accept(true);//todo send true or false depending upon the paramter received in function
        }
        const r = await vidyoConnector.DisableVideoSilenceForAll({requestId:MODERATION_REQ.SOFT_VIDEO_MUTE_ALL.ID})
        if(!r){
            accept(r);
        }
    });
}

async function DropAllParticipants(reason) {
    //returns true or false
    const r = await vidyoConnector.DropAllParticipants({ reason })
  
    return r
}



async function SoftAudioMuteAllParticipants() {
    return new Promise( async (accept, reject)=>{
        MODERATION_REQ.SOFT_AUDIO_MUTE_ALL.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            accept(true) //todo: check here parmater to decide success or failute.
        }
        const r = await vidyoConnector.DisableAudioSilenceForAll({ requestId:MODERATION_REQ.SOFT_AUDIO_MUTE_ALL.ID })
      
        if(!r){
            accept(r);
        }
    });
}

async function HardVideoMuteAllParticipants(is_mute) {
    return new Promise(async (accept, reject)=>{
        MODERATION_REQ.HARD_VIDEO_MUTE_ALL.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            accept(true)//todo: chek here paramter to decide success or failure
        }
        const r = await vidyoConnector.DisableVideoForAll({ disable: is_mute, requestId:MODERATION_REQ.HARD_VIDEO_MUTE_ALL.ID })
        //return true or false
        if(!r){
            accept(r);
            console.error("HardVideoMuteAllParticipants failed")
        }
    });
   
}

async function HardMuteMicAllParticipants(is_mute) {
    return new Promise( async (accept, reject)=>{
        MODERATION_REQ.HARD_AUDIO_MUTE_ALL.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            accept(true);// todo check here paramter to decide success or failure.
        }
        const r = await vidyoConnector.DisableAudioForAll({ disable: is_mute, requestId:MODERATION_REQ.HARD_AUDIO_MUTE_ALL.ID })
       
        if(!r){
            accept(r);
            console.error("HardMuteMicAllParticipants failed")
        }
    });
  
}

////////// moderation for participant ////////////


async function DropParticipant(reason , participantId) {
    //returns true or false
    const r = await vidyoConnector.DropParticipant({participant: participantList[participantId].participantData,reason:reason });
    if(!r){
        console.error("DropParticipant failed")
    }
    return r
}

async function SoftVideoMuteParticipant(participantId) {
    return new Promise(async (accept, reject)=>{
        MODERATION_REQ.SOFT_VIDEO_MUTE_PARTICIPANT.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            //todo check there response for soft video mute participant
            accept(true);//todo send true or false depending upon the paramter received in function
        }
        const r = await vidyoConnector.DisableVideoSilenceForParticipant({participant: participantList[participantId].participantData,requestId:MODERATION_REQ.SOFT_VIDEO_MUTE_PARTICIPANT.ID})
        if(!r){
            accept(r);
            console.error("SoftVideoMuteParticipant failed")
        }
    });
    
}

async function SoftAudioMuteParticipant(participantId) {
    return new Promise( async (accept, reject)=>{
        MODERATION_REQ.SOFT_AUDIO_MUTE_PARTICIPANT.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            accept(true) //todo: check here parmater to decide success or failute.
        }
        const r = await vidyoConnector.DisableAudioSilenceForParticipant({participant: participantList[participantId].participantData, requestId:MODERATION_REQ.SOFT_AUDIO_MUTE_PARTICIPANT.ID })
        if(!r){
            accept(r);
            console.error("SoftAudioMuteParticipant failed")
        }
    });
}
  
async function HardVideoMuteParticipant(is_mute,participantId) {
    return new Promise(async (accept, reject)=>{
        MODERATION_REQ.HARD_VIDEO_MUTE_PARTICIPANT.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            accept(true)//todo: chek here paramter to decide success or failure
        }
        const r = await vidyoConnector.DisableVideoForParticipant({participant: participantList[participantId].participantData, disable: is_mute, requestId:MODERATION_REQ.HARD_VIDEO_MUTE_PARTICIPANT.ID })
        //return true or false
        if(r){
            participantList[participantId].camHardMute = is_mute;
        }
        if(!r){
            accept(r);
            console.error("HardVideoMuteParticipant failed")
        }
    });
   
}

async function HardMuteMicParticipant(is_mute , participantId) {
    return new Promise( async (accept, reject)=>{
        MODERATION_REQ.HARD_AUDIO_MUTE_PARTICIPANT.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            accept(true);// todo check here paramter to decide success or failure.
        }
        const r = await vidyoConnector.DisableAudioForParticipant({participant: participantList[participantId].participantData, disable: is_mute, requestId:MODERATION_REQ.HARD_AUDIO_MUTE_PARTICIPANT.ID })
        if(r){
            participantList[participantId].micHardMute = is_mute;
        }
        if(!r){
            accept(r);
            console.error("HardMuteMicParticipant failed")
        }
    });
}


async function SetPresenter(participantId) {
    if (conferenceModeSDK !== "VIDYO_CONNECTORCONFERENCEMODE_LOBBY") {
        RemovePresenter();
    }
    return new Promise(async (accept, reject) => {
        MODERATION_REQ.SET_PRESENTER.callback = (VidyoParticipantObj, resultObj, actionObj, requestIdObj) => {
            accept(true);// todo check here paramter to decide success or failure.
        }
       const r = await vidyoConnector.SetPresenter({ participant: participantList[participantId].participantData, requestId: MODERATION_REQ.SET_PRESENTER.ID })

        if (!r) {
            accept(r);
            console.error("SetPresenter failed")
        }
    });
}
async function RemovePresenter() {

    return new Promise(async (accept, reject) => {
        MODERATION_REQ.REMOVE_PRESENTER.callback = (VidyoParticipantObj, resultObj, actionObj, requestIdObj) => {
            currentPresenterId ="";
            accept(true);// todo check here paramter to decide success or failure.
        }
        const r = await vidyoConnector.RemovePresenter({ requestId: MODERATION_REQ.REMOVE_PRESENTER.ID })
      
        if (!r) {
            accept(r);
            console.error("RemovePresenter failed")
        }
    });
}


let currentPresenterId = "";
let conferenceModeSDK = "group"
function RegisterLectureModeEventListener(onPresenterChangedCallBack , onHandRaiseCallBack){
    vidyoConnector.RegisterLectureModeEventListener({
        presenterChanged : function (participantObj){
            if(participantObj){
                if(currentPresenterId !== "" && participantList[currentPresenterId]){
                    participantList[currentPresenterId].isPresenter = false;
                }
                addDataToParticpantList(participantObj);
                participantList[participantObj.userId].isPresenter = true;
                onPresenterChangedCallBack(currentPresenterId === "" ? null : participantList[currentPresenterId] ,participantObj)
                currentPresenterId = participantObj.userId;
          }
          else{
              //participantList[currentPresenterId].isPresenter = false;
              currentPresenterId = "";
          }
        },

        handRaised : function (participantObjectList){
            clearHandRaiseFlagFromParticpantList();
            participantObjectList.forEach((participant , index,array)=>{
                participantList[participant.userId].isHandRaised = true;
            });
            onHandRaiseCallBack();
        }

    });
}

 clearHandRaiseFlagFromParticpantList = () => {
   for (particpant in participantList) {
     if (participantList[particpant].isHandRaised) {
       participantList[particpant].isHandRaised = false;
     }
   }
 };

function RegisterConferenceModeEventListener (conferenceModeChangedCallBack){
    vidyoConnector.RegisterConferenceModeEventListener({
        conferenceModeChanged : function (modeObj){
            conferenceModeSDK = modeObj;
            conferenceModeChangedCallBack(modeObj);
        }
    }).then((status)=>{
        if(!status){
            console.error("Register Conference Mode Event Listener failed")
        }
    })
}

//////////////////////////////////////////////////

async function StopLectureMode() {
    return new Promise(
        async (accept, reject)=>{
            MODERATION_REQ.STOP_LECTURE.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
                accept(true);//todo; check here paramter to decide success or failure
            }
            const r = await vidyoConnector.StopLectureMode({ requestId:MODERATION_REQ.STOP_LECTURE.ID })

            if(!r){
                accept(false);
                console.error("StopLectureMode failed")
            }
        }
    );
  
}

async function UnRaiseAllParticipantsHands(){
    return new Promise(
        async (accept, reject)=>{
            MODERATION_REQ.UNRAISE_HAND.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
                accept(true);//todo: check here paramer to decide success or failure
            }
            const r = await  vidyoConnector.DismissAllRaisedHands({requestId:MODERATION_REQ.UNRAISE_HAND.ID})
            //returns true or false
            if(!r){
                accept(false);
                console.error("DismissAllRaisedHands failed")
            }
        });
    
}

async function ApproveRaisedHandFromSDK(participantID) {
   const particpant  = participantList[participantID].participantData;
    return new Promise(
        async (accept, reject)=>{
            MODERATION_REQ.APPROVAL_RAISE_HAND.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
                accept(true);//todo: check here paramer to decide success or failure
            }
            const r = await vidyoConnector.ApproveRaisedHand({participant:particpant, requestId:MODERATION_REQ.APPROVAL_RAISE_HAND.ID});
            //returns true or false
            if(!r){
                accept(false);
                console.error("ApproveRaisedHand failed")
                
            }
        });
    }

async function DismissRaisedHandFromSDK(participantID) {
    let particpantArray = [];
    particpantArray.push(participantList[participantID].participantData);
    return new Promise(
        async (accept, reject)=>{
            MODERATION_REQ.DISMISS_RAISE_HAND.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
                accept(true);//todo: check here paramer to decide success or failure
            }
            const r = await vidyoConnector.DismissRaisedHand({participants:particpantArray, requestId:MODERATION_REQ.DISMISS_RAISE_HAND.ID})
            //returns true or false
            if(!r){
                accept(false);
                console.error("DismissRaisedHand failed")
            }
        });
}
function SendGroupChatMessage(message)
{
    return vidyoConnector.SendChatMessage({message:message})
}



/* Vidyo Connector Banuba api's */

const GetBackgroundEffectOptions = (callBack) => {
    vidyoConnector.GetCameraBackgroundEffect({
        onGetEffectInfo: function (effectInfo) {
            callBack(effectInfo);
        }
    });
};

/* Vidyo Connector Camera Background Effect */
// Enable background blur effect

const EnableBackgroundBlurEffect = async() => {
    const EFFECT_INFO_OBJECT = {
        effectType: BackgroundEffectType.BLUR_BACKGROUND,
        token : backgroundOption.token,
        pathToResources: backgroundOption.pathToResources,
        pathToEffect: backgroundOption.pathToBlurEffect,
        blurIntensity: parseInt(backgroundOption.blurIntensity),
    };

    const status = await vidyoConnector.SetCameraBackgroundEffect({
        effectInfo: EFFECT_INFO_OBJECT
    });
    return status;
};

// Switch to virtual background effect
const EnableVirtualBackgroundEffect = async (imagePath) => {
    const EFFECT_INFO_OBJECT = {
        effectType: BackgroundEffectType.VIRTUAL_BACKGROUND,
        token : backgroundOption.token,
        pathToResources: backgroundOption.pathToResources,
        pathToEffect: backgroundOption.pathToVirtualBackgroundEffect,
        virtualBackgroundPicture: imagePath
    };

    const STATUS = await vidyoConnector.SetCameraBackgroundEffect({
        effectInfo: EFFECT_INFO_OBJECT
    })
    return STATUS;
};

const SetEffectToNone = async() => {
    const EFFECT_INFO_OBJECT = {
        effectType: BackgroundEffectType.NONE,
    };
    const STATUS = await vidyoConnector.SetCameraBackgroundEffect({ effectInfo: EFFECT_INFO_OBJECT});
    return status;
};

// Set blur intensity (changing blur effect on item click)
const SetBlurIntensity = async (intensity) => {
    backgroundOption.blurIntensity = intensity;
    const STATUS = await vidyoConnector.SetBlurIntensity({ intensity: intensity});
    return STATUS;
};

// Change background picture (changing virtual image on item click)
const ChangeVirtualBackgroundPicture = async(imagePath) => {
    const STATUS = await vidyoConnector.SetVirtualBackgroundPicture({ 
        pathToPicture:imagePath
    });
    return STATUS;
};
 ///////////////////////////////////////////////////////////////////////////////////

let isRoomLock = false;
let isRoomHasModerationPin = false;
let isRoomHasPin = false;
let roomName = "";
let recordingState = "";
let vcRecordingState = "";
let webCastingState = "";

function getRoomLockStatus (){
    return isRoomLock;
}

function isRoomModerationPinEnabled (){
    return isRoomHasModerationPin;
}

function isRoomPinEnabled () {
    return isRoomHasPin;
}

function getRoomName (){
    return roomName;
}

function getRecordingState () {
    return recordingState;
}

function getVCRecordingState(){
    return vcRecordingState;
}

function RegisterConnectionPropertyListenerFromSDK (callBack){
    vidyoConnector.RegisterConnectionPropertiesEventListener({onConnectionPropertiesChanged:(connectionObject)=>{
        isRoomHasModerationPin = connectionObject.hasModeratorPin;
        isRoomHasPin = connectionObject.hasRoomPin;
        isRoomLock = connectionObject.isRoomLocked;
        roomName = connectionObject.roomName;
        vcRecordingState = connectionObject.recordingState;
        minRoomPin =  connectionObject?.minimumRoomPinLength || 4;
        maxRoomPin = connectionObject?.maximumRoomPinLength || 12;

        callBack(connectionObject);
    }}).then((status)=>{
        if(!status){
            console.error("Register Connection Properties Event Listener failed")
        }
         
        
    })
}

////////// Room Moderation Control //////////////////

function LockRoom (callBack){
    vidyoConnector.LockRoom({
        onLockRoomResult:callBack
    }).then((status)=>{
        if(!status){
            console.error("LockRoom Failed")
        }
    })
}

function UnLockRoom (callBack){
    vidyoConnector.UnlockRoom({
        onUnlockRoomResult:callBack
    }).then((status)=>{
        if(!status){
            console.error("UnlockRoom Failed")
        }
    })
}

async function SetModeratorPin(pin) {
    return new Promise(async (accept, reject)=>{
        MODERATION_REQ.SET_MODERATOR_PIN.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            //todo check there response for remove moderator pin
            isRoomHasModerationPin = true;
            accept(true);//todo send true or false depending upon the paramter received in function
        }
        const r = await vidyoConnector.SetModeratorPIN({moderatorPIN:pin , requestId:MODERATION_REQ.SET_MODERATOR_PIN.ID})
        if(!r){
            accept(r)
            console.error("SetModeratorPIN Failed")
        }
    });
    
}
async function RemoveModeratorPin() {
    return new Promise(async (accept, reject)=>{
        MODERATION_REQ.REMOVE_MODERATOR_PIN.callback = (VidyoParticipantObj,resultObj,actionObj,requestIdObj)=>{
            //todo check there response for remove moderator pin
            isRoomHasModerationPin = false;
            accept(true);//todo send true or false depending upon the paramter received in function
        }
        const r = await vidyoConnector.RemoveModeratorPIN({requestId:MODERATION_REQ.REMOVE_MODERATOR_PIN.ID})
        if(!r){
            accept(r)
            console.error("RemoveModeratorPIN Failed")
        }
    });
    
}

function roomPinRequirementSDK(){
    return {
        minRoomPin,
        maxRoomPin
    }
}

function SetRoomPin (pin , callBack){
    vidyoConnector.SetRoomPIN({
        roomPIN:pin, onSetRoomPinResult:callBack
    }).then((status)=>{
        isRoomHasPin = status;
        if(!status){
            console.error("SetRoomPIN Failed")
        }
    })
}

function RemoveRoomPin (callBack){
    vidyoConnector.RemoveRoomPIN({
        onRemoveRoomPinResult:callBack
    }).then((status)=>{
        isRoomHasPin = !status;
        if(!status){
            console.error("RemoveRoomPIN Failed")
        }
    })
}

let recordingProfileList=[];
function getRecordingList (){
    return recordingProfileList;
}
function GetRecordingProfile (){
    vidyoConnector.GetRecordingServiceProfiles({
        onGetRecordingProfilesCallback : function (profilesObj,prefixesObj,resultObj){
            if(resultObj === "VIDYO_CONNECTORRECORDINGSERVICERESULT_Success"){
                for(let i = 0 ; i < profilesObj.length ; i++){
                    recordingProfileList[i] = {profile : profilesObj[i] ,prefix : prefixesObj[i] };
                }
            }
        }
    }).then((status)=>{
        if(!status){
            console.error("GetRecordingServiceProfiles Failed")
        }
    })
}



///////////////////////////////////////////////////// 
async function SearchUsers(searchText, startIndex, maxRecords, userSearchResultCallback)
{
    const r = await vidyoConnector.SearchUsers({
        searchText: searchText, 
        startIndex: startIndex, 
        maxRecords: maxRecords, 
        onUserSearchResults: userSearchResultCallback
    });
    return r
}
async function InviteParticipant(contactObj, message, inviteResultCallBack) {
    const r = await vidyoConnector.InviteParticipant({contact: contactObj, message: message, onInviteResult: inviteResultCallBack});
    return r;
}
async function RemoteCameraControlPTZNudge(remoteCameraCtrl, pan, tilt, zoom) {
    let status = await remoteCameraCtrl.ControlPTZNudge({pan: pan, tilt: tilt, zoom: zoom});
    return status;
}   

async function LocalCameraControlPTZ(localCameraCtrl, pan, tilt, zoom) {
    let status = await localCameraCtrl.ControlPTZ({pan: pan, tilt: tilt, zoom: zoom});
    return status;
}

async function RemoteCameraActivatePreset(remoteCameraCtrl, presetIndex) {
    let status = await remoteCameraCtrl.ActivatePreset({index:parseInt(presetIndex)})
    return status;
}   


function GetLocalWindowShareList()
{
    return localWindowShareList;
}

function GetLocalMonitorShareList()
{
    return localMonitorShareList;
}

makeCallbackForLocalWindowShare = (callBack)=>{
    return{
        onAdded: function(localWindowShare) {
            if (localWindowShare) {
                if(!localWindowShareList[localWindowShare.applicationName])
                {
                    localWindowShareList[localWindowShare.applicationName] = new Array();
                }
                localWindowShareList[localWindowShare.applicationName][localWindowShare.objId] = localWindowShare;
                callBack(Status.ADD , {});
            }
        },
        onRemoved: function(localWindowShare) {
            if (localWindowShare) {
                delete localWindowShareList[localWindowShare.applicationName][localWindowShare.objId];
                if(localWindowShareList[localWindowShare.applicationName].length <= 0){
                    delete localWindowShareList[localWindowShare.applicationName]
                }
                callBack(Status.REMOVE , {});
            }
        }, 
        onSelected: function(localWindowShare) {
            /* Window was selected */
            console.log('local Window is shared')
            //todo:localWindowShare is shared, now we can enable or display close share options
        },
        onStateUpdated: function(localWindowShare, state) { 
            //Local Window share state value
            //currently state values:-
            //     VIDYO_DEVICESTATE_Added            The device was added to the system.
            //     VIDYO_DEVICESTATE_Removed          The device was removed from the system.
            //     VIDYO_DEVICESTATE_Started          The device started successfully.
            //     VIDYO_DEVICESTATE_Stopped          The device stopped.
            //     VIDYO_DEVICESTATE_Suspended        The device was suspended and the frames can no longer be captured.
            //     VIDYO_DEVICESTATE_Unsuspended      The device was unsuspended.
            //     VIDYO_DEVICESTATE_DefaultChanged   The device default device has changed.
            //     VIDYO_DEVICESTATE_ConfigureSuccess The device configured successfully.
            //     VIDYO_DEVICESTATE_ConfigureError   The device configuring failed.
            //     VIDYO_DEVICESTATE_Error            The device failed.
        }
    }
}

async function RegisterLocalWindowShareEventListener(callBacks)
{
    const r = await vidyoConnector.RegisterLocalWindowShareEventListener({...makeCallbackForLocalWindowShare(callBacks)})
    return r;
}


function GetSharePreviewIconForWindow(localWindowShare, width, height, callBack)
{
    if (localWindowShare) {
        localWindowShare.GetPreviewFrameDataUriAsync({
            maxWidth: width,
            maxHeight: height,
            onComplete: function(previewFrameURI, sharePreviewState) {
               callBack(Status.LWS_PREVIEW_IMAGE, {objId: localWindowShare.objId, applicationName: localWindowShare.applicationName, name: localWindowShare.name , previewIcon: previewFrameURI, sharePreviewState: sharePreviewState});
            }
        });
        
    }
}


async function ShareLocalWindow(localWindowShare , shareOptions)
{
    //Selects the local window to share in a conference
    const r1 = await vidyoConnector.SelectLocalWindowShareAdvanced({localWindowShare:{} , options:{}});
    const r = await vidyoConnector.SelectLocalWindowShareAdvanced({localWindowShare:localWindowShare , options:shareOptions});
    return r;
}

async function StopShareLocalWindow()
{
    //Stop the local window share in a conference
    const r = await vidyoConnector.SelectLocalWindowShareAdvanced({localWindowShare:{} , options:{}});
    return r;
}

 

function GetApplicationIconForSharedApplication(localWindowShare, width, height, callBack)
{
    localWindowShare.GetApplicationIconFrameDataUriAsync({
        maxWidth: width,
        maxHeight: height,
        onComplete: (response) => {
            // Assign an image source in the UI with the preview frame
            callBack(localWindowShare.objId, response)
        }
    })
}

makeCallbackForLocalMonitorShare = (callBack)=>{
    return{
        onAdded: function(localMonitorShare) {
            if (localMonitorShare) {
                localMonitorShareList[localMonitorShare.objId] = localMonitorShare;
                callBack(Status.ADD , {objId:localMonitorShare.objId});
            }
        },
        onRemoved: function(localMonitorShare) {
            if (localMonitorShare) {
                delete localMonitorShareList[localMonitorShare.objId];
                callBack(Status.REMOVE , {objId:localMonitorShare.objId});
            }
        }, 
        onSelected: function(localMonitorShare) {
            /* Monitor was selected */
            console.log('local Monitor is shared successfully')
            //todo:localMonitor is shared, now we can enable or display close share options
        },
        onStateUpdated: function(localMonitorShare, state) { 
            //Local Monitor share state value
            //currently state values:-
            //     VIDYO_DEVICESTATE_Added            The device was added to the system.
            //     VIDYO_DEVICESTATE_Removed          The device was removed from the system.
            //     VIDYO_DEVICESTATE_Started          The device started successfully.
            //     VIDYO_DEVICESTATE_Stopped          The device stopped.
            //     VIDYO_DEVICESTATE_Suspended        The device was suspended and the frames can no longer be captured.
            //     VIDYO_DEVICESTATE_Unsuspended      The device was unsuspended.
            //     VIDYO_DEVICESTATE_DefaultChanged   The device default device has changed.
            //     VIDYO_DEVICESTATE_ConfigureSuccess The device configured successfully.
            //     VIDYO_DEVICESTATE_ConfigureError   The device configuring failed.
            //     VIDYO_DEVICESTATE_Error            The device failed.
         }
    }
}

async function RegisterLocalMonitorventListener(callBacks)
{
    const r = vidyoConnector.RegisterLocalMonitorEventListener({...makeCallbackForLocalMonitorShare(callBacks)})
    return r;
  
}

function GetSharePreviewIconForMonitor(localMonitorShare, width, height, callBack)
{
    if (localMonitorShare) {
        localMonitorShare.GetPreviewFrameDataUriAsync({
            maxWidth: width,
            maxHeight: height,
            onComplete: function(previewFrameURI, sharePreviewState) {
                // Assign an image source in the UI with the preview frame
                callBack(Status.LWS_PREVIEW_IMAGE, {objId: localMonitorShare.objId, previewIcon: previewFrameURI, sharePreviewState: sharePreviewState});
            }
        });
    }
}

async function ShareLocalMonitor(localMonitor,shareOptions)
{
    //Selects the local monitor to share in a conference 
    const r = await vidyoConnector.SelectLocalMonitorAdvanced({localMonitor:localMonitor , options:shareOptions});
    return r;
}

async function StopShareLocalMonitor()
{
    const localMonitor ={};
    const options ={};
    //Stop the local monitor share in a conference 
    const r = await vidyoConnector.SelectLocalMonitorAdvanced({localMonitor,options});
    return r;
}

const MAX_WIDTH_INTERVAL = 1920;
const MIN_WIDTH_INTERVAL = 1;
const MAX_HEIGHT_INTERVAL = 1080;
const MIN_HEIGHT_INTERVAL = 1;
async function SetBoundsConstraintsForWindow(localWindowShare, min_fps, max_fps)
{
    const r = localWindowShare.SetBoundsConstraints(max_fps, min_fps, MAX_WIDTH_INTERVAL, MIN_WIDTH_INTERVAL, MAX_HEIGHT_INTERVAL, MIN_HEIGHT_INTERVAL)
    return r;
}

function SetBoundsConstraintsForMonitor(localMonitorShare, min_fps, max_fps)
{
    const r = localMonitorShare.SetBoundsConstraints(max_fps, min_fps, MAX_WIDTH_INTERVAL, MIN_WIDTH_INTERVAL, MAX_HEIGHT_INTERVAL, MIN_HEIGHT_INTERVAL);
    return r;
}


function GetLogLevel(){
    return logLevel_
}

function getLogFilter(logLevel){
    if(logLevel == 'Debug')
    {
        return logFileFilter.debug;
    }
    else if(logLevel == 'Production')
    {
        return logFileFilter.production;
    }
    else if(logLevel == 'Advanced')
    {
        return logFileFilter.advanced;
    }
}

async function StopRealTimeLog(){
    const status =  await vidyoConnector.UnregisterLogEventListener()
}

async function GetRealTimeLog(callback ){
    if(callback){
         //todo: sdk should provide clean api for this purpose.
         const filterString = getLogFilter(GetLogLevel());
         const status =  await vidyoConnector.RegisterLogEventListener({onLog:callback, filter:filterString});
         //it does not work for 
        //no need to provide filter field
    }else{
        const status =  await vidyoConnector.UnregisterLogEventListener();
    }
  
    
}

async function SetAdvanceLogOptions(logFileFilter)
{
    const status = await vidyoConnector.SetAdvancedLogOptions({'advancedLogFilter':logFileFilter});
    if(status)
    {
        logFileFilter.advanced = logFileFilter;
        logLevel_ = 'Advanced';//save set level
    } 
    return status;
    
}

async function SetLogLevel(level){
    logLevel_ = level;//save set level
  
    const status = await vidyoConnector.SetLogLevel(level)
    return status;
}

async function RaiseHandRequest(callBackRaiseHandResponse){
    const r = await vidyoConnector.RaiseHand({
        raiseHandResponse: callBackRaiseHandResponse,
        requestId: MODERATION_REQ.RAISE_HAND_REQUEST.ID
    });
    return r;
}

async function UnraiseHandRequest(){
    let r = await vidyoConnector.UnraiseHand({requestId: MODERATION_REQ.UNRAISE_HAND_REQUEST.ID})
    return r;
}

function GetAnalyticsDataFromSDK(callback) {
    const result = vidyoConnector.GetAnalyticsData({
        onGetAnalyticsDataCallback: callback
    });
    return result;
}

 GetAnalyticsEventTableFromSDK=async(callback)=> {
    const result = await vidyoConnector.GetAnalyticsEventTable({
        onGetAnalyticsEventTableCallback: callback
    });
    return result;
}

function AnalyticsControlEventActionfromSDK(evtCategoryObj, evtActionObj, enableObj) {
    const result = vidyoConnector.AnalyticsControlEventAction({
        eventCategory: evtCategoryObj,
        eventAction: evtActionObj,
        enable: enableObj
    });

    return result;
}

AnalyticsStartFromSDK = async (service, url, id) => {
    const result = await vidyoConnector.AnalyticsStart({ serviceType: service, serverUrl: url, trackingID: id });
    return result;
}

AnalyticsStopFromSDK = async () => {
    const result = await vidyoConnector.AnalyticsStop();
    return result;
};

function StartRecording(prefix, callBack){
    vidyoConnector.StartRecording({recordingProfilePrefix: prefix,       
        onRecordingServiceStartCallback:function(response){
            callBack(Status.RECORD_START, response)
        }
    })
}

function PauseRecording(callBack){
    vidyoConnector.PauseRecording({
        onRecordingServicePauseResultCallback:function(response){
            callBack(Status.RECORD_PAUSE, response)
        }
    })
}

function ResumeRecording(callBack){
    vidyoConnector.ResumeRecording({
        onRecordingServiceResumeResultCallback:function(response){
            callBack(Status.RECORD_RESUME, response)
        }
    })
}

function StopRecording(callBack){
    vidyoConnector.StopRecording({
        onRecordingServiceStopResultCallback:function(response){
            callBack(Status.RECORD_STOP, response)
        }
    })
}


// create room api service...
const getInstantCallData = () => {
    var requestPromise = $.Deferred();
      $.ajax({
        type: 'POST',
        url: "https://vidyo-adhoc-zsdgxlqgkq-uc.a.run.app/api/v1/rooms",
        data: {"roomType": "schedule"},
        dataType: "text",
        success: function(resultData) { 
            if(resultData)
            {
                
                const jsonData = JSON.parse(resultData);
                const {pin,roomUrl,extension, inviteContent} = jsonData;
                const portalAddress = roomUrl.split("/join/")[0]
                const roomkey = roomUrl.split("/join/")[1]
                console.log(">>", jsonData)
                instantCallData.displayName = $("#startCall-displayName").val();
                instantCallData.roomKey = roomkey;
                instantCallData.portalUrl = portalAddress;
                instantCallData.roomPin = pin;
                instantCallData.extension = extension;
                instantCallData.joinLink = encodeURI(roomUrl);
                instantCallData.inviteContent = encodeURI(inviteContent);

                requestPromise.resolve();
            }
         },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            requestPromise.reject(textStatus);
         }
  });
  return requestPromise;
}

function EnableDebugSDK(){
    vidyoConnector.EnableDebug(7776,"Debug");   
}
function DisableDebugSDK(){
    vidyoConnector.DisableDebug();
}