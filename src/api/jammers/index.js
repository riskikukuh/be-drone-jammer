const routes = require('./routes');
const JammersHandler = require('./handler');

module.exports = {
  name: 'jammers',
  version: '0.0.1',
  register: async (server, { jammersService }) => {
    const jammersHandler = new JammersHandler(jammersService);
    server.route(routes(jammersHandler));
  },
};