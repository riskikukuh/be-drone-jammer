const {
  Pool,
} = require('pg');
const NotFoundError = require('../../api/exceptions/NotFoundError');
const InvariantError = require('../../api/exceptions/InvariantError');
const { Util } = require('../../utils/util');

class JammersService {
  constructor() {
    this._pool = new Pool();
  }

  async getJammers(freqs) {
    if (freqs) {
      let optionFreqs = '';
      Object.keys(freqs).forEach((x) => {
        optionFreqs += `f${freqs[x]} = true ${x == freqs.length - 1 ? '' : 'OR'} `;
      });
      const query = `SELECT id, name, ip, port, geolocation, location, activated_freq, f900, f1200, f1500, f2400, f5800, last_on, status, created_at, updated_at FROM jammers ${optionFreqs != '' ? `WHERE ${optionFreqs}` : ''} ORDER BY created_at`;

      const { rows } = await this._pool.query(query);
      return rows;
    }

    const query = 'SELECT id, name, ip, port, geolocation, location, last_on, activated_freq, f900, f1200, f1500, f2400, f5800, status, created_at, updated_at FROM jammers ORDER BY created_at';
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getJammerById(jammerId) {
    const query = {
      text: 'SELECT id, name, ip, port, geolocation, location, activated_freq, f900, f1200, f1500, f2400, f5800, last_on, status, created_at, updated_at FROM jammers WHERE id = $1',
      values: [jammerId],
    };

    const resultJammers = await this._pool.query(query);

    if (!resultJammers.rowCount) {
      throw new NotFoundError('Jammer tidak ditemukan');
    }

    return resultJammers.rows[0];
  }

  async getJammerByName(name) {
    const query = {
      text: 'SELECT id, name, ip, port, geolocation, location, last_on, status, created_at, updated_at FROM jammers WHERE name = $1',
      values: [name],
    };

    const resultJammers = await this._pool.query(query);

    if (!resultJammers.rowCount) {
      throw new NotFoundError('Jammer tidak ditemukan');
    }

    return resultJammers.rows[0];
  }

  async addJammer(data) {
    const id = `SCM${Util.generateId()}`;
    const lastOn = null;
    const status = 'MATI';
    const {
      name, ip, port, lat, long, location, active_freq,
    } = data;
    const {
      f900 = false, f1200 = false, f1500 = false, f2400 = false, f5800 = false,
    } = {};
    const geolocation = `(${lat},${long})`;

    const query = {
      text: 'INSERT INTO jammers (id, name, ip, port, geolocation, location, last_on, status, f900, f1200, f1500, f2400, f5800, activated_freq) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 ) RETURNING id',
      values: [id, name, ip, port, geolocation, location, lastOn, status, f900, f1200, f1500, f2400, f5800, active_freq.join(',')],
    };

    const resultInsert = await this._pool.query(query);

    if (!resultInsert.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan jammer');
    }

    return resultInsert.rows[0];
  }

  async updateJammer(jammerId, data) {
    const oldData = await this.getJammerById(jammerId);

    const {
      name, ip, port, lat, long, location, active_freq,
    } = data;
    const geolocation = `(${lat},${long})`;

    const updateStatusConfigFreq = {};
    for (const freq of [900, 1200, 1500, 2400, 5800]) {
      const index = active_freq.findIndex((f) => f === freq);
      if (index < 0) {
        updateStatusConfigFreq[`f${freq}`] = false;
      } else {
        updateStatusConfigFreq[`f${freq}`] = oldData[`f${freq}`];
      }
    }

    const valueStatusConfigFreq = Object.keys(updateStatusConfigFreq).map((freq) => updateStatusConfigFreq[freq]);

    const query = {
      text: 'UPDATE jammers SET name = $1, ip = $2, port = $3, geolocation = $4, location = $5, activated_freq = $6, f900 = $7, f1200 = $8, f1500 = $9, f2400 = $10, f5800 = $11 WHERE id = $12',
      values: [name, ip, port, geolocation, location, active_freq.join(','), ...valueStatusConfigFreq, jammerId],
    };
    await this._pool.query(query);
  }

  /*
    @require to verify jammer first
    @Params data is list frequency in `FLOAT`
  */
  async verifyActivatedFreq(jammerId, data) {
    const { frequency, status } = data;
    const resultQueryJammer = await this._pool.query({
      text: 'SELECT activated_freq FROM jammers WHERE id = $1 LIMIT 1',
      values: [jammerId],
    });
    const activatedJammerFreq = resultQueryJammer.rows[0].activated_freq?.split(',');
    if (!activatedJammerFreq.includes(frequency.toString())) {
      throw new InvariantError('Frekuensi belum diaktifkan');
    }
    const result = {};
    result[`f${frequency}`] = status;
    return result;
  }

  async updateFreq(jammerId, data) {
    const keys = Object.keys(data);
    const query = {
      text: `UPDATE jammers SET ${keys[0]} = $1 WHERE id = $2`,
      values: [data[keys[0]], jammerId],
    };
    await this._pool.query(query);
  }

  async deleteJammer(jammerId) {
    const query = {
      text: 'DELETE FROM jammers WHERE id = $1',
      values: [jammerId],
    };
    await this._pool.query(query);
  }

  async switchJammerById(jammerId, isOn) {
    let status = 'MATI';
    let query;
    if (isOn) {
      status = 'HIDUP';
      query = {
        text: 'UPDATE jammers SET last_on = $1, status = $2, updated_at = $3 WHERE id = $4',
        values: [+new Date(), status, +new Date(), jammerId],
      };
    } else {
      query = {
        text: 'UPDATE jammers SET status = $1, updated_at = $2 WHERE id = $3',
        values: [status, +new Date(), jammerId],
      };
    }

    await this._pool.query(query);
  }

  async resetJammer(jammerId) {
    const status = 'MATI';
    const query = {
      text: 'UPDATE jammers SET status = $1, last_on = $2, f900 = $3, f1200 = $4, f1500 = $5, f2400 = $6, f5800 = $7, activated_freq = $8, error_count = $9 WHERE id = $10',
      values: [status, null, 0, 0, 0, 0, 0, '', 0, jammerId],
    };

    await this._pool.query(query);

    const queryInsertResetTemperature = {
      text: 'INSERT INTO jammer_statistics (jammer_id, temperature, electric_current, voltage) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [jammerId, null, null, null],
    };

    await this._pool.query(queryInsertResetTemperature);
  }

  async verifyAnyJammer(id) {
    const query = {
      text: 'SELECT id FROM jammers WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount > 0) {
      throw new NotFoundError('Jammer tidak ditemukan');
    }
  }

  async verifyName(name, jammerId = null) {
    let query;
    if (jammerId) {
      query = {
        text: 'SELECT name FROM jammers WHERE name = $1 AND id != $2',
        values: [name, jammerId],
      };
    } else {
      query = {
        text: 'SELECT name FROM jammers WHERE name = $1',
        values: [name],
      };
    }
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('Nama telah digunakan');
    }
  }

  async verifyIpPort(ip, port, jammerId = null) {
    let query;
    if (jammerId) {
      query = {
        text: 'SELECT ip, port FROM jammers WHERE ip = $1 AND port = $2 AND id != $3',
        values: [ip, port, jammerId],
      };
    } else {
      query = {
        text: 'SELECT ip, port FROM jammers WHERE ip = $1 AND port = $2',
        values: [ip, port],
      };
    }
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('IP dan PORT telah digunakan');
    }
  }
}

module.exports = JammersService;
