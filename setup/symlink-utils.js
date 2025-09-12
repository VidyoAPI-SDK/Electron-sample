const fs = require("fs-extra");

/**
 * Creates the Banuba framework symlink
 * This symlink is required for the BNBEffectPlayerC.framework to be found at runtime
 */
const createBanubaSymlinks = () => {
  try {
    const rootDir = '.';
    const executableSymlinkPath = `${rootDir}/BNBEffectPlayerC.framework`;

    fs.ensureDirSync(rootDir);
    
    // Remove existing symlink if it exists
    if (fs.existsSync(executableSymlinkPath)) {
      fs.unlinkSync(executableSymlinkPath);
    }
    
    // Create the symlink
    fs.symlinkSync('./VidyoClient-OSXSDK/lib/macos/Banuba/BNBEffectPlayerC.framework', executableSymlinkPath);
    console.log(`✅ Created Banuba symlink: ${executableSymlinkPath}`);
    
    return true;
  } catch (err) {
    console.error(`❌ Error creating Banuba symlink: ${err}`);
    return false;
  }
};

module.exports = {
  createBanubaSymlinks
};
