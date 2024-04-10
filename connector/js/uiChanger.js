let localCameraList = {};
let localMicrophoneList = {};
let localSpeakerList = {};
let disableVideoOnLowBandWidth = null;
let allowRemoteCameraControl = null;

let lowBandwidthThresholdAudioStream = 3;
let voiceProcesingAlgorithm = 2;
let currentSelectedCameraCapabities = {};
let cameraCapablitiesData = {};
let chatWindowPage = "";
let currentShareContentObjId = "";
let currentShareContentApplicationName = "";
let lastSetCameraResolution = {};
let lastSetCameraFPS = null;
let openningModeratorUI = false;

let analyticsEnabled = false;

let selectedBackgroundEffect = "VIDYO_CONNECTORCAMERAEFFECTTYPE_None";
let selectedBlurIntensity = 3;

let sampleTime = null;
let responseTime = null;
let lowBandwidthThreshold = null;

let autoReconnect =null;
let reconnectAttempts  = null;
let reconnectBackOff = null;
let networkSignal = null  ;
let networkMedia = null  ;

let windowShared = null;
let monitorShared = null;
let isCoModerator = null;
const electron = require('electron');

const SHARE_PREVIEW_ICON_WIDTH = 300;
const SHARE_PREVIEW_ICON_HEIGHT = 300;
const SHARE_ICON_WIDTH = 30;
const SHARE_ICON_HEIGHT = 30;
const MIC_MUTED_IMG = "images/icon_microphone_muted.svg"
const MIC_UNMUTED_IMG = "images/icon_microphone.svg"
const CAM_MUTED_IMG = "images/icon_camera_muted.png"
const CAM_UNMUTED = "images/icon_camera.svg"
const SPEAKER_MUTED = "images/icon_speaker_muted.svg"
const SPEAKER_UNMUTED= "images/icon_speaker.svg"

const THEATER_MODE_IMG = "images/icon_theater_mode.svg"
const GRID_MODE_IMG = "images/icon_grid_mode.svg"

const MODERATOR_ON_IMG = "images/icon_moderator_controls_open.svg"
const MODERATOR_OFF_IMG = "images/icon_moderator_controls.svg"

const RAISE_HAND_IMG = "images/icon_raise_hand.svg"
const UNRAISE_HAND_IMG = "images/icon_unraise_hand_green.svg"

const LOCAL_CAMERA_OFF_IMG = "images/icon_local_camera.svg"
const LOCAL_CAMERA_ON_IMG = "images/icon_local_camera_active.svg"
const SOFT_MUTE_DELAY = 4000;
var chatParticipants = new Map();

var chatData  = {
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

var instantCallData = {
    displayName:"",
    roomKey:"",
    roomPin:"",
    portalUrl:"",
    extension:"",
    joinLink:"",
    inviteContent:"",
}

let defaultGAService = null;
let userPresetMap = new Map();

var persistMicBoost = {
    value:0,
    newValue: 0,
    newPos: 0
};

let hardMuteCamAll = false;
let hardMuteMicAll = false;
let mutedParticipantMics = [];
let mutedParticipantCams = [];

let debugMode = false;

let optionItemDefault = {
    microphoneMaxBoostLevel: "10",
    audioExclusiveMode: "false",
    AudioBitrateMultiplier: "2",
    audioCodecPriority: "OPUS",
    AudioPacketInterval: "40",
    AudioPacketLossPercentage: "10",
    audioWhitelistedItems: [],
};

let isOverlayOpen = false;
const overlayContentBounds = [
    {
        component:'selectView',
        anchor:'#grid-selection',
        bounds:{
            width:220,
            height:300,
        }
    },
    {
        component:'cameraControl',
        anchor:'#localfecc_id',
        bounds:{
            width:190,
            height:600
        }
    },
    {
        component:'inviteContent',
        anchor:'#invite-info-popup',
        bounds:{
            width:580,
            height:700
        }
    }
]

let viewModeOptions = {
    viewMode:"GRID",
    participantsLen:11
}

let feccControlOptions ={
    allowed:true,
}
let invitedParticipantList = [];
function changeToSignInUI(){
    toggleNavView("guest")
    document.getElementById("joinCallcontent").classList.add("hidden")
    document.getElementById("signInbutton").classList.add("hidden")
    document.getElementById("displayNameId").classList.add("hidden")
    document.getElementById("userNameId").classList.remove("hidden")
    document.getElementById("passwordId").classList.remove("hidden")
    $("#joincallid").html('Join as registered user');
    document.getElementById("joincallid").onclick = JoinCallWithId;
    addParicipantCallBack(participantCallBack);  
}

function changeToJoinCallUI(){
    toggleNavView("call")
    document.getElementById("joinCallcontent").classList.remove("hidden")
    document.getElementById("signInbutton").classList.remove("hidden")
    document.getElementById("displayNameId").classList.remove("hidden")
    
    document.getElementById("userNameId").classList.add("hidden")
    document.getElementById("passwordId").classList.add("hidden")
    $("#joincallid").html('Join as guest');
    
    document.getElementById("joincallid").onclick = JoinCall;
    addParicipantCallBack(participantCallBack);
    
}

const offsetSelfPreviewWindowOnMac = (isMac) => {
    if(isMac){
        $("#renderer").css({"transform":"translateY(-20px)"});
    }
}


function onNetworkInterfaceAdded(networkInterface){  //Added the new and unique network interface to the select list
    var text = $.trim(networkInterface.name);
    var isExist = !!$('#sel_network_signal').filter(function() {
        return $(this).text() === text;
    }).length;

    if(networkInterface.family.indexOf("IPV4") > -1){
        text += " - IPv4";
    }else{
        text += " - IPv6";
    }

    if (!isExist) {
        let value = JSON.stringify(networkInterface)
        $('<option>').val(value).text(text).appendTo($('#sel_network_signal'));
        $('<option>').val(value).text(text).appendTo($('#sel_network_media'));
    }
    networkDefaults();

}

function onNetworkInterfaceRemoved(networkInterface){ //Removed the unavailablle network interface from the select list
    var text = JSON.stringify(networkInterface);
    if(networkInterface.family.indexOf("IPV4") > -1){
        text += " - IPv4";
    }else{
        text += " - IPv6";
    }
    $("#sel_network_signal").each(function() {
        $(this).find(text).remove();
    });
    $("#sel_network_media").each(function() {
        $(this).find(text).remove();
    });
    networkMedia = null;
    networkSignal = null;
}

const setCPUProfileUI = (val) => {
    $("input[name=radio_cpuprofile][value=" + val + "]").attr('checked', 'checked'); // change UI of CPU Profile which currently selected.
}

function onSelectAutoConnect(event)
{
    if(event.target.checked)
    {
        $('.autoConnectFrame').removeClass('disabled');
        changeAutoReconnect(true)
        autoReconnect=true;
    }
    else
    {
        $('.autoConnectFrame').addClass('disabled')
        changeAutoReconnect(false)
        autoReconnect=false;
    }
}

const settingDefaultsGeneralSettings = (params) => {

    $('#sel_network_signal').bind("change",function(){
        networkSignal = $("#sel_network_signal option:selected").val();
    })
    $('#sel_network_media').bind("change",function(){
        networkMedia = $("#sel_network_media option:selected").val();
    })
    if(autoReconnect){
        $('#check_autoReconnect').prop("checked",true);

    }
    else{
        $('.autoConnectFrame').addClass('disabled')
    }
    $(`input[type=radio][name="radio_maxReconnectAttempt"][value='${reconnectAttempts}']`).prop("checked",true);
    $('#radio_reconnectBackOff').val(reconnectBackOff);
    $("#toggleDebugMode").prop("checked",debugMode);
    toggleDebugModeUi(debugMode)

}


const toggleDebugModeUi = (debugMode) => {
    $("#toggleDebugMode").prop("checked", debugMode);
    $('.toggle-debug-mode span').text(debugMode ? "Enabled" : "Disabled");
    if(debugMode){
        $("#btnSeeVidyoLogger").show();
    }
    else{
        $("#btnSeeVidyoLogger").hide();
    }
};

const networkDefaults = () => {
    if(networkSignal !== null){
        $('#sel_network_signal').val(networkSignal)
    }
    if(networkMedia !==null){
        $('#sel_network_media').val(networkMedia)
    }
}

const reconnectingCountdown = (retry,timeleft) => { 
    let counter = timeleft;
    var reconnectTimer = setInterval(function(){
        $("#reconnect-span").html(`Reconnect try (${retry}) - ${counter}`)
        counter -= 1;
        if(counter <= 0){
          clearInterval(reconnectTimer);
        }
      }, 1000);
 }

const updateUIonReConnecting = (reconnectionState , reconnectResponse = null) => { 
    switch (reconnectionState) {
      case "onReconnecting":
        const {attempt , nextAttemptIn } =reconnectResponse
        let dynamicMessage = $("<div>",{html:`Reconnect try (${attempt}) - ` , id:"reconnect-span"});
        showSnackBar("info",dynamicMessage,true)
        reconnectingCountdown(attempt , nextAttemptIn)
        break;
      case "onReconnected":
        showSnackBar("info","Connected !" )
        break;
      case "onConferenceLost":
        showSnackBar("info","Can't connect !")
        break;
    }
}

function registerGeneralSettingsClickEvent(){
    $('#sel_network_signal').on('change', onSelectNetworkSignal);
    $('#sel_network_media').on('change',onSelectNetworkMedia);
    $('input[type=radio][name="radio_cpuprofile"]').on('change', onSelectCpuProfile);
    $('#check_autoReconnect').on('change',onSelectAutoConnect);
    $('input[type=radio][name="radio_maxReconnectAttempt"]').on('change', onSelectMaxReconnectAttempt)
    $('#radio_reconnectBackOff').on('change', onSelectReconnectBackOff)
    $('#settingClose').on('click', onCloseSetting);
   // $('#btn-analytics-config').on('click', loadAnalyticsConfigEvent);
   $("input[value='"+analyticsServiceType+"']").prop("checked",true);
   if(analyticsServiceType !== "VIDYO_CONNECTORANALYTICSSERVICETYPE_None"){
     addAnalyticsConfig(analyticsServiceType);
   }
   $("input[name='radio_analytic_type']").on("change",function(){
       if($(this).val() !== "VIDYO_CONNECTORANALYTICSSERVICETYPE_None"){
         loadAnalyticsConfigEvent($(this).val())
       }
       else{
        onDeselectAnalyticsService().then(()=>{
            $(".configure-analytics-service").remove();
        })
           //todo disable analytics code here
       }
   })
   settingDefaultsGeneralSettings();

   $('#toggleDebugMode').change(function () {
      debugMode = this.checked;
      toggleDebugModeUi(debugMode)
       if(debugMode){
           enableDebugMode();
       }
       else{
          disableDebugMode();
       }
    });

    $("#btnSeeVidyoLogger").on("click",function(e){
        e.preventDefault();
        const link = $(this).val()
        electron.shell.openExternal(link);
    });
}

const updateBackgroundBlurEffectOptions = (backgroundOption) => {

    $("#select-img").on("change", function () {
        let selected_value = $("input[name='radioBGFX']:checked").val();
        if (selected_value === BackgroundEffectType.VIRTUAL_BACKGROUND) {
            $(".bg-gird-images > ul > li").on("click", function () {
                let blur = $(this).find("img").data("imgVal");
                backgroundOption.blurIntensity = blur;
                selectedBlurIntensity = blur;
                setBlurIntensityEffect(backgroundOption);
            });
        }
    });
};

updateEffectTypeOnUI = (effectType) => {
    $("input[name='radioBGFX'][value='" + effectType + "']").prop("checked", true);
    enablePhotoGridBasedOnEffectType(effectType);
    currentEffectType = effectType;
};

updateBlurIntentsity =(intensity)=>{
    $("input[type=range][name='rangeBlurIntensity']").val(intensity);
}

enablePhotoGridBasedOnEffectType = (effectType) => {
    $(".bg-gird-images").addClass("disable");
    $(".bg-gird-images").hide();
    $("#select-img .from-field").addClass("disabled");
    $("#select-img .from-field").hide();
    if (effectType === "VIDYO_CONNECTORCAMERAEFFECTTYPE_VirtualBackground") {
        $(".bg-gird-images").removeClass("disable");
        $(".bg-gird-images").show();
    }else if(effectType === "VIDYO_CONNECTORCAMERAEFFECTTYPE_Blur"){
        
        $("#select-img .from-field").removeClass("disabled");
        $("#select-img .from-field").show();
    }
}


let currentEffectType = "";

var path = require("path");
var virtualBackGroundAbsolutePath = path.resolve(__dirname, "./images/full");
let imagePath = null;
 registerBackgroundEffectsEvents=()=> {
    // Close Background Effect Dialog
    $("#bgEffectClose").on("click", onCloseBackgroundEffect);
    if(imagePath !== null  && imagePath.includes("full/")){
        const imgname  =imagePath.split("full/")[1].toString();
        $(`img[src*='${imgname}']`).css({
            "border":"solid 2px #80b02f"
        })
    }
    // Highlight items when clicked
    $(".bg-gird-images > ul > li").on("click", function () {

        imagePath = $(this).find("img").attr("src");

        if(imagePath){
            imagePath = virtualBackGroundAbsolutePath + "/"+(imagePath.split("thumbnails/")[1]);
            if (!$(this).hasClass("active")) {
                $(this).css({
                    "border":"solid 2px #80b02f",
           
                })
                $(this).addClass("active");
                $(this).siblings().removeClass("active");
                $(this).siblings().css({
                    "border":"",
         
                })
            }
        }
    });
    const checkIfRemoteModuleDeprecated = () => {
        const electronVersion = process.versions.electron.toString();
        let isRemoteDeprecated = (parseInt(electronVersion.split(".")[0].toString(),10)>=14);
        if(isRemoteDeprecated){
              try {
                console.log(require.resolve("@electron/remote"));
            } catch(e) {
                return;
            }
         }
       return isRemoteDeprecated;
      }

      const GetElectronRemoteModule = () => {
        let remoteModule;
        if(checkIfRemoteModuleDeprecated()){
          remoteModule = require('@electron/remote');
        }
        else{
          remoteModule = require("electron").remote;
        }
       return remoteModule;
      }
    // Open file dialog
    $("#openLocalBackgroundImgFile").on("click", function () {
        const dialog = GetElectronRemoteModule().dialog;
        dialog.showOpenDialog({
             title: 'Select the virtual background image',
             buttonLabel: 'Upload',
             filters: [
                 {name: 'Images', extensions: ['jpg', 'png']},
                 {name: 'All Files', extensions: ['*']} ],
             properties: ['openFile']
             }).then(file => {
             if (!file.canceled) {
                 global.filepath = file.filePaths[0].toString();
                 imagePath = global.filepath
                 $(".bg-gird-images > ul > li").eq(0).addClass("active");
                 $(".bg-gird-images > ul > li").eq(0).siblings().removeClass("active");
             }
         }).catch(err => {
             console.error(err)
         });
    });

    // Radio buttons
    $("#select-img").on("change", function () {
        let selected_value = $("input[name='radioBGFX']:checked").val();
        enablePhotoGridBasedOnEffectType(selected_value);
        
    });

    // Call API when clicked on apply button
    $("#applyBackground").on("click", function () {
        let selected_value = $("input[name='radioBGFX']:checked").val();
        if(selected_value === BackgroundEffectType.VIRTUAL_BACKGROUND && imagePath === null){
            const parentDiv = $(this).parent("div");
            $(".notify-image-select").remove();
            $("<small class='notify-image-select'> Please select a background </small>").insertBefore(parentDiv)
            
            return;
        }
        if (selected_value === BackgroundEffectType.VIRTUAL_BACKGROUND &&  currentEffectType !== BackgroundEffectType.VIRTUAL_BACKGROUND && imagePath !== null) {
            enableVirtualBackgroundEffect(imagePath);
        }else if (selected_value === BackgroundEffectType.VIRTUAL_BACKGROUND &&  currentEffectType === BackgroundEffectType.VIRTUAL_BACKGROUND && imagePath !== null) {
            changeVirtualBackgroundPicture(imagePath);
        }
        else if (selected_value === BackgroundEffectType.BLUR_BACKGROUND && currentEffectType !== BackgroundEffectType.BLUR_BACKGROUND) {
            enableBackgroundBlurEffect();
            imagePath = null;
        } else if (selected_value === BackgroundEffectType.NONE && currentEffectType !== BackgroundEffectType.NONE){
            setNoneEffect();
            imagePath = null;
        }
        selectedBackgroundEffect = selected_value;
        selectedBlurIntensity =  $("#rangeBlurIntensity").val();
       
        onCloseBackgroundEffect();
    });
    $("#rangeBlurIntensity").on("mouseup", function () {
        setBlurIntensity($(this).val());
        selectedBlurIntensity = $(this).val();
    });
};

const getViewParticipantsCount = ()=>{
     const count = $('.participants-list span').text();
     return Number(count)
}

const setViewParticipantsCount = (count)=>{
    $('.participants-list span').text(count)
}

const increaseViewParticipantsCounts = ()=>{
    //Todo: set boundary condition check
    const participantCount  =getViewParticipantsCount() == 16 ? 16 :getViewParticipantsCount() + 1   
    setViewParticipantsCount(participantCount)
}

const decreaseViewParticipantCounts = ()=>{

    if( getViewParticipantsCount() > 0){
        setViewParticipantsCount(getViewParticipantsCount() -1 )
    }else{
    }
}

const get_style = ()=>{
    const selection =  document.getElementById("grid-selection");
    return selection.src.includes(THEATER_MODE_IMG)?ViewStyle.THEATER:ViewStyle.GRID;
}


function registerEventsForViewSelection(){
    let selectBox = false;

    const selection =  document.getElementById("grid-selection1");
    selection.onclick = ()=>{
        if(selectBox){
            $('.view-selection-box').addClass("hidden")
        }else{
            $('.view-selection-box').removeClass("hidden")
        }
        selectBox = !selectBox;

       // onSelectViewVisiblityChange(selectBox)
    }

    const informProcessForViewStyleChange = ()=>{
        onViewStyleChange(get_style(), getViewParticipantsCount())
    }

    $('#theater-view-select').on("click", ()=>{
        selection.src = THEATER_MODE_IMG;
        informProcessForViewStyleChange()
    } );
    $('#grid-view-select').on("click", ()=>{
        selection.src = GRID_MODE_IMG
        informProcessForViewStyleChange()
    });
    $('.left').on('click',
     ()=>{
         decreaseViewParticipantCounts();
         informProcessForViewStyleChange( selection.src )

     })
    $('.right').on('click', ()=>{
        increaseViewParticipantsCounts();
        informProcessForViewStyleChange()
    }
     )
}

function showHideMultipleShareIcon(toShow){
    if(toShow){
        $(".multiple-share-select").removeClass("hidden");
    }else{
        $(".multiple-share-select").addClass("hidden");
    }
}

function addRemoveiteminMultipleShare(itme, toAdd, onclickCallback){
    const v = itme
    const clasName = itme.replace(/ /g, '-');
    if(toAdd){
        const elm =  $('.multiple-share-select-box ul').prepend("<li class=" + clasName + ">"+ v + "</li>");
        $('.'+ clasName).on('click', onclickCallback)

    }else{
        $('.' + clasName).remove()
    }
}

function registerMutlitpleShareEvent(){
    const informProcessForChangeinSelectBoxVisiblity = ()=>{
       const isHidden =  $('.multiple-share-select-box').hasClass('hidden')
       onMutlitpleShareSelectBoxVisibilityChange(!isHidden)
    }

    $('#mulitple-share-select-image').on('click', ()=>{
            if( $('.multiple-share-select-box').hasClass('hidden')){
                //addRemoveiteminMultipleShare("my share", true, ()=>console.log("my share clicked")) tODO: it is just demonstration how to add relement and remove element
                $('.multiple-share-select-box').removeClass('hidden');
            }else{
               // addRemoveiteminMultipleShare("my share", false)
                $('.multiple-share-select-box').addClass('hidden');
            }
            informProcessForChangeinSelectBoxVisiblity()
    });
    $('#stop-view-share').on('click', onStopViewShareClick);

}


function registerNetworkServiceListener() {
    $('#networkServiceContentEncoding').html('');
    $('#networkServiceContentEncoding').append('<option value="RPC">RPC</option>');
    $('#networkServiceContentEncoding').append('<option value="RPC-literal">RPC-literal</option>');
    $('#networkServiceContentEncoding').append('<option value="document-style">document-style</option>');        
    $(".close-icon").on("click", closeNetworkService);

    // Network service request form events
    // Selectors
    const networkServiceEl = document.querySelector(".network-popup-body"),
        formReq = networkServiceEl.querySelector(".form-network-service-request"),
        radioToken = formReq.querySelector("#authDetailToken"),
        radioCredential = formReq.querySelector("#authDetailCredentials"),
        radioSoap = formReq.querySelector("#networkServiceReqSOAP"),
        radioRest = formReq.querySelector("#networkServiceReqREST"),
        radioReqFileInfo = formReq.querySelector("#networkServiceReqFileInfo"),
        radioReqFileContent = formReq.querySelector("#networkServiceReqFileContent"),
        btnReq = formReq.querySelector("input[type='submit']"),
        btnReset = formReq.querySelector("input[type='button']");

    radioReqFileContent.addEventListener("change", selectReqFileContent, false);
    radioToken.addEventListener("change", selectTokenAuthDetail, false);
    radioCredential.addEventListener("change", selectCredentialAuthDetail, false);
    radioSoap.addEventListener("change", selectReqTypeSOAP, false);
    radioRest.addEventListener("change", selectReqTypeREST, false);
    radioReqFileInfo.addEventListener("change", selectReqFileInfo, false);
    btnReq.addEventListener("click",sendHttpRequest);
    btnReset.addEventListener("click" , clearAllNetworkServiceRequestInput)
}

function clearAllNetworkServiceRequestInput (){
    $('#networkServiceURL').val("");
    $('#networkServiceRequestNumber').val("");
    $('#networkServiceRequestPayload').val("");
    $('#networkServiceWebProxyUserName').val("");
    $('#networkServiceWebProxyPassword').val("");
    $('#networkServiceTokenInput').val("");
    $('#networkServiceCredentialName').val("");
    $('#networkServiceCredentialPassword').val("");
    $('#networkServiceReqMethod > option').eq(0).prop("selected",true);
    $("#networkServiceContentEncoding > option").eq(0).prop("selected",true);
    $('#networkServiceFileContent').val("");
    $('#networkServiceFileInfo').val("");
   clearAllNetworkServiceResponse();
}

function clearAllNetworkServiceResponse(){
    $('#networkServiceResponseNumber').val("");
    $('#networkServiceResponseErrCode').val("");
    $('#networkServiceResponseHttpStatus').val("");
    $('#networkServiceResponseSize').val("");
    $('#networkServiceResponseContentType').val("");
    $('#networkServiceResponseIPAdd').val("");
    $('#networkServiceResponseIPPort').val("");
    $('#networkServiceResponseHttpPayload').val("");
}

function updateNeworkRequestUI(errorCode,httpResponseContent,httpResponseContentSize,httpResponseContentType,httpStatusCode,requestNumber,webProxyIPAddress,webProxyIPPort){
    $('#networkServiceResponseNumber').val(requestNumber);
    $('#networkServiceResponseErrCode').val(errorCode);
    $('#networkServiceResponseHttpStatus').val(httpStatusCode);
    $('#networkServiceResponseSize').val(httpResponseContentSize);
    $('#networkServiceResponseContentType').val(httpResponseContentType);
    $('#networkServiceResponseIPAdd').val(webProxyIPAddress);
    $('#networkServiceResponseIPPort').val(webProxyIPPort);
    $('#networkServiceResponseHttpPayload').val(httpResponseContent);
}

function selectCredentialAuthDetail() {
    const networkServiceEl = document.querySelector(".network-popup-body"),
        formReq = networkServiceEl.querySelector(".form-network-service-request"),
        radioCredential = formReq.querySelector("#authDetailCredentials");

    if (radioCredential.checked === true) {
        document.getElementById("networkServiceTokenInput").disabled = true;
        document.getElementById("networkServiceCredentialName").disabled = false;
        document.getElementById("networkServiceCredentialPassword").disabled = false;
    }
}

// Select Request Type
function selectReqTypeSOAP() {
    document.getElementById("networkServiceReqMethod").disabled = true;
    $('#networkServiceContentEncoding').html('');
    $('#networkServiceContentEncoding').append('<option value="RPC">RPC</option>');
    $('#networkServiceContentEncoding').append('<option value="RPC-literal">RPC-literal</option>');
    $('#networkServiceContentEncoding').append('<option value="document-style">document-style</option>');
}

function selectReqTypeREST() {
    document.getElementById("networkServiceReqMethod").disabled = false;
    $('#networkServiceContentEncoding').html('');
    $('#networkServiceContentEncoding').append('<option value="application/json">(JSON:application/json)</option>');
    $('#networkServiceContentEncoding').append('<option value="application/xml">(XML:application/xml)</option>');
}

// Select Request content
function selectReqFileInfo() {
    document.getElementById("networkServiceFileInfo").disabled = false;
    document.getElementById("networkServiceFileContent").disabled = true;
}

function selectReqFileContent() {
    document.getElementById("networkServiceFileInfo").disabled = true;
    document.getElementById("networkServiceFileContent").disabled = false;
}

// Select authorization detail
function selectTokenAuthDetail() {
    const networkServiceEl = document.querySelector(".network-popup-body"),
        formReq = networkServiceEl.querySelector(".form-network-service-request"),
        radioToken = formReq.querySelector("#authDetailToken");

    if (radioToken.checked === true) {
        document.getElementById("networkServiceTokenInput").disabled = false;
        document.getElementById("networkServiceCredentialName").disabled = true;
        document.getElementById("networkServiceCredentialPassword").disabled = true;
    }
}

function sendHttpRequest() {
    const requestUrl = $('#networkServiceURL').val();
    const requestNumber = $('#networkServiceRequestNumber').val();
    const requestPayload = $('#networkServiceRequestPayload').val();
    const webProxyUserName = $('#networkServiceWebProxyUserName').val();
    const webProxyUserPassword = $('#networkServiceWebProxyPassword').val();
    const userAuthToken = $('#networkServiceTokenInput').val();
    const userAuthUserName = $('#networkServiceCredentialName').val();
    const userAuthUserPassword = $('#networkServiceCredentialPassword').val();
    const requestMethod = $('#networkServiceReqMethod').find(":selected").text();
    const requestContentType = $('#networkServiceContentEncoding').val();
    const caFileContent = $('#networkServiceFileContent').val();
    const caFilePath = $('#networkServiceFileInfo').val();
    if (requestUrl !== "") {
        clearAllNetworkServiceResponse();
        sendNetworkServceRequest(requestUrl,
            requestNumber,
            requestPayload,
            webProxyUserName,
            webProxyUserPassword,
            userAuthToken,
            userAuthUserName,
            userAuthUserPassword,
            requestMethod,
            requestContentType,
            caFileContent,
            caFilePath)
    }
}

const toggleBottomBarBlur = (state) => {
    if(state){
        $("body").append("<div class='bottom-bar-disable'></div>")
        $("#moderator_cnt_id").attr("src",MODERATOR_ON_IMG)
    }
    else{
        $(".bottom-bar-disable").remove();
        openningModeratorUI = false;
        $("#moderator_cnt_id").attr("src",MODERATOR_OFF_IMG)
    }
}

const showHideRaiseHand = (show) => {
    $('#raisehand_id').parent().hide();
    if(show){
        $('#raisehand_id').parent().show();
    }

}

function toggleRaiseHandUI(isHandRaised , eventtype = 'local'){
    const raisehand = document.getElementById("raisehand_id")

    if(isHandRaised){
        raisehand.src = UNRAISE_HAND_IMG
        raisehand.title = "Lower raised hand"
    }else{
        raisehand.src = RAISE_HAND_IMG
        raisehand.title = "Raise Hand"
    }
    if(eventtype !== 'local'){
        const label = isHandRaised ? 'approved' : 'dismissed';
        showSnackBar("info",`Your hand raise is ${label} by moderator`);
    }
}

function onClickRaisedHand(){
    const raisehand = document.getElementById("raisehand_id")
    if(raisehand.src.includes(UNRAISE_HAND_IMG)){
        onUnraiseHandClick();
    }else{
        onRaiseHandClick();
    }
}
const raiseHandIconToggle=(isRaiseHand)=>{
    if(isRaiseHand){
        $("#raisehand_id").attr("src",UNRAISE_HAND_IMG)
        $("#raisehand_id").attr("title","Lower raised hand")
    }
    else{
        $("#raisehand_id").attr("src",RAISE_HAND_IMG)
        $("#raisehand_id").attr("title","Raised hand")
    }
}
const raiseHandRequest =(isRaiseHand)=>{
    if(isRaiseHand){
        onRaiseHandClick();
    }
    else{
        onUnraiseHandClick();
    }
}
const raiseHandEventHandler = (btn) => {
    const raised =  $("#raisehand_id").attr("src").includes(UNRAISE_HAND_IMG);
    raiseHandIconToggle(!raised)
    raiseHandRequest(!raised)
 
}


function toggleLocalCameraControl(camera){
    const localfecc_id = document.getElementById("localfecc_id");
    if(localfecc_id.src.includes(LOCAL_CAMERA_OFF_IMG)){
         //ON case
        closeFeccControl(true);
    }else{
        //close local camera control  UI
        openFeccControl(camera, true);
    }
}

function setTitleCameraControl()
{
    const id = $(".activeFeccUserId").eq(0).attr("id").split("fecc-")[1];
    const name =$(`#name-${id}`).html();
    $('#fecc-title').text(name);
    $('#fecc-title').attr("title", name);
}

function setlocalCameraControlIcon(on)
{
    const localfecc_id = document.getElementById("localfecc_id");
    if(on)
    {
        localfecc_id.src = LOCAL_CAMERA_ON_IMG
    }
    else{
        localfecc_id.src = LOCAL_CAMERA_OFF_IMG
    }
}

function registerModeratorUIEvents(){
    // $(".fa-close-gray.moderator-popup-close").on("click", ()=>{onModeratorbuttonClick()});
    $(".fa-close-gray.moderator-popup-close").on("click", onCloseConferenceModeration);
    $("#disconnect-main").on("click", onClickDropAllParticipants)
    $(".fa-unraise-hand#main-dismiss-all-raisehand").on("click", function(){
        onClickUnraiseAllHand();
        removeAllRaiseHands();
    });
    
    
    $(".roomControlTable #" +particpantId).find(".fa-unraise-hand")[0].style.display = "none";
    $("#soft-mic-mute-main").on("click", function(){
        onClickSoftAudioMuteAll();
        $(".moderation-control[value^='soft-mic-mute']").addClass("active");
        setTimeout(()=>{
            $(".moderation-control[value^='soft-mic-mute']").removeClass("active");
        }, SOFT_MUTE_DELAY)
    })
    $("#soft-cam-mute-main").on("click", function(){
        onClickSoftVideoMuteAll();
        $(".moderation-control[value^='soft-cam-mute']").addClass("active");
        setTimeout(()=>{
            $(".moderation-control[value^='soft-cam-mute']").removeClass("active");
        }, SOFT_MUTE_DELAY)
    })
    $("#hard-mic-mute-main").on("click", function(){
        const participantList = getParticipantList();
        if(getConfernceMode() !== "GROUP"){
            return;
        }
        if(!$(this).hasClass("active")){
            onClickHardMuteMicAll();
            setHardMuteMicAll(true)
            $(".moderation-control[value^='hard-mic-mute']").addClass("active");
            for(participant in participantList)
            {
                const id = participantList[participant].participantData.userId;
                mutedParticipantMics.push(id);
            }
        }
        else{
            onClickHardUnmuteMicAll();
            setHardMuteMicAll(false)
            $(".moderation-control[value^='hard-mic-mute']").removeClass("active");
            for(participant in participantList)
            {
                participantList[participant].micHardMute = false;
            }
            mutedParticipantMics = [];
        }
    })

    $("#hard-cam-mute-main").on("click", function(){
        if(!$(this).hasClass("active")){
            onClickHardMuteCamAll();
            $(".moderation-control[value^='hard-cam-mute']").addClass("active");
            setHardMuteCamAll(true)
            const participantList = getParticipantList();
            for(participant in participantList)
            {
                const id = participantList[participant].participantData.userId;
                mutedParticipantCams.push(id);
            }
        }
        else{
            onClickHardUnmuteCamAll();
            $(".moderation-control[value^='hard-cam-mute']").removeClass("active");
            setHardMuteCamAll(false)
            mutedParticipantCams = [];
        }
    })

    $('input[type=checkbox][name="presenter-mode-start"]').on('change', (event)=>{ 
        onPresenterModeSelect(event.target.checked);
        updateConfrenceMode("LOBBY")
    });
    $("input[name='mode-radio-button']").on("change", conferenceModeToggle);

    $("input[name='room-lock-unlock-button']").change(()=>{
        onRoomLockUnlockSelect($("input[name='room-lock-unlock-button']:checked").val() === "lock")
    })


    $('.pin-input > input').on('input', function (event) { 
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $("#set-pin-moderation").on("click",function(){
        if(validateRoomPinByPortal($("#pin-moderation").val())){
            setModerationPin($("#pin-moderation").val().toString());
            $(this).parent().eq(0).parent().eq(0).find("div.errorMessage").hide();
            $("#pin-moderation").removeClass("error")
        }
        else{
            const {minRoomPin:min, maxRoomPin:max} = getRoomPinRequirementsSDK()
            $(this).parent().eq(0).parent().eq(0).find("div.errorMessage").text(`Moderation PIN must be ${min} - ${max} digits.`)
            $(this).parent().eq(0).parent().eq(0).find("div.errorMessage").show();
            $("#pin-moderation").addClass("error")
        }

    })
   
    $("#rem-pin-moderation").on("click",function(){
        removeModeratorPin();
    })

    $("#set-pin-room").on("click",function(){
        
        if(validateRoomPinByPortal($("#pin-room").val())){
            setRoomPin($("#pin-room").val().toString())
            $(this).parent().eq(0).parent().eq(0).find("div.errorMessage").hide();
            $("#pin-room").removeClass("error")
        }
        else{
            const {minRoomPin:min, maxRoomPin:max} = getRoomPinRequirementsSDK()
            $(this).parent().eq(0).parent().eq(0).find("div.errorMessage").text(`Room PIN must be ${min} - ${max} digits.`)
            $(this).parent().eq(0).parent().eq(0).find("div.errorMessage").show();
            $("#pin-room").addClass("error")
        }

    })
    $("#rem-pin-room").on("click",function(){
        removeRoomPin();
    })

    $('.moderatorRaiseList').on("click", (event)=> {
        $('.vidyoConnecto-popup').removeClass('popup-hide');
        registerRaisedPopUpClickEvent();
    });
   // $('.addParticipantLink').on('click',onClickAddParicipant);
   $('#btnInviteParticipant').on('click',onClickAddParicipant);

    $(document).on("click", "#start-record", function () {
        prefix = $("input[name='radio_2']:checked").val();
        let recordingState = "start";
        if($("#start-record").hasClass("fa-start-recording")){
            recordingState = "start";
            if($("#stop-record").hasClass("fa-stop-recording-pressed")){
                recordingState  = "resume";
            }
        }
        recordingControl(recordingState, prefix);
    })
    $(document).on("click", "#pause-record", function () {
        if ($("#pause-record").hasClass("fa-pause-recording-pressed")) {
            recordingControl("pause");
        }
    })
    $(document).on("click", "#stop-record", function () {
        if ($("#stop-record").hasClass("fa-stop-recording-pressed")) recordingControl("stop")
    })
}

const updateRecordingLabel = (message) => {
    if(message !== ""){
        
        $("#lbl-recording-status").css("display", "block");
        $("#lbl-recording-status").html(message);
    }
    else{
        $("#lbl-recording-status").css("display", "none");
    }
}

function conferenceModeToggle() {
    const checkedInput = $("input[name='mode-radio-button']:checked");
    if(checkedInput.val() === "GROUP") {
        var presenterRadio = $(".conferenceModerationRight input[name='radio_3']:checked");
        presenterRadio.prop("checked", false);
        updateConfrenceMode("GROUP")
        $("button[value='hard-mic-mute'] , #hard-mic-mute-main").removeClass("active")
    }
    else{
        updateConfrenceMode("LOBBY")
        $("button[value='hard-mic-mute'] , #hard-mic-mute-main").addClass("active")
    }
    onPresenterModeSelect(checkedInput.val() === "LECTURE");
}


const updatedModerationUiForRemoteParticipant = (callMode)=>{
    if(callMode !== "GROUP"){

        if(!$("#hard-mic-mute-main").hasClass("active"))
        {
                $("#hard-mic-mute-main").addClass("active")
                $("button[value='hard-mic-mute']").addClass("active")
        }
        const selectedPresenterId = $('input[name="radio_3"]:checked').val();
        if($(`button#mc-${selectedPresenterId}`))
            $(`button#mc-${selectedPresenterId}`).removeClass("active")

    }else
    {
        if($("#hard-mic-mute-main").hasClass("active") && !hardMuteMicAll)
        {
                $("#hard-mic-mute-main").removeClass("active")
                $("button[value='hard-mic-mute']").removeClass("active")
        }
    }
}


function updateRoomPin(isPin) {
    $("#rem-pin-room, #set-pin-room").attr("disabled", true);
    if (isPin) {
        $("#pin-room").val("000000000000");
        $(".modal-content > .modal-title").html("PIN Set");
        $(".modal-content > .modal-message").html("Room PIN is successfully set.");
        $("#rem-pin-room").removeAttr("disabled")
    }
    else {
        $("#pin-room").val("");
        $(".modal-content > .modal-title").html("PIN Removed");
        $(".modal-content > .modal-message").html("Room PIN is removed.");
        $("#set-pin-room").removeAttr("disabled")
    }
    $(".modal-cta > button").show();
}

function updateModerationPin(isPin) {
    $("#rem-pin-moderation ,  #set-pin-moderation").attr("disabled", true);
    if (isPin) {
        $("#pin-moderation").val("0000000000");
        $("#rem-pin-moderation").removeAttr("disabled");
        $(".modal-content > .modal-title").html("PIN Set");
        $(".modal-content > .modal-message").html("Moderation PIN is successfully set.");
    } else {
        $("#pin-moderation").val("");
        $("#set-pin-moderation").removeAttr("disabled");
        $(".modal-content > .modal-title").html("PIN Removed");
        $(".modal-content > .modal-message").html("Moderation PIN is removed.");
    }
    $(".modal-cta > button").show();
}

function updateConfrenceName (name){
    $(".conferenceModerationLeft .leftSection .meeting-name h2").text(name);
}
function updateConfrenceMode (mode){
    $("input[name='mode-radio-button'][value='" + mode + "']").prop("checked", true);
    if(mode === "LOBBY"){
        $(".lobby-mode-checkbox").prop("checked", true);
        $("input[name='mode-radio-button'][value='LECTURE']").prop("checked", true);
    }else{
        $(".lobby-mode-checkbox").prop("checked", false);
     }

     if(mode !== "GROUP"){
        $("input[name='presenter-mode-start']").prop("checked", true);
     }else{
        $("input[name='presenter-mode-start']").prop("checked", false);
        $(".conferenceModerationRight input[name='radio_3']:checked").prop("checked", false);
     }
}

function updateRoomLockUnlockStatus (lockStatus){
    $("input[name='room-lock-unlock-button'][value='" + lockStatus + "']").prop("checked", true);
}

function getModerationPinFromUI (){
    const moderationPin = $('.moderation-pin').val();
    if(moderationPin.length < 4){
        return "";
    }else{
        return moderationPin;
    }
}

function getRoomPinFromUI (){
    const roomPin = $('.room-pin').val();
    if(roomPin.length < 4){
        return "";
    }else{
        return roomPin;
    }
}
function renderRecordingUI(recordingList) {
    if (recordingList.length > 0) {
        $(".recording-detail").css("display", "inline-block");
        $(".recording-control").css("display", "inline-block");
        recordingList.forEach(function (item, index, array) {
            $(".recording-detail .leftBody").append(
              $(renderRecordingListItem(item.profile, item.prefix, index))
            );
        });
    } else {
        $(".recording-detail").css("display", "none");
        $(".recording-control").css("display", "none");
    }
}

function renderRecordingListItem(profileName, prefix, i) {
  return `<label class="radioButton">${profileName}
    <input type="radio" ${
      i === 0 ? 'checked="checked"' : ""
    }  name="radio_2" value ="${prefix}">
    <span class="RadioCheckmark"></span>
    </label>`;
}

function renderModerationParticipantList(){
    const particpantList = getParticipantList();
    const confernceMode = getConfernceMode();
     $("#moderation-participant-list-header-particpant-count").html(participantCountLabel());
    for(particpantId in particpantList ){
        $(".roomControlTable").append($(renderModerationParticpantListItem(participantList[particpantId] , confernceMode)));
    }
    if(hardMuteMicAll){
        $("#hard-mic-mute-main").addClass("active");
    }
    if(hardMuteCamAll){
        $("#hard-cam-mute-main").addClass("active");
    }
}

const hardMuteAllOnRejoin = () => {
    if(hardMuteMicAll){
        onClickHardMuteMicAll();
    }
    if(hardMuteCamAll){
        onClickHardMuteCamAll();
    }
}


function  renderModerationParticpantListItem(particpantObj , confernceMode){
    const particpantUserId = particpantObj.participantData.userId;
    const clearanceType = particpantObj.clearenceType;
    const name = particpantObj.participantData.name;
    const rasiseHandStyle = particpantObj.isHandRaised;
    const localUser = isLocaUser(particpantObj.participantData.userId)
    let userTypeLabel = localUser ? "Me": clearanceType;
    if(clearanceType === "Administrator"){
        userTypeLabel += " (Admin)";
    }
    let $row = $("<tr>",{id:particpantUserId});
    $row.append($("<td>",{html:name}));
    $row.append($("<td>",{html:userTypeLabel }));
    const presenterModeOptions={
        confernceMode,
        particpantUserId,
        isPresenter:particpantObj.isPresenter
    }
    $row.append(presenterModeUIControl(presenterModeOptions))
    const handRaiseOptions ={
        particpantUserId,
        rasiseHandStyle
    }
    $row.append(handRaiseUIControl(handRaiseOptions))
    $row.append(softMicMuteUIControl(particpantUserId))
    $row.append(softCamMuteUIControl(particpantUserId))
    $row.append(hardMicMuteUIControl(particpantUserId))
    $row.append(hardCamMuteUIControl(particpantUserId))
    $row.append(dropParticipantUIControl(particpantUserId))

    return $row;
}

const presenterModeUIControl = (options) => {
    const {confernceMode, particpantUserId , isPresenter} = options;
    let $td = $("<td>");
    let $div = $("<div>" ,{class:"tableRadioButton"});
    let $label =$("<label>" ,{class:"radioButton"})
    let $input =$("<input>",{ type:"radio",name:"radio_3" , val:particpantUserId , disabled:true , class:"presenter_radio" , checked:isPresenter});
    if( confernceMode !== "GROUP"){
        $input.removeAttr("disabled")
    }
    $input.on("click",function(){
        if(particpantUserId === currentPresenterId){
            RemovePresenter()
            $(this).prop('checked', false);
        }
        else{
            onSetPresenterClick(particpantUserId);
        }
        $(`button[value='hard-mic-mute']`).addClass("active");
        $(`button#mc-${particpantUserId}[value='hard-mic-mute']`).eq(0).removeClass("active");
        if(!$(this).is(":checked")){
            $(`button#mc-${particpantUserId}[value='hard-mic-mute']`).eq(0).addClass("active");
        }
    })
    let $span  = $("<span>", {class:"RadioCheckmark"});
    $label.append($input,$span);
    $div.append($label)
    $td.append($div);
    return $td;
}

const handRaiseUIControl = (options) => {
    const {particpantUserId , rasiseHandStyle} = options;
    let $td = $("<td>");
    let $div = $("<div>" ,{class:"icon"});
    $div.on("click",function(){
        handRaise(particpantUserId);
    })
    let $icon =$("<i>",{class:"fa-unraise-hand" , title:"Unraise hand"})
    if(!rasiseHandStyle){
        $icon.hide();
    }
    $div.append($icon)
   return  $td.append($div)
}

const buttonTemplate = (options) => {
    const {value,title, participantId, onClickEvent} = options;
    let $td = $("<td>");
    let $btn =  $("<button>",{type:"button" , id:"mc-"+participantId , val:value,  title , class:"moderation-control"});
    /// Persistant Class for Hard Mute Mic/Cam
    if(value.toString().split("-")[0] === "hard"){
        if(value.toString() === "hard-mic-mute"){
            if(getHardMute(participantId,"micHardMute") || mutedParticipantMics.includes(participantId) || getConfernceMode() !== "GROUP"){
                $btn.addClass("active")
            }
        }
        else if(value.toString() === "hard-cam-mute"){
            if(getHardMute(participantId,"camHardMute")  || mutedParticipantCams.includes(participantId)){
                $btn.addClass("active")
            }
        }
    }
    /// Synthetic event on click
    $btn.on("click",function(){
        if(value.toString().split("-")[0] === "soft"){
            onClickEvent(participantId);
            $(this).addClass("active");
            setTimeout(()=>{
                $(this).removeClass("active")
            }, SOFT_MUTE_DELAY)
        }
        else if(value.toString().split("-")[0] === "hard"){
            if(getConfernceMode() !== "GROUP"){
                return;
            }
            if($(this).hasClass("active")){
                $(this).removeClass("active")
            }
            else{
                $(this).addClass("active")
            }
            onClickEvent(participantId).then(()=>{
            }).catch(()=>{
                $(this).removeClass("active");
            })
        }
        else{
            /// drop parrticipant
            onClickEvent(participantId);
        }
    });
    $td.append($btn)
    return $td;
}

const softMicMuteUIControl = (id) => {
    const attrs = {
        value:"soft-mic-mute",
        title:"Soft Mute Microphone",
        participantId:id,
        onClickEvent:onClickSoftAudioMute
    }
    return buttonTemplate(attrs);
}

const softCamMuteUIControl = (id) => {
    const attrs = {
        value:"soft-cam-mute",
        title:"Soft Mute Camera",
        participantId:id,
        onClickEvent:onClickSoftVideoMute
    }
    return buttonTemplate(attrs);
}
const getHardMute = (participantID,device)=>{
    return getParticipantList()[participantID][device]
}
const setHardMuteMicAll = (state) => {
    hardMuteMicAll = state;
    if(!state){
        $("#hard-mic-mute-main").removeClass("active");
    }
    else{
    $("#hard-mic-mute-main").addClass("active");
    }
}
const setHardMuteCamAll = (state) => {
    hardMuteCamAll = state;
    if(!state){
        $("#hard-cam-mute-main").removeClass("active");
    }
    else{
      $("#hard-cam-mute-main").addClass("active");
    }
}
const hardMicMuteUIControl =  (id) => {
    const toggle = async () => {
        return new Promise(async (resolve,reject)=>{
            if(!getHardMute(id,"micHardMute")  && !mutedParticipantMics.includes(id)){
                await onClickHardMuteMic(id);
                resolve()
            }
            else if(getConfernceMode() !== "GROUP" && $(`button#mc-${id}`).hasClass("active")){
                await onClickHardUnmuteMic(id);
                reject();
            }
            else{
                mutedParticipantMics = mutedParticipantMics.filter(item => item !== id);
                await onClickHardUnmuteMic(id);

                reject();
            }
        })
    }

    const attrs = {
        value:"hard-mic-mute",
        title:"Hard Mute Microphone",
        participantId:id,
        onClickEvent:toggle
    }
    return buttonTemplate(attrs);
}
const hardCamMuteUIControl = (id) => {
    const toggle = async () => {
        return new Promise(async (resolve,reject)=>{
            if(!getHardMute(id,"camHardMute") && ! mutedParticipantCams.includes(id)){
                await onClickHardMuteCam(id);
                resolve()
            }
            else{
                await onClickHardUnmuteCam(id);
                mutedParticipantCams = mutedParticipantCams.filter(item => item !== id);
                reject();
            }
        })
    }
    const attrs = {
        value:"hard-cam-mute",
        title:"Hard Mute Camera",
        participantId:id,
        onClickEvent:toggle
    }
    return buttonTemplate(attrs);
}
const dropParticipantUIControl = (id) => {
    const attrs = {
        value:"disconnect",
        title:"Disconnect Participant",
        participantId:id,
        onClickEvent:onClickDropParticipant
    }
    return buttonTemplate(attrs);
}

function handRaise (particpantId){
    $('.vidyoConnecto-popup').removeClass('popup-hide');
    registerRaisedPopUpClickEvent(particpantId);
}

function UpdatePresenterEnableDisable(mode) {
    if (mode === "LECTURE" || mode === "LOBBY") {
        $("input[type=radio][name='radio_3']").each(function () {
            $(this).removeAttr("disabled")
        });
    } else {
        $("input[type=radio][name='radio_3']").each(function () {
            $(this).attr("disabled", true);
        });
    }
}

// function clearAllRaiseHand (){
//     const participantList = getParticipantList();
//     for(particpant in participantList){
//         id = participantList[particpant].participantData.userId;
//         var ele = $(".roomControlTable #" +id);
//         ele.find(".fa-unraise-hand")[0].style.display = "none";
//     }
// }
const addPresenterCheck = (presenterObject) => {
    const {userId} = presenterObject;
    $(".presenter_radio[value='"+userId+"']").prop("checked",true);
    $(`button[value='hard-mic-mute']`).addClass("active");
    $(`button#mc-${userId}[value='hard-mic-mute']`).eq(0).removeClass("active");
}




function addRaiseHand (){
    const particiapntList = getParticipantList();
    for(id in particiapntList){
        const rasiseHandStyle = particiapntList[id].isHandRaised?"inline-block" : "none";
        var ele = $(".roomControlTable #" +id);
        if(ele.find(".fa-unraise-hand")[0]){
            ele.find(".fa-unraise-hand")[0].style.display = rasiseHandStyle;
        }
    }
}
const removeAllRaiseHands = () => {
    const particiapntList = getParticipantList();
    for(id in particiapntList){
        var ele = $(".roomControlTable #" +id);
        if(ele.find(".fa-unraise-hand")[0]){
            ele.find(".fa-unraise-hand")[0].style.display = "none";
        }
    }
}


function registerEventForInCallScreen(){
    document.getElementById("call-disconnect").onclick = onCallDisconnectClick;
    document.getElementById("chat_id").onclick = onLoadChat;
    document.getElementById("network_service").style.display = "none";

/* click event for network service */
    document.getElementById("network_service").onclick = openNetworkService;
    /* Click event for user background select */
    document.getElementById("bg_select").onclick = openBackgroundEffectsDialog;

    const spk_elem = document.getElementById("speaker_id")
    spk_elem.onclick = ()=>{
        if(spk_elem.src.includes(SPEAKER_MUTED)){
            spk_elem.src = SPEAKER_UNMUTED
            onSpeakerUnMuteClick()
        }else{
            spk_elem.src = SPEAKER_MUTED
            onSpeakerMuteClick()
        }
    };
    const $localMicrophone =  $("#mic_id");

    $localMicrophone.on("click", function(){
        const srcFile = $(this).attr("src");
        if(srcFile.includes(MIC_MUTED_IMG)){
            if(getMicHardMuteStatus()){
                localDeviceModerationEvent(onClickHardUnmuteMic).then(()=>{
                    onMicUnmuteClick();
                    $localMicrophone.attr("src",MIC_UNMUTED_IMG);
                    mutedParticipantMics = mutedParticipantMics.filter(item => item !== getLocalUserID());
                    $("#mc-"+getLocalUserID()+"[value='hard-mic-mute']").removeClass("active")
                }).catch(e=>{
                    console.log(e.toString())
                });
                return;
            }
            else{
                onMicUnmuteClick();
                $localMicrophone.attr("src",MIC_UNMUTED_IMG);
            }
        }
        else{
            onMicMuteClick();
            $localMicrophone.attr("src",MIC_MUTED_IMG);
        }
    })

    const $localCamera = $("#cam_id");
    $localCamera.on("click",function(){
        const srcFile = $(this).attr("src");
        if(srcFile.includes(CAM_MUTED_IMG)){
            if(getCamHardMuteStatus()){
                localDeviceModerationEvent(onClickHardUnmuteCam).then(()=>{
                    onCamUnMuteClick();
                    $localCamera.attr("src",CAM_UNMUTED);
                    mutedParticipantCams = mutedParticipantCams.filter(item => item !== getLocalUserID());
                    $("#mc-"+getLocalUserID()+"[value='hard-cam-mute']").removeClass("active")
                })
                return;
            }
            else{
                onCamUnMuteClick();
                $localCamera.attr("src",CAM_UNMUTED);
            }
        }
        else{
            onCamMuteClick();
            $localCamera.attr("src",CAM_MUTED_IMG);
        }
    });

    let utilty = utility();
    const participant_elm = document.getElementById("participant_id");
    participant_elm.onclick=()=>{
        if(openningModeratorUI){
            return;
        }
        utilty.loadTempletWithClassName( "right-section", "participant_list.html").then(
            ()=>{
                $("#renderer").addClass("right-section-open");
                $(".right-section").addClass("right-section-open");
                //highlight participants
                $("#participant_id").parent('li').addClass('active');
                $("#participant_id").attr('src','./images/icon_participants_active.svg');
                //remove chat active
                $('#chat_id').parent().removeClass('active');
                $('#chat_id').attr('src','./images/icon_chat.svg');
                if($(".setting-container").html() !== ""){
                    $(".moderator-popup-close").trigger("click");
                }
                showRendering();
                addParticipantToTheList();
                addRemoteDeviceCallBackToSDK(remoteDeviceCallBack);
                updateLocalDeviceIconState("cam",$("#cam_id").attr("src").includes(CAM_MUTED_IMG))
                updateLocalDeviceIconState("mic",$("#mic_id").attr("src").includes(MIC_MUTED_IMG))
            }
        );
    }

    const moderator_cnt = document.getElementById("moderator_cnt_id")
    moderator_cnt.onclick = ()=>{
        if($(".right-section").html() !== ""){
            $("#renderer").removeClass("right-section-open");
            $(".right-section").removeClass("right-section-open").html('');
            hideRightBlock();
            $('#participant_id').parent().removeClass('active');
            $('#participant_id').attr('src','./images/icon_participants.svg');
            //remove chat active
            $('#chat_id').parent().removeClass('active');
            $('#chat_id').attr('src','./images/icon_chat.svg');
            showRendering();
        }
        openningModeratorUI = true;
        onModeratorbuttonClick(moderator_cnt.src.includes(MODERATOR_OFF_IMG))
    };
    //registerEventsForViewSelection();
    registerMutlitpleShareEvent();
    $("#grid-selection").on("click",function(){
        if(!isOverlayOpen){
            initOverlay('selectView',viewModeOptions);
        }
    })

}



const updateLocalDeviceIconState =(device,isDisabled)=>{
    if($(".local-cam-muted") && $(".local-mic-muted"))
    {
        if(device === "mic"){
            if(isDisabled){
                $(".local-mic-muted").show();    
            }
            else{
                $(".local-mic-muted").hide();
            }
        }
        if(device === "cam"){
            if(isDisabled){
                $(".local-cam-muted").show();
            }
            else{
                $(".local-cam-muted").hide();
            }
        }
        
        
    }

}
 remoteDeviceCallBack = (deviceType,status,data,state) => {

    let participantID = status === Status.CAMERA_CONTROL_CAPABLITES_UPDATED ? data.particpant.userId : data.userId;
    let deviceIcon = deviceType === DEVICE_TYPE.CAMERA ?  $("#cam-" + participantID) :  $("#mic-" + participantID);
    if(status === Status.ADD) deviceIcon.hide();
    if(status === Status.REMOVE) deviceIcon.show();
    if(status === Status.STATUS_CHANGED){
        if(state === "VIDYO_DEVICESTATE_Paused"){
            deviceIcon.show();
        }
        else{
            deviceIcon.hide();
        }
    }
    if(deviceType === DEVICE_TYPE.CAMERA ){
        if(status === Status.CAMERA_CONTROL_CAPABLITES_UPDATED){
            const {capabilities} = data;
            if(isRemoteCamControlAllowed(capabilities)) {
                $("#fecc-"+participantID).show();
            }else{
                $("#fecc-"+participantID).hide();
            }
        }
        else{
            if(deviceIcon.is(":visible")){
                $("#fecc-"+participantID).hide();
                $("#pin-"+participantID).hide();
                $("#pin-"+participantID).removeClass("active");
                unPinParticipant(null)
            }
            else{
                $("#fecc-"+participantID).show();
                $("#pin-"+participantID).show();
            }
        }
    }
}

const participantDetails = (participantObject) => {
    const {camera,microphone,participantData:participantInfo} = participantObject;
    const camDisabled  = camera["data"] === undefined; /// empty object {} means not active;
    const micDisabled  = microphone["data"] === undefined || microphone["state"] === undefined ? false : !microphone["state"] ; //  empty object {} means not active;
    const feccSupported = camera["isFECCSuported"] === undefined ?  false: camera["isFECCSuported"];
    const clearence = participantObject.clearenceType ?participantObject.clearenceType : "";
    const isLocalUser = isLocaUser(participantObject.participantData.userId);
    return   {
                participantUserId:participantInfo.userId.toString(),
                participantName:null,
                micDisabled,
                camDisabled,
                feccSupported,
                clearanceType:isLocalUser ? "Me" : clearence
            }
}

const participantCountLabel = () => {
    const count = getParticipantCount(); 
    return count>1?"Participants ("+count+")":"Participant ("+count+")"
}


addParticipantToTheList = ()=>{
    const participantList = getParticipantList();
    $("#participant-count").text(participantCountLabel);
    for(participant in participantList){
            const participantObj = participantList[participant];
            const {participantData:participantInfo} =participantObj;;
             const listItemPayload = participantDetails(participantObj);
            getParticipantName(participantInfo , (name)=>{
                listItemPayload.participantName = name;
                $("#participant-list-ul").append($(participantListItemStyle(listItemPayload)));
            }) ///getParticipantName

        } /// for loop


    $('.cancel-white , #close-participant-list').click(function(){
        $("#renderer").removeClass("right-section-open");
        $(".right-section").removeClass("right-section-open").html('');
        hideRightBlock();
        //remove participants active
        $('#participant_id').parent().removeClass('active');
        $('#participant_id').attr('src','./images/icon_participants.svg');

        //remove chat active
        $('#chat_id').parent().removeClass('active');
        $('#chat_id').attr('src','./images/icon_chat.svg');
        showRendering();
    })
}

 /// refactored &  replaced function with new
const participantListItemStyle = (payload) => {
    const {participantUserId,participantName , micDisabled , camDisabled , feccSupported, clearanceType} = payload;
    const ctrl = (className) =>{
        return $("<div>", {class:className , id:className + "-" + participantUserId});
     }
     let li = $("<li>" , {id:"participant-"+participantUserId});
     let avatar = ctrl("avatar"); avatar.text(getNameFirstChar(participantName));
     let details = ctrl("details");
     let name = ctrl("name"); 
     name.text(participantName);
     name.attr("title" , participantName)
     let metaData = ctrl("meta-data");
     let mutedMicIcon = ctrl("mic");
     let mutedCamIcon = ctrl("cam");
     if(clearanceType !=="Me"){
         if(!micDisabled) mutedMicIcon.hide();
         if(!camDisabled) mutedCamIcon.hide();
     }
     else{
        mutedMicIcon.addClass("local-mic-muted");
        mutedCamIcon.addClass("local-cam-muted");
     }
     let role = ctrl("role"); role.html(clearanceType);
     details.append(name,metaData);
     let actions = ctrl("actions");
     let fecc = ctrl("fecc"); 
     fecc.hide();
     fecc.on("click",function(){
        const particpantList  = getParticipantList();
        $(".activeFeccUserId").removeClass("activeFeccUserId");
        $(this).addClass("activeFeccUserId");
        openFeccControl(particpantList[participantUserId].camera, false );
      })
     let pin = ctrl("pin");
     pin.on("click",function(){
        pinParticipant(participantUserId);
     })
     if(camDisabled){
         pin.hide();
     }
     
     metaData.append(mutedMicIcon,mutedCamIcon)
     if(clearanceType !=="Me"){
        if(feccSupported){
             fecc.show();
         }
     }
     else{
         avatar.addClass("host");
     }
      metaData.append(role);
      actions.append(fecc,pin)
      li.append(avatar,details,actions);
      return li;

}

const pinParticipantUIUpdate = (participantObject) => {
     $(".pin").removeClass("active");
    const {participantData ,pin} = participantObject
    const {userId} =participantData;
    if(pin){
        $("#pin-"+userId).addClass("active")
    }

}
function toggleMic(){
    document.getElementById("myImg").src = "hackanm.gif";

}

function registerSettingsClickEvent(){
    document.getElementById("logSetting").onclick = ()=>openLogSetting(GetLogLevel());
    document.getElementById("generalSetting").onclick = openGeneralSetting;
}

const RenderLogEventsOnUI = (logEvents) => {
    const preFormatted = $("<pre>", {html:JSON.stringify(logEvents)});
    $("#log-content").append(preFormatted);
}  
const getSelectedFilterStrings = (selectedLogLevel) => { 
    let selectedFilterKeys = []
    logFileFilter[selectedLogLevel].split(" ").forEach(function(item){
        if(item !== "info@LmiPace" && item !== "all@LmiIce" ){
            selectedFilterKeys.push(item)
        }
    
    })
    return selectedFilterKeys.join(", ")
}
function registerLogSettingclickEvent(){

    document.getElementById("loglevelapplybtn").onclick = function() {
        const value = document.getElementById("logLevelSelect").value;
        if(!value){
            alert("invalid case log select option is null")
            return;
        }
        onApplyLogLevel(value.toString().toLowerCase());
    }
    document.getElementsByClassName("log-display")[0].onclick = function (){
        const logLevel = $("#logLevelSelect").val().toLowerCase();
        displyaLogEvents(getSelectedFilterStrings(logLevel), RenderLogEventsOnUI);
    };

    document.getElementById("logLevelSelect").onchange = function (event){
        const value = event.target.value;
        if(!value){
            alert("invalid case log select option is null")
            return;
        }
        onLogLevelChange(value);
    }
    document.getElementById("logclose").onclick = onCloseSetting
    document.getElementById("loglevelclosebtn").onclick = onCloseSetting
}

function registerForTextPopupButtonClick(onOk, onCancel){
    const textArea = document.getElementsByClassName("from-txt-box")[0]
    document.getElementById("text-popup-cancel").onclick = onCancel
    document.getElementById("text-popup-ok").onclick =()=>onOk(textArea.value)
}




function intilizeUIEventRegistration(){
 
   document.getElementById("go-to-guest-view").onclick =  changeToJoinCallUI;
   document.getElementById("joincallid").onclick = JoinCall;
   document.getElementById("signInbutton").onclick = changeToSignInUI;
   document.getElementById("setting").onclick = openSetting;
   document.getElementById("share_id").onclick = openLocalShare;
   //document.getElementById('raisehand_id').onclick = onClickRaisedHand;
  $("#raisehand_id").on("click",raiseHandEventHandler);
  $('#localfecc_id').hide();
   document.getElementById("localfecc_id").onclick = function(){
    if(isLocalCameraControlAllowed()){
        if(!allowRemoteCameraControl){
            showSnackBar("info", `Please allow remote camera control from Video Settings`);
            return;
        }
        const supportedFeatures = getSupportedCameraFeatures();
        if(!isOverlayOpen){
            initOverlay('cameraControl',{...supportedFeatures});
        }
    }
   }
   if(registerEventForInCallScreen()){
    document.getElementById("network_service").style.display = "none";
   }else{
    document.getElementById("network_service").style.display = "block";
   }
   //registerEventForInCallScreen();
   $('#participant_id').parent().removeClass('active');
   $('#participant_id').attr('src','./images/icon_participants.svg');
   //remove chat active
   $('#chat_id').parent().removeClass('active');
   $('#chat_id').attr('src','./images/icon_chat.svg');

   $("#nav-view").hide();
   $("#btnStartCall").on("click",startCallHandler)
   $("#sign-in-panel").hide();
   $("#go-to-start-call").on("click",function(){
    toggleStartupView("start-call-panel")
    $("#nav-view").hide();
  
   })
   $("#btnSignInView").on("click",function(){
    toggleStartupView("sign-in-panel")
    $("#nav-view").show();
    toggleNavView("call")
   })

   $("#startCall-displayName, #displayName").on("keydown",function(event){
     return /[a-z, ]/i.test(event.key)
   })

   $("#invite-info-popup").on("click", function () {
     if (!isOverlayOpen) {
       initOverlay("inviteContent", { ...instantCallData });
     }
   });
   
   
}
const toggleStartupView = (view) => {
    $(".startup-view").hide();
    $("#"+view).show();
}
const toggleNavView = (link) => {
    $("#go-to-guest-view ,#go-to-start-call").hide()

    if(link==="guest"){
        $("#go-to-guest-view").show();
    }
    else{
        $("#go-to-start-call").show();
    }

 }
function registerSettingMainPageListener() {
    $(".setting-menu-section ul li").click(function () {
        $(".setting-menu-section ul li").removeClass("active");
        $(this).addClass("active");
        loadSettingData($(this).data("settingName"))
    })
}
const toggleLocalCameraIcon = (isAllowed) => {
    if(isAllowed){
        $('#localfecc_id').show();
    }
    else{
        $('#localfecc_id').hide();
    }
 }


handleAudioVideoSettingCleanUp =()=>{
    hideRendering();
}

updateLobbyPageUI =(roomName , userName) =>{
    $('.lobbyRoomContainer h2').text(roomName);
    $('.lobbyRoomContainer h3').text(userName);
}

const updateConnectorOption = (connectorOptionObject) => {
    /** options properties are
     * microphoneMaxBoostLevel
     * audioExclusiveMode
     * audioCodecPriority
     * AudioPacketInterval
     * AudioPacketLossPercentage
     * AudioBitrateMultiplier
     * audioWhitelistedItems
     */
    $("input[type=range][name='micboost']").val(connectorOptionObject.microphoneMaxBoostLevel);
    $("#rangeMicBoost").trigger("input");
    // Audio device usage mode share
    $("input[name='radio_usage_mode'][value='share']").prop("checked", connectorOptionObject.audioShareMode);

    // Audio device usage mode mic exclusive
    $("input[name='radio_usage_mode'][value='mic_exclusive']").prop("checked", connectorOptionObject.micExclusiveMode);

    // Audio device usage mode mic and speaker exclusive
    $("input[name='radio_usage_mode'][value='mic_speak_exclusive']").prop("checked", connectorOptionObject.micSpeakerExclusiveMode);

    // Audio codec preferences
    $("input[name='radio_audio_codec_preference'][value='" + connectorOptionObject.audioCodecPriority + "']").prop("checked", true);

    // Audio packet interval
    $("input[name='audio_packet_interval'][value='" + connectorOptionObject.AudioPacketInterval + "']").prop("checked", true);

    // Packet loss %
    $("input[name='packet_loss'][value='" + connectorOptionObject.AudioPacketLossPercentage + "']").prop("checked", true);

    // Bitrate multiplier
    $("input[name='radio_bitrate_multiplier'][value='" + connectorOptionObject.AudioBitrateMultiplier + "']").prop("checked", true);

    // Whitelist items
    const listItems = $("#wl_list > li");
    listItems.each(function (li) {
        optionItemDefault.audioWhitelistedItems.push($(this).text());
    });

    /**
     * sampleTime
     * responseTime
     * lowBandwidthThreshold
     * autoReconnect
     * reconnectAttempts
     * reconnectBackOff
     */

}
//updating default values for general settings and video settings.
const updateDefaultValues = (optionsData) => {
  Object.keys(optionsData).forEach(function (key) {
    var value = optionsData[key];
    switch (key) {
      case "sampleTime":
                sampleTime = value;
        break;
      case "responseTime":
        responseTime = value;
        break;
      case "lowBandwidthThreshold":
        lowBandwidthThreshold = value;
        break;
      case "autoReconnect":
            autoReconnect = value;
        break;
      case "reconnectAttempts":
        reconnectAttempts = value;
        break;
      case "reconnectBackOff":
        reconnectBackOff = value;
        break;
    }
  });
};
const RegisterAnalyticsServicesEvents = () => { 

    $("#close-analytics-services").on("click",onCloseSetting);
    $(".panel-links").each(function(){
        $(this).on("click",()=>{
            var id = $(this).data("panel-id");
            ToggleAnalyticsServicePanel(id)
            $(this).addClass("active")
            if(id === "panel-google-analytics"){
                onGetAnalyticsEventTable();
            }
        })
    })

    $(".btn-set-provider").each(function(){
        $(this).on("click",()=>{
            var btn = $(this);
            var serviceUrl = btn.attr("data-service-url");
            if(serviceUrl === 'service-url-vidyoinsights' ){
                if($(`#${serviceUrl}`).val() === ""){
                    return ;
                }
                const payload = {
                    isEnabled:btn.hasClass('remove'),
                    serviceType:serviceUrl,
                    serviceUrl:$(`#${serviceUrl}`).val() 
                }
                ToggleAnalyticsServiceProvider(payload)
            }
            else if(serviceUrl === 'service-url-google-ga4'){
                var id = $('#ga4-id').val();
                var key = $('#ga4-key').val()
                if(id=="" && key==""){
                    id = GetDefaultGA4Options().id
                    key = GetDefaultGA4Options().key ;
                }
                else if(id == "" && key != ""){
                    return;
                }
                else if (id != "" && key == ""){
                    return
                }
                else{

                }
                const options = {
                    isEnabled:btn.hasClass('remove'),
                    id,
                    key
                }
                
                ToggleGA4AnalyticsServices(options).then(result=>{
                    UpdateUIForGA4Services(result)
                }).catch(e=>{
                    console.error('>>> ToggleGA4AnalyticsServices',e)
                })
            }
            else{
                
            }
        })
    })

}
const ToggleAnalyticsServicePanel = (activePanel) => { 
    $(".analytics-panel").hide();
    $(".panel-links").removeClass("active");
    $(`#${activePanel}`).show()
}
const ToggleAnalyticsServiceProvider = (payload) => { 
    ToggleAnalyticsServices(payload).then((res)=>{
        const {serviceType} = payload;
        const {enabled,GAtrackingId,VIServiceUrl} = res
        const uiOptions = {
            enabled,
            serverUrl:serviceType === 'service-url-google'? null : VIServiceUrl ,
            trackingId:serviceType === 'service-url-google'? GAtrackingId : null ,
        }
        UpdateUIForAnalyticsServices(serviceType,uiOptions);
    }).catch(e=>{
        console.error('Error:ToggleAnalyticsServices',e)
    })
}

const UpdateUIForAnalyticsServices = (serviceType,options) => {
    const {enabled, serverUrl, trackingId} = options;
    $(`#${serviceType}`).prop("disabled",false);
    $(`#${serviceType}`).val("");
    $(`button[data-service-url=${serviceType}]`).removeClass("remove");
    $(`button[data-service-url=${serviceType}]`).text("Start");
    $(`span[data-service='${serviceType}'].active-badge`).fadeOut(200);

    if(enabled){
        $(`#${serviceType}`).val(serviceType === 'service-url-google'? trackingId : serverUrl);
        $(`#${serviceType}`).prop("disabled",true);

        $(`button[data-service-url=${serviceType}]`).addClass("remove");
        $(`button[data-service-url=${serviceType}]`).text("Stop");

        $(`span[data-service='${serviceType}'].active-badge`).fadeIn(400);

    }
}


const UpdateUIForGA4Services = (options) => {
    const {enabled, id, key} = options;
    $(".ga4-details").prop("disabled",false);
    $(".ga4-details").val("");
    $(`button[data-service-url=service-url-google-ga4]`).removeClass("remove");
    $(`button[data-service-url=service-url-google-ga4]`).text("Start");
    $(`span[data-service='service-url-google-ga4'].active-badge`).fadeOut(200);
    if(enabled){
        $("#ga4-id").val(id);
        $("#ga4-key").val(key);
        $(".ga4-details").prop("disabled",true);
        $(`button[data-service-url=service-url-google-ga4]`).addClass("remove");
        $(`button[data-service-url=service-url-google-ga4]`).text("Stop");
        $(`span[data-service='service-url-google-ga4'].active-badge`).fadeIn(400);
    }
   
}

const SetDefualtAnalyticsConfiguration = (checkForServices) => {
    if(checkForServices.includes('service-url-google')) {
        CheckIfGoogleAnalyticsIsEnabled().then(response=>{
            UpdateUIForAnalyticsServices('service-url-google',response)
        }).catch((e)=>{
            console.error('Error while fetching IsGoogleAnalyticsEnabledSDK')
        })
    }

    if(checkForServices.includes('service-url-google-ga4')) {
        CheckIfGoogleAnalyticsGA4IsEnabled().then(response=>{
            UpdateUIForGA4Services(response)
        }).catch(e=>{
            console.error(e)
        })
    }

    if(checkForServices.includes('service-url-vidyoinsights')) {
        CheckIfVidyoInsightsIsEnabled().then(response=>{
            UpdateUIForAnalyticsServices('service-url-vidyoinsights',response)
        }).catch((e)=>{
            console.error('Error while fetching IsVidyoInsighsAnalyticsEnabledSDK')
        })
    }
}



const addDataToAudioSettingPage = () => {
    getConnectorOption();
    getWhiteListDeviceList();
    getVoiceProcesingStatusFromSDK();
    getAutoGainControlStatusFromSDK();
    // Microphone
    localMicrophoneList = getLocalMicrophonesListFromSDK();
    for (localMicrophone in localMicrophoneList) {
        if (localMicrophone !== "0") {
            $("#microphones").append("<option value='" + window.btoa(localMicrophoneList[localMicrophone].id) + "'>" + localMicrophoneList[localMicrophone].name + "</option>");
        }
    }
    $("#microphones option[value='" + window.btoa(selectedMicrophone.id) + "']").prop('selected', true);

    // Speaker
    localSpeakerList = getLocalSpeakersListFromSDK();
    for (localSpeaker in localSpeakerList) {
        if (localSpeaker !== "0") {
            $("#speakers").append("<option value='" + window.btoa(localSpeakerList[localSpeaker].id) + "'>" + localSpeakerList[localSpeaker].name + "</option>");
        }
    }
    $("#speakers option[value='" + window.btoa(selectedSpeaker.id) + "']").prop('selected', true);

    //audio stream
    $("input[name='radio_audio_stream'][value='" + lowBandwidthThresholdAudioStream + "']").prop("checked", true);
    getMaxSendBitRateFromSDK((value) => {
        $('#send-Max-bandwidth').val(value);
    });

    registerAudioSettingPageEvents();
};

const microPhoneBoostIndicator = (inputRange) => {
  const convertDBtoPercentage = (db) => {
    const top = 20; // maxboost top value from SDK documentation
    return Math.round((db / top) * 100);
  };
  const newValue = Number(
    ((inputRange.value - inputRange.min) * 100) /
      (inputRange.max - inputRange.min)
  );
  const newPos = 10 - inputRange.value * 0.32;
  $("#rangeV > span").html(convertDBtoPercentage(inputRange.value) + " %");
  $("#rangeV > span").css({ left: `calc(${newValue}% + (${newPos}px))` });
};

const registerAudioSettingPageEvents = () => {
    $("#settingClose").on("click", onCloseSetting);

    // Hook up microphone selector functions for each of the available microphones
    $("#microphones").change(function () {
        // Microphone selected from the drop-down menu
        $("#microphones option:selected").each(function () {
            microphone = localMicrophoneList[$(this).val()];
            selectLocalMicrophoneFromSDK(microphone);
        });
    });

    // micboost
    $("#rangeMicBoost").on("mouseup", function () {
        setMaxAudioBoost($(this).val());
    });

  // sync idicator change
  $("#rangeMicBoost").on("input", function () {
    microPhoneBoostIndicator(this);
  });

    // Hook up speaker selector functions for each of the available speakers
    $("#speakers").change(function () {
        // Speaker selected from the drop-down menu
        $("#speakers option:selected").each(function () {
            speaker = localSpeakerList[$(this).val()];
            selectLocalSpeakerFromSDK(speaker);
        });
    });

    // Audio stream
    $("input[name='radio_audio_stream']").click(function () {
        setDisableVideoOnLowBandwidthAudioStream($(this).val());
    });

    // Audio device usage mode
    $("input[name='radio_usage_mode']").on("change", function () {
        switch ($(this).val()) {
            case "share":
                setAudioDeviceUsageModeToShare();
                break;
            case "mic_exclusive":
                setAudioDeviceUsageModeToMicExclusive();
                break;
            case "mic_speak_exclusive":
                setAudioDeviceUsageModeToMicSpeakerExclusive();
                break;
        }
    });

    // Audio codec preference
    $("input[name='radio_audio_codec_preference']").click(function () {
        setAudioCodecPreference($(this).val());
    });

    // Audio packet interval
    $("input[name='audio_packet_interval']").click(function () {
        setAudioPacketInterval($(this).val());
    });

    // Audio packet loss %
    $("input[name='packet_loss']").click(function () {
        setAudioPacketLossPercentage($(this).val());
    });

    // Audio bitrate interval
    $("input[name='radio_bitrate_multiplier']").on("change", function () {
        setBitrateMultiplier($(this).val());
    });

    // Voice processing
    $('#avp_switch').change(function () {
        setVoiceProcesingStatusFromSDK(this.checked);
        updateVoiceProcessingOnUI(this.checked)
    });

    // Auto gain
    $('#aagc_switch').change(function () {
        setAutoGainControlStatusFromSDK(this.checked);
        selectAutomaticGainControlOnUI(this.checked)
    });
    // Hook up camera selector functions for each of the available cameras
    $("#cameras").change(function () {
        // Camera selected from the drop-down menu
        $("#cameras option:selected").each(function () {
            camera = localCameraList[$(this).val()];
            selectLocalCameraFromSDK(camera);
        });
    });

    // Toggle whitelist content
    $("#toggle_whitelist_audio_devices").on("click", function () {
        let togglePanel = $("#toggle_panel_whitelist_audio_devices");
 
        if (togglePanel.hasClass("hide")) {
            togglePanel.removeClass("hide");
            togglePanel.addClass("show");
        } else {
            togglePanel.removeClass("show");
            togglePanel.addClass("hide");
        }
    });

    document.getElementById("add_wl_iten").addEventListener("click", function (e) {
        e.preventDefault();
        addDeviceToWhiteList();
        });
};

// Add/Remove Whitelist item
const createCloseBtn =(li)=> {
    const deviceName = li.innerHTML;
    let span = document.createElement("SPAN");
    let txt = document.createTextNode("x");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    span.addEventListener("click", async function () {
        const status = await RemoveAudioDeviceFromWhitelist(deviceName);
        if(status)
        li.remove();
    });
}

const addDeviceToWhiteList =async ()=> {
    let input_value = document.whitelistForm.whitelist_input.value;
    const status = await AddAudioDeviceToWhitelist(input_value);
    if(status)
    addWhiteListDeviceToList(input_value);
    document.whitelistForm.whitelist_input.value = "";
}

const addWhiteListDeviceToList= (deviceName)=>{
    let li = document.createElement("LI");
    let input_txt = document.createTextNode(deviceName);

    li.appendChild(input_txt);

    document.querySelector("#wl_list").appendChild(li);
    document.whitelistForm.whitelist_input.value = "";

    createCloseBtn(li);
}

const updateWhiteListDeviceListUI = (list) =>{
    for (item in list) {
        addWhiteListDeviceToList(list[item]);
    }
}


const displayFramerate = val => {
    cameraCapablitiesData = val;
    const nanoSecond  = 1000000000;
    let MAX_FPS = 0
    $("#cameras_fps").empty();
    for(var i=0;i< cameraCapablitiesData.ranges.length; i++){
        const fps = nanoSecond / cameraCapablitiesData.ranges[i].range.end;
        addCameraFPSToUI(fps);
    }
    if(lastSetCameraFPS != null){
        $('#cameras_fps option[value="' + lastSetCameraFPS + '"]').prop('selected', true);
        return;
    }
    if( cameraCapablitiesData.ranges.length >1)
    {
        const fpsList = cameraCapablitiesData.ranges.map(r=>{
            return nanoSecond / r.range.end 
        })
        MAX_FPS  = Math.max(...fpsList);
        MAX_FPS = Math.round(MAX_FPS);
       $('#cameras_fps option[value="' + MAX_FPS + '"]').prop('selected', true);
    }
    
};

const addDataToAudioVideoSettingPage = () => {
    localCameraList = getLocalCamerasListFromSDK();
    for (localCamera in localCameraList) {
        if (localCamera !== "0") {
            $("#cameras").append("<option value='" + window.btoa(localCameraList[localCamera].id) + "'>" + localCameraList[localCamera].name + "</option>");
        }
    }
    $("#cameras option[value='" + window.btoa(selectedCamera.id) + "']").prop('selected', true);
    if(selectedCamera.id !== "0"){
    addCameraDetailsToUI(getCameraCapablitiesFromSDK());
    displayFramerate(currentSelectedCameraCapabities[$("#cameras_resolution option:selected").val()]);
    }

    showRenderingAtView(document.getElementsByClassName("cam-img"));

    $(".right-con-section-scroll").scroll(() => {

        let element = document.getElementsByClassName("cam-img");
        element = element[0];
        resetPreviewWindow(element.getBoundingClientRect().left, element.getBoundingClientRect().top + 10, element.getBoundingClientRect().width, element.getBoundingClientRect().height);
    })

    window.onresize = () => {
        let element = document.getElementsByClassName("cam-img");
        element = element[0];
        resetPreviewWindow(element.getBoundingClientRect().left, element.getBoundingClientRect().top + 10, element.getBoundingClientRect().width, element.getBoundingClientRect().height);

    }

    $("#response_time option[value='" + responseTime + "']").prop('selected', true);
    $("#sample_time option[value='" + sampleTime + "']").prop('selected', true);
    $("#low_bandwidth_threshold option[value='" + lowBandwidthThreshold + "']").prop('selected', true);
    $("input[name='radio'][value='" + lowBandwidthThresholdAudioStream + "']").prop("checked", true)
    getMaxSendBitRateFromSDK((value) => {
        $('#send-Max-bandwidth').val(value);
    });

    getMaxReceiveBitRateFromSDK((value) => {
        $('#recieve-Max-bandwidth').val(value);
    });

    registerEventForAudioVideoSettingPage();
}

const registerEventForAudioVideoSettingPage = () => {
    $("#settingClose").on("click", onCloseSetting);
    if(disableVideoOnLowBandWidth){
        $('#disable-video-low-bandwidth').prop("checked",true);
        $('.disable-vid-low-bw').removeClass('disabled')
    }
    $('#disable-video-low-bandwidth').on("change", function (e) {
        if(e.target.checked) {
            $('.disable-vid-low-bw').removeClass('disabled');
            setDisableVideoOnLowBandwidth(true);
            disableVideoOnLowBandWidth = true;
            $("#low_bandwidth_threshold > option").eq(2).prop("selected",true);
            $("#response_time, #sample_time, #low_bandwidth_threshold").trigger("change"); 

        } else {
            $('.disable-vid-low-bw').addClass('disabled')
         
            $("#response_time option[value='"+responseTime+"']").prop('selected', true);
            $("#sample_time option[value='"+sampleTime+"']").prop('selected', true);
            $("#low_bandwidth_threshold option[value='"+lowBandwidthThreshold+"']").prop('selected', true);

            setDisableVideoOnLowBandwidth(false);
            disableVideoOnLowBandWidth = false;
        }
    });
    // Hook up camera selector functions for each of the available cameras
    $("#cameras").change(function () {
        // Camera selected from the drop-down menu
        $("#cameras option:selected").each(function () {
            const selectedCam = $(this).val();
            camera = localCameraList[$(this).val()];
            selectLocalCameraFromSDK(camera);
            if(selectedCam !== "0"){
                addCameraDetailsToUI(getCameraCapablitiesFromSDK());
            }
            else{
                $("#cameras_resolution , #cameras_fps ").html("")
            }
        });

        displayFramerate(currentSelectedCameraCapabities[$("#cameras_resolution option:selected").val()]);
    });

    // Hook up camera resoselector functions for each of the available cameras
    $("#cameras_resolution").change(function () {
        // Camera selected from the drop-down menu
        var res  = $("#cameras_resolution").val();
        onChangeCameraResolution(res)
    });

    $("#cameras_fps").change(function(){
        var fps = $(this).val();
        onChangeCameraFPS(fps)
    })

    // Hook up microphone selector functions for each of the available microphones
    $("#microphones").change(function () {
        // Microphone selected from the drop-down menu
        $("#microphones option:selected").each(function () {
            microphone = localMicrophoneList[$(this).val()];
            selectLocalMicrophoneFromSDK(microphone);
        });
    });

    // Hook up speaker selector functions for each of the available speakers
    $("#speakers").change(function () {
        // Speaker selected from the drop-down menu
        $("#speakers option:selected").each(function () {
            speaker = localSpeakerList[$(this).val()];
            selectLocalSpeakerFromSDK(speaker);
        });
    });

    $("#response_time").change(function () {
        $("#response_time option:selected").each(function () {
            setDisableVideoOnLowBandwidthResponseTime($(this).val(), (value) => {
                responseTime = value;
            });
        });
    });

    $("#sample_time").change(function () {
        $("#sample_time option:selected").each(function () {
            setDisableVideoOnLowBandwidthSampleTime($(this).val(), (value) => {
                sampleTime = value;
            });
        });
    });


    $("#low_bandwidth_threshold").change(function () {
        $("#low_bandwidth_threshold option:selected").each(function () {
            setDisableVideoOnLowBandwidthThreshold($(this).val(), (value) => {
                lowBandwidthThreshold = value;
            });
        });
    });

    $("input[name='radio']").click(function () {
        setDisableVideoOnLowBandwidthAudioStream($(this).val(), (value) => {
            lowBandwidthThresholdAudioStream = value;
        });
    })
    $('#send-Max-bandwidth').donetyping(function () {
        setMaxSendBitRateFromSDK($('#send-Max-bandwidth').val() * 1000);
    });

    $('#recieve-Max-bandwidth').donetyping(function () {
        setMaxReceiveBitRateFromSDK($('#recieve-Max-bandwidth').val() * 1000);
    });
     if(!isLocalCameraControlAllowed()){
        $('#allowRemoteControl').hide();
     }
    if(allowRemoteCameraControl){
        $('#allow-remote-control').prop('checked',true);
    }
    $('#allow-remote-control').on("change", function (e) {
        allowRemoteCameraControl = e.target.checked
        AllowRemoteCameraControl(allowRemoteCameraControl)
    });
}

const onChangeCameraResolution = (resolution) => { 
    displayFramerate(currentSelectedCameraCapabities[resolution]);
    const {width,height} = cameraCapablitiesData;
    setLocalCameraCapabilitesFromSDK(height , width);
    lastSetCameraResolution = {width,height};
}
const onChangeCameraFPS = (selectedFPS) => { 
    const {width,height} = lastSetCameraResolution;
    setLocalCameraCapabilitesFromSDK(height , width ,selectedFPS);
    lastSetCameraFPS = selectedFPS;
 }

const showMessageForAudioOnlyMode = (r) => {
    if(r<1){
        showSnackBar("info", `The video was disabled due to poor connection.`);
    }
}

const addCameraDetailsToUI = (cameraDetail) => {
    currentSelectedCameraCapabities = cameraDetail.capabilities;
    const cameraData = cameraDetail.cameraInfo;
    let selectedIndex = 0;
    $("#cameras_resolution").empty();
    currentSelectedCameraCapabities.forEach(function (item, index, array) {
        if(item.width == cameraData.width && item.height == cameraData.height){
            selectedIndex = index;
        }
        $("#cameras_resolution").append("<option value='" + index + "'>" + item.width + "*" + item.height + "</option>")
    });
    if(lastSetCameraResolution && Object.keys(lastSetCameraResolution).length === 0 && lastSetCameraResolution.constructor === Object){
        $("#cameras_resolution option[value='" + selectedIndex + "']").prop('selected', true);
    }
    else{
        $("#cameras_resolution > option").each(function(index){
            const {width,height} = lastSetCameraResolution;
            const label = width.toString() + "*"  + height.toString();
            if(label === $(this).text()){
                $(this).prop('selected', true);
            }
        })
    }

}

const addCameraFPSToUI = (FPS) => {
    $("#cameras_fps").append("<option value='" + Math.round(FPS) + "'>" + Math.round(FPS) + " fps" + "</option>");
}

const updateVoiceProcessingOnUI = (voiceProcessing) => {
    $("#avp_switch").prop("checked", voiceProcessing);
    $('.voice-processing-switch span').text(voiceProcessing ? "ON" : "OFF");
}

const selectAutomaticGainControlOnUI = (automaticGainControl) => {
    $("#aagc_switch").prop("checked", automaticGainControl);
    $('.gain-control-switch span').text(automaticGainControl ? "ON" : "OFF");
};

const updateMicEnergyUI=(localDeviceData)=>{
    let all_pids = $('.pid');
    let amout_of_pids = Math.round((localDeviceData + 100) / 12);
    let elem_range = all_pids.slice(0, amout_of_pids)
    for (var i = 0; i < all_pids.length; i++) {
        all_pids[i].style.backgroundColor = "#e6e7e8";
    }
    for (var i = 0; i < elem_range.length; i++) {

        elem_range[i].style.backgroundColor = "#69ce2b";
    }
}
const localDeviceListner = (DEVICETYPE, STATUS, localDeviceData) => {
    switch (STATUS) {
        case Status.ADD:
            switch (DEVICETYPE) {
                case DEVICE_TYPE.CAMERA:
                    $("#cameras").append("<option value='" + window.btoa(localDeviceData.id) + "'>" + localDeviceData.name + "</option>");
                    break;
                case DEVICE_TYPE.MICROPHONE:
                    $("#microphones").append("<option value='" + window.btoa(localDeviceData.id) + "'>" + localDeviceData.name + "</option>");
                    break;
                case DEVICE_TYPE.SPEAKER:
                    $("#speakers").append("<option value='" + window.btoa(localDeviceData.id) + "'>" + localDeviceData.name + "</option>");
                    break;
            }
            break;
        case Status.REMOVE:
            switch (DEVICETYPE) {
                case DEVICE_TYPE.CAMERA:
                    $("#cameras option[value='" + window.btoa(localDeviceData.id) + "']").remove();
                    break;
                case DEVICE_TYPE.MICROPHONE:
                    $("#microphones option[value='" + window.btoa(localDeviceData.id) + "']").remove();                  
                    break;
                case DEVICE_TYPE.SPEAKER:
                    $("#speakers option[value='" + window.btoa(localDeviceData.id) + "']").remove();
                    break;
            }
            break;
        case Status.SELECT:
            switch (DEVICETYPE) {
                case DEVICE_TYPE.CAMERA:
                    $("#cameras option[value='" + window.btoa(localDeviceData.id) + "']").prop('selected', true);
                    break;
                case DEVICE_TYPE.MICROPHONE:
                    $("#microphones option[value='" + window.btoa(localDeviceData.id) + "']").prop('selected', true);
                    break;
                case DEVICE_TYPE.SPEAKER:
                    $("#speakers option[value='" + window.btoa(localDeviceData.id) + "']").prop('selected', true);
                    break;
            }
            break;

        case Status.MICROPHONE_ENERGY_CHANGE:
            updateMicEnergyUI(localDeviceData);
            break;

        case Status.CAMERA_CAPABLITES_UPDATED:
            switch (DEVICETYPE) {
                case DEVICE_TYPE.CAMERA:
                    addCameraDetailsToUI(localDeviceData);
                    break;
            }
            break;

        case Status.AUTO_GAIN_CONTROL_STATUS_CHANGE:
            selectAutomaticGainControlOnUI(localDeviceData);
            break;

        case Status.VOICE_PROCESSING_STATUS_CHANGE:
            updateVoiceProcessingOnUI(localDeviceData);
            break;

        case Status.STATUS_CHANGED:
         switch (DEVICETYPE) {
                case DEVICE_TYPE.CAMERA:
                    const cam_elm = document.getElementById("cam_id");
                    if (localDeviceData === "VIDYO_DEVICESTATE_Resumed" || localDeviceData === "VIDYO_DEVICESTATE_Started") {
                        cam_elm.src = CAM_UNMUTED;
                        updateLocalDeviceIconState("cam",false)
                    } else if(localDeviceData === "VIDYO_DEVICESTATE_Stopped" || localDeviceData === "VIDYO_DEVICESTATE_Paused"){
                        cam_elm.src = CAM_MUTED_IMG
                        updateLocalDeviceIconState("cam",true)
                    }
                    break;
                case DEVICE_TYPE.MICROPHONE:
                    const mic_elm = document.getElementById("mic_id");
                    if (localDeviceData === "VIDYO_DEVICESTATE_Resumed" || localDeviceData === "VIDYO_DEVICESTATE_Started") {
                        mic_elm.src = MIC_UNMUTED_IMG
                        updateLocalDeviceIconState("mic",false)
                    } else if(localDeviceData === "VIDYO_DEVICESTATE_Stopped" || localDeviceData === "VIDYO_DEVICESTATE_Paused") {
                        mic_elm.src = MIC_MUTED_IMG;
                        updateLocalDeviceIconState("mic",true)
                        updateMicEnergyUI(-100)
                    }
                    break;
            }
            break;
    }
}
let isInCall = false;
const switchToLoginUI = ()=>{
    $(".btm-list-lt ul li").addClass("in-call");
    $(".btm-list-rt ul li").addClass("in-call");
    $(".sighIn").removeClass("in-call");
    $('#setting').removeClass("in-call");
    $('#bg_select').removeClass("in-call");
    $("#renderer").addClass("sighIn-image");
    $('#network_service').parent('li').removeClass("in-call");
    $(".btm-list-lt #network_service").show();
    $(".btm-list-lt #network_service").attr('src','./images/icon_network_service.svg');
    $("#moderator_cnt_id").attr("src",MODERATOR_OFF_IMG)
    $("#renderer").removeClass("incall-renderer");
    isInCall = false;
    $('#renderer').removeClass('leftblock');
    $('#right-section').removeClass('rightblock');

    // Default states for device control icons
    const cam_elm = document.getElementById("cam_id");
    if(cam_elm.src.includes(CAM_MUTED_IMG)) {
        cam_elm.src = CAM_UNMUTED;
        onCamUnMuteClick();
    }

    const mic_elm =  document.getElementById("mic_id");
    if(mic_elm.src.includes(MIC_MUTED_IMG)) {
        mic_elm.src  = MIC_UNMUTED_IMG;
        onMicUnmuteClick()
    }

    const spk_elem = document.getElementById("speaker_id");
    if(spk_elem.src.includes(SPEAKER_MUTED)) {
        spk_elem.src = SPEAKER_UNMUTED;
        onSpeakerUnMuteClick();
    }
    $("#invite-info-popup").hide();
}

const switchToInCallUI = ()=>{
    $(".btm-list-lt ul li").removeClass("in-call");
    $(".btm-list-rt ul li").removeClass("in-call");
    $(".btm-list-lt #network_service").hide();
    $(".sighIn").addClass("in-call");
    $("#renderer").removeClass("sighIn-image");
    $("#renderer").addClass("incall-renderer");
    showHideRaiseHand(true)
    isInCall = true;
}

disableGeneralSettings =()=>{
    $(".cpuProfileFrame").addClass('disabled');
    $(".networkSignalingFrame").addClass('disabled')
    $(".NetworkMediaFrame").addClass('disabled')
    $(".autoReconnectFrame").addClass('disabled')
    $(".autoConnectFrame").addClass('disabled')
}

participantCallBack = (status , data)=>{
    switch(status){
        case Status.JOINED:
        participantList = getParticipantList();
        const confernceMode = getConfernceMode();
        $("#participant-count").text(participantCountLabel);
        data.IsLocal().then(function(isLocal) {
            const listItemPayLoad = participantDetails(participantList[data.userId])
            getParticipantName(data, function(name) {
                listItemPayLoad.participantName = name;   
                $("#participant-list-ul").append($(participantListItemStyle(listItemPayLoad)))
            });
         });
        if(isModerationAllowed())
        {
           // $('#raisehand_id').parent().hide();
        }
        else{
           // $('#raisehand_id').parent().show();
        }
        updateChatUI()
        if(hardMuteCamAll){
            mutedParticipantCams.push(data.userId)
        }
        if(hardMuteMicAll){
            mutedParticipantMics.push(data.userId)
        }
        data.IsLocal().then(function(isLocal) {
            const listItemPayLoad = participantDetails(participantList[data.userId])
            getParticipantName(data, function(name) {
                let participatnObject = {...participantList[data.userId]};
                participatnObject.clearenceType =listItemPayLoad.clearanceType 
                $(".roomControlTable").append($(renderModerationParticpantListItem(participatnObject , confernceMode)));
                $("#moderation-participant-list-header-particpant-count").html(participantCountLabel());
                $("#remove-invite-"+data.userId).trigger("click");
            });
         });

        break;
        case Status.LEAVE:
        participantList = getParticipantList();
        $("#participant-count").text(participantCountLabel);
        $("#participant-"+ data.userId.toString()).remove();
        updateChatUI();
        $(".roomControlTable #"+ data.userId.toString()).remove();
        $("#moderation-participant-list-header-particpant-count").html(participantCountLabel());
        break;
        case Status.LOUDEST_CHANGED:
        updateChatUI();
        break;
    }
}


const registerAudioVideoSettingPageListener = () => {

}

const bindChatParticipantList = (userId,id,name,status) => {
    const $li = $("<li>" , {id:`user_${userId}`, class:"active-participants" });
    const isLocalUser = isLocaUser(userId);
    if(isLocalUser){
        return ;
    }
    
    $li.on("click",()=>{
        if(!isLocalUser)
            onSelectParticipant(id)
    })
    const $div = $("<div>", {class:"user-pic"})
    const $spanChar  =$("<span>",{text:getNameFirstChar(name)})
    $div.append($spanChar)

    const $spanName  =$("<span>",{text:name, class:"user-name" , title:name})
    $li.show(500);
    if(status === "InActive"){
        $li.attr("class","disabled")
        $spanName.text(`${name} <br /> Left the Conference`)
        setTimeout(() => {$li.hide()}, 1000);
        chatParticipants.delete(id)
    }
    $li.append($div,$spanName);
    $("#chatContainList").append($li)
}

const getParticipantListForChat = (searchKeyword='') => {
    const participantList  = getParticipantList();
    $('#chatContainList').html('');
     for(participant in participantList){
        const participantObj = participantList[participant];
        const {participantData} =participantObj;
        const {userId,id,name,status} = participantData;
        if(searchKeyword === '' || (name.toString().toLowerCase().indexOf(searchKeyword.toString().toLowerCase()) != -1) ){
            bindChatParticipantList(userId,id,name,status);
        }
     }
}


function renderParticiapant(){
    getParticipantListForChat();
}
const isChatWindowOpen =()=>{
    return $("#txtChatInput").is(":visible")
}
updateMessageCount = () =>{
    if(chatData.chat.group.messages)
    {
        let data = chatData.chat.private.messageCount;
        for(const index in data)
        {
            let userID  = chatParticipants.get(index).userId;
            let count = data[index];
            if(count > 0)
            {
                $('#chatContainList #user_'+userID +' .user-pic').prepend('<small class="msg-count">'+count+'</small>');
            }
            else{
                $('#chatContainList #user_'+userID).find('.msg-count').remove();
               
            }
        }
        const groupMessageCount = chatData.chat.group.messageCount;;

        if(groupMessageCount >0){
            $("#group-msg-count").text(groupMessageCount.toString());
            $("#group-msg-count").show();
        }
        else{
            $("#group-msg-count").hide();
        }

        showUnreadMessageCounter(getTotalUnreadMessages());
       
    }
}


const showUnreadMessageCounter = (unreadMessageCount) => { 
    if(unreadMessageCount > 0){
        $("#unread-message-counter").show();
        $("#unread-message-counter").text(unreadMessageCount);
    }
    else{
        $("#unread-message-counter").hide();
    }
   
}

function onSearchParticipant(event){
    if($.trim(event.target.value) === '') renderParticiapant();
    getParticipantListForChat($.trim(event.target.value));
}

function registerChatClickEvent(){
    $("#chat-close").on("click",function(){
        onCloseChat();
        $(".cancel-white").trigger("click")
        $(".right-section-open").removeClass("right-section-open")
    })
    $('#searchInput').on('keyup',onSearchParticipant)
   	$('.group-chat').on('click',onOpenGroupChat);
}
function disableChat()
{
    let pid = $('#participantId').val();
    let participant = chatParticipants.get(pid);
    $('.left-message').text(participant.name +' left the confrence. <br/>You are not able to send messages.');
    $('.group-chat-footer .chatInput').hide();
    $('.group-chat-footer .left-message').show();
}

function enableChat()
{
    $('.group-chat-footer .left-message').hide();
    $('.group-chat-footer .chatInput').show();
    $('.left-message').html('');
}

function registerPrivateChatClickEvent(){
    $(".private-chat-close").on('click',onLoadChat);
    $('#btnSendMsg').on('click',()=>{
        let pid = $('#participantId').val();
        let msg = $('#txtChatInput').val();
        if(!onlySpaces(msg)){
            SendPrivateMessage(pid, msg);
        }
       
    });
    $("#txtChatInput").on('keydown',(event)=>{
        if(event.which == 13 )
        {
            let pid = $('#participantId').val();
            let msg = $('#txtChatInput').val();
            if(!onlySpaces(msg)){
                SendPrivateMessage(pid, msg);
            }
        }
    })
}

function registerGroupChatClickEvent(){
    $(".group-chat-close").on('click',onLoadChat);

    $('#btnSendMsg').on('click',()=>{
        let msg = $('#txtChatInput').val()
        if(!onlySpaces(msg)){
            SendGroupMessage(msg);
        }
    });
    $("#txtChatInput").on('keydown',(event)=>{
        if(event.which == 13 )
        {
            let msg = $('#txtChatInput').val()
            if(!onlySpaces(msg)){
                SendGroupMessage(msg);
            }
            
        }
    })
}

function onlySpaces(str) {
    return /^\s*$/.test(str);
  }

showRightBlock = () =>{
    $('#renderer').addClass('leftblock');
    $('#right-section').addClass('rightblock');
}

hideRightBlock = () =>{
    $('#renderer').removeClass('leftblock');
    $('#right-section').removeClass('rightblock');
    $('#participant_id, #chat_id').parent().removeClass('active');
    $('#participant_id').attr('src','./images/icon_participants.svg');
    $('#chat_id').attr('src','./images/icon_chat.svg');
    $(".close_feccControl").trigger("click")
}
const messageBubbles = (payload) => {
    const {name,body,timeStamp} = payload;

    const $div1 = $("<div>" , {class:"message-box-holder user-message"});
    const $div2 = $("<div>" , {class:"user-message-outer"});
    const $div3 = $("<div>" , {class:"user-pic"});
    const $span  = $("<span>" , { text:getNameFirstChar(name)})
    $div3.append($span);

    const $div4  = $("<div>" , {class:"user-message-con"});
    const $div5  = $("<div>" , {class:"message-sender"})
    const $anchor = $("<a>" , {text:name , title:name});
    $div5.append($anchor)

    const $div6 = $("<div>" , {class:"message-box message-partner" , text:body})
    const $div7 = $("<div>" , {class:"chat-time" , text:timeStamp});
    $div4.append($div5,$div6,$div7);
    $div2.append($div3,$div4)
    $div1.append($div2);

    return $div1;
}
const messageBubblesSelf = (payload) => {
    const {body, timeStamp} = payload;
    const $div1 = $("<div>" , {class:"message-box-holder self-message"});
    const $div2 = $("<div>" , {class:"message-box" , text:body});
    const $div3 = $("<div>" , {class:"chat-time" , text:timeStamp});
    $div1.append($div2,$div3);
    return $div1
}

const bindChatBubbleList = (type,participantId) => {
    // type either private/gruop
    const messages = chatData.chat[type].messages;
    let messagesData = (type === "private") ?  messages[participantId]:messages;
    if(messagesData){
     const bubbleList =  $.map(messagesData,function(item,i){
            const payload = {
                name:item.userName,
                body:item.body,
                timeStamp:item.timestamp
            }
            return item.senderType === "" ? messageBubblesSelf(payload) :  messageBubbles(payload);
        })
        if(type === "private"){
            $('#private-chat-list').html('');
            $('#private-chat-list').append(bubbleList)
            const scrollHeight = document.getElementById("private-chat-list").scrollHeight;
            $('#private-chat-list').animate({scrollTop:scrollHeight},500)
        }
        else{
            $('#group-chat-list').html("")
            $('#group-chat-list').append(bubbleList)
            const scrollHeight = document.getElementById("group-chat-list").scrollHeight;
            $('#group-chat-list').animate({scrollTop:scrollHeight},500)
        }
    }
}

function updatePrivateChatMessagesWindow()
{
    bindChatBubbleList("private",$('#participantId').val())
}

updatePrivateChatStatus = () =>{
    let participant = chatParticipants.get($('#participantId').val())
    if(participant.status == 'Active')
    {
        enableChat();
    }else{
        disableChat();
    }
}

updateGroupChatMessagesWindow = () =>{
 bindChatBubbleList("group",null);
}

updateGroupChatText =() =>{
    let participantCount = GetParticipantCountFromSDK();
    if(participantCount > 0)
        $('#group-pcount').text(participantCount >1 ? participantCount+" Participants": participantCount+" Participant");
    else
        $('#group-pcount').text('');
}

function clearChatInput()
{
    $('#txtChatInput').val('');
}

function updatePrivateChatContain(username)
{
    $('.chat-full-name').text(username);
    $('.chat-full-name').attr("title",username);
    $('#chat-icon-letter').text(getNameFirstChar(username))
}

function registerRaisedPopUpClickEvent(particpantId)
{
    $('#btnRaiseHandSubmit').click(()=>{
        if($('input[type=radio][name="radioRaisedHand"]:checked').val() == 'approve')
        {
            approveRaisedHand(particpantId);
            if($(`button#mc-${particpantId}[value='hard-mic-mute']`).hasClass("active")){
                $(`button#mc-${particpantId}[value='hard-mic-mute']`).removeClass("active")
                onClickHardUnmuteMic(particpantId)
            }
        }
        else
        {
            dismissRaisedHand(particpantId);
        }
        $(".roomControlTable #" +particpantId).find(".fa-unraise-hand")[0].style.display = "none";
        $('.vidyoConnecto-popup').addClass('popup-hide');
    });
   
    $('#btnRaiseHandCancel').click(()=>{
        $('.vidyoConnecto-popup').addClass('popup-hide');
    });
    $('.fa-close-gray.popup').click(()=>{
        $('.vidyoConnecto-popup').addClass('popup-hide');
    })
}

async function showInfoPopUp(title = '', content = '', funcBeforeClose= ()=>{})
{
    return await $.get('generalPopup.html', function(html){
        $('.mainbody').prepend(html);
        if(title !=''){ $('#general-popup-title').html(title); }
        if(content !=''){ $('#general-popup-content').html(content); }
        $('.general-popup-close').on('click',()=>{
            funcBeforeClose();
            $('#general-popup').remove();
        });
    });
}

function renderUserSearchResult(usersData)
{
    $('#invite-participant-count').text('('+usersData.length+')');
    $('.invitedParticipantContainer').remove();
    for(let index in usersData)
    {
        const alreadyInvited  = IsInvited(usersData[index].id)
        let participantStatus = '';
        let checkboxStatus = '';
        if(usersData[index].presenceState == 'VIDYO_CONTACTINFOPRESENCESTATE_Available' )
        {
            participantStatus = 'Online';
        }
        else {
            participantStatus = 'Offline';
            checkboxStatus = 'disabled';
        }

        html = `<div class="inviteParticipantItem invitedParticipantContainer ${participantStatus}">
            <div class="invite-col-name">${usersData[index].name}</div>
            <div class="invite-col-status">${participantStatus}</div>
            
            <div class="invite-col-check">
                <label class="checkBox">
                    <input name="invite_participant_list" type="checkbox" ${checkboxStatus} value="${index}" />
                    <span class="checkmark"></span>
                </label>
            </div>
            <div class="invite-col-sent">
            ${alreadyInvited?'Invite Sent':''}
            </div>

           

        </div>`;
        $('.inviteParticipantList').append(html);
    }
}

const IsInvited = (userId) => { 
   return invitedParticipantList.filter(item=> {
        return item.id === userId
    }).length
 }

function addInviteList(inviteeIdObj)
{
    let inviteParticipantCount = 0;
    for(index in contactsObjList)
    {
        if(contactsObjList[index].id == inviteeIdObj)
        {
            inviteParticipantCount+=1;
            const invitedParticipant ={
                name:contactsObjList[index].name,
                id:contactsObjList[index].id
            }
            if(!IsInvited(invitedParticipant.id)){
                addInviteListItem(invitedParticipant);
                updateCallInvitedList({...invitedParticipant});
            }
            
        }
    }
    closeInvitePopup();
}

const addInviteListItem = (inviteDetails) => { 

    const wrapper = $("<div>",{class:"invitedParticipant"});
    const name = $("<div>",{class:"name", html:inviteDetails.name});
    const removeCta = $("<div>",{class:"remove-cta", html:"&times;" });
    wrapper.attr("data-pid",inviteDetails.id)
    wrapper.append(name,removeCta);
    removeCta.on("click",function(){
        const userId = $(this).parent(".invitedParticipant").attr("data-pid");
        updateCallInvitedList({id:userId},true);
        $(this).parent(".invitedParticipant").remove();
    })
    $("#invitedParticipantList").append(wrapper);
    
}

 const updateCallInvitedList = (participantObject, isRemove) => {
   if (!isRemove) {
    invitedParticipantList.push(participantObject);
   } else {
     var filterdList = invitedParticipantList.filter((item) => {
       return item.id !== participantObject.id;
     });
     invitedParticipantList = [...filterdList];
   }
   $("#invitedParticipantCount").text(invitedParticipantList.length)
 };

 const RepaintInvitedList = () => { 
    invitedParticipantList.forEach(item=>{
        addInviteListItem(item);
    })
    $("#invitedParticipantCount").text(invitedParticipantList.length)
 }

function registerInviteParticipantPopupUIEvents()
{

    $('#btnSendInvite').on('click', ()=>{
        $("input[type='checkbox'][name='invite_participant_list']:checked").each( function() {
            let index = $(this).val();
            let contactsObj =  contactsObjList[index];
            let message = 'please join the invite';
            sendInvite(contactsObj, message, inviteResultCallBack)
        })
    });
    $('#btnInviteSearch').on('click', ()=>{
        let searchText = $('#searchUser').val();
        searchUserDetails(searchText);
    });
    $('.fa-close-gray.participantClose').on('click', ()=>{ closeInvitePopup(); });


}

function registerFECCControlClickEvent(camera, isLocalCamera) {

    $('.arrow-up').on('click',()=>{
        moveCamera(camera, 'UP', isLocalCamera);
    })
    $('.arrow-right').on('click',()=>{
        moveCamera(camera, 'RIGHT', isLocalCamera);
    })
    $('.arrow-left').on('click',()=>{
        moveCamera(camera, 'LEFT', isLocalCamera);
    })
    $('.arrow-down').on('click',()=>{
        moveCamera(camera, 'DOWN', isLocalCamera);
    })
    $('.zoom-in').on('click',()=>{
        moveCamera(camera, 'ZOOM_IN', isLocalCamera);
    })
    $('.zoom-out').on('click',()=>{
        moveCamera(camera, 'ZOOM_OUT', isLocalCamera);
    })

    $('.close_feccControl').on('click',function(){
        closeFeccControl(isLocalCamera)
        $(".activeFeccUserId").removeClass("activeFeccUserId");
    });

    $("#sel-cam-preset").on("change",function(){
        const selectedPresetId = $(this).val();
        const feccUserId = $(".activeFeccUserId").eq(0).attr("id");
        userPresetMap.set(feccUserId, selectedPresetId);
        activateRemoteCameraPreset(camera,selectedPresetId)
    })
}
function hideCameraPresetUI(){
    $("#cam-preset").hide();
}
function getUserForPresetList(){
    return $(".activeFeccUserId").eq(0).attr("id").split("fecc-")[1];
}
function setSelectedUserPreset(){
    const feccUserId = $(".activeFeccUserId").eq(0).attr("id");
    if(userPresetMap.get(feccUserId)){
        $("#sel-cam-preset").val(userPresetMap.get(feccUserId))
    }
    
}
function addPresetToList(){
   let presetList =  getActiveUserPresetList(getUserForPresetList());
    $("#sel-cam-preset").html("")
    presetList.forEach(element => {
        let $opt = $("<option>", {val:element.index, text:element.name});
        $("#sel-cam-preset").append($opt)
    });
}


function resetShareIcon(){
    $('#share_id').attr('src','./images/icon_share.svg');
}
function RegisterLocalShareEventListener()
{

    // all application share - click handler
    $('#share_all_application').on('click',function(){
        loadAllApplicationShareContent();
    });

    // all monitor share (screens) -  click handler
    $('#share_screen').on('click',function(){
        let localMonitorShareList = GetLocalMonitorShareList();
        $('#share-screen-content').html('');
        for(let index in localMonitorShareList)
        {
            localMonitorShareSelected(localMonitorShareList[index], SHARE_PREVIEW_ICON_WIDTH, SHARE_PREVIEW_ICON_HEIGHT);
        }
    })

    //app share - click handler
    $(document).on('click',".content-share-list",function(){
        $(".content-share-list").removeClass('active');
        $(this).addClass('active');
    });
   
    // frame rate - change handler
    $("input[name='shareframe_rate']").on("click",function(){
        const frameRate = $(this).val();
        $("#content-share-tooltip").removeClass("highframerate");
        $("#content_share_audio").prop("checked",false)
        $("#content_share_audio").prop("disabled",true)
        $("#tooltip-content").html("Recommended for sharing static documents, presentations, images etc.")
        if(frameRate !== "framerate-normal"){
         $("#content-share-tooltip").addClass("highframerate");
         $("#content_share_audio").prop("disabled",false)
         $("#tooltip-content").html("Recommended for sharing videos.")
        }
    })

    $(".share-right-header").mouseover(function(){
        $("#content-share-tooltip").show();
    });
    $(".share-right-header").mouseout(function(){
        $("#content-share-tooltip").hide();
    });

    $("#share-screen-content").mouseover(function(){
        $("#content-share-tooltip").hide();
    });
    
    

    // close button - click handler
    $('#close-share-popup').on('click',function(){
        closeSharePage()
        if(windowShared || monitorShared){
            $('#share_id').attr('src','./images/icon_share_active.svg');
        }
        else{
            $('#share_id').attr('src','./images/icon_share.svg');
        }
    });

}
function loadAllApplicationShareContent()
{
    let localWindowShareList = GetLocalWindowShareList();
    $('#share-screen-content').html('');
    for(let applicationName in localWindowShareList)
    {
        localWindowShareSelected(applicationName, SHARE_PREVIEW_ICON_WIDTH, SHARE_PREVIEW_ICON_HEIGHT);
    }
}
function updateLocalWindowShareList(items)
{
    $('#localWindowShareList').html('');
    for(applicationName in items)
    {
        let objItem = items[applicationName];
        let li = `<li class="content-share-list" onClick="showSelectedPreview('${applicationName}')">
        <img id="lwi-${getFirstElementOfApplication(objItem).objId}" src=""/>
        <span>${applicationName}</span> <span class='sharing-badge' data-app='${applicationName}'>Sharing</span> </li>`;
        $('#localWindowShareList').append(li);
        updateWindowShareIcon(objItem, SHARE_ICON_WIDTH,SHARE_ICON_HEIGHT);
    }
    updateSharingBadge();
}

function showSelectedPreview(applicationName)
{
    $('#share-screen-content').html('');
    localWindowShareSelected(applicationName)
}

function setShareMenuActive(menuId)
{
    $('.content-share-list').removeClass('active');
    $('#'+menuId).addClass('active');
}

function updateLocalWindowIcon(objId, base64Img)
{
    $('#lwi-'+objId).attr("src",base64Img);
}

function updateLocalWindowPreviewIconImage(objId, previewIcon, applicationName, title, sharePreviewState)
{
    let htmlContent='';
    if(previewIcon == null){
        console.error('Local Window share preview status ',sharePreviewState)
        return;
    }
    switch(sharePreviewState)
    {
        case "VIDYO_LOCALWINDOWSHARESTATE_Ok":
        case "VIDYO_LOCALWINDOWSHARESTATE_NotVisible":
            let activeShared = "";
            if(currentShareContentObjId == objId)
            {
                activeShared = " activeShared";
            }
            htmlContent =
            `<div id="${objId}" class="screen-area-row">
                <div class="screen-name app-win">
                <span class='active-app-name'>${applicationName}</span> 
                <span class='active-app-details'>${title}</span></div>
                <div class="scren-thubnail${activeShared}"><image src="${previewIcon}" alt=""/>
                    <button class="share${activeShared}" onClick="sendShareContent('${objId}','${applicationName}')">${activeShared !== "" ? "Stop Share" : "Share"}</button>
                </div>
            </div>`;
        break;
        case "VIDYO_LOCALWINDOWSHARESTATE_Minimized":
            htmlContent = `<div class="screen-area-row">
              <div class="screen-name app-win">
              <span class='active-app-name'>${applicationName}</span>
              <span class='active-app-details'>${title}</span>
              </div>
            <div class="scren-thubnail">
            This application window is currently minimized. Minimized windows cannot be shared or previewed. Please restore this window to a visible size if you want to share it.
            </div>
            </div>`;
        break;
        default:
            console.error('Local Window share preview status ',sharePreviewState)
            return;
    }
    $('#share-screen-content').append(htmlContent);
    updateShareScreenUI()
 
}

function updateLocalMonitorPreviewIconImage(objId, previewIcon, sharePreviewState)
{
    let htmlContent='';
    if(previewIcon == null){
        console.error('Local Monitor share preview status ',sharePreviewState)
        return;
    }
    let count = $('.monitor-win').length + 1;
    let monitor = 'Monitor ' + count;
    switch(sharePreviewState)
    {
        case "VIDYO_LOCALMONITORSTATE_Ok":
        case "VIDYO_LOCALMONITORSTATE_NotVisible":
            let activeShared = "";
            if(currentShareContentObjId == objId)
            {
                activeShared = " activeShared";

            }
            htmlContent =
            `<div id="${objId}" class="screen-area-row">
                <div class="screen-name monitor-win">${monitor}<br/>All applications on this monitor will be visible to other participants</div>
                <div class="scren-thubnail${activeShared}"><image src="${previewIcon}" alt=""/>
                    <button class="share${activeShared}" onClick="sendShareContent('${objId}')">${activeShared !== "" ? "Stop Share" : "Share"}</button>
                </div>
            </div>`;
        break;
        default:
            console.error('Local Monitor share preview status ',sharePreviewState)
        return;
    }
    $('#share-screen-content').append(htmlContent);
    updateShareScreenUI();
}

const updateShareScreenUI = () => {

    const activeItem = $(".content-share-list.active").eq(0).attr("id");
    if(activeItem === "share_all_application"){
    }
    else if (activeItem === "share_screen"){
        $(".app-win").closest('div.screen-area-row').hide();
    }
    else{
        let selectedAppName =  $(".content-share-list.active").eq(0).find("span").eq(0).html(); 
        $(".active-app-name").each(function(){
            let selectedAppWin = $(this).html()
            if(selectedAppName.toLowerCase() !== selectedAppWin.toLowerCase()){
                $(this).closest('div.screen-area-row').hide();
                $(".monitor-win").closest('div.screen-area-row').hide();
            }
        })
    }

 }

function sendShareContent(objId, applicationName = '')
{
    if($("#"+objId).find(".scren-thubnail").hasClass("activeShared"))
    {
        if(applicationName!='')
        {
            windowShared = false;
            stopShareApplicationContent();
        }
        else
        {
            monitorShared = false
            stopShareMonitorContent();
        }
    }
    else{

        if(currentShareContentObjId != "")
        {
            if(applicationName!='')
            {
                windowShared = false;
                stopShareApplicationContent();
            }
            else
            {
                monitorShared = false
                stopShareMonitorContent();
            }
        }
        const frameRate = $("input[name='shareframe_rate'][type='radio']:checked").val();
        const audioShare  = $("#content_share_audio").is(":checked");
        const contentShareOptions ={
            enableAudio : audioShare,
            enableHighFramerate : (frameRate === "framerate-high")
        }
        if(applicationName!='')
        {
            windowShared =true;
            shareApplicationContent(applicationName, objId, contentShareOptions);
        }
        else
        {
            monitorShared = true
            shareMonitorContent(objId, contentShareOptions);
        }
    }
}

function hideConnectingMessage (){
    showSnackBar("info", "Connected !");
}

function showCallErrorMessage (reason){
    showSnackBar("info", reason);
}
const disableAudioShare=(isDisabled)=>{
    $("#audio-share-check").css({"visibility":"hidden"})
    if(!isDisabled){
        $("#audio-share-check").css({"visibility":"visible"})
    }
}
function shareDoneUI(objId, applicationName)
{
    currentShareContentObjId = objId;
    currentShareContentApplicationName = applicationName;
    $("#"+objId).find(".scren-thubnail").addClass("activeShared");
    $("#"+objId).find(".scren-thubnail button").addClass("activeShared");
    $("#"+objId).find(".scren-thubnail button").text("Stop Share");
    updateSharingBadge();
}

function StopShareUI()
{
    currentShareContentObjId = "";
    currentShareContentApplicationName = "";
    $(".scren-thubnail").removeClass("activeShared");
    $(".scren-thubnail button").removeClass("activeShared");
    $(".scren-thubnail button").text("Share")
    updateSharingBadge();
    
}

function updateSharingBadge(){
    $(".sharing-badge").hide();
   if(currentShareContentApplicationName!==""){
       $(".sharing-badge").each(function(){
           if(currentShareContentApplicationName === $(this).data("app")){
               $(this).show();
           }
       })
   } 
}

function registerAnalyticsConfigurationEvents(serviceProvider) {
    $('#settingClose').on('click', onCloseSetting);
    $('#backToSetting').on('click', onBackToSetting);
  
    $("#btn-cancel-tracking-id").on('click', function(){
        if($("#analytics-service-tracking-id").val() === ""){
            return ;
          }
        onDeselectAnalyticsService().then(()=>{
            $("#analytics-service-tracking-id").val("")
            notifyAnalytics("Removed analytics service provider.","success")
        }).catch(()=>{
            notifyAnalytics("Something went wrong.","error")
        })
    });
    $('.btnInitializeAnlaytics').on('click', function(){
        initializeAnalytics(serviceProvider);
    });
};
const loadConfigView = (analyticsServiceProvider) => {
    if(analyticsServiceProvider === "VIDYO_CONNECTORANALYTICSSERVICETYPE_VidyoInsights"){
        $("#analytics-title").html("VidyoInsights Analytics");
        $("#analytics-url-caption").html("IP Address or URL")
        $("#analytics-service-tracking-id").val(analyticsServerURL)
        $(".analytics-events-table").hide();
        $(".analytics-events-table").prev("label").hide();
    }
    else if(analyticsServiceProvider === "VIDYO_CONNECTORANALYTICSSERVICETYPE_Google"){
        $("#analytics-service-tracking-id").val(analyticsTrackingID)
    }
}

const initializeAnalytics = (serviceProvider) => {
    let vidyoInsightUrl = "";
    let googleTrackingId ="";
    if(serviceProvider === "VIDYO_CONNECTORANALYTICSSERVICETYPE_VidyoInsights"){
        vidyoInsightUrl=$("#analytics-service-tracking-id").val()
      }
      else if(serviceProvider === "VIDYO_CONNECTORANALYTICSSERVICETYPE_Google"){
        googleTrackingId=$("#analytics-service-tracking-id").val()
      }
      else {

      }
      if($("#analytics-service-tracking-id").val() === ""){
        $("#analytics-service-tracking-id").focus()
        notifyAnalytics("Enter analytics service provider URL or Tracking Id.","error")
        return ;
      }
      onSelectAnalyticsService(serviceProvider,vidyoInsightUrl,googleTrackingId).then(()=>{
        notifyAnalytics("Analytics service provider is set.","success")
      }).catch(()=>{
        notifyAnalytics("Something went wrong.","error")
      })
}

const notifyAnalytics = (message,cls) => {
    const small = $("<span>" , {id:"anlaytics-notify", html:message, class:cls})
    $(".analytics-url-bar").append(small)
    setTimeout(() => {
        small.remove();
    }, SOFT_MUTE_DELAY);
}

const addAnalyticsConfig = (serviceProvider) => {
    let configBtn = $("<button>",{class:"configure-analytics-service" , html:"Configure >"})
    configBtn.on("click",function(){
        loadAnalyticsConfigEvent(serviceProvider)
    })
    $("input[value='"+serviceProvider+"']").parent("div.radio").append(configBtn);
}


const loadAnalyticsConfigEvent = (analyticsServiceProvider) => {
    loadAnalyticsConfiguration(analyticsServiceProvider);
}
function validateModerationPin (){
    const $moderationPin = $("#moderatorPINrequestID");
    const $errorCaption = $("<small>" , {html:"Moderation PIN Can't be empty." , class:"error-caption"});
    $(".error-caption").remove();
    $('.moderator-pin-validation-warning').hide();
    $moderationPin.removeClass("has-error");

    if($moderationPin.val() === "")
    {
        $moderationPin.addClass("has-error");
        $moderationPin.after($errorCaption);

        return;
    }

    onSubmitModeratorPin($moderationPin.val());
}
function registerModeratorPinModalEvents(){
    $('#btn-cancel-moderator-pin').on('click', onCancelModeratorPin);
    $('#btn-submit-moderator-pin').on('click', validateModerationPin);
}

function onDisplayValidationPinMsg() {
    $('#moderatorPINrequestID').val("");
    $('.moderator-pin-validation-warning').show();
}

function onHideValidationPinMsg() {
    $('#moderatorPINrequestID').val("");
    $('.moderator-pin-validation-warning').hide();
}
// About setting page
const RegisterAboutEvents = () => { 
    $("#settingClose").on("click",onCloseSetting);
    $("#btnGitHub, #btnDocs").on("click",function(e){
        e.preventDefault();
        const link = $(this).val();
        electron.shell.openExternal(link);
    })
 }
const updateSDKVersion = (version) => { 
    $("#sdk-version").text(version)
 }
function updateRecordingStatus(status) {
    switch(status)
    {
        case Status.RECORD_START:
        case Status.RECORD_RESUME:
            $("#start-record").addClass("fa-start-recording-red");
            $("#start-record").removeClass("fa-start-recording");
            $("#pause-record").addClass("fa-pause-recording-pressed");
            $("#pause-record").removeClass("fa-pause-recording");
            $("#stop-record").addClass("fa-stop-recording-pressed");
            $("#stop-record").removeClass("fa-stop-recording");

        break;
        case Status.RECORD_PAUSE:
            $("#start-record").addClass("fa-start-recording");
            $("#start-record").removeClass("fa-start-recording-red");

            $("#pause-record").addClass("fa-pause-recording");
            $("#pause-record").removeClass("fa-pause-recording-pressed");

            $("#stop-record").addClass("fa-stop-recording-pressed");
            $("#stop-record").removeClass("fa-stop-recording");

        break;
        case Status.RECORD_STOP:
            $("#start-record").addClass("fa-start-recording");
            $("#start-record").removeClass("fa-start-recording-red");

            $("#pause-record").addClass("fa-pause-recording");
            $("#pause-record").removeClass("fa-pause-recording-pressed");

            $("#stop-record").addClass("fa-stop-recording");
            $("#stop-record").removeClass("fa-stop-recording-pressed");
    }
 }

 const addAnalyticsEventsOnUI = (eventsData) => {
    eventsData.forEach(element => {
        const {enable,eventAction,eventCategory,categoryName,actionName} = element;
        const togleCheckBox = (state) => {
            const label  =$("<label>",{class:"checkbox"})
            const span =$("<span>");
            const input  =$("<input>",{type:"checkbox",checked:state , class:"chk-analytics-event"})
            input.on("change",function(){
                onToggleAction(eventCategory,eventAction,$(this).is(":checked"))
            })
             
            label.append(input,span);
            return label;
        }

        let tr = $("<tr>")
        let td1 = $("<td>",{class:"table-cell-align-left" , html:categoryName})
        let td2 = $("<td>",{class:"table-cell-align-left", html:actionName})
        let td3 = $("<td>",{class:"table-cell-align-center" })
        td3.append(togleCheckBox(enable));

        tr.append(td1,td2,td3);
        $("#analytics_action_items").append(tr)

    });
 }



    //
    // $('#element').donetyping(callback[, timeout=1000])
    // Fires callback when a user has finished typing. This is determined by the time elapsed
    // since the last keystroke and timeout parameter or the blur event--whichever comes first.
    //   @callback: function to be called when even triggers
    //   @timeout:  (default=1000) timeout, in ms, to to wait before triggering event if not
    //              caused by blur.
    // Requires jQuery 1.7+
    //
    ; (function ($) {
        $.fn.extend({
            donetyping: function (callback, timeout) {
                timeout = timeout || 1e3; // 1 second default timeout
                var timeoutReference,
                    doneTyping = function (el) {
                        if (!timeoutReference) return;
                        timeoutReference = null;
                        callback.call(el);
                    };
                return this.each(function (i, el) {
                    var $el = $(el);
                    // Chrome Fix (Use keyup over keypress to detect backspace)
                    // thank you @palerdot
                    $el.is(':input') && $el.on('keyup keypress paste', function (e) {
                        // This catches the backspace button in chrome, but also prevents
                        // the event from triggering too preemptively. Without this line,
                        // using tab/shift+tab will make the focused element fire the callback.
                        if (e.type == 'keyup' && e.keyCode != 8) return;

                        // Check if timeout has been set. If it has, "reset" the clock and
                        // start over again.
                        if (timeoutReference) clearTimeout(timeoutReference);
                        timeoutReference = setTimeout(function () {
                            // if we made it here, our timeout has elapsed. Fire the
                            // callback
                            doneTyping(el);
                        }, timeout);
                    }).on('blur', function () {
                        // If we can, fire the event since we're leaving the field
                        doneTyping(el);
                    });
                });
            }
        });
    })(jQuery);


const startCallHandler = () => { 

    const displayName = $("#startCall-displayName").val();
    $("#startCall-displayName").removeClass("has-error")
    $(".call-err").remove();
    if(displayName == ""){
        $("#startCall-displayName").addClass("has-error")
        $("#startCall-displayName").after("<span class='call-err'>Please enter your name</span>")
        return;
    }
    if(
        instantCallData.displayName !== "" && 
        instantCallData.roomkey !== "" && 
        instantCallData.portalUrl !== ""&&
        instantCallData.roomPin !== ""){
        updateInstantCallUI(true);
        startCallWithCredentials();
    }
    else{
       
        updateInstantCallUI(true);
        $.when(getInstantCallData()).done(function(){
            startCallWithCredentials();
        })

    }

 }

 const updateInstantCallUI = (isWaiting) => {
    if(isWaiting){
        $("#btnStartCall").prop("disabled",true)
        $("#btnStartCall").html("Connecting call..")
    }
    else{
        $("#btnStartCall").prop("disabled",false)
        $("#btnStartCall").html("Start call")
    }
  }


 const startCallWithCredentials = () => {
    const { roomKey,roomPin,portalUrl,displayName } = instantCallData;
    $("#portalAdress").val(portalUrl)
    $("#displayName").val(displayName);
    $("#roomkey").val(roomKey);
    $("#roompin").val(roomPin);

    $("#joincallid").trigger("click");
    $("#invite-info-popup").show();
    if(!isOverlayOpen){
        initOverlay('inviteContent',{...instantCallData});
    }
  }
  
  const getProtocolHandlerFlags = (protocolHandlerLink) => {
    const params = new URLSearchParams(protocolHandlerLink);
    const portal = params.has("portal") ? params.get("portal") : null;
    const roomKey = params.has("roomKey") ? params.get("roomKey") : null;
    const roomPin = params.has("roomPin") ? params.get("roomPin") : '';
    const displayName = params.has("displayName")
    ? ( params.get("displayName") == '' ? "Demo User" : params.get("displayName"))
    : "Demo User";
    const enableAutoReconnect = params.has("enableAutoReconnect")
      ? (params.get("enableAutoReconnect") === "1" ? true:false)
      : false;
      return {
          portal,
          roomKey,
          roomPin,
          displayName,
          enableAutoReconnect
      }
  };
  
  function joinFromLinkUI(protocolHandlerValues) {
    $("#btnSignInView").trigger("click");
    $(
      "#nav-view, #signInbutton, #input-portal, #input-roomkey ,  #input-roomPin ,  #displayNameId "
    ).hide();
    const { portal, roomKey, roomPin, displayName, enableAutoReconnect } =
      getProtocolHandlerFlags(protocolHandlerValues);
    if (portal && roomKey) {
      $("#portalAdress").val(portal);
      $("#displayName").val(displayName);
      $("#roomkey").val(roomKey);
      $("#roompin").val(roomPin);
      if (enableAutoReconnect) {
        $("#joincallid").bind("click", function () {
          RegisterReconnectEventListener();
          SetAutoReconnect(enableAutoReconnect);
          autoReconnect = enableAutoReconnect;
        });
      }
    } else {
      alert("Please provide valid portal and room key.");
    }
  }

const toggleRenderingClass = (state) => {
    if (state) {
      $("#renderer").addClass("rendering-active");
    } else {
      $("#renderer").removeClass("rendering-active");
    }
};
const checkIfPopupAvailable = () => {
  return $(".vidyoConnecto-popup, .popup-section").is(":visible");
};
const checkActiveRendering = () => {
  return $("#renderer").hasClass("rendering-active");
};
  $(document).ready(function(){
    $('.sighIn-container').bind("DOMSubtreeModified",function(){
        if(checkIfPopupAvailable() && checkActiveRendering()){
            hideRendering();
        }
    })
    electron.ipcRenderer.on('vidyo-join-link', (event, message) => {
        if(message && message.toString().indexOf("://join") >=0){
            const phVals = message.toString().split("vidyoconnector://join")[1];
            if(phVals.substring(0,2) === "/?"){
                phVals = phVals.substring(1)
            }
            joinFromLinkUI(phVals);
        }
    })

    window.onbeforeunload = (e) => {
        if($("#call-disconnect").is(":visible")){
            onCallDisconnectClick();
        }
        if(selectedBackgroundEffect !== "VIDYO_CONNECTORCAMERAEFFECTTYPE_None"){
            setNoneEffect();
            imagePath = null;
        }
        electron.ipcRenderer.send('app_quit');
    }    

    electron.ipcRenderer.on('update-viewmode',(e,options)=>{
        onViewStyleChange(ViewStyle[options.viewMode], options.participantCount)
        viewModeOptions.viewMode = options.viewMode;
        viewModeOptions.participantsLen = options.participantCount
        if(options.viewMode === 'GRID'){
            $("#grid-selection").attr("src",GRID_MODE_IMG)
        }
        else{
            $("#grid-selection").attr("src",THEATER_MODE_IMG)
        }
    })

    electron.ipcRenderer.on('overlay-hidden',(e,options)=>{
        isOverlayOpen = false;
    })
    
    electron.ipcRenderer.on('cameraControl-movement',(e,command)=>{
        OverlayCameraControl(command)
    })


  }) /// DOM Ready
