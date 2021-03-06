import url from 'url';

const isThisParam = (segment) => segment.startsWith(':');

const recursiveBuild = (route, routeSegments, currentNode) => {
  const [word, ...tailSegments] = routeSegments;

  const isParam = isThisParam(word);

  const nodeKey = isParam ? '*' : word;
  const node = { ...(currentNode[nodeKey] ?? {}) };

  if (isParam) {
    node.paramName = word.slice(1);
    const constraintsThisWord = route.constraints?.[node.paramName] ?? null;

    if (constraintsThisWord) {
      node.constraints = [
        ...(node.constraints ?? []),
        { param: node.paramName, constraints: constraintsThisWord },
      ];
    }
  }

  if (tailSegments.length === 0) {
    const routes = { ...(node.routes ?? {}) };

    return { [nodeKey]: { ...node, end: true, routes: { ...routes, [route.method]: route } } };
  }

  return { [nodeKey]: { ...node, ...recursiveBuild(route, tailSegments, node) } };
};

const generateTrie = (routes) => {
  let trieRoutePart = {};

  for (const routeRaw of routes) {
    console.log({ routeRaw });
    const route = routeRaw.method ? routeRaw : { ...routeRaw, method: 'GET' };

    const routeSegments = url.resolve('/', route.path).split('/');
    trieRoutePart = recursiveBuild(route, routeSegments, trieRoutePart);
  }
  return trieRoutePart;
};

const getParamsByTemplate = (path, route) => {
  const pathSegments = url.resolve('/', path).split('/');
  const routeSegments = url.resolve('/', route).split('/');

  return routeSegments.reduce((acc, segment, i) => {
    if (isThisParam(segment)) {
      const key = segment.slice(1);
      const value = pathSegments[i];
      return { ...acc, [key]: value };
    }
    return acc;
  }, {});
};

const isCheckedPathParam = (isListConstraints, word) => {
  let isChecked = false;

  for (const { constraints: is } of isListConstraints) {
    if (typeof is === 'string') {
      isChecked = word === is;
    } else if (is instanceof RegExp) {
      isChecked = is.test(word);
    } else if (typeof is === 'function') {
      isChecked = is(word);
    } else {
      throw new Error('route constraints is not string/regexp/function');
    }

    if (isChecked) {
      break;
    }
  }

  return isChecked;
};

const traversal = (currentNode, pathSegments) => {
  const [word, ...tailSegments] = pathSegments;

  let node = currentNode[word];
  console.log({ currentNode, word });
  if (!node) {
    if (currentNode['*']) {
      console.log('exist *');
      node = currentNode['*'];
      const isListConstraints = node.constraints;

      if (isListConstraints) {
        if (!isCheckedPathParam(isListConstraints, word)) {
          throw new Error('path params is not constraints route');
        }
      }
    } else {
      console.log({ currentNode, word });
      throw new Error('404 Not Found');
    }
  }

  return tailSegments.length === 0 ? node : traversal(node, tailSegments);
};

const serve = (routesTrie, pathRaw) => {
  console.log({ pathRaw });
  let pathFull = pathRaw;

  if (typeof pathRaw === 'string') {
    pathFull = { path: pathRaw, method: 'GET' };
  } else if (!pathFull.method) {
    pathFull.method = 'GET';
  }
  if (pathFull.path.endsWith('/')) {
    pathFull.path = pathFull.path.slice(0, -1);
  }

  const { path, method } = pathFull;

  const pathSegments = url.resolve('/', path).split('/');
  const node = traversal(routesTrie, pathSegments);

  if (!node.end) {
    throw new Error('404 Not Found');
  }

  const route = node.routes[method];
  const params = getParamsByTemplate(path, route.path);
  console.log({ routes: node.routes, method, route: node.routes[method], params });
  if (!route) {
    throw new Error('404 Not Found');
  }

  return { ...route, params };
};

export default (routes) => {
  console.log('routes');
  console.log(JSON.stringify(routes));
  console.log({ routes });
  const routesTrie = generateTrie(routes);

  return {
    serve: (path) => serve(routesTrie, path),
  };
};
