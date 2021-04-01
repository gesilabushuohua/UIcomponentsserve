const fs = require('fs');
const JSZIP = require('jszip');

class HandleFiles {

  /**
   *
   * @param {string} dir 文件
   * @return {boolean}
   */
  isDirectory(dir: string) {
    const state = fs.lstatSync(dir);
    return state.isDirectory(dir);
  }

  /**
   * @function 文件夹压缩为 zip buffer
   */
  async readFileToZipBuffer(dir: string) {
    const zip = new JSZIP();
    // read floder 
    if (!this.readFloder(zip, dir)) {
      return;
    }
    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      }
    });
    return buffer;
  }

  /**
 * @function 读取文件
 */
  async readFloder(zip: any, path: string) {
    if (fs.existsSync(path) && this.isDirectory(path)) {
      const files = fs.readdirSync(path, { withFileTypes: true });

      files.forEach(file => {
        const filePath = `${path}/${file.name}`;

        if (this.isDirectory(filePath)) {
          const zipFloder = zip.folder(file.name);
          this.readFloder(zipFloder, filePath);
        } else {
          zip.file(file.name, fs.readFileSync(filePath));
        }
      });
      return true;
    }

    return false;
  }

  /**
   * @function 解析 zip stream, 指定文件内容
   * @param {buffer} stream zip stream
   * @param {string} fileName 解读指定文件内容
   * @return {object}
   */
  async bufferToZipContent(buffer: any) {
    const zip = new JSZIP();
    const zipContent = await zip.loadAsync(buffer);
    return zipContent;
  }

  /**
   * @function 解析后的 zip 内容，存储到硬盘
   * @param fileName
   * @param zipContent
   * @return
   */
  async writeZipContentFile(dir: string, zipContent: any) {
    try {
      !fs.existsSync(dir) && fs.mkdirSync(dir);
      const filesObj = zipContent.files;
      Object.keys(filesObj).forEach(key => {
        const file = filesObj[key];
        const filePath = `${dir}/${file.name}`;
        if (file.dir && !fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
        } else if (!file.dir) {
          // 把每个文件buffer写到硬盘中
          file.async('nodebuffer')
            .then(content => fs.writeFileSync(filePath, content));
        }
      });
    } catch (err) {
      console.error(err);
      throw err;
    }

    return true;
  }


  async unZip(path: string) {
    const dir = path.replace('.zip', '');
    const buffer = fs.readFileSync(path);
    const zipContent = await this.bufferToZipContent(buffer);
    return await this.writeZipContentFile(dir, zipContent);
  }

  writeZipFile(fullName: string, stream: any) {
    return new Promise((resolve, reject) => {
      try {
        const writeStream = fs.createWriteStream(fullName);
        stream.pipe(writeStream);
        stream.on('end', resolve);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * @description 
   */
  async readFileToReadStream(name: string) {
    if (!fs.existsSync(name)) {
      throw new Error(`${name} is not exist`);
    }
    const buffer = await this.readFileToZipBuffer(name);
    const zipName = `${name}.zip`;
    fs.writeFileSync(zipName, buffer);
    const fileStream = fs.createReadStream(zipName);
    return {
      zipName,
      fileStream
    };
  }

  //  zip stream 字节流转为文件
  async readStreamToFile(fullName: string, fileStream: any) {
    // zip read stream 生成 zip
    await this.writeZipFile(fullName, fileStream);
    // 解压文件
    await this.unZip(fullName);
    // 删除 zip
    fs.rmSync(fullName);
  }
}

module.exports.HandleFiles = HandleFiles;
