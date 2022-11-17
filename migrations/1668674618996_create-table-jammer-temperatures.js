/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('jammer_temperatures', {
        id: {
            type: 'id',
            notNull: true,
            primaryKey: true,
        },
        jammer_id: {
            type: 'VARCHAR(50)',
            notNull: false,
        },
        temperature:  {
            type: 'FLOAT',
            notNull: true,
        },
        created_at: {
            type: 'BIGINT',
            notNull: true,
            default: pgm.func('extract(epoch FROM now()) * 1000'),
        },
    });
};

exports.down = pgm => {};
