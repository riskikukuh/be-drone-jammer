const {
    Pool,
} = require('pg');
const NotFoundError = require('../../api/exceptions/NotFoundError');

class JammersService {
    constructor() {
        this._pool = new Pool();
    }

    async getJammers() {
        const query = `SELECT id, name, ip, port, status, error_count, created_at, updated_at FROM jammers WHERE status != 'UNAVAILABLE' ORDER BY created_at`;
        const { rows } = await this._pool.query(query);
        return rows;
    }

    async updateErrorCount(jammerId, count) {
        const query = {
            text: 'UPDATE jammers SET error_count = $1 WHERE id = $2',
            values: [count, jammerId],
        };

        await this._pool.query(query);
    }

    async markAsUnavailable(jammerId) {
        const queryFindJammer = {
            text: 'SELECT id FROM jammers where id = $1',
            values: [jammerId],
        };
        const checkJammer = await this._pool.query(queryFindJammer);

        if (!checkJammer.rowCount) {
            throw new NotFoundError('Jammer tidak ditemukan');
        }

        const query = {
            text: 'UPDATE jammers SET status = $1 WHERE id = $2',
            values: ['UNAVAILABLE', jammerId],
        };

        await this._pool.query(query);
    }
}

module.exports = JammersService;
