import { describe, it, expect } from '@jest/globals';
import makeRouter from '../src/index.js';

let router = null;
let routes = null;

beforeEach(() => {
  // Роутер используется как часть на конкретном сайте,
  // роутеру нужно знать лишь про сами маршруты на сайте - не учитываем протокол, хост и т. д.
  routes = [
    { path: '/courses', handler: () => 'courses!' },
    { path: '/courses/basics', handler: () => 'basics!' },
  ];

  router = makeRouter(routes);
});

describe('static routers', () => {
  it('path exist', async () => {
    expect(router.serve('/courses')()).toStrictEqual('courses!'); // courses!
    expect(router.serve('/courses/basics')()).toStrictEqual('basics!'); // courses!
  });

  it('path not exist - error', async () => {
    expect(() => {
      router.serve('/no_such_way')();
    }).toThrowError();
  });
});
