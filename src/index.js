export default (routes) => {
  const mapRoutesToHandler = routes.reduce(
    (acc, { path, handler }) => ({ ...acc, [path]: handler }),
    {}
  );

  return {
    serve(path) {
      const handler = mapRoutesToHandler[path];

      if (!handler) {
        throw new Error('Path not exist');
      }

      return handler;
    },
  };
};
