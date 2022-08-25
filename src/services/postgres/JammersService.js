const {
  Pool,
} = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../api/exceptions/NotFoundError');
const InvariantError = require('../../api/exceptions/InvariantError');

class JammersService {
  constructor() {
    this._pool = new Pool();
  }

  async getJammers() {
    const { rows } = await this._pool.query('SELECT id, alias_name, ip, port, geolocation, location, last_on, status, created_at, updated_at FROM jammers');
    return rows;
  }

  async getJammerById(jammerId) {
    const query = {
      text: 'SELECT id, alias_name, ip, port, geolocation, location, last_on, status, created_at, updated_at FROM jammers WHERE id = $1',
      values: [jammerId],
    };

    const resultJammers = await this._pool.query(query);

    if (!resultJammers.rowCount) {
      throw new NotFoundError('Jammer tidak ditemukan');
    }

    return resultJammers.rows[0];
  }

  async getJammerByAliasName(aliasName) {
    const query = {
      text: 'SELECT id, alias_name, ip, port, geolocation, location, last_on, status, created_at, updated_at FROM jammers WHERE alias_name = $1',
      values: [aliasName],
    };

    const resultJammers = await this._pool.query(query);

    if (!resultJammers.rowCount) {
      throw new NotFoundError('Jammer tidak ditemukan');
    }

    return resultJammers.rows[0];
  }

  async addJammer({ alias, ip, port, lat, long, location }) {
    const geolocation = `(${lat},${long})`;
    const id = `jammer-${nanoid(16)}`;
    const lastOn = null;
    const status = "MATI";

    const query = {
      text: 'INSERT INTO jammers VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING id',
      values: [id, alias, ip, port, geolocation, location, lastOn, status, +new Date()],
    };

    const resultInsert = await this._pool.query(query);

    if (!resultInsert.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan jammer');
    }

    return resultInsert.rows[0];
  }

  async updateJammer(jammerId, { alias, ip, port, lat, long, location }) {
    const geolocation = `(${lat},${long})`;
    const query = {
      text: 'UPDATE jammers SET alias_name = $1, ip = $2, port = $3, geolocation = $4, location = $5 WHERE id = $6',
      values: [alias, ip, port, geolocation, location, jammerId],
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
    let status = "MATI"
    let query;
    if (isOn) {
      status = "HIDUP";
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

  async verifyAliasName(aliasName, jammerId = null) {
    let query;
    if (jammerId) {
      query = {
        text: 'SELECT alias_name FROM jammers WHERE alias_name = $1 AND id != $2',
        values: [aliasName, jammerId],
      };
    } else {
      query = {
        text: 'SELECT alias_name FROM jammers WHERE alias_name = $1',
        values: [aliasName],
      };
    }
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('Nama Lain telah digunakan');
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