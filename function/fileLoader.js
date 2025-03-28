const { glob } = require("glob").glob
const path = require("path")

async function deleteCachedFile(file) {
    const filePath = path.resolve(file)

    if (require.cache[filePath]) {
        delete require.cache[filePath]
    }
}

async function loadFiles(dirName) {
    try {
        
        const files = await glob(path.join(process.cwd(), dirName, "**/*.js").replace(/\\/g, "/"));
        const jsFiles = files.filter(file => path.extname(file) === ".js")
        await Promise.all(jsFiles.map(deleteCachedFile));
        console.log(jsFiles)
        console.log(process.cwd())
        return jsFiles

    } catch (error) {
        console.log(`An error occured while trying to load files from directory ${dirName}: ${error}`)
        throw error;
    }
}

module.exports = { loadFiles };
