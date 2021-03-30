const sendToWormhole = require('stream-wormhole');
const { BaseController } = require('./base');

export default class FileController extends BaseController {
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
        if(part[0] === 'type') {
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
        if(res) {
          this.success();
        }
        
      }
    }
  }
}

module.exports = FileController;

