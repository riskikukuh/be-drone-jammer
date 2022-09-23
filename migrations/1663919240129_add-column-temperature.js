/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('jammers', {
        temperature: {
            type: 'FLOAT',
            notNull: false,
        },
    });
};

exports.down = pgm => {
    pgm.dropColumn('jammers', 'temperature');
};
