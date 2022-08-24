const routes = (handler) => [
  {
    method: 'GET',
    path: `/jammers`,
    handler: handler.getJammersHandler,
  }, {
    method: 'POST',
    path: `/jammers`,
    handler: handler.addJammerHandler,
    options: {
      payload: {
        multipart: true,
      },
    },
  }, {
    method: 'GET',
    path: `/jammers/switch/{jammerId}/{isOn}`,
    handler: handler.toggleJammerHandler,
  },
];

module.exports = routes;
