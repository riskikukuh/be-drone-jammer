const routes = require('./routes');
const JammersHandler = require('./handler');

module.exports = {
  name: 'jammers',
  version: '0.0.1',
  register: async (server, {
    jammersService, jammersValidator, statisticsService, logService,
  }) => {
    const jammersHandler = new JammersHandler(jammersService, jammersValidator, statisticsService, logService);
    server.route(routes(jammersHandler));
  },
};
