import { describe, it, expect } from '@jest/globals';
import makeRouter from '../src/index.js';

// Роутер используется как часть на конкретном сайте,
// роутеру нужно знать лишь про сами маршруты на сайте - не учитываем протокол, хост и т. д.

// GET - чтение, POST - создание, PUT - обновление, DELETE - удаление
// Методы есть, теперь нужно объединить часть путей, это сделаем таким образом:
//  /courses/:id - Чтение, удаление, обновление
//  /courses - Создание, чтение нескольких курсов

const routes = [
  { path: '/courses', handler: () => 'courses!' },
  { path: '/courses/basics', handler: () => 'basics!' },
  { method: 'GET', path: '/courses/:id', handler: () => 'course!' },
  { path: '/courses/:course_id/exercises/:id', handler: () => 'exercise!' },
  { method: 'POST', path: '/courses/:course_id/exercises', handler: () => 'created!' },
  { method: 'GET', path: '/courses/:course_id/exercises', handler: () => 'exercises!' },
];
let router = null;

beforeEach(() => {
  router = makeRouter(routes);
});

describe('router not exist', () => {
  it('error', async () => {
    expect(() => {
      router.serve('/courses/php_trees/')();
    }).toThrowError();
  });
});

describe('static routers', () => {
  it('path exist', async () => {
    const result = router.serve('/courses/basics');

    expect(result.handler(result.params)).toStrictEqual('basics!');
  });
});

describe('dynamic routers', () => {
  it('path exist', async () => {
    const result = router.serve('/courses/1/exercises/2');

    expect(result.params).toStrictEqual({ course_id: '1', id: '2' });
    expect(result.handler(result.params)).toStrictEqual('exercise!');
  });
});

describe('routes with methods', () => {
  it('equal routers with different method', async () => {
    const postRes = router.serve({ path: '/courses/5/exercises', method: 'POST' });
    const getRes = router.serve({ path: '/courses/5/exercises', method: 'GET' });

    expect(postRes.params).toStrictEqual(getRes.params);
    expect(postRes.method).toStrictEqual('POST');
    expect(getRes.method).toStrictEqual('GET');
    expect(postRes.handler(postRes.params)).toStrictEqual('created!');
    expect(getRes.handler(getRes.params)).toStrictEqual('exercises!');
  });
});
