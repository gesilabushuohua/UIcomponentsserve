import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.get('/file/list', controller.file.list);
  router.get('/file/name', controller.file.index);
  router.post('/file/upload', controller.file.upload);
};
