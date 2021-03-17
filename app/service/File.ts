import { Service } from 'egg';

export default class File extends Service {

  public async list() {
    
    return 'list';
  }

  public async get() {
    return 'get';
  }

  public async upload() {
    return 'upload';
  }
}