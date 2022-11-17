/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('jammer_logs', {
        raw_payload: {
            type: 'TEXT'
        },
    });
};

exports.down = pgm => {
    pgm.dropColumn('jammer_logs', ['raw_payload']);
};
