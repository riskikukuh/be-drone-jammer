const {
    Pool,
  } = require('pg');
  const InvariantError = require('../../api/exceptions/InvariantError');
  
  class StatisticLogsService {
    constructor() {
      this._pool = new Pool();
    }
  
    async addLog(data, rawStatistic, status) {
      const { id, temperature, electric_current: electricCurrent, voltage } = data;
  
      const query = {
        text: 'INSERT INTO statistic_logs (jammer_id, temperature, electric_current, voltage, raw_statistic, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        values: [id, temperature, electricCurrent, voltage, rawStatistic, status],
      };
  
      const resultInsert = await this._pool.query(query);
  
      if (!resultInsert.rowCount > 0) {
        throw new InvariantError('Gagal menambahkan log statistik');
      }
  
      return resultInsert.rows[0];
    }
  }
  
  module.exports = StatisticLogsService;
  