/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('jammers', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(200)',
            notNull: true,
        },
        ip: {
            type: 'TEXT',
            notNull: true,
        },
        port: {
            type: 'TEXT',
            notNull: true,
        },
        geolocation: {
            type: 'point',
            notNull: false,
        },
        location: {
            type: 'TEXT',
            notNull: false,
        },
        last_on: {
            type: 'BIGINT',
            notNull: false,
        },
        status: {
            type: 'VARCHAR(20)',
            notNull: true,
        },
        created_at: {
            type: 'BIGINT',
            notNull: true,
            default: pgm.func('extract(epoch FROM now()) * 1000'),
        },
        updated_at: {
            type: 'BIGINT',
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('jammers');
};
