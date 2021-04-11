/* eslint-disable no-continue */
const isStaticRoute = (path) => !path.includes(':');

export default (routes) => {
  const mapStaticRoutesToHandler = routes
    .filter(({ path }) => isStaticRoute(path))
    .reduce((acc, { path, handler }) => ({ ...acc, [path]: handler }), {});

  const routesCheck = routes.map((route) => ({
    ...route,
    check: (path) => {
      // const pattern = `^${route.path.replaceAll('/', '\\/').replace(/(:(\w+))/g, '\\(w+)')}`;
      const routeSegments = route.path.split('/');
      const pathSegments = path.split('/');

      if (routeSegments.length !== pathSegments.length) {
        return false;
      }

      const params = {};

      for (let i = 0; i < pathSegments.length; i += 1) {
        const routePart = routeSegments[i];
        const pathPart = pathSegments[i];

        if (pathPart !== routePart) {
          if (!routePart.startsWith(':')) {
            return false;
          }

          params[routePart.slice(1)] = pathPart;
        }
      }

      if (!Object.keys(params).length) {
        return route.handler; // static
      }

      return { ...route, params };
    },
  }));

  return {
    serve(path) {
      const handler = mapStaticRoutesToHandler[path];

      if (!handler) {
        let res = null;
        for (const route of routesCheck) {
          res = route.check(path);
          if (res) {
            break;
          }
        }
        if (!res) {
          throw new Error('404 Not Found');
        }
        return res;
      }

      return handler;
    },
  };
};
