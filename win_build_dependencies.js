require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const copyFilePromise = util.promisify(fs.copyFile);

const PACKAGE_FORLDER_NAME = './VidyoClient-WinVS2017SDK/'
const REPO_DIRECTORY = process.env.CODEBASE_DIR;


const SDK_MODE = process.env.DEV_MODE;
const SDK_PATH = `${REPO_DIRECTORY}/SDK/`;
const SAMPLES_PATH = `${REPO_DIRECTORY}/Samples/`;
const SOURCE_PATH = `${REPO_DIRECTORY}/SDK/Lmi/`;
const FRAMEWORKS_PATH = `${REPO_DIRECTORY}/Frameworks/Win32/`;

const BUILD_INC_PATH = `${PACKAGE_FORLDER_NAME}include/Lmi/`;
const BANUBA_RES_PATH = `${PACKAGE_FORLDER_NAME}lib/windows/resources/Banuba/`;

const BINDINGS_PATH = `${SDK_PATH}/Lmi/VidyoClient/javascript/`;



const getLibPathByArch = (arch) => { 
  return `./VidyoClient-WinVS2017SDK/lib/windows/${arch}/Release/`;
}
const getFrameworkLibsByArch = (arch) => {
  let libraryPaths = [
    `${FRAMEWORKS_PATH}OpenSSL/openssl-1.1.1l/lib.ucrt/${arch}/libcrypto.lib`,
    `${FRAMEWORKS_PATH}OpenSSL/openssl-1.1.1l/lib.ucrt/${arch}/libssl.lib`,
    `${FRAMEWORKS_PATH}Speex/speex-1.2rc2/lib.ucrt/${arch}/libspeex.lib`,
    `${FRAMEWORKS_PATH}Opus/opus-1.3.1/lib.ucrt/${arch}/opus.lib`,
    `${FRAMEWORKS_PATH}LibSRTP/libsrtp-2.4.0/lib.ucrt/${arch}/srtp2.lib`,
    `${FRAMEWORKS_PATH}Google/libvpx-1.9.0/lib.ucrt/${arch}/vpxmt.lib`,
    `${FRAMEWORKS_PATH}zlib/zlib-1.2.11/lib.ucrt/${arch}/zlibstat.lib`,
  ];
  return libraryPaths;
};

const getSDKLibsByArch = (arch) => { 
  return [
    `${SDK_PATH}/${arch}/${SDK_MODE}`,
    `${SAMPLES_PATH}/${arch}/${SDK_MODE}`,
  ]
}

let headerPaths = [
  {
    src: `${SOURCE_PATH}Media/Common/`,
    dst: `${BUILD_INC_PATH}Media/Common/`,
  },
  {
    src: `${SOURCE_PATH}Os/`,
    dst: `${BUILD_INC_PATH}Os/`,
  },
  {
    src: `${SOURCE_PATH}Utils/`,
    dst: `${BUILD_INC_PATH}Utils/`,
  },
  {
    src: `${SOURCE_PATH}Utils/SysDep/`,
    dst: `${BUILD_INC_PATH}Utils/SysDep/`,
  },
  {
    src: `${SOURCE_PATH}Video/Common/`,
    dst: `${BUILD_INC_PATH}Video/Common/`,
  },
  {
    src: `${SOURCE_PATH}VidyoClient/`,
    dst: `${BUILD_INC_PATH}VidyoClient/`,
  },
];

const banubaResources = [
  `${FRAMEWORKS_PATH}Banuba/bnb-0.37.1/bnb-resources`,
  `${FRAMEWORKS_PATH}Banuba/bnb-0.37.1/effects`,
];

const banubaLibsByArch = (arch) => {
  return [
    `${FRAMEWORKS_PATH}Banuba/bnb-0.37.1/lib.ucrt/${arch}/release`,
    `${FRAMEWORKS_PATH}Banuba/bnb-0.37.1/lib.ucrt/${arch}/OpenAL32.dll`,
  ];
};

function copyFiles(srcDir, destDir, files) {
  return Promise.all(
    files.map((f) => {
      return copyFilePromise(path.join(srcDir, f), path.join(destDir, f));
    })
  );
}

const ensureDirectoryStructure = async () => {
  const createDirs = () => {
    try {
      headerPaths.forEach((item) => {
        fs.ensureDirSync(item.dst);
      });
      fs.ensureDirSync(BANUBA_RES_PATH);
      fs.ensureDirSync(getLibPathByArch("Win32"));
      fs.ensureDirSync(getLibPathByArch("x64"));
    } catch (err) {
      console.log("Error while Ensure Directories : ", err);
    }
  };
  return new Promise(async (resolve, reject) => {
    await createDirs();
    resolve();
  });
};

const copyLibraries = () => {
  try {
    getFrameworkLibsByArch("Win32").forEach((lib) => {
      const dest = `${getLibPathByArch("Win32")}${path.basename(lib)}`;
      fs.copySync(lib, dest);
      console.log("Copied : ", dest);
    });
    getFrameworkLibsByArch("x64").forEach((lib) => {
      const dest = `${getLibPathByArch("x64")}${path.basename(lib)}`;
      fs.copySync(lib, dest);
      console.log("Copied : ", dest);
    });
  } catch (error) {
    console.log(error);
  }
};
const getFilesByExtension = (headerPaths, headerFileFilter) => {
  const headerFiles = [];
  let filteredFileList = [];
  function getHeaderFilesDetails(startPath, filter) {
    if (!fs.existsSync(startPath)) {
      console.log("no dir ", startPath);
      return;
    }
    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
      var filename = path.join(startPath, files[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        getHeaderFilesDetails(filename, filter); //recurse
      } else if (filename.indexOf(filter) >= 0) {
        var fileDetails = {
          fileDir: startPath,
          fileName: path.basename(filename),
        };
        headerFiles.push(fileDetails);
      }
    }

    filteredFileList = headerFiles
      .filter((item) => {
        return item.fileDir === startPath;
      })
      .map((item) => {
        return item.fileName;
      });
  }

  return new Promise(async (res, rej) => {
    await getHeaderFilesDetails(headerPaths, headerFileFilter);
    res(filteredFileList);
  });
};

const copyHeaderFiles = () => {
  headerPaths.forEach((hPath) => {
    getFilesByExtension(hPath.src, ".h").then((headerFileList) => {
      copyFiles(hPath.src, hPath.dst, headerFileList)
        .then(() => {
          console.log("Copied : ", hPath.dst);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
};

const copySDKLibraries = (arch,part) => { 
  getFilesByExtension(getSDKLibsByArch(arch)[part], ".lib").then((libFileList) => {
    copyFiles(getSDKLibsByArch(arch)[part], getLibPathByArch(arch), libFileList)
      .then(() => {
        console.log("Copied : ", getLibPathByArch(arch));
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
const copyBanubaFiles = () => { 
  try {
    banubaResources.forEach((item, i) => {
      const dest = `${BANUBA_RES_PATH}${path.basename(item)}`;
      fs.copySync(item, dest);
      console.log("Copied : ", dest);
    });
    banubaLibsByArch("Win32").forEach((item, i) => {
      const dest = `${getLibPathByArch("Win32")}/Banuba/${path.basename(item)}`;
      fs.copySync(item, dest);
      console.log("Copied : ", dest);
    });
    banubaLibsByArch("x64").forEach((item, i) => {
      const dest = `${getLibPathByArch("x64")}/Banuba/${path.basename(item)}`;
      fs.copySync(item, dest);
      console.log("Copied : ", dest);
    });
  } catch (error) {
    console.log(error);
  }
}

const copyJavascriptBindings = () => {
  fs.copySync(BINDINGS_PATH, `${PACKAGE_FORLDER_NAME}/javascript/`);
};

const copyNodeGypBindings = () => {
  const sourcePath = `./node-gyp-bindings/${SDK_MODE}/`
  fs.copySync(sourcePath, "./");
}

ensureDirectoryStructure()
  .then(() => {
    copyNodeGypBindings();
    copyLibraries();
    copyHeaderFiles();
    copyBanubaFiles();
    copyJavascriptBindings();
    //copySDKLibraries("Win32",0);
    //copySDKLibraries("Win32",1);
    copySDKLibraries("x64",0);
    copySDKLibraries("x64",1);
    
  })
  .catch((err) => {
    console.log("Error Occured while loading SDK Files : " ,  err);
  });
