const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const path = require('path');

const { BaseController } = require('./base');

const mimeType = {
  '.ico': 'image/x-icon',
  '.md': 'text/plain',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/font-sfnt',
};

export default class FileController extends BaseController {

  public async source() {
    const { ctx } = this;
    const { params } = ctx;
    const createRule = {
      type: 'string',
      com: 'string',
      name: 'string',
    };

    // 检验参数
    ctx.validate(createRule, ctx.params);
    const { type, com, name } = params;
    const { config: { componentPath } } = this;
    const filePath = `${componentPath}/${type}/${com}/${name}`;
    const ext = path.extname(params.name);
    ctx.set('Content-Type', mimeType[ext]);
    

    if (!fs.existsSync(filePath)) {
      ctx.status = 404;
      return;
    }

    // 304 缓存有效期判断，使用 If-Modified-Since，用 Etag 也可以
    const fStat = await ctx.service.file.sourceFsStat(filePath);
    // 缓存字段
    const modified = ctx.get('if-modified-since');
    const expectedModified = new Date(fStat.mtime).toUTCString();
    ctx.set('Cache-Control', 'max-age=3600');
    ctx.set('Last-Modified', new Date(expectedModified).toUTCString());

    if (modified && modified === expectedModified) {
      ctx.status = 304;
      return;
    }

    // 文件头部信息设置
    ctx.status = 200;
    /* ctx.set('Content-Encoding', 'gzip'); */

    // 调用 services 进行业务处理
    const fileStream = fs.createReadStream(filePath, {
      flags: 'r',
    });

    fileStream.on('error', () => {
      console.error(404);
      ctx.status = 404;
    });

    ctx.body = fs.readFileSync(filePath);
  }


  public async list() {
    const { ctx } = this;
    const { params: { name } } = ctx;
    const createRule = {
      name: 'string',
    };

    // TODO 过滤非法字符串
    // 检验参数
    ctx.validate(createRule, ctx.params);
    // 调用 services 进行业务处理
    const res = await ctx.service.file.list(name);
    this.success(res);
  }

  public async get() {
    const { ctx } = this;
    const { params: { type, name } } = ctx;
    const { typesArr } = this.config;
    const createRule = {
      type: typesArr,
      name: 'string',
    };
    ctx.validate(createRule, ctx.params);
    const res = await ctx.service.file.get(type, name);
    ctx.body = res;
  }

  public async put() {
    const { ctx } = this;
    const parts = ctx.multipart();
    let part;
    let type = '';
    // parts() 返回 promise 对象
    while ((part = await parts()) != null) {
      if (part.length) {
        // 这是 busboy 的字段
        if (part[0] === 'type') {
          type = part[1];
        }
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return;
        }
        // part 是上传的文件流
        let res: any = null;
        try {
          res = await ctx.service.file.put(type, part);
        } catch (err) {
          // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
          await sendToWormhole(part);
          throw err;
        }
        if (res) {
          this.success();
        }

      }
    }
  }
}

module.exports = FileController;

