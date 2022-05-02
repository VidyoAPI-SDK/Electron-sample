const superAgent = require("superagent");
const decompress = require("decompress");
const progress = require("progress-stream");
const fs = require("fs-extra");
const path = require("path");
const cliSpinners = require('cli-spinners');

const BUCKET = "https://static-vidyodev-io.s3.amazonaws.com/latest/package/";
const JSBindings = "VidyoClient-JsSDK.zip";
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
            if(arch){
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

    str.on('progress', function(progress) {
        const {frames} = cliSpinners.material;
       // console.clear();
        //console.log(frames[i = ++i % frames.length] + ' setting up')
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
        console.log("Donloaded both files")
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

    Promise.all([unZipJSBindings,unZipSDKBundle]).then(()=>{
        console.log("unzipped both files")
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
                console.log(err);
              } else {
                console.log("Successfully renamed the directory.");
              }
            });
          // console.log(">> exists dir", decompressedSDKDir,  fs.existsSync(`./${decompressedSDKDir}/`))
        }

    } catch (error) {
        console.error(err)
    }
 }

module.exports = {
  downloadFiles,
};
