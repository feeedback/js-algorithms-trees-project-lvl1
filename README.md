### Hexlet tests and linter status:

[![Actions Status](https://github.com/feeedback/js-algorithms-trees-project-lvl1/workflows/hexlet-check/badge.svg)](https://github.com/feeedback/js-algorithms-trees-project-lvl1/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/3e35bb1ed1ce64f7ed5b/maintainability)](https://codeclimate.com/github/feeedback/js-algorithms-trees-project-lvl1/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3e35bb1ed1ce64f7ed5b/test_coverage)](https://codeclimate.com/github/feeedback/js-algorithms-trees-project-lvl1/test_coverage)
[![wakatime](https://wakatime.com/badge/github/feeedback/js-algorithms-trees-project-lvl1.svg)](https://wakatime.com/badge/github/feeedback/js-algorithms-trees-project-lvl1)

Реализация учебного проекта Hexlet Алгоритмы. Деревья. №1 https://ru.hexlet.io/programs/js-algorithms-trees/projects/68

**Роутер**

У каждой страницы любого сайта есть URL-адрес. Каждый раз когда, происходит обращение к сайту, движок на котором написан сайт анализирует URL-адрес и пытается найти функцию для генерации ответа. За этот процесс отвечает роутинг, который обычно реализован в виде отдельного компонента – роутера. Этот компонент является одним из ключевых частей сайта. Соответственно, он производит выбор функции в зависимости от URL-адреса.

Роутеры часто реализуются в виде отдельных библиотек, которые потом используется внутри сайта. Это хорошая практика, и здесь мы напишем такую библиотеку. После завершения наш роутер можно будет использовать на реальных сайтах.

_Пример использования:_

```js
import makeRouter from '@hexlet/code';

const routes = [
  {
    path: '/hello', // маршрут
    method: 'POST', // метод HTTP
    handler: () => 'Hello!', // обработчик
  },
  {
    path: '/hello/:name', // динамический маршрут
    handler: ({ name }) => `Hello ${name}!`,
    constraints: { name: /\w+/ }, // ограничения накладываемые на динамический маршрут
  },
];

const router = makeRouter(routes); // инициализируем наши маршруты

// запрос из сети
// На самом деле, всё гораздо сложнее и в реальности сам HTTP запрос обрабатывает сервер на сайте
// Далее он сам прокидывает запрос в роутер
// Мы просто говорим, что запрос должен состоять из пути и метода
const request = { path: 'hello/Hexlet', method: 'GET' };

// вызываем наш роутер с запросом из "сети"
const result = router.serve(request); // { path: 'hello/Hexlet', method: 'GET', handler: [Function handler], params: { name: 'Hexlet' } }
// вызываем обработчик с параметрами, который вернул роутер
result.handler(result.params); // Hello Hexlet!
```
