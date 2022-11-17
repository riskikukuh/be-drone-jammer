const {
    Pool,
  } = require('pg');
  const NotFoundError = require('../../api/exceptions/NotFoundError');
  const InvariantError = require('../../api/exceptions/InvariantError');
  const { Util } = require('../../utils/util');
  
  class TemperaturesService {
    constructor() {
      this._pool = new Pool();
    }
    
    async addTemperature(data) {
        const { jammerId, temperature } = data;
        
        const query = {
            text: 'INSERT INTO jammer_temperatures (jammer_id, temperature) VALUES ($1, $2) RETURNING id',
            values: [jammerId, temperature],
        };
      
        const resultInsert = await this._pool.query(query);

        if (!resultInsert.rowCount > 0) {
            throw new InvariantError('Gagal menambahkan temperature');
        }
      
        return resultInsert.rows[0];
    }

  }
  
  module.exports = TemperaturesService;