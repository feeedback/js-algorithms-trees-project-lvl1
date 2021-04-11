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
    { path: '/courses/:id', handler: () => 'course!' },
    { path: '/courses/:course_id/exercises/:id', handler: () => 'exercise!' },
  ];

  router = makeRouter(routes);
});

describe('static routers', () => {
  it('path exist', async () => {
    expect(router.serve('/courses')()).toStrictEqual('courses!');
    expect(router.serve('/courses/basics')()).toStrictEqual('basics!');
  });

  it('path not exist - error', async () => {
    expect(() => {
      router.serve('/no_such_way')();
    }).toThrowError();
  });
});

describe('dynamic routers', () => {
  it('path exist', async () => {
    const { handler, params } = router.serve('/courses/1/exercises/2');
    // { path: '/courses/:id', handler: [Function handler], params: { id: 'php_trees' } }

    expect(params).toStrictEqual({ course_id: '1', id: '2' });
    expect(handler(params)).toStrictEqual('exercise!');
  });

  it('path not exist - error', async () => {
    expect(() => {
      router.serve('/courses/php_trees/')();
    }).toThrowError();
  });
});
