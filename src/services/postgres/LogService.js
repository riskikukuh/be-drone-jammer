const {
    Pool
} = require('pg');
const InvariantError = require('../../api/exceptions/InvariantError');

class LogService {
    constructor() {
        this._pool = new Pool();
    }
    
    async getJammerLogs() {
        const { rows } = await this._pool.query('SELECT * FROM jammer_logs ORDER BY created_at');
        return rows;
    }

    async addJammerLog(jammer, { action, actionStatus, errorMessage }) {
        const { id, name, ip, port, geolocation, lat, long, location, last_on, status, f900, f1200, f1500, f2400, f5800, active_freq = '', activated_freq = '', raw_payload = '' } = jammer || {};

        let resultActivatedFreq = '';
        if (active_freq) {
            resultActivatedFreq = active_freq.join(',');
        } else if (activated_freq) {
            resultActivatedFreq = activated_freq;
        }

        let geolocationFinalize = null;
        if (geolocation) {
            geolocationFinalize = `(${geolocation.x},${geolocation.y})`;
        } else if (lat & long) {
            geolocationFinalize = `(${lat ?? 0},${long ?? 0})`;
        }

        let resultRawPayload = '';
        if (raw_payload) {
            resultRawPayload = raw_payload;
        } 
        
        const query = {
            text: 'INSERT INTO jammer_logs (jammer_id, name, ip, port, geolocation, location, last_on, status, f900, f1200, f1500, f2400, f5800, activated_freq, action, action_status, error_message, raw_payload) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id',
            values: [id, name, ip, port, geolocationFinalize, location, last_on, status, f900, f1200, f1500, f2400, f5800, resultActivatedFreq, action, actionStatus, errorMessage, resultRawPayload],
        };

        const resultInsert = await this._pool.query(query);
        
        if (!resultInsert.rowCount > 0) {
            throw new InvariantError('Gagal menambahkan log jammer');
        }

        return resultInsert.rows[0];
    }
}

module.exports = LogService;
