import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/file/list/:name', controller.file.list);
  router.get('/file/get/:type/:name', controller.file.get);
  router.post('/file/put', controller.file.put);
};
