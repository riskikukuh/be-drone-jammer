/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('jammer_logs', {
        id: {
            type: 'id',
            notNull: true,
            primaryKey: true,
        },
        jammer_id: {
            type: 'VARCHAR(50)',
            notNull: false,
        },
        name: {
            type: 'VARCHAR(200)',
            notNull: false,
        },
        ip: {
            type: 'TEXT',
            notNull: false,
        },
        port: {
            type: 'TEXT',
            notNull: false,
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
            notNull: false,
        },
        action: {
            type: 'TEXT',
            notNull: false,
        },
        action_status: {
            type: 'VARCHAR(10)',
            notNull: false,
        },
        error_message: {
            type: 'TEXT',
            notNull: false,
        },
        created_at: {
            type: 'BIGINT',
            notNull: true,
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('jammer_logs');
};
