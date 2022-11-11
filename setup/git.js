const fs = require("fs-extra");

module.exports.clean = ()=> {
    const exceptedFiles = ['package.json', 'package-lock.json','README.md']
    const gitRepoPath = './git_repo/';
    try {
        exceptedFiles.forEach(file => {
            fs.copySync(`${gitRepoPath}${file}`, `./setup/${file}`);
        });

        fs.emptyDirSync('./git_repo');
        exceptedFiles.forEach(file => {
            fs.moveSync(`./setup/${file}`, `${gitRepoPath}${file}`);
        });

    } catch (e) {
        console.error("Something went wrong while cleaning git repo", e)
    }

}