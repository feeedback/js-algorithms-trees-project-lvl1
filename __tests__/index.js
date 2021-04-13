import { describe, it, expect } from '@jest/globals';
import makeRouter from '../src/index.js';

// Роутер используется как часть на конкретном сайте,
// роутеру нужно знать лишь про сами маршруты на сайте - не учитываем протокол, хост и т. д.

// GET - чтение, POST - создание, PUT - обновление, DELETE - удаление
// Методы есть, теперь нужно объединить часть путей, это сделаем таким образом:
//  /courses/:id - Чтение, удаление, обновление
//  /courses - Создание, чтение нескольких курсов

const routes = [
  { path: 'users/long/1', handler: () => 'user!' },
  { path: '/courses', handler: () => 'courses!' },
  { path: '/courses/basics', handler: () => 'basics!' },

  {
    method: 'POST',
    path: '/courses/:id',
    handler: () => 'created!',
  },
  {
    method: 'GET',
    path: '/courses/:id',
    handler: () => 'course!',
  },
  {
    method: 'GET',
    path: '/courses/:course_id/exercises/:id',
    handler: () => 'exercise!',
    constraints: {
      course_id: /\d+/,
      id: (courseId) => courseId.startsWith('js'),
    },
  },
];
let router = null;

beforeEach(() => {
  router = makeRouter(routes);
});

describe('router not exist', () => {
  it('error', async () => {
    expect(() => {
      router.serve('/courses/php_trees/');
    }).toThrowError();
  });
});

describe('static routers', () => {
  it('path exist', async () => {
    const result = router.serve('users/long/1');

    expect(result.handler(result.params)).toStrictEqual('user!');
  });
});

describe('dynamic routers', () => {
  it('path exist', async () => {
    const result = router.serve('/courses/5/exercises/js_tree');

    expect(result.params).toStrictEqual({ course_id: '5', id: 'js_tree' });
    expect(result.handler(result.params)).toStrictEqual('exercise!');
  });
});

describe('routes with methods', () => {
  it('equal routers with different method', async () => {
    const postRes = router.serve({ path: '/courses/5', method: 'POST' });
    const getRes = router.serve({ path: '/courses/5', method: 'GET' });

    expect(postRes.params).toStrictEqual(getRes.params);
    expect(postRes.method).toStrictEqual('POST');
    expect(getRes.method).toStrictEqual('GET');
    expect(postRes.handler(postRes.params)).toStrictEqual('created!');
    expect(getRes.handler(getRes.params)).toStrictEqual('course!');
  });
});

describe('dynamic routes with constraints', () => {
  it("path doesn't fit - error", async () => {
    expect(() => {
      router.serve('/courses/noop/exercises/2');
    }).toThrowError();
  });

  it('path constraints', async () => {
    const result = router.serve('/courses/6/exercises/js_tree');

    expect(result.params).toStrictEqual({ course_id: '6', id: 'js_tree' });
    expect(result.handler(result.params)).toStrictEqual('exercise!');
  });
});
