/* eslint-disable no-console */
require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Jammers
const jammers = require('./api/jammers');
const JammersService = require('./services/postgres/JammersService');
const jammersValidator = require('./validator/jammers');

// Exceptions
const ClientError = require('./api/exceptions/ClientError');

const init = async () => {
    const jammersService = new JammersService();

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
            }
        }
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;
        if (response.isBoom) {
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'error',
                    message: response.message,
                });
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
