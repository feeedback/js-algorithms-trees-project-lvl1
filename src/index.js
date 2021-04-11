const generateTrie = (routes) => {
  const trieRoutePart = {};

  for (const route of routes) {
    const routeSegments = route.path.split('/');
    const lastIndex = routeSegments.length - 1;
    let currentNode = trieRoutePart;

    for (let i = 0; i < routeSegments.length; i += 1) {
      const word = routeSegments[i];
      const isThisParam = word.startsWith(':');

      const nodeKey = isThisParam ? '*' : word;
      if (!currentNode[nodeKey]) {
        currentNode[nodeKey] = {};
      }
      const node = currentNode[nodeKey];

      if (isThisParam) {
        node.paramName = word.slice(1);
      }

      if (i === lastIndex) {
        node.end = true;
        node.route = route;
      }

      currentNode = node;
    }
  }

  return trieRoutePart;
};

export default (routes) => {
  const routesTrie = generateTrie(routes);

  return {
    serve(path) {
      const pathSegments = path.split('/');
      const params = [];
      let currentNode = routesTrie;
      let node = null;

      for (const word of pathSegments) {
        node = currentNode[word];

        if (!node) {
          if (currentNode['*']) {
            node = currentNode['*'];
            params.push([node.paramName, word]);
          } else {
            throw new Error('404 Not Found');
          }
        }
        currentNode = node;
      }

      if (!node.end) {
        throw new Error('404 Not Found');
      }
      const { route } = node;

      if (params.length) {
        return { ...route, params: Object.fromEntries(params) };
      }
      return route.handler; // static
    },
  };
};
