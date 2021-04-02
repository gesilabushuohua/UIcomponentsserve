const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
/* const zlib = require('zlib'); */

const { HandleFiles } = require('../lib/handleFiles');

const handleFiles = new HandleFiles();

export default class FileService extends Service {


  // 文件信息
  public async sourceFsStat(filePath: string) {
    return fs.statSync(filePath);
  }

  // 静态资源管理
  public async sourceStream(filePath: string) {
    const stream = fs.createReadStream(filePath, {
      flags: 'r',
    });
    return stream/* .pipe(zlib.createGzip()) */;
  }

  public async list(type: string) {
    const { config: { componentPath } } = this;
    const dirPath = path.join(componentPath, `/${type}`);
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    const floders = files.filter(file => file.isDirectory()).map(file => file.name);
    return floders;
  }

  public async get(type: string, name: string) {
    const { config: { componentPath } } = this;
    const path = `${componentPath}/${type}/${name}`;
    const { zipName, fileStream } = await handleFiles.readFileToReadStream(path);
    fileStream.on('end', () => {
      // 删除 zip
      fs.rmSync(zipName);
    });

    return fileStream;
  }

  public async put(type: string, stream: any) {
    const { config: { componentPath } } = this;
    const fileName = stream.filename;
    const fullName = `${componentPath}/${type}/${fileName}`;
    const { zipName, fileStream } = await handleFiles.readStreamToFile(fullName, stream);
    // 删除 zip
    fs.rmSync(zipName);
    return fileStream;
  }
}

module.exports = FileService;
