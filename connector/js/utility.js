const utility = ()=>{
    async function loadTemplet (cointainerName , templatePath){
        return new Promise( (accept, reject)=>{
        $(cointainerName).load(templatePath, null, (res, status)=>{ 
            if(status=="success"){
                accept();
            }     
            else{
                reject();
            }
            });
        });
    }
    async function loadTempletWithId (templateCointainerId , templetePath){
        templateCointainerId = "#"+templateCointainerId;
        return await loadTemplet(templateCointainerId , templetePath);
    }

    async function loadTempletWithClassName (templateCointainerClassName , templetePath){
        templateCointainerClassName = "."+templateCointainerClassName;
        return await loadTemplet(templateCointainerClassName , templetePath);
    }

    async function unloadTemplet(cointainerName) {
        $(cointainerName).empty();
    }

    async function unLoadTempletWithClassName(templateCointainerClassName) {
        templateCointainerClassName = "." + templateCointainerClassName;
        await unloadTemplet(templateCointainerClassName);
    }

    function showModalBox(title,message){
        let $modalBox = $("<div>" , {class:"modal-box"});
        let $modalContent  = $("<div>",{class:"modal-content"});
        let $modalTitle  = $("<div>",{class:"modal-title" , html:title});
        let $modalMessage  = $("<div>",{class:"modal-message" , html:message});
        let $modalCTA  = $("<div>",{class:"modal-cta"});
        let $button = $("<button>" , {html:"Ok"});
        $button.on("click",function(){
            $modalBox.remove();
        })
        $modalCTA.append($button);
        $modalContent.append($modalTitle,$modalMessage,$modalCTA);
        $modalBox.append($modalContent);
        $("body").append($modalBox);
    }

    function showSnackBar(icon,message , persistant = false){
        let $snackBar = $("<div>",{id:"snack-bar" , class:"ui-snack-bar"});
        let $icon = $("<div>",{class:icon , id:"snack-bar-icon"});
        let $message = $("<div>", {html:message,id:"snack-bar-message"})
        let $close = $("<div>",{class:icon , id:"snack-bar-close"});
        const autoClose = (t) => { 
            $("#snack-bar-close").show();
            setTimeout(() => {
                $("#snack-bar").remove();
             }, 4000);
         }
        if($(".ui-snack-bar").length > 0){
            $("#snack-bar-icon").attr("class", icon);
            $("#snack-bar-message").html(message);
            if(persistant){
                $("#snack-bar-close").hide();
            }
            else{
                autoClose();
            }
        }
        else{
            $close.on("click",function(){
                $snackBar.remove();
            })
            if(persistant){
                $close.hide();
            }
            else{
                autoClose();
            }
            $snackBar.append($icon,$message,$close); 
            $("body").append($snackBar);
        }

    }

    return {
        loadTempletWithId : loadTempletWithId,
        loadTempletWithClassName : loadTempletWithClassName,
        unLoadTemplet: unloadTemplet,
        unLoadTempletWithClassName: unLoadTempletWithClassName,
        showModalBox,
        showSnackBar
    }
}