/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('jammer_logs', {
        f900: {
            type: 'BOOLEAN',
            notNull: false,
        },
        f1200: {
            type: 'BOOLEAN',
            notNull: false,
        },
        f1500: {
            type: 'BOOLEAN',
            notNull: false,
        },
        f2400: {
            type: 'BOOLEAN',
            notNull: false,
        },
        f5800: {
            type: 'BOOLEAN',
            notNull: false,
        },
        activated_freq: {
            type: 'TEXT',
            notNull: false,
            default: '',
        }
    });
};

exports.down = pgm => {
    pgm.dropColumn('jammer_logs', ['f900', 'f1200', 'f1500', 'f2400', 'f5800', 'activated_freq']);
};
