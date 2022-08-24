const {
  Pool,
} = require('pg');
// import { nanoid } from 'nanoid';
const { nanoid } = require('nanoid');
// import { nanoid } from 'nanoid'
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

    await this.verifyAliasName(alias);
    await this.verifyIpPort(ip, port);

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

  async updateJammer({ alias, ip, port, lat, long, location, status }) {
    await this.verifyAnyJammer(id);    
    await this.verifyAliasName(alias, id);
    const geolocation = `(${lat},${long})`;
    const statuses = ["MATI", "HIDUP", "ERROR"];
    
    if (!statuses.includes(status)) {
      status = "MATI";
    }

    const query = {
      text: 'UPDATE jammers SET alias_name = $1, ip = $2, port = $3, geolocation = $4, location = $5, status = $6 WHERE id = $7',
      values: [alias, ip, port, geolocation, location, status, id],
    };

    await this._pool.query(query);
  }

  async switchJammerById(jammerId, isOn) {
    await this.verifyAnyJammer(jammerId);    

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

  async verifyIpPort(ip, port) {
    const query = {
      text: 'SELECT ip, port FROM jammers WHERE ip = $1 AND port = $2',
      values: [ip, port],
    };
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('IP dan PORT telah digunakan');
    }
  }

}

module.exports = JammersService;