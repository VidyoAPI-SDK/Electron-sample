const superAgent = require("superagent");
const decompress = require("decompress");
const progress = require("progress-stream");
const fs = require("fs-extra");
const path = require("path");
const cliSpinners = require('cli-spinners');
const { createBanubaSymlinks } = require('./symlink-utils');
const BUCKET = "https://static-vidyodev-io.s3.amazonaws.com/latest/package/";
const JSBindings = "VidyoClient-JsSDK.zip";
let downloadCounter = 0;
const MAX_DOWNLOAD = 2;
let decompressedSDKDir = ""
const downloadBundle = [
    {
      platform: "win32",
      source: "VidyoClient-WinVS2017SDK.zip",
    },
    {
      platform: "darwin",
      source: "VidyoClient-macOSSDK-arm64.zip",
      arch: "arm64",
    },
    {
      platform: "darwin",
      source: "VidyoClient-macOSSDK-x86-64.zip",
      arch:"x64"
    },
  ];

const getSDKBundleByPlatform = () => {
    const {platform} = process;
    const {npm_config_arch:arch} = process.env;
    const files = downloadBundle.filter(function(item){
        if(platform === "darwin")
        {
            // Determine target architecture: use npm_config_arch if specified, otherwise detect host arch
            // Normalize x86_64 to x64 to match downloadBundle.arch values
            const normalizedArch = arch === 'x86_64' ? 'x64' : arch;
            const targetArch = normalizedArch || (process.arch === 'arm64' ? 'arm64' : 'x64');

            if(targetArch === 'arm64'){
                decompressedSDKDir = "VidyoClient-OSXSDK-arm64";
                return item.platform === platform  &&  item.arch === "arm64";
            }
            else{
                decompressedSDKDir = "VidyoClient-OSXSDK-x86-64";
                return item.platform === platform  &&  item.arch === "x64";
            }
        }
        else
        {
            return item.platform === platform 
        }
    })
    return files.length===1 ?  files[0].source: null;
}

const downloadHandler = async (source, destination) => {
    var str = progress({
        time: 17 /* ms */
    });
    let i =0;
    downloadCounter++;

    str.on('progress', function(progress) {
        const {frames} = cliSpinners.material;
        console.clear();
        console.log(`${frames[i = ++i % frames.length]} Downloading file ${downloadCounter} of ${MAX_DOWNLOAD} `)
    });

    return new Promise(async (resolve,reject)=>{
        var stream = fs.createWriteStream(destination);
        superAgent.get(source).on('progress',function(e){
        }).pipe(str).on('error',function(){
            reject()
        }).pipe(stream).on('finish',function(){
            resolve();
        })
    })
}

const downloadFiles = () => {
// download javascript bindings...
    const jsBindingsLink = `${BUCKET}${JSBindings}`
    const jsBindingsSaveTo = `./connector/lib/${JSBindings}`
    const jsBindingRequest = downloadHandler(jsBindingsLink,jsBindingsSaveTo);
// download sdk bundle...
    const sdkFileName = getSDKBundleByPlatform();
    const sdkSaveTo = `./${sdkFileName}`;
    const sdkBundleRequest = downloadHandler(`${BUCKET}${sdkFileName}`,sdkSaveTo);
    Promise.all([jsBindingRequest, sdkBundleRequest]).then(()=>{
        console.log("Download Completed!");
        decompressFiles();
    }).catch(e=>{
        console.error(e)
    })

}

const unZipFile = async(zipFile)=>{
    return new Promise(async (resolve,reject)=>{
        decompress(zipFile, `${path.dirname(zipFile)}` ).then(()=>{
            resolve();
        }).catch(e=>{
            reject();
        })
    })

}

const decompressFiles = () => { 
    const unZipJSBindings = unZipFile(`./connector/lib/${JSBindings}`);
    const unZipSDKBundle = unZipFile(`./${getSDKBundleByPlatform()}`);

    console.log(`Decompressing files...`)
    Promise.all([unZipJSBindings,unZipSDKBundle]).then(()=>{
        console.log("Decompressed Files !")
        cleanup();
    }).catch(e=>{
        console.error(e)
    })
}

const cleanup = async () => { 
    try {
        fs.copySync('./connector/lib/VidyoClient-JsSDK/javascript', './connector/lib/javascript/');
        fs.removeSync('./connector/lib/VidyoClient-JsSDK/');
        fs.removeSync(`./${getSDKBundleByPlatform()}`);
        if(process.platform === "darwin"){
            const currPath = `./${decompressedSDKDir}`
            const newPath = './VidyoClient-OSXSDK'
            fs.rename(currPath, newPath, function (err) {
              if (err) {
                throw err;
              } else {
                console.log("Successfully renamed the directory.");
                // Create Banuba symlinks after SDK directory is set up
                createBanubaSymlinks();
              }
            });
       
        }
    } catch (error) {
        console.error(error)
    }
 }

module.exports = {
  downloadFiles,
};
