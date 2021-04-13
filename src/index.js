const isThisParam = (segment) => segment.startsWith(':');

const recursiveBuild = (route, routeSegments, currentNode) => {
  const [word, ...tailSegments] = routeSegments;

  const isParam = isThisParam(word);

  const nodeKey = isParam ? '*' : word;
  const node = { ...(currentNode[nodeKey] ?? {}) };

  if (isParam) {
    node.paramName = word.slice(1);
    node.constraints = route.constraints?.[node.paramName] ?? null;
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
    const route = routeRaw.method ? routeRaw : { ...routeRaw, method: 'GET' };

    const routeSegments = route.path.split('/');
    trieRoutePart = recursiveBuild(route, routeSegments, trieRoutePart);
  }
  return trieRoutePart;
};

const getParamsByTemplate = (path, route) => {
  const pathSegments = path.split('/');
  const routeSegments = route.split('/');

  return routeSegments.reduce((acc, segment, i) => {
    if (isThisParam(segment)) {
      const key = segment.slice(1);
      const value = pathSegments[i];
      return { ...acc, [key]: value };
    }
    return acc;
  }, {});
};

const isCheckedPathParam = (is, word) => {
  let isChecked = false;

  if (typeof is === 'string') {
    isChecked = word === is;
  } else if (is instanceof RegExp) {
    isChecked = is.test(word);
  } else if (typeof is === 'function') {
    isChecked = is(word);
  } else {
    throw new Error('route constraints is not string/regexp/function');
  }

  return isChecked;
};

const traversal = (currentNode, pathSegments) => {
  const [word, ...tailSegments] = pathSegments;

  let node = currentNode[word];

  if (!node) {
    if (currentNode['*']) {
      node = currentNode['*'];
      const is = node.constraints;
      if (is !== null) {
        if (!isCheckedPathParam(is, word)) {
          throw new Error('path params is not constraints route');
        }
      }
    } else {
      throw new Error('404 Not Found');
    }
  }

  return tailSegments.length === 0 ? node : traversal(node, tailSegments);
};

const serve = (routesTrie, pathRaw) => {
  const pathFull = typeof pathRaw === 'string' ? { path: pathRaw, method: 'GET' } : pathRaw;
  const { path, method } = pathFull;

  const pathSegments = path.split('/');
  const node = traversal(routesTrie, pathSegments);

  if (!node.end) {
    throw new Error('404 Not Found');
  }

  const route = node.routes[method];
  if (!route) {
    throw new Error('404 Not Found');
  }

  return { ...route, params: getParamsByTemplate(path, route.path) };
};

export default (routes) => {
  const routesTrie = generateTrie(routes);

  return {
    serve: (path) => serve(routesTrie, path),
  };
};
