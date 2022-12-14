const {
  Pool,
} = require('pg');
const InvariantError = require('../../api/exceptions/InvariantError');

class StatisticsService {
  constructor() {
    this._pool = new Pool();
  }

  async addStatistic(data) {
    const { jammerId, temperature = null, electricCurrent = null, voltage = null} = data;

    const query = {
      text: 'INSERT INTO jammer_statistics (jammer_id, temperature, electric_current, voltage) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [jammerId, temperature, electricCurrent, voltage],
    };

    const resultInsert = await this._pool.query(query);

    if (!resultInsert.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan statistik');
    }

    return resultInsert.rows[0];
  }
}

module.exports = StatisticsService;
