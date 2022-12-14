const {
  Pool,
} = require('pg');

class StatisticsService {
  constructor() {
    this._pool = new Pool();
  }

  async getLatestStatisticByJammerId(jammerId) {

    const query = {
      text: 'SELECT temperature, electric_current, voltage FROM jammer_statistics WHERE jammer_id = $1 ORDER BY created_at DESC LIMIT 1',
      values: [jammerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount > 0) {
      return { temperature: null, electricCurrent: null, voltage: null };
    }

    const { temperature, electric_current, voltage } = result.rows[0];
    return { temperature, electricCurrent : electric_current, voltage };
  }
}

module.exports = StatisticsService;
