/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('jammers', {
        f900: {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
        f1200: {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
        f1500: {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
        f2400: {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
        f5800: {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
        activated_freq: {
            type: 'TEXT',
            notNull: false,
            default: '',
        }
    });
};

exports.down = pgm => {
    pgm.dropColumn('jammers', ['f900', 'f1200', 'f1500', 'f2400', 'f5800', 'activated_freq']);
};
