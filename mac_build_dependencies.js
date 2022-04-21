require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const copyFilePromise = util.promisify(fs.copyFile);

const PACKAGE_FORLDER_NAME = './VidyoClient-OSXSDK/'
const REPO_DIRECTORY = process.env.CODEBASE_DIR;

const SDK_MODE = process.env.DEV_MODE;
const SDK_PATH = `${REPO_DIRECTORY}/SDK/`;
const SAMPLES_PATH = `${REPO_DIRECTORY}/Samples/`;
const SOURCE_PATH = `${REPO_DIRECTORY}/SDK/Lmi/`;
const FRAMEWORKS_PATH = `${REPO_DIRECTORY}/Frameworks/MacOS/`;
const LIBRARIES_PATH = `${PACKAGE_FORLDER_NAME}/lib/macos/`
const BUILD_INC_PATH = `${PACKAGE_FORLDER_NAME}include/Lmi/`;
const BANUBA_PATH = `${LIBRARIES_PATH}/Banuba/`
const BINDINGS_PATH = `${SDK_PATH}/Lmi/VidyoClient/javascript/`;

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

function copyFiles(srcDir, destDir, files) {
  return Promise.all(
    files.map((f) => {
      return copyFilePromise(path.join(srcDir, f), path.join(destDir, f));
    })
  );
}

const getFrameworksLibrarires = () => {
  return [
    `${FRAMEWORKS_PATH}/Google/libvpx-1.9.0/macOS/lib/libvpx.a`,
    `${FRAMEWORKS_PATH}/Speex/speex-1.2rc2/usr/local/macOS/lib/libspeex.a`,
    `${FRAMEWORKS_PATH}/Opus/opus-1.3.1/OSX/lib/libopus.a`,
    `${FRAMEWORKS_PATH}/LibSRTP/libsrtp-2.4.0/OSX/lib/libsrtp2.a`,
    `${FRAMEWORKS_PATH}/OpenSSL/openssl-1.1.1l/release/lib/libcrypto.a`,
    `${FRAMEWORKS_PATH}/OpenSSL/openssl-1.1.1l/release/lib/libssl.a`
  ];
};

const copyBanubaFramework = () => {
  const banubaFiles  = [
    `${FRAMEWORKS_PATH}/Banuba/bnb-0.37.1/macOS/release/BNBEffectPlayerC.framework`,
    `${FRAMEWORKS_PATH}/Banuba/bnb-0.37.1/effects`,
    `${FRAMEWORKS_PATH}/Banuba/BnbLicenseToken.h`,
  ]
  try {
    banubaFiles.forEach((item) => {
      fs.copySync(item, `${BANUBA_PATH}${path.basename(item)}`);

    });
  } catch (error) {
    console.log(error);
  }

}

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
const ensureDirectoryStructure = async () => {
  const createDirs = () => {
    try {
      headerPaths.forEach((item) => {
        fs.ensureDirSync(item.dst);
      });
      fs.ensureDirSync(LIBRARIES_PATH);
      fs.ensureDirSync(BANUBA_PATH);
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
    getFrameworksLibrarires().forEach((lib) => {
      const dest = `${LIBRARIES_PATH}${path.basename(lib)}`;
      fs.copySync(lib, dest);
      console.log("Copied : ", dest);
    });
  } catch (error) {
    console.log(error);
  }
};

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
    copyJavascriptBindings();
    copyBanubaFramework();
  })
  .catch((err) => {
    console.log("Error Occured while loading SDK Files : " ,  err);
  });
