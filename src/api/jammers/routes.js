const routes = (handler) => [
  {
    method: 'GET',
    path: '/jammers',
    handler: handler.getJammersHandler,
  }, {
    method: 'GET',
    path: '/jammers/{jammerId}',
    handler: handler.getJammerByIdHandler,
  }, {
    method: 'POST',
    path: '/jammers',
    handler: handler.addJammerHandler,
    options: {
      payload: {
        multipart: true,
      },
    },
  }, {
    method: 'PUT',
    path: '/jammers/freq/{jammerId}',
    handler: handler.editFreqJammerHandler,
    options: {
      payload: {
        multipart: true,
      },
    },
  }, {
    method: 'PUT',
    path: '/jammers/{jammerId}',
    handler: handler.editJammerHandler,
    options: {
      payload: {
        multipart: true,
      },
    },
  }, {
    method: 'DELETE',
    path: '/jammers/{jammerId}',
    handler: handler.deleteJammerHandler,
  }, {
    method: 'GET',
    path: '/jammers/switch/{jammerId}/{isOn}',
    handler: handler.toggleJammerHandler,
  }, {
    method: 'POST',
    path: '/jammers/temp/{jammerId}',
    handler: handler.addTemperature,
  },
];

module.exports = routes;
