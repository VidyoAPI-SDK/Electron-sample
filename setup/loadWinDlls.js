require("dotenv").config();
const REPO_DIRECTORY = process.env.CODEBASE_DIR;
const FRAMEWORKS_PATH = `${REPO_DIRECTORY}/Frameworks`;
const fs = require("fs-extra");
const copyRequiredWinDLLs = () => { 
    if(process.platform !== "darwin"){
        const requiredDlls = ["concrt140.dll", "msvcp140.dll", "vcruntime140.dll" , "vcruntime140_1.dll"]
        const outPath = process.env.npm_lifecycle_event === "load-win-dlls:git" ?  `./git_repo/` : `./`
        try{
            requiredDlls.forEach(dllFile => {
                fs.copySync(`${FRAMEWORKS_PATH}/ip-vid-lib-ms-win/Microsoft.VC140.CRT/x64/${dllFile}`, `${outPath}${dllFile}`);
            });
        }
        catch(e){
            console.error( `Error occured while copying DLLs ${requiredDlls.join(", ")}`)
        }
    }
 }

copyRequiredWinDLLs();
