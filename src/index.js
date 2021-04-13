const isThisParam = (segment) => segment.startsWith(':');

const recursiveBuild = (route, routeSegments, currentNode) => {
  const [word, ...tailSegments] = routeSegments;

  const isParam = isThisParam(word);

  const nodeKey = isParam ? '*' : word;
  const node = { ...(currentNode[nodeKey] ?? {}) };

  if (isParam) {
    node.paramName = word.slice(1);
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
      return [...acc, [key, value]];
    }
    return acc;
  }, []);
};

const serve = (routesTrie, pathRaw) => {
  const pathFull = typeof pathRaw === 'string' ? { path: pathRaw, method: 'GET' } : pathRaw;
  const { path, method } = pathFull;

  const pathSegments = path.split('/');
  let currentNode = routesTrie;
  let node = null;

  for (const word of pathSegments) {
    node = currentNode[word];

    if (!node) {
      if (currentNode['*']) {
        node = currentNode['*'];
      } else {
        throw new Error('404 Not Found');
      }
    }
    currentNode = node;
  }

  if (!node.end) {
    throw new Error('404 Not Found');
  }
  const { routes } = node;
  const route = routes[method];

  if (!route) {
    throw new Error('404 Not Found');
  }

  const params = getParamsByTemplate(path, route.path);

  return { ...route, params: Object.fromEntries(params) };
};

export default (routes) => {
  const routesTrie = generateTrie(routes);

  return {
    serve: (path) => serve(routesTrie, path),
  };
};
