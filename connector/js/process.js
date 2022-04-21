let lastSettingOpen = "";
let isModerationScreenVisible = false;
let registerdModerationEventListnersStatus = false;
let  {showSnackBar} = utility();

const onCallDisconnectClick = ()=>{
    DisconnectFromConference();
    clearAllOpenWindow();
    switchToLoginUI();
    conferenceMode = "";
    isModerationScreenVisible = false;
    showRendering()// to resize renderer
    //UnregisterParticipantEventListener();
    UnregisterMessageEventListener();
    clearData();
    stopShareApplicationContent();
    stopShareMonitorContent();
    unloadLobbyRoomPage();
    UnregisterModerationResultEventListener();
    isMicrophoneHardMuted =false;
    setHardMuteMicAll(false)
    mutedParticipantMics=[];
    mutedParticipantCams = [];
    currentPresenterId = "";
    isCoModerator = null;
    resetShareIcon();
    userPresetMap.clear();
    windowShared = null;
    monitorShared = null;
}

const clearAllOpenWindow =()=>{
    let utilty = utility();
    utilty.unLoadTempletWithClassName("setting-cointainer", "").then(() => {
    }
    ).catch(err => {
        console.error("close moderator failed ", err)
    });

    utilty.unLoadTempletWithClassName("right-section" , "").then(()=>{
        hideRightBlock()
        }
    ).catch(err=>{
        console.error("chat unload failed ", err)
    });

    
    
    utilty.unLoadTempletWithClassName("popup-container").then(
        () => {
    }).catch(err => {
        console.error("invite participant popup failed ", err)
    });

    $("#renderer").removeClass("right-section-open");
    $(".right-section").removeClass("right-section-open");
    $(".bottom-bar-disable").remove();
}

const onSpeakerMuteClick = ()=>{
    SetSpeakerOFF()
}

const onSpeakerUnMuteClick = ()=>{
    SetSpeakerON();
}

const onMicMuteClick = ()=>{
    SetMicMute()
}

const onMicUnmuteClick = ()=>{
    SetMicUnMute()
}

const onCamMuteClick = ()=>{
    SetLocalCameraOFF()
}

const onCamUnMuteClick = ()=>{
    SetLocalCameraON()
}

const showInCallUI = ()=>{
    switchToInCallUI();
    showRendering()// to resize renderer
    
    registerChatMessageEventListener(chatMessageReceivedCallBack);
}

const onJoinCallStatus = (status, reason)=>{

    if(status === Status.SUCCESS ){
        hideConnectingMessage();
        showInCallUI();
        GetRecordingProfile();
        hardMuteAllOnRejoin();

    }
    else if (status === Status.FAIL) {
        showCallErrorMessage(reason);
    } else if (status === Status.DISCONNECT) {
        onCallDisconnectClick();
        showCallErrorMessage(reason);
    }
    updateInstantCallUI(false);
}
participantCallBack = {
    
};

addParicipantCallBack = (callBack) => {
    participantCallBack = callBack;
}

const JoinCall = ()=>{
    
     const portal =  document.getElementById("portalAdress").value; 
     const name = document.getElementById("displayName").value; 
     const roomKey = document.getElementById("roomkey").value;
     const roomPin = document.getElementById("roompin").value;
   
     const token = "";//todo: know of this
    // ConnectToConference(portal, token, name,roomKey, onJoinCallStatus);
     ConnectToConferceAsGuest(portal, name,roomKey, roomPin,onJoinCallStatus)
     showCallErrorMessage("Connecting...");
}

const JoinCallWithId = ()=>{
    const portal =  document.getElementById("portalAdress").value
    const roomKey = document.getElementById("roomkey").value
    const user = document.getElementById("usernamevalueid").value
    const pwd = document.getElementById("pswvalueId").value
    const roomPin = document.getElementById("roompin").value;
    showCallErrorMessage("Connecting...");
    ConnectconferenceWithKey(portal, user, pwd, roomKey, roomPin,onJoinCallStatus);

}
let isHideRendering = false;
const showRendering = ()=>{
    isHideRendering = false;
    if(isModerationScreenVisible || checkIfPopupAvailable()){
        return;
    }
    if(getConfernceMode() === "LOBBY"){
        return;
    }
    offsetSelfPreviewWindowOnMac(navigator.platform.toUpperCase().indexOf('MAC')>=0);
    var rndr = document.getElementById("renderer").getBoundingClientRect();
     ResizeRendering(rndr.offsetLeft, rndr.offsetTop, rndr.offsetWidth, rndr.offsetHeight);
     ResizeRendering(parseInt(rndr.left), parseInt(rndr.top), parseInt(rndr.width), parseInt(rndr.height));
     toggleRenderingClass(true);
}

const hideRendering = () =>{
    isHideRendering = true;
    var rndr = document.getElementById("renderer");
     ResizeRendering(rndr.offsetLeft, rndr.offsetTop, 0, 0);
     toggleRenderingClass(false);
}
showRenderingAtView = (elementData)=>{
    let element  = elementData[0];
    RerenderView(element.getBoundingClientRect().left, element.getBoundingClientRect().top + 10, element.getBoundingClientRect().width, element.getBoundingClientRect().height);

}

resetPreviewWindow = (x,y,w,h) =>{
    ResizeRendering(x, y, w, h);
}
let conferenceMode = ""
const getConfernceMode = () => {
    let mode = ""
    switch (conferenceMode) {
        case "VIDYO_CONNECTORCONFERENCEMODE_GROUP":
            mode = "GROUP";
            break;
        case "VIDYO_CONNECTORCONFERENCEMODE_LECTURE":
            mode = "LECTURE";
            break;
        case "VIDYO_CONNECTORCONFERENCEMODE_LOBBY":
            mode = "LOBBY";
            break;
    }
    return mode;
}
const start = () => {
    let util = utility();
    util.loadTempletWithClassName("mainbody", "sign_call.html").then(() => {
        intilizeUIEventRegistration()
        let param = GetDefaultParam();
        param.viewerId = "renderer";
        Initialize(param, (status) => {
            
           showRendering();
            window.onresize = () => {
                if (!isHideRendering) {
                    showRendering()
                };
            }
            RegisterDeviceListner();
            registerRemoteDeviceListner();
            registerParticipantListiner(participantCallBack);
            registerConnectionPropertyListener();
            RegisterConferenceModeEventListener((modeObj)=>{
                conferenceMode = modeObj;
                renderModerationUILeftSideScreen();
                toggleLobbyMode(getConfernceMode());
                currentSelectedMode = getConfernceMode();
                UpdatePresenterEnableDisable(getConfernceMode());
                updatedModerationUiForRemoteParticipant(getConfernceMode())
            });
            RegisterModerationResultEventListener();
            RegisterLectureModeEventListener(onPresenterChangedCallBack , onHandRaiseCallBack);
            RegisterLocalWindowShareEventListener(localWindowShareCallBack);
            RegisterLocalMonitorventListener(localMonitorShareCallBack);
            registerModerationCommandEventListener();
            addDeviceCallBackToSDKAPI();
            getDefaultsFromOptions();
            
        });
    }).catch(err => console.error(err))

}

const getPresenter =()=>{
return presenter;
}

const getHandRaisedArray = () =>{
return handRaiseList;
}

let presenter = null;
let handRaiseList = null;

const onPresenterChangedCallBack =(currentSelectedPresenter , newPresenter)=>{
  present = newPresenter;
  addPresenterCheck(newPresenter);
}

const onHandRaiseCallBack = (participantObjArray)=>{
   addRaiseHand();
}

const loadSettingData =(settingName)=>{
    
    let utilty = utility();
    if(lastSettingOpen === "Audio/Video"){
        handleAudioVideoSettingCleanUp();
    }
    switch (settingName) {
        case "General":
            utilty.loadTempletWithClassName( "right-con-section", "general_setting.html").then(
                ()=>{
                    
                    GetCpuTradeOffProfile().then((value)=>{
                        setCPUProfileUI(value);
                    });
                    registerGeneralSettingsClickEvent(); // any event should be registered only after changing ui
                    SetRegisterNetworkInterfaceEvent(onNetworkInterfaceAdded, onNetworkInterfaceRemoved).then(function() {
                        
                    }).catch(function() {
                        console.error("RegisterNetworkInterfaceEventListener Failed");
                    })

                    //getAnalyticsInfo();

                    if(isInCall){
                        disableGeneralSettings();
                    }
                }
            );
            break;
        case "Audio":
            utilty.loadTempletWithClassName("right-con-section", "audioSettingPage.html")
                .then(() => {
                    if(navigator.platform.toUpperCase().indexOf('MAC')>=0){
                                $("#audioDeviceUsageMode_rbtnlist").hide();
                    }
                    addDataToAudioSettingPage();
                });
            break;
        case "Audio/Video":
            utilty.loadTempletWithClassName("right-con-section" , "audiovideosettingpage.html").then(()=>{
                
                addDataToAudioVideoSettingPage();
                registerAudioVideoSettingPageListener();
            });
            break;
        case "Logs":
            openLogSetting();
            break;
        case "Account":
            break;
    }
    lastSettingOpen = settingName;
}

const openSetting = () =>{
    hideRendering(); //hide the camera view because on camera view no html element can be render
    let utilty = utility();
    utilty.loadTempletWithClassName("setting-cointainer" , "setting_cointainer.html").then(()=>{
      //register elemnt click for setting page.
      
      loadSettingData("General");// Open the General Setting page default
      registerSettingMainPageListener();
      if(!autoReconnect){
        RegisterReconnectEventListener();
      }
    }).catch(err=>{
        console.error("setting page load failed ", err)
    });
}

const openNetworkService = () => {
    hideRendering(); //hide the camera view because on camera view no html element can be render
    let utilty = utility();
    utilty.loadTempletWithClassName("network-service-cointainer", "networkServicePage.html").then(() => {
        
        $('#network_service').attr('src','./images/icon_network_service_active.svg');  
        registerNetworkServiceListener();
    }).catch(err => {
        console.error("network service page load failed ", err);
    });
};

const closeNetworkService = () => {
    
    let utilty = utility();
    utilty.unLoadTempletWithClassName("network-service-cointainer", "").then(() => {
        $('#network_service').attr('src','./images/icon_network_service.svg');  
        showRendering();
    }).catch(err => {
        console.error("Network service close failed", err);
    });
};
/**
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
 */
sendNetworkServceRequest = (requestUrl,
    requestNumber,
    requestPayload,
    webProxyUserName,
    webProxyUserPassword,
    userAuthToken,
    userAuthUserName,
    userAuthUserPassword,
    requestMethod,
    requestContentType ,
    caFileContent,
    caFilePath) =>{
    const requestHeader = {
        requestUrl: requestUrl,
        requestNumber: requestNumber,
        requestPayload: requestPayload,
        webProxyUserName: webProxyUserName,
        webProxyUserPassword: webProxyUserPassword,
        userAuthToken: userAuthToken,
        userAuthUserName: userAuthUserName,
        userAuthUserPassword: userAuthUserPassword,
        requestMethod: requestMethod,
        requestContentType: requestContentType
    }

    let CAInfo = {};
    if(caFileContent || caFilePath){
        CAInfo.caFilePath = caFilePath;
        CAInfo.caFileContent = caFileContent;
    }

    SendNetworkServiceRequest(requestHeader , CAInfo , networkServiceResponseCallBack);
}

networkServiceResponseCallBack =(response)=>{
    const errorCode = response.errorCode;
    const httpResponseContent = response.httpResponseContent;
    const httpResponseContentSize = response.httpResponseContentSize;
    const httpResponseContentType = response.httpResponseContentType;
    const httpStatusCode = response.httpStatusCode;
    const requestNumber = response.requestNumber;
    const webProxyIPAddress = response.webProxyIPAddress;
    const webProxyIPPort = response.webProxyIPPort;
    updateNeworkRequestUI(errorCode,httpResponseContent,httpResponseContentSize,httpResponseContentType,httpStatusCode,requestNumber,webProxyIPAddress,webProxyIPPort);
}
const openFeccControl = (cameraObject, isLocalCamera) => {
    const {data:cameraControl,presetSupport} = cameraObject;
    let utilty = utility();
    utilty.loadTempletWithClassName("feccControl_id" , "feccControl.html").then(()=>{
        
        registerFECCControlClickEvent(cameraControl, isLocalCamera);
        setlocalCameraControlIcon(false)
        let title = '';
        if(isLocalCamera)
        {
            title = 'Local camera'
        }
       if (presetSupport)
       {
         addPresetToList()
       }
       else{
         hideCameraPresetUI()
       }
        setTitleCameraControl();
        setSelectedUserPreset();
    }).catch(err=>{
        console.error("FECC Control load failed ", err)
    });
}

const closeFeccControl = (isLocalCamera) =>{
    
    let utilty = utility();
    utilty.unLoadTempletWithClassName("feccControl_id" , "").then(()=>{
        if(isLocalCamera){ setlocalCameraControlIcon(true) }
        window.onresize = () => {
            if (!isHideRendering) {
                showRendering()
            };
        };
    }
    ).catch(err=>{
        console.error("close FECC Control failed ", err)
    });
}

const openBackgroundEffectsDialog = () => {
    hideRendering(); //hide the camera view because on camera view no html element can be render
    
    let utilty = utility();
    utilty.loadTempletWithClassName("bg-effects-cointainer" , "bg_effects_container.html").then(()=>{
        updateEffectTypeOnUI(selectedBackgroundEffect)
        updateBlurIntentsity(selectedBlurIntensity);
        registerBackgroundEffectsEvents();
        getEffectInfo();
    }).catch(err=>{
        console.error("background effects page load failed ", err)
    });
};

// Banuba Api from SDK
const enableBackgroundBlurEffect = async() => {
    const STATUS =await EnableBackgroundBlurEffect();
    
}

const enableVirtualBackgroundEffect = async (imagePath = null) => {
   const STATUS = await EnableVirtualBackgroundEffect(imagePath);
   
}

const setNoneEffect = async () => {
    const STATUS = await SetEffectToNone();
    
};

const setBlurIntensity = async (intensity = 5) => {
    selectedBlurIntensity = intensity;
    const STATUS = await SetBlurIntensity(intensity);
    
};

function openLocalShare()
{
    hideRendering(); //hide the camera view because on camera view no html element can be render
    let utilty = utility();
    utilty.loadTempletWithClassName("setting-cointainer" , "shareContentPage.html").then(()=>{
        
        updateLocalWindowShareList(GetLocalWindowShareList());
        loadAllApplicationShareContent();
        RegisterLocalShareEventListener();
        disableAudioShare(navigator.platform.toUpperCase().indexOf('MAC')>=0);
    }).catch(err=>{
        console.error("local Share page load failed ", err)
    });
}

function closeSharePage()
{
    
    let utilty = utility();
    utilty.unLoadTempletWithClassName("setting-cointainer" , "").then(()=>{
        showRendering();
    }
    ).catch(err=>{
        console.error("close Share Page load failed ", err)
    });
}
const changeVirtualBackgroundPicture = async(imagePath) => {
   const STATUS = await ChangeVirtualBackgroundPicture(imagePath);
   
};

const getEffectInfo = () =>{
    GetBackgroundEffectOptions((effectInfo)=>{
        updateEffectTypeOnUI(effectInfo.effectType);
        if(effectInfo.blurIntensity <= 8){
            updateBlurIntentsity(effectInfo.blurIntensity);
        }
    })
}

function onSelectNetworkSignal(event)
{
    
    let objNetworkInterface = JSON.parse(event.target.value)
    SelectNetworkInterfaceForSignaling(objNetworkInterface);
}

function onSelectNetworkMedia(event)
{
    let objNetworkInterface = JSON.parse(event.target.value);
    SelectNetworkInterfaceForMedia(objNetworkInterface)
}

function onSelectMaxReconnectAttempt(event)
{
    reconnectAttempts = event.target.value;
    SetAutoReconnectMaxAttempts(event.target.value)
}

function onSelectReconnectBackOff(event)
{
  reconnectBackOff = event.target.value;
  SetAutoReconnectAttemptBackOff(event.target.value)
}

const onCloseSetting = ()=>{
    if(isModerationScreenVisible){
        _closeModeratorUI();
    }
    let utilty = utility();
    utilty.unLoadTempletWithClassName("setting-cointainer" , "").then(()=>{
       // UnregisterReconnectEventListener();
       if(!autoReconnect){
        UnregisterReconnectEventListener();
       }
       UnRegisterLogEventListener() //unregister the log event
        showRendering();
        window.onresize = () => {
            if (!isHideRendering) {
                showRendering()
            };
        }
    }
    ).catch(err=>{
        console.error("setting page load failed ", err)
    });
}

const onCloseBackgroundEffect = () => {
    
    let utilty = utility();
    utilty.unLoadTempletWithClassName("bg-effects-cointainer", "")
        .then(() => {
            showRendering();
            window.onresize = () => {
                if (!isHideRendering) {
                    showRendering()
                };
            }
        }).catch(err => {
            console.error("background effect page load failed", err);
        });
}

const reconnectingHandler = (state , response) => { 
    updateUIonReConnecting(state,response)
}
function changeAutoReconnect(val)
{
    SetAutoReconnect(val);
}

function onSelectCpuProfile(event)
{
    SetCpuTradeOffProfile(event.target.value)
}
       

const getLocalCamerasListFromSDK = () =>{
    const cameraList = GetLocalCamerasList();
    return cameraList;
}

const getCameraCapablitiesFromSDK =()=>{
    const capabilities = GetCameraCapablities();
    return capabilities;
}

setLocalCameraCapabilitesFromSDK = (height , width) =>{
    setMaxConstraintForCamera (height , width);
}

const getLocalMicrophonesListFromSDK = () =>{
    const microphoneList = GetLocalMicrophonesList();
    return microphoneList;
}

const getVoiceProcesingStatusFromSDK =()=>{
    GetVoiceProcesingStatus();
}

const getAutoGainControlStatusFromSDK = () => {
    GetAutoGainStatus();
}

const setVoiceProcesingStatusFromSDK =async (value)=>{
    const status = await SetVoiceProcesing(value);
    if(!status){
        console.error("voice processing api return false");
    }
}

const setAutoGainControlStatusFromSDK = async(value) => {
    const status = await SetAutoGainControl(value);
    if(!status){
        console.error("set auto gain api return false");
    }
}


const getLocalSpeakersListFromSDK = () =>{
    const localSpeakerList = GetLocalSpeakersList();
    return localSpeakerList;
}

const addDeviceCallBackToSDKAPI = () => {

    AddDeviceCallBack(localDeviceCallBack);
}

localDeviceCallBack = (deviceType, status, data) => {
    localDeviceListner(deviceType, status, data);
}

const getMaxSendBitRateFromSDK = (callback)=>{
    GetMaxSendBitRate(callback);
}

const getMaxReceiveBitRateFromSDK = (callback)=>{
    GetMaxReceiveBitRate(callback);
}

const selectLocalCameraFromSDK =(cameraObj)=>{
    SelectLocalCamera(cameraObj);
}

const selectLocalMicrophoneFromSDK =(microphoneObj) =>{
    SelectLocalMicrophone(microphoneObj);
}

const selectLocalSpeakerFromSDK = (speakerObj) =>{
    SelectLocalSpeaker(speakerObj);
}

const setDisableVideoOnLowBandwidth = (enable) => {
    SetDisableVideoOnLowBandwidthSDK(enable);
}

const setDisableVideoOnLowBandwidthResponseTime = (value,callBack) => {
    SetDisableVideoOnLowBandwidthResponseTimeSDK(value).then((status) => {
        if (status) {
            callBack(value);
        }
    })
}

const setDisableVideoOnLowBandwidthSampleTime = (value,callBack) => {
    SetDisableVideoOnLowBandwidthSampleTimeSDK(value).then((status) => {
        if (status) {
            callBack(value)
        }
    })
}

const setDisableVideoOnLowBandwidthThreshold = (value,callBack) => {
    SetDisableVideoOnLowBandwidthThresholdSDK(value).then((status) => {
        if (status) {
            callBack(value);
        }
    })
}

const setDisableVideoOnLowBandwidthAudioStream = (value,callBack) => {
    SetDisableVideoOnLowBandwidthAudioStreamsSDK(value).then((status) => {
        if (status) {
            lowBandwidthThresholdAudioStream = value;
        }
    })
}

const setAudioDeviceUsageModeToShare = () => {
    SetAudioDeviceUsageModeToShareFromSDK();
};

const setAudioDeviceUsageModeToMicExclusive = () => {
    SetAudioDeviceUsageModeToMicExclusiveFromSDK();
};

const setAudioDeviceUsageModeToMicSpeakerExclusive = () => {
    SetAudioDeviceUsageModeToMicSpeakerExclusiveFromSDK();
};

const setAudioCodecPreference = (value) => {
    SetAudioCodecPreferenceFromSDK(value);
};

const setAudioPacketInterval = (value) => {
    SetAudioPacketIntervalFromSDK(value);
};

const setAudioPacketLossPercentage = (value) => {
    SetAudioPacketLossPercentageFromSDK(value);
};

const setBitrateMultiplier = (value) => {
    SetBitrateMultiplierFromSDK(value);
};

const setMaxAudioBoost = (value) => {
    SetAudioMaxBoostFromSDK(value);
};

const setWhiteListedAudioDevices = (value) => {
    SetWhitelistedAudioDevicesFromSDK(value);
};

const getConnectorOption = async() =>{
    let connectorOption = await GetConnectorOptions();
    updateConnectorOption(connectorOption);
}
const getDefaultsFromOptions = async() => {
    let connectorOption = await GetConnectorOptions();
    updateDefaultValues(connectorOption)
}


const getWhiteListDeviceList = async()=>{
    let status = await GetWhiteListDeviceListFromSDK(whiteListDeviceCallBack);
}

const whiteListDeviceCallBack =(list)=>{
    updateWhiteListDeviceListUI(list);
}

const AddAudioDeviceToWhitelist =async (deviceName)=>{
    const status = await AddAudioDeviceToWhitelistFromSDK(deviceName);
    return status;
}
const RemoveAudioDeviceFromWhitelist =async (deviceName)=>{
    const status = await RemoveAudioDeviceFromWhitelistFromSDK(deviceName);
    return status;
}

const setMaxSendBitRateFromSDK = (value) =>{
    SetMaxSendBitRate (value);
}

const setMaxReceiveBitRateFromSDK =(value)=>{
    SetMaxReceiveBitRate(value)
}

const onViewStyleChange = (style, participantCount)=>{
    SetViewLayout(style, participantCount)
}

const onStopViewShareClick = ()=>{

}

const _toggleRenderingVisiblity = (toShow)=>{
    if(toShow){
        showRendering();
    }else{
        hideRendering();
    }
}

const onSelectViewVisiblityChange = (isVisible)=>{
    /*
    this is only a work around, as ui component is not posible to renderer on video rendering screen,
    hence, video rendring made to hide to make view selection dialog box to shown to user
    */
   _toggleRenderingVisiblity(!isVisible)
}

const onMutlitpleShareSelectBoxVisibilityChange = (isVisible)=>{
      /*
    this is only a work around, as ui component is not posible to renderer on video rendering screen,
    hence, video rendring made to hide to make view selection dialog box to shown to user
    */
    _toggleRenderingVisiblity(!isVisible)
}

const _openModeratorUI = () => {

   
    //request to open moderator UI
    hideRendering(); //hide the camera view because on camera view no html element can be render
    let utilty = utility();

    utilty.loadTempletWithClassName("setting-cointainer", "moderatorUIFloating.html").then(
        () => { 
        renderModerationParticipantList();
        renderModerationUILeftSideScreen();
        updateRoomPin(isRoomPinEnabled());
        updateModerationPin(isRoomModerationPinEnabled());
        renderRecordingUI(getRecordingList());
        registerModeratorUIEvents()
        toggleBottomBarBlur(true);
        isModerationScreenVisible = true;
        updatedModerationUiForRemoteParticipant(getConfernceMode())
       // updateRecordingStatus(getRecordingState())
    });
    window.onresize = () => { };
}

const _closeModeratorUI = () => {
    let utilty = utility();
    utilty.unLoadTempletWithClassName("setting-cointainer", "").then(() => {
        isModerationScreenVisible = false;
        registerdModerationEventListnersStatus  = false;
        toggleBottomBarBlur(false)
        showRendering();
        window.onresize = () => {
            if (!isHideRendering) {
                showRendering()
            };
        }
    }
    ).catch(err => {
        console.error("close moderator failed ", err)
    });
}

const onCloseConferenceModeration = () => {
    _closeModeratorUI();
};

const onModeratorbuttonClick = (toOpen) => {
    let userSetPin = isRoomModerationPinEnabled();
    let isUserRegistered = getLocalUserClearenceType();

    if (isUserRegistered === "Guest"){

        showSnackBar("info", `You don't have access to perform moderation actions. `);
        _closeModeratorUI();
        return;
    }
    
    if(isUserRegistered === "Member" && userSetPin) {
        
        if(isCoModerator){
            _openModeratorUI();
        }
        else{
            loadModeratorPinModal();
        }
    } else {
        if (toOpen) {
            //todo: check here pin entry for moderation.
            RequestConfernceModeration("").then((status)=>{
                if(status === "VIDYO_CONNECTORMODERATIONRESULT_OK"){
                    _openModeratorUI();
                }
            })
            if(!registerdModerationEventListnersStatus){ /// this is to prevent re-registering <RegisterModerationResultEventListener>
                RegisterModerationResultEventListener();
            }
        } else {
            _closeModeratorUI()
        }
    }
}

const onSubmitModeratorPin = (pin) => {
    if(pin !== "") {
        RequestConfernceModeration(pin).then((status) => {
            if(status === "VIDYO_CONNECTORMODERATIONRESULT_OK"){
                onHideValidationPinMsg();
                unloadModeratorPinModal();
                _openModeratorUI();
                isCoModerator = true;
            } else {
                onDisplayValidationPinMsg();
                isCoModerator = false;
            }
        }, (err) => {
            console.error("moderator pin was rejected.", err)
        }).catch(err => {
            console.error("moderator pin could not be submitted. ", err);
        });
    } else {
        _closeModeratorUI()
       
    }
};

loadModeratorPinModal = () => {
    hideRendering(); //hide the camera view because on camera view no html element can be render
    let utilty = utility();
    utilty.loadTempletWithClassName("moderator-pin-container", "moderatorPinModal.html").then(() => {
        registerModeratorPinModalEvents();
    }
    ).catch(err => {
        console.error("close moderator failed ", err)
    });
};

unloadModeratorPinModal = () => {
    hideRendering(); //hide the camera view because on camera view no html element can be render
    let utilty = utility();
    utilty.unLoadTempletWithClassName("moderator-pin-container" , "").then(() => {
        _openModeratorUI();
    } ).catch(err => {
        console.error("moderatorn pin modal unload failed ", err)
    });
};

const onCancelModeratorPin = () => {
    let utilty = utility();
    utilty.unLoadTempletWithClassName("moderator-pin-container" , "").then(() => {
        showRendering();
    } ).catch(err => {
        console.error("moderatorn pin modal unload failed ", err)
    });
};
renderModerationUILeftSideScreen =()=>{
    const roomLockStatus = getRoomLockStatus() ? "lock" : "unlock"
    updateRoomLockUnlockStatus(roomLockStatus);
    //updateRoomPin(isRoomPinEnabled());
   // updateModerationPin(isRoomModerationPinEnabled());
    updateConfrenceName(getRoomName());
    updateConfrenceMode(getConfernceMode());
    let recordingStatus = "";
    switch (getVCRecordingState()) {
      case "VIDYO_CONNECTORRECORDINGSTATE_NotRecording":
        recordingStatus = Status.RECORD_STOP;
        break;
      case "VIDYO_CONNECTORRECORDINGSTATE_RecordingPaused":
          recordingStatus = Status.RECORD_PAUSE;
        break;
      case "VIDYO_CONNECTORRECORDINGSTATE_Recording":
        recordingStatus = Status.RECORD_START;
        break;
    }

    updateRecordingStatus(recordingStatus);
}

let currentSelectedMode = "";
loadLobbyRoomPage = () => {
    hideRendering(); //hide the camera view because on camera view no html element can be render
    currentSelectedMode = getConfernceMode();
    let util = utility();
    util.loadTempletWithClassName("lobby-mode-cointainer", "lobbyroom-container.html").then(()=>{
        updateLobbyPageUI(getRoomName(), GetLocalUserName());
    });
}

unloadLobbyRoomPage = () => {
     if ( currentSelectedMode === "LOBBY" ) {
        showRendering();
        let util = utility();
        util.unLoadTempletWithClassName("lobby-mode-cointainer");
     }
}

const toggleLobbyMode = (mode) => {
    mode === "LOBBY" ? loadLobbyRoomPage() : unloadLobbyRoomPage();
};

const onPresenterModeSelect = (start)=>{    
    StartLectureMode(start).then(()=>{
        updateConfrenceMode(getConfernceMode());
    });
}

const onRoomLockUnlockSelect = (lock)=>{
    lock ? LockRoom(lockRoomCallBack) : UnLockRoom(unLockRoomCallBack)
}

const checkForAdminOrHost = () => {
    return  getLocalUserClearenceType().toString() === "Host";
}

const checkForAdminOrHostModeration = () => {
    return  getLocalUserClearenceType().toString() === "Host" ||  getLocalUserClearenceType().toString() === "Administrator";
}

const getRoomPinRequirementsSDK=()=>{
    return roomPinRequirementSDK()
}
const validateRoomPinByPortal = (pin)=>{

    const {minRoomPin:min, maxRoomPin:max} = getRoomPinRequirementsSDK();
    return (pin.length>=min && pin.length<=max)
}
const setRoomPin =(pin)=>{
    const utils = utility();
    if(!checkForAdminOrHost()){
        utils.showModalBox("Access Denied","You can't update room pin settings.");
        return;
    }
    if(pin === ""){
        utils.showModalBox("Required Pin","Please enter a 4 digit pin.");
        return;
    }

    utils.showModalBox("Please wait","We're setting a Room PIN.");
    $(".modal-cta > button").hide();
    SetRoomPin(pin,setRoomPinCallBack);

}

const removeRoomPin =()=>{
    const utils = utility();
    if(!checkForAdminOrHost()){
        utils.showModalBox("Access Denied","You can't update room pin settings.");
        return;
    }
    utils.showModalBox("Please wait","We're removing the Room PIN.");
    $(".modal-cta > button").hide();
    RemoveRoomPin(removeRoomPinCallBack);

}

const setModerationPin= (pin)=>{
    const utils = utility();
    if(!checkForAdminOrHostModeration()){
        utils.showModalBox("Access Denied","You can't update moderation pin settings.");
        return;
    }
    if(pin === ""){
        utils.showModalBox("Required Pin","Please enter a 4 digit pin.");
        return;
    }

    utils.showModalBox("Please wait","We're setting a moderation PIN.");
    $(".modal-cta > button").hide();
    SetModeratorPin(pin).then(()=>{
        updateModerationPin(isRoomModerationPinEnabled());
    }).catch((e)=>{
        utils.showModalBox("Oops","Something went wrong.");
        $(".modal-cta > button").show();
    })
}

const removeModeratorPin =()=>{
    const utils = utility();
    if(!checkForAdminOrHostModeration()){
        utils.showModalBox("Access Denied","You can't update moderation pin settings.");
        return;
    }

    utils.showModalBox("Please wait","We're removing the moderation PIN");
    $(".modal-cta > button").hide();
     RemoveModeratorPin().then(()=>{
        updateModerationPin(isRoomModerationPinEnabled());
    }).catch((e)=>{
        utils.showModalBox("Oops","Something went wrong.");
        $(".modal-cta > button").show();
    });
}

const setRoomPinCallBack=(resultObj)=>{
    
    updateRoomPin(isRoomPinEnabled());
}

const removeRoomPinCallBack=(resultObj)=>{
    
    updateRoomPin(isRoomPinEnabled());
}

const lockRoomCallBack = (resultObject) => {
    //User can perform any operation after recieveing room  lock callback
    
}

const unLockRoomCallBack = (resultObject) => {
    //User can perform any operation after recieveing room un lock callback
    
}

const onClickDropAllParticipants = () => {
    DropAllParticipants()
}

const onClickSoftAudioMuteAll = () => {
    SoftAudioMuteAllParticipants();
}

const onClickSoftVideoMuteAll = () => {
    SoftVideoMuteAllParticipants();
}

const onClickUnraiseAllHand = ()=>{
    UnRaiseAllParticipantsHands()
}

const onClickHardMuteMicAll = ()=>{
    HardMuteMicAllParticipants(true);
}

const onClickHardUnmuteMicAll = ()=>{
    HardMuteMicAllParticipants(false)
}

const onClickHardMuteCamAll = ()=>{
    HardVideoMuteAllParticipants(true)
}

const onClickHardUnmuteCamAll = ()=>{
    HardVideoMuteAllParticipants(false)
}

// moderation particpant list method
const onClickDropParticipant = (id) => {
    DropParticipant("",id)
}

const onClickSoftAudioMute = (id) => {
    SoftAudioMuteParticipant(id);
}

const onClickSoftVideoMute = (id) => {
    SoftVideoMuteParticipant(id);
}


const onClickHardMuteMic = async (id)=>{
    return HardMuteMicParticipant(true ,id)
}

const onClickHardUnmuteMic = async (id)=>{
    return  HardMuteMicParticipant(false ,id)
}

const onClickHardMuteCam = async (id)=>{
    return HardVideoMuteParticipant(true,id);
}

const onClickHardUnmuteCam = (id)=>{
    return HardVideoMuteParticipant(false,id)
}

const localDeviceModerationEvent = async (callBackEvent) => {
    return new Promise(async (resolve,reject)=>{
        if(isModerationAllowed()){
            RegisterModerationResultEventListener();
            registerdModerationEventListnersStatus = true;
            await callBackEvent(getLocalUserID());
            resolve();
        }
        else{
            reject("Moderation not allowed");
        }
    })
}
const onSetPresenterClick = (id)=>{
    SetPresenter(id);
}
////////////////////////////////////

const addRemoteDeviceCallBackToSDK = (callBack) =>{
    addRemoteDeviceCallBack(callBack);
}

const getParticipantList =()=>{
    return GetParticipantListFromSDK();
}

const getParticipantName = (participantObject , cb)=>{
    if (!participantObject) {
        cb("Undefined");
        return;
    }

    if (participantObject.name) {
        cb(participantObject.name);
        return;
    }

    GetParticpiantNameFromSDK(participantObject,cb)
}

pinParticipant = (id) =>{
    PinParticpantFromSDK(id, pinParticipantUIUpdate);
}

const getParticipantCount=()=>{
    return GetParticipantCountFromSDK();
    
}

const onClosePrivateChat = () => {
    onLoadChat();
} 

const onLoadChat = () => {
    if(openningModeratorUI){
        return;
    }
    let util = utility();
    util.loadTempletWithClassName( "right-section", "chatParticipant.html").then(
        ()=>{
            $("#renderer").addClass("right-section-open");
            $(".right-section").addClass("right-section-open");
            showRightBlock();
            showRendering();
            //remove active class in participant icon
            $('#participant_id').parent().removeClass('active');
            $('#participant_id').attr('src','./images/icon_participants.svg'); 
            if($(".setting-container").html() !== ""){
                $(".moderator-popup-close").trigger("click");
            }
            //add active class in chat icon
            $('#chat_id').parent().addClass('active');
            $('#chat_id').attr('src','./images/icon_chat_active.svg'); 
            $(".close_feccControl").trigger("click")
            registerChatClickEvent();
            chatWindowPage = 'PARTICIPANT_CHAT';
            updateChatUI();
            updateMessageCount();
        }
    );
}

const onOpenGroupChat = () => {
    let util = utility();
    util.loadTempletWithClassName( "right-section", "groupChatWindow.html").then(
        ()=>{
            showRightBlock()
            showRendering()// to resize renderer
            registerGroupChatClickEvent();
            chatWindowPage = 'GROUP_CHAT';
            chatData.chat.group.messageCount = 0;
            updateChatUI()
        }
    );
}

const onCloseChat = () =>{
    let utilty = utility();
    utilty.unLoadTempletWithClassName("right-section" , "").then(()=>{
        hideRightBlock()
         //remove participants active
         $('#participant_id').parent().removeClass('active');
         $('#participant_id').attr('src','./images/icon_participants.svg'); 

         
        //remove chat active
        $('#chat_id').parent().removeClass('active');
        $('#chat_id').attr('src','./images/icon_chat.svg'); 

        showRendering()// to resize renderer
        }
    ).catch(err=>{
        console.error("chat unload failed ", err)
    });
}

const SendPrivateMessage = (participantId, msgTxt) => {
    
    if(msgTxt!='')
    {   
        let objParticipant = chatParticipants.get(participantId);
        SendPrivateChatMessage(objParticipant, msgTxt).then(()=>{

            let message = {"body": msgTxt, "timestamp": currentTime(), "senderType": ''};
            if(!chatData.chat.private.messages[participantId])
            {
                chatData.chat.private.messages[participantId] = new Array();
            }
            chatData.chat.private.messages[participantId].push(message);
            updateChatUI();
            clearChatInput();
        });
    }
}

const SendGroupMessage = (msgTxt) => {
    if(msgTxt!='')
    {   
        SendGroupChatMessage(msgTxt).then(()=>{
            let message = {"body": msgTxt, "timestamp": currentTime(), "senderType": ''};
            chatData.chat.group.messages.push(message);
            updateChatUI();
            clearChatInput();
        });
    }
}

const onSelectParticipant = (participantId) =>{
    let util = utility();
    util.loadTempletWithClassName( "right-section", "chatWindow.html").then(
        ()=>{
            let username = chatParticipants.get(participantId).name;
            updatePrivateChatContain(username);
            enableChat();
            $('#participantId').val(participantId);
            showRightBlock();
            showRendering()// to resize renderer
            registerPrivateChatClickEvent(); // any event should be registered only after changing ui
            chatWindowPage = 'PRIVATE_CHAT';
            if(chatData.chat.private.messageCount[participantId])
            { 
                chatData.chat.private.messageCount[participantId] = 0; 
            }
            updateChatUI();
        })
}
const changeLogLevel = (level)=>{
    const sel =  document.getElementById( "logLevelSelect");
    let index = 0;
    if (level === "Debug"){
        index = 1;
    }else if(level === "Advanced"){
        index = 2;
    }
    sel.selectedIndex = index;
}


const openLogSetting = (logLevelToSet = '')=>{
    let util = utility();
    util.loadTempletWithClassName( "right-con-section", "log_setting.html").then(
        ()=>{
            changeLogLevel(logLevelToSet);
            registerLogSettingclickEvent(); // any event should be registered only after changing ui
        }
    );
   
}
//todo: title will be used in future to chhange title of text box.
const showTextPop = (title)=>{
    
    let util = utility();
    util.loadTempletWithClassName( "right-con-section", "text_popup.html").then(
        ()=>{
          registerForTextPopupButtonClick( (textValue)=>{
              openLogSetting("Advanced");
              SetAdvanceLogOptions(textValue)
          }, ()=>{
                openLogSetting(); //to old level
          });
        }
    );
}

function closeInvitePopup() {
  let utilty = utility();

  utilty
    .unLoadTempletWithClassName("popup-container")
    .then(() => {

    })
    .catch((err) => {
      console.error("invite participant popup failed ", err);
    });
}

function onClickAddParicipant()
{
    let utilty = utility();
    utilty.loadTempletWithClassName("popup-container", "inviteParticipantPopup.html").then(
        () => { 
        registerInviteParticipantPopupUIEvents()
    });
   
}

approveRaisedHand = (selectedParticipantId) => {
    ApproveRaisedHandFromSDK(selectedParticipantId);
}

dismissRaisedHand = (selectedParticipantId) => {
    DismissRaisedHandFromSDK(selectedParticipantId)
}

function currentTime()
{
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ampm;
}

updateChatUI = () =>{
    if(chatWindowPage === 'PARTICIPANT_CHAT')
    {
        renderParticiapant();
        updateMessageCount();
    }
    else if(chatWindowPage === 'PRIVATE_CHAT')
    {
        updatePrivateChatMessagesWindow();
        updatePrivateChatStatus();
    }
    else if(chatWindowPage === 'GROUP_CHAT')
    {
        updateGroupChatMessagesWindow();
        updateGroupChatText();
    }
}

chatMessageReceivedCallBack = (status, VidyoChatMessageObj) =>{
    if(status == Status.SUCCESS)
    {
        let msg = '';
        switch(VidyoChatMessageObj.type)
        {
            case 'VIDYO_CHATMESSAGETYPE_PrivateChat':
                let id = VidyoChatMessageObj.userId;
                msg = VidyoChatMessageObj;
                msg.timestamp = currentTime();
                if(!chatData.chat.private.messages[id])
                {
                    chatData.chat.private.messages[id] = new Array();
                    chatData.chat.private.messageCount[id] = 0;
                }
                chatData.chat.private.messages[id].push(msg);
                chatData.chat.private.messageCount[id] = isChatWindowOpen() ? 0 : chatData.chat.private.messageCount[id] + 1;
                showSnackBar("chat","New message in chat")
            break;
            case 'VIDYO_CHATMESSAGETYPE_Chat':
                msg= VidyoChatMessageObj;
                msg.timestamp = currentTime();
                chatData.chat.group.messages.push(msg);
                chatData.chat.group.messageCount =  isChatWindowOpen() ? 0 : chatData.chat.group.messageCount + 1;
                showSnackBar("chat","New message in group chat")
            break;
           default:
        }
        updateChatUI();
    }

}

function getNameFirstChar(text)
{
    text = text.toUpperCase();
    let textArr = text.split(" ");
    if(textArr.length > 1)
    {
       return textArr[0].substr(0,1) + textArr[1].substr(0,1);
    }
    else
    {
        return textArr[0].substr(0,1);
    }
}

function clearData()
{
    chatParticipants.clear();
    chatData  = {
        chat: {
            'private':{
                'messageCount':[],
                'messages':[]
            },
            'group':{ 
                'messages':[],
                'messageCount':0
            }
        }
    };
}
 function registerConnectionPropertyListener(){
    RegisterConnectionPropertyListenerFromSDK(onConnectionPropertiesChangedCallBack)
 }

 function onConnectionPropertiesChangedCallBack(VidyoConnectorConnectionPropertiesObj){
  //todo this function will use when we will implement pin window for moderation
     renderModerationUILeftSideScreen();
 }

let contactsObjList = new Array();
const MAX_RECORD_SEARCH = 18;
userSearchResultCallback = (searchTextObj, startIndexObj, searchResultObj, contactsObj, numRecordsObj) =>{
    if(searchResultObj == 'VIDYO_CONNECTORSEARCHRESULT_Ok')
    {
        if(startIndexObj == 0)
        {
            contactsObjList = contactsObj;
        }
        else{
            contactsObjList = [...contactsObjList, ...contactsObj];
        }
        
        if(contactsObjList.length < numRecordsObj)
        {
            setTimeout(()=> { SearchUsers(searchTextObj, contactsObjList.length-1, MAX_RECORD_SEARCH, userSearchResultCallback) },1000);
        }
        else{
            renderUserSearchResult(contactsObjList);
        }
    }
}

searchUserDetails = (searchText) => {
    contactsObjList = [];
    SearchUsers(searchText, 0, MAX_RECORD_SEARCH, userSearchResultCallback) 

}

inviteResultCallBack = (inviteeIdObj,resultObj) => {
    switch(resultObj)
    {
        case 'VIDYO_CONNECTORMODERATIONRESULT_UserIsOffline':
            //todo: Requested user is offline
        break;
        case 'VIDYO_CONNECTORMODERATIONRESULT_MiscRemoteError':
            //todo: The server is rejecting the request due to some miscellaneous problem of its own
        break;
        case 'VIDYO_CONNECTORMODERATIONRESULT_Unauthorized':
            //todo: The user did not have permission for request
        break;
        case 'VIDYO_CONNECTORMODERATIONRESULT_OK':
            addInviteList(inviteeIdObj);
        break;
        default:
    }
}

sendInvite = (contactsObj, message, inviteResultCallBack) =>{
   InviteParticipant( contactsObj, message, inviteResultCallBack);
}

const onLogLevelChange = async (value)=>{
    const level = value;
    if(!level){
        alert("invalid case log select option is null")
        return;
    }
    if(level === "Advanced"){
        showTextPop();
    }
}

const onApplyLogLevel = async (value)=>{
    const v =  value;
    if(!v){
        alert("invalid case log select option is null")
        return;
    }
    if("Production" === v || "Debug" === v)
    {
        const r = await SetLogLevel(v)
    }else if("Advanced" === v)
    {
     
       
    } else{
    }

}

const displyaLogEvents = async (filterKeys,renderMethod) => { 
    await RegisterLogEventListener(renderMethod,filterKeys)
}

getLocalCamera = () =>{
    return GetCurrentLocalCamera(); 
}

localDeviceStatusCallBack =(deviceType, status, localDevice) =>{
    if(deviceType == DEVICE_TYPE.CAMERA)
    {
    }

}

getRemoteCamera = (participantID) => {
    let participantList = GetParticipantListFromSDK();
    return participantList[participantID].camera.data;
}

moveCamera = (camera,  direction, isLocalCamera) =>{

    const controlFunc = isLocalCamera?LocalCameraControlPTZ:RemoteCameraControlPTZNudge;

    switch(direction)
    {
        case 'LEFT':
            controlFunc(camera, -1, 0, 0).then(function(result){
               
            }).catch(function(result){
                console.error('Error Camera Move left',result)
            });
        break;
        case 'RIGHT':
            controlFunc(camera, 1, 0, 0).then(function(result){
               
            }).catch(function(result){
                console.error('Error Camera Move right',result)
            });
        break;
        case 'UP':
            controlFunc(camera, 0, 1, 0).then(function(result){
                
            }).catch(function(result){
                console.error('Error Camera Move up',result)
            });
          
        break;
        case 'DOWN':
            controlFunc(camera, 0, -1, 0).then(function(result){
      
            }).catch(function(result){
                console.error('Error Camera Move down',result)
            });
        break;
        case 'ZOOM_IN':
            controlFunc(camera, 0, 0, 1).then(function(result){
               
            }).catch(function(result){
                console.error('Error Camera Move ZOOM_IN',result)
            });
        break;
        case 'ZOOM_OUT':
            controlFunc(camera, 0, 0, -1).then(function(result){
    
            }).catch(function(result){
                console.error('Error Camera Move ZOOM_OUT',result)
            });
        break;
    }
}

activateRemoteCameraPreset =(remoteCam,presetIndex)=>{
    RemoteCameraActivatePreset(remoteCam,presetIndex).then(function(r){
        console.log("ActivatePreset > success" , r)
    }).catch(function(){
        console.error("ActivatePreset > fail")
    })
}

callBackLocalWindowIcon = (objId, response) => {
    updateLocalWindowIcon(objId, response)
}

localWindowShareCallBack = (status, objData) =>
{
    switch(status)
    {
        case Status.ADD:
        case Status.REMOVE:
           updateLocalWindowShareList(GetLocalWindowShareList());
        break;
        case Status.LWS_PREVIEW_IMAGE:
            updateLocalWindowPreviewIconImage(objData.objId, objData.previewIcon, objData.applicationName, objData.name, objData.sharePreviewState);
        break;

    }
}

localMonitorShareCallBack = (status, objData) => 
{
    switch(status)
    {
        case Status.LWS_PREVIEW_IMAGE:
            updateLocalMonitorPreviewIconImage(objData.objId, objData.previewIcon, objData.sharePreviewState);
        break;

    }
}

function getFirstElementOfApplication(objItem)
{
    const key = Object.keys(objItem)[0]
    return objItem[key];
}

async function updateWindowShareIcon(objItem, width, height) {
    let firstItem =getFirstElementOfApplication(objItem);
    GetApplicationIconForSharedApplication(firstItem, width, height, callBackLocalWindowIcon);
}

async function localWindowShareSelected(applicationName, width, height)
{
    let localWindowShareList = GetLocalWindowShareList();
    for(let objId in localWindowShareList[applicationName])
    {
        GetSharePreviewIconForWindow(localWindowShareList[applicationName][objId], width, height, localWindowShareCallBack);
    }
}

async function localMonitorShareSelected(localMonitorShare, width, height)
{
    GetSharePreviewIconForMonitor(localMonitorShare, width, height, localMonitorShareCallBack)
}
const getMinBoundConstraint = (isHighFrameRate) => {
    return (isHighFrameRate ? 33333333 : 333333333);
}
const getMaxBoundConstraint = (isHighFrameRate) => {
    return (isHighFrameRate ? 333333333 : 1000000000);
}

function shareApplicationContent(applicationName, objId, contentShareOptions)
{
    let localShareWindowListArr = GetLocalWindowShareList();
    const {enableHighFramerate} = contentShareOptions;
    SetBoundsConstraintsForWindow(localShareWindowListArr[applicationName][objId], 
        getMinBoundConstraint(enableHighFramerate), 
        getMaxBoundConstraint(enableHighFramerate));
    ShareLocalWindow(localShareWindowListArr[applicationName][objId], contentShareOptions).then(function(response){
        if(response) { shareDoneUI(objId); }
       
    }).catch(function(response){
        console.error('Applcation share content failed ',response)
    })
}

function shareMonitorContent(objId,  contentShareOptions)
{
    const {enableHighFramerate} = contentShareOptions;
    let localShareMonitorListArr = GetLocalMonitorShareList();
    SetBoundsConstraintsForMonitor(localShareMonitorListArr[objId], 
        getMinBoundConstraint(enableHighFramerate), 
        getMaxBoundConstraint(enableHighFramerate));
    ShareLocalMonitor(localShareMonitorListArr[objId] ,contentShareOptions).then(function(response){
        if(response) { shareDoneUI(objId); }
        
    }).catch(function(response){
        console.error('Monitior share failed ',response)
    })
}
const stopLocalShare = (stopMethod) => {
    stopMethod().then(function(response){
        if(response) { StopShareUI(); }
    }).catch(function(response){
        console.error('Stop  share content failed ',response)
    });
}

function stopShareApplicationContent()
{
    stopLocalShare(StopShareLocalWindow)
}

function stopShareMonitorContent()
{
    stopLocalShare(StopShareLocalMonitor)
}
const callBackRaiseHandResponse = (response) =>{
    raiseHandIconToggle(false)
    switch(response)
    {
        case 'VIDYO_PARTICIPANTHANDSTATE_APPROVED':
        showSnackBar("info", `Hand raise approved, you can unmute.`);
        break;
        case 'VIDYO_PARTICIPANTHANDSTATE_DISMISSED':
        showSnackBar("info", `Moderator has lowered you hand for now.`);
        break;
    }
}

raiseHandRequestHandler = (resultObj, actionObj) =>{
    if(resultObj !== 'VIDYO_CONNECTORMODERATIONRESULT_OK') return;
    switch(actionObj)
    {
        case 'VIDYO_CONNECTORMODERATIONACTIONTYPE_RaiseHand':
            toggleRaiseHandUI(true)
        break;
        case 'VIDYO_CONNECTORMODERATIONACTIONTYPE_UnraiseHand':
            toggleRaiseHandUI(false)
        break;
        default:
            console.error('Action - ',actionObj)
    }

}

const onRaiseHandClick = async () =>{
    RaiseHandRequest(callBackRaiseHandResponse);
}

const onUnraiseHandClick = async () => {
    UnraiseHandRequest();
}
function isLocalCameraControlAllowed()
{
    const res = GetCameraControlCapablities();
    let capablities = res.capabilities;
    return (capablities.panTiltHasNudge && capablities.zoomHasNudge)
}

function isRemoteCamControlAllowed(cameraCapabilities) {
    return ((cameraCapabilities.panTiltHasNudge && cameraCapabilities.zoomHasNudge ) || cameraCapabilities.hasPresetSupport);
}

function isRemoteCamSupportPresets(cameraCapabilities) {
    return (cameraCapabilities.hasPresetSupport);
}

getParticipantCameraStatus = (particpant) => {
    if (participantList[participant].camera) {
        return true;
    } else {
        return false;
    }
}

getParticipantMicroPhoneStatus =(particpant)=>{
    const microphoneStatus = particpant.microphone.state ? particpant.microphone.state :false;
    return microphoneStatus;
}

isLocaUser =(particpantId)=>{
    return particpantId === getLocalUserID();
}

registerModerationCommandEventListener =()=>{
    RegisterModerationCommandEventListenerSDK(moderationCommandListenerCallBack)
}
let isCameraHardMuted = false;
let isMicrophoneHardMuted = false;
moderationCommandListenerCallBack = (deviceType, moderationType, state) => {
  const label = !state ? "enabled" : "disabled";
  if (
    deviceType === "VIDYO_DEVICETYPE_LocalCamera" &&
    moderationType === "VIDYO_ROOMMODERATIONTYPE_HardMute"
  ) {
    isCameraHardMuted = state;
    if (getConfernceMode() === "GROUP" ){
        showSnackBar("info", `Camera is ${label} by moderator`);
    }
    
  } else if (
    deviceType === "VIDYO_DEVICETYPE_LocalMicrophone" &&
    moderationType === "VIDYO_ROOMMODERATIONTYPE_HardMute"
  ) {
    isMicrophoneHardMuted = state;
    if(getConfernceMode() === "GROUP"){
        showSnackBar("info", `Microphone is ${label} by moderator`);
    }
  }
};

getMicHardMuteStatus = () =>{
    return isMicrophoneHardMuted;
}

getCamHardMuteStatus =()=>{
    return isCameraHardMuted;
}

// Analytics processes
const loadAnalyticsConfiguration = (analyticsServiceProvider) => {
    let utilty = utility();

    utilty.unLoadTempletWithClassName("right-con-section", "general_setting.html").then(() => {
    
    }).catch(err => {
        console.error("Analytics configuration page load failed ", err);
    });

    utilty.loadTempletWithClassName("right-con-section", "analytics_configuration.html").then(() => {
        if(analyticsServiceProvider === "VIDYO_CONNECTORANALYTICSSERVICETYPE_Google"){
            onGetAnalyticsEventTable();
        }
        loadConfigView(analyticsServiceProvider)
        registerAnalyticsConfigurationEvents(analyticsServiceProvider);

    }).catch(err => {
        console.error("Analytics configuration page load failed ", err);
    });
};

const onBackToSetting = () => {
    let utilty = utility();

    utilty.unLoadTempletWithClassName("right-con-section", "analytics_configuration.html").then(() => {
   
    }).catch(err => {
        console.error("setting page load failed ", err);
    });

    utilty.loadTempletWithClassName("right-con-section", "general_setting.html").then(() => {
        registerGeneralSettingsClickEvent();
    
    }).catch(err => {
        console.error("setting page load failed ", err);
    });
    loadSettingData("General");
};

const getAnalyticsInfo = async () => {
    let status = await GetAnalyticsDataFromSDK(analyticsDataRecieveCallBack);
};

let analyticsServiceType = "VIDYO_CONNECTORANALYTICSSERVICETYPE_None";
let analyticsServerURL = "";
let analyticsTrackingID = "";
const analyticsDataRecieveCallBack = (serviceType, serverUrl, trackingID) => {
    analyticsServiceType = serviceType;
    analyticsServerURL = serverUrl;
    analyticsTrackingID = serviceType === "VIDYO_CONNECTORANALYTICSSERVICETYPE_VidyoInsights"? "": trackingID;
    //updateAnalyticsTypeOnUI(analyticsServiceType,analyticsServerURL,analyticsTrackingID);
}

const onGetAnalyticsEventTable = async () => {
    let status = await GetAnalyticsEventTableFromSDK(analyaticsEventCallBack);
};

const analyaticsEventCallBack = (eventAction) =>{
   const alayticsEventsData =  eventAction.map(item=>{
        const {enable,eventAction,eventCategory} = item;
        return {
            enable,
            eventAction,
            eventCategory,
            categoryName:processEventCategoryName(eventCategory),
            actionName:processActionName(eventAction)
        }
    })
    addAnalyticsEventsOnUI(alayticsEventsData);
}

const processEventCategoryName = (categoryName) => {
    let category = "";
    switch (categoryName) {
        case "VIDYO_CONNECTORANALYTICSEVENTCATEGORY_Login":
            category = "Login";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTCATEGORY_UserType":
            category = "User type";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTCATEGORY_JoinConference":
            category = "Join conference";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTCATEGORY_ConferenceEnd":
            category = "Conference end";
            break;
            case "VIDYO_CONNECTORANALYTICSEVENTCATEGORY_InCallCodec":
                category = "InCall Codec";
                break;
    }
    return category;
}


const processActionName = (actionName) => {
    let action = "";
    switch (actionName) {
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginSuccess":
            action = "Login sucess";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginAttempt":
            action = "Login attempt";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedAuthentication":
            action = "login authentication failed";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedConnect":
            action = "Login connection failed";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginSuccess":
            action = "Login sucess";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginAttempt":
            action = "Login attempt";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedAuthentication":
            action = "login authentication failed";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedConnect":
            action = "Login connection failed";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginSuccess":
            action = "Login sucess";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginAttempt":
            action = "Login attempt";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedAuthentication":
            action = "login authentication failed";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedConnect":
            action = "Login connection failed";
            break;

        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedResponseTimeout":
            action = "Login failed response timeout";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_LoginFailedUnsupportedTenantVersion":
            action = "Login failed unsupported tenant version";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_UserTypeGuest":
            action = "User type guest";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_UserTypeRegularToken":
            action = "User type regular token";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_UserTypeRegularPassword":
            action = "User type regular password";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_UserTypeRegularSaml":
            action = "User type regular saml";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_UserTypeRegularExtdata":
            action = "User type regular extData";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceSuccess":
            action = "Join Conference Success";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceAttempt":
            action = "Join Conference Attempt";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceReconnectRequests":
            action = "Join Conference Reconnect Requests";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceFailedConnectionError":
            action = "Join Conference Failed Connection Error";
            break;

        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceFailedWrongPin":
            action = "Join Conference Failed Wrong Pin";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceFailedRoomFull":
            action = "Join Conference Failed Room Full";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceFailedRoomDisabled":
            action = "Join Conference Failed Room Disabled";
            break;

        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceFailedConferenceLocked":
            action = "Join Conference Failed Conference Locked";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_JoinConferenceFailedUnknownError":
            action = "Join Conference Failed Unknown Error";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_ConferenceEndLeft":
            action = "Conference End Left";
            break;

        case "VIDYO_CONNECTORANALYTICSEVENTACTION_ConferenceEndBooted":
            action = "Conference End Booted";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_ConferenceEndSignalingConnectionLost":
            action = "Conference End Signaling Connection Lost";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_ConferenceEndMediaConnectionLost":
            action = "Conference End Media Connection Lost";
            break;

        case "VIDYO_CONNECTORANALYTICSEVENTACTION_ConferenceEndUnknownError":
            action = "Conference End Unknown Error";
            break;

        case "VIDYO_CONNECTORANALYTICSEVENTACTION_InCallCodecVideoH264":
            action = "In Call Codec Video H264";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_InCallCodecVideoH264SVC":
            action = "In Call Codec Video H264 SVC";
            break;
        case "VIDYO_CONNECTORANALYTICSEVENTACTION_InCallCodecAudioSPEEXRED":
            action = "In Call Codec Audio SPEEX RED";
            break;
    }
    return action;
}

const onSendTrackingID = async () => {
    let trackingId = document.getElementById("analytics-service-tracking-id").value;
    
};

const onCancelTrackingID = async () => {
    let trackingId = "";
    getUpdatedTrackingIDInfo(trackingId);
};
 

const onSelectAnalyticsService = async (serviceType,vidyoInsightUrl,googleTrackingId) => {
    return new Promise(async (resolve,reject)=>{
        if(analyticsServiceType !== "VIDYO_CONNECTORANALYTICSSERVICETYPE_None"){
           await  AnalyticsStopFromSDK("VIDYO_CONNECTORANALYTICSSERVICETYPE_None");
        }
        await AnalyticsStartFromSDK(serviceType,vidyoInsightUrl,googleTrackingId);
        const isAnalyticsSet =  await GetAnalyticsDataFromSDK(analyticsDataRecieveCallBack);
        if(isAnalyticsSet){
            resolve();
        }
        else{
            reject();
        }
    })

};

const onDeselectAnalyticsService = async () => {
    return new Promise(async (resolve,reject)=>{
        await AnalyticsStopFromSDK("VIDYO_CONNECTORANALYTICSSERVICETYPE_None");
        await GetAnalyticsDataFromSDK(analyticsDataRecieveCallBack);
        resolve();
    })
};

const onToggleAction = (category,action,state) => {
    AnalyticsControlEventActionfromSDK(category,action,state);
};

const recordingCallback = (status, response) =>{
    if(response === "VIDYO_CONNECTORMODERATIONRESULT_OK") 
    {
        updateRecordingStatus(status)
        recordingState = status;
    }


}

const recordingControl = (action, prefix = null) => {
    switch(action) 
    {
        case "start":   
            if(prefix != null){
                StartRecording(prefix, recordingCallback);
            }
            break;
        case "pause":
            PauseRecording(recordingCallback);
            break;
        case "resume":
            ResumeRecording(recordingCallback);
            break;
        case "stop":
            StopRecording(recordingCallback);
            break;
    }
}

const enableDebugMode = () => {
    EnableDebugSDK();
}

const disableDebugMode =()=>{
    DisableDebugSDK();
}