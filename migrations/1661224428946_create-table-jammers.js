/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('jammers', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        alias_name: {
            type: 'VARCHAR(200)',
            notNull: true,
            unique: true,
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
            type: 'VARCHAR(10)',
            notNull: true,
        },
        created_at: {
            type: 'BIGINT',
            notNull: true,
        },
        updated_at: {
            type: 'BIGINT',
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('jammers');
};
