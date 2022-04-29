const superAgent = require("superagent");
const decompress = require("decompress");
const progress = require("progress-stream");
const fs = require("fs-extra");
const path = require("path");

const BUCKET = "https://static-vidyodev-io.s3.amazonaws.com/latest/package/";
const JSBindings = "VidyoClient-JsSDK.zip";

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
      arch: "x86",
    },
  ];

const getSDKBundleByPlatform = () => {
    const {platform, arch} = process;
    const files = downloadBundle.filter(function(item){
        if(platform === "darwin"){
            return item.platform === platform  &&  item.arch === arch;
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
        time: 500 /* ms */
    });
    str.on('progress', function(progress) {
        console.log(Math.round(progress.percentage)+'%');
    });
    return new Promise(async (resolve,reject)=>{
        var stream = fs.createWriteStream(destination);
        superAgent.get(source).on('progress',function(e){
            console.log(">> donwloading file..")
        }).pipe(str)
        .on('error',function(){
            reject()
            console.error(">> error occured while downloading...")
        }).pipe(stream).on('finish',function(){
            resolve();
            console.log('>> file downloaded successfully...');
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
        console.log("Donloaded both files")
        decompressFiles();
    }).catch(e=>{
        console.error(e)
    })

}

const unZipFile = async(zipFile)=>{
    return new Promise(async (resolve,reject)=>{
        decompress(zipFile, `${path.dirname(zipFile)}/unzipped` ).then(()=>{
            resolve();
        }).catch(e=>{
            reject();
        })
    })

}

const decompressFiles = () => { 
    const unZipJSBindings = unZipFile(`./connector/lib/${JSBindings}`);
    const unZipSDKBundle = unZipFile(`./${getSDKBundleByPlatform()}`);

    Promise.all([unZipJSBindings,unZipSDKBundle]).then(()=>{
        console.log("unzipped both files")
    }).catch(e=>{
        console.error(e)
    })

}

module.exports = {
  downloadFiles,
};
