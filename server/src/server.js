/* eslint-disable no-console */
require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Jammers
const jammers = require('./api/jammers');
const JammersService = require('./services/postgres/JammersService');
const jammersValidator = require('./validator/jammers');

// Exceptions
const ClientError = require('./api/exceptions/ClientError');
const LogService = require('./services/postgres/LogService');
const { Util } = require('./utils/util');

// Statistics
const StatisticsService = require('./services/postgres/StatisticsService');

const init = async () => {
  const jammersService = new JammersService();
  const statisticsService = new StatisticsService();
  const logService = new LogService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: jammers,
      routes: {
        prefix: '/api',
      },
      options: {
        jammersService,
        jammersValidator,
        statisticsService,
        logService,
      },
    },
  ]);

  server.ext('onPreResponse', async (request, h) => {
    const { response } = request;
    if (response.isBoom) {
      if (response instanceof ClientError) {
        const errorResponse = {
          status: 'error',
          message: response.message,
        };
        if (response.type == 'Jammer') {
          await logService.addJammerLog({
            raw_payload: JSON.stringify(request.payload || request.params || {}),
          }, {
            action: response.action,
            actionStatus: Util.ACTION_STATUS.ERROR,
            errorMessage: JSON.stringify({
              status: response.statusCode,
              ...errorResponse,
            }),
          });
        }
        const newResponse = h.response(errorResponse);
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (response.isServer) {
        console.error(response);
        const newResponse = h.response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        newResponse.code(500);
        return newResponse;
      }
      console.error(response);
      return response.continue || response;
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
