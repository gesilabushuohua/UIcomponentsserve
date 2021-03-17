import { Controller } from 'egg';


export default class FileController extends Controller {
  public async list(type: string) {
    const { ctx } = this;
    console.log(type);
    ctx.body = 'list';
  }

  public async get(name: string) {
    const { ctx } = this;
    console.log(name);
    ctx.body = 'get';
  }

  public async upload() {
    const { ctx } = this;
    console.log('upload');
    ctx.body = 'upload';
  }
}