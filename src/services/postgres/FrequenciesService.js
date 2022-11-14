const {
    Pool,
} = require('pg');
const NotFoundError = require('../../api/exceptions/NotFoundError');

class FrequenciesService {
    constructor() {
        this._pool = new Pool();
    }

    async getFrequencies(withId = true) {
        let query = 'SELECT frequency FROM frequencies ORDER BY created_at';
        if (withId) {
            query = 'SELECT id, frequency FROM frequencies ORDER BY created_at'
        }
        const { rows } = await this._pool.query(query);
        return rows;
    }

    async getFrequencyById(frequencyId) {
        const query = {
            text: 'SELECT id, frequency FROM frequencies WHERE id = $1',
            values: [frequencyId],
        };

        const resultFreq = await this._pool.query(query);

        if (!resultFreq.rowCount) {
            throw new NotFoundError('Frequency not found');
        }

        return resultFreq.rows[0];
    }

    async verifyByFrequencies(freqs = []) {
        for await (const freq of freqs) {
            const query = {
                text: 'SELECT frequency FROM frequencies WHERE frequency = $1',
                values: [freq],
            };
    
            const resultFreq = await this._pool.query(query);
    
            if (!resultFreq.rowCount) {
                throw new NotFoundError('Frequency not found');
            }
        }
    }
}

module.exports = FrequenciesService;