/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('jammers', {
        error_count: {
            type: 'INT',
            notNull: true,
            default: 0,
        },
    });
};

exports.down = pgm => {
    pgm.dropColumn('jammers', ['error_count']);
};
