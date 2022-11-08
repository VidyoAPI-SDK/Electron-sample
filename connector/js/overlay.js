const electron = require("electron");
const { ipcRenderer } = electron;

const componentDetails = new Map();
componentDetails.set("selectView", "select-view");
componentDetails.set("cameraControl", "camera-control-wrapper");
componentDetails.set("inviteContent", "invite-content-wrapper");

$(document).ready(function () {
  const props = LoadView();
  RenderComponent(props);
});


const LoadView = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const component = urlParams.get("load-view");
  const optionsString = urlParams.get("default-options");
  const options = JSON.parse(optionsString);
  return {
    component,
    options,
  };
};

const RenderComponent = (prop) => {
  const { component, options } = prop;
  $("#component-wrapper").show();
  $(`#${componentDetails.get(component)}`).show();
  switch (component) {
    case "selectView":
      RenderComponent_SelectView(options);
      break;
    case "cameraControl":
      RenderComponent_CameraControl(options);
      break;
    case "inviteContent":
      RenderComponent_InviteContent(options);
      break;
  }
};

const RenderComponent_SelectView = (options) => {
  const { viewMode, participantsLen } = options;
  const MinParticipantCount = 1;
  const MaxParticipantCount = 16;
  let participantCount = participantsLen;
  let selectedViewMode = viewMode;
  // set default value on component load
  $("#participant-count").html(participantCount);
  $(`button[value='${viewMode}']`).addClass("active");

  // event handlers
  $("button[name='btn-viewmode']").on("click", function () {
    $("button.active").removeClass("active");
    selectedViewMode = $(this).val();
    SetViewMode(() => {
      $(this).addClass("active");
    });
  });

  $("button[name='btn-participantlength']").on("click", function () {
    if ($(this).val() === "less") {
      participantCount =
        participantCount > MinParticipantCount
          ? participantCount - 1
          : MinParticipantCount;
    } else {
      participantCount =
        participantCount < MaxParticipantCount
          ? participantCount + 1
          : MaxParticipantCount;
    }
    $("#participant-count").html(participantCount);
    SetViewMode(() => {});
  });

  const SetViewMode = (onSuccess) => {
    ipcRenderer
      .invoke("set-viewmode", selectedViewMode, participantCount)
      .then((res) => {
        onSuccess();
      })
      .catch((e) => {
        console.error("Error SetViewMode : ", e);
      });
  };
};

const RenderComponent_CameraControl = (options) => {
  $("#presets-control").hide();
  const {panTiltHasNudge, panTiltHasContinuousMove, zooomHasContinuousMove, hasPresetSupport} = options
   $("#tab-bar > div.tab").on("click", function () {
    const control = $(this);
    if(control.hasClass("active")){
        return;
    }
    $("#tab-bar > div.tab").removeClass("active");
    $("#manual-control , #presets-control").hide();
    control.addClass("active")
    if(control.attr("id") === 'manual'){
        $("#manual-control").show();
    }
    else if (control.attr("id") === 'presets'){
        $("#presets-control").show();
        if(!hasPresetSupport){
          $("#lbl-notsupported").show();
        }
    }
    else{

    }
    
   });
  const timerInterval = 150;
   let recursiveTimer;
  $("#view-controller > .control, #zoom-in, #zoom-out  ")
    .mousedown(function () {
      const control = $(this);
      const direction = control.attr("id").split("-")[1];
      $("#center-dot").addClass(`move-${direction}`);
      recursiveTimer = setInterval(()=>{
        SendCameraControlCommand({direction, type:panTiltHasContinuousMove?"Start":"Nudge"});
        if(!$("#center-dot").hasClass("lock-absolute")){
          $("#center-dot").addClass("lock-absolute")
        }
      },timerInterval)
    })
    .mouseup(function () {
      const control = $(this);
      const controlCommand = {
        direction: control.attr("id").split("-")[1],
        type: $("#center-dot").hasClass("lock-absolute") ? "Stop" : "Nudge",
      };
      if(controlCommand.type === "Stop"){
        if(panTiltHasContinuousMove){
          SendCameraControlCommand(controlCommand);
        }
      }
      else{
        SendCameraControlCommand(controlCommand);
      }
      $("#center-dot").removeClass();
      $("#center-dot").addClass(`focus-point`);
      clearTimeout(recursiveTimer);
    });
};


const SendCameraControlCommand = (payload) => {
    const {direction, type} =  payload
  ipcRenderer
    .invoke("cameraControl-command", direction, type)
    .then((res) => {
       
    })
    .catch((e) => {
      console.error("Error SendCameraControlCommand : ", e);
    });
};

const RenderComponent_InviteContent = (data) => {
  const { inviteContent, joinLink, roomPin } = data;
  $("#invite-content").text(decodeURI(inviteContent));
  $("#join-link").text(decodeURI(joinLink));
  if (!roomPin) {
    $(".roompin-content").hide();
  } else {
    $("#roomPin").text(decodeURI(roomPin));
  }

  $("#btnCopy").on("click",function(){
    copyToClipboard('#join-link');
    $(this).text("Copied !");
    setTimeout(() => {
      $(this).text("Copy");
    }, 2000);
  })
};



function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}