const InvariantError = require("../exceptions/InvariantError");
const axios = require('axios').default;

class JammersHandler {
    constructor(service) {
        this._jammersService = service;

        this.getJammersHandler = this.getJammersHandler.bind(this);
        this.addJammerHandler = this.addJammerHandler.bind(this);
        this.toggleJammerHandler = this.toggleJammerHandler.bind(this);
        this.editJammerHandler = this.editJammerHandler.bind(this);
        this.deleteJammerHandler = this.deleteJammerHandler.bind(this);
    }

    async getJammersHandler(request, h) {
        const jammers = await this._jammersService.getJammers();
        return h.response({
            status: 'success',
            data: jammers,
        });
    }

    async addJammerHandler(request, h) {
        const { alias, ip, port, lat, long, location } = request.payload;
        await this._jammersService.verifyAliasName(alias);
        await this._jammersService.verifyIpPort(ip, port);
        const jammer = await this._jammersService.addJammer({ alias, ip, port, lat, long, location });

        return h.response({
            status: 'success',
            data: {
                ...jammer
            },
        }).code(201);
    }

    async toggleJammerHandler(request, h) {
        const defaultStatus = ["on", "off"];
        const { jammerId, isOn } = request.params;
        await this._jammersService.verifyAnyJammer(jammerId);
        const castedIsOn = isOn.toLowerCase();
        if (!defaultStatus.includes(castedIsOn)) {
            throw new InvariantError('Status tidak diketahui');
        }

        const { ip, port } = await this._jammersService.getJammerById(jammerId);
        let errorMessage;
        const resultSwitch = await this.switchJammerLan(ip, port, castedIsOn).catch(err => {
            console.error("====> ERROR");
            console.error(err);
            errorMessage = err;
        });
        if (resultSwitch == castedIsOn) {
            await this._jammersService.switchJammerById(jammerId, resultSwitch == "on");
            return h.response({
                status: 'success',
                data: {
                    jammerStatus: resultSwitch,
                },
            });
        }
        return h.response({
            status: 'error',
            message: errorMessage.message,
            data: {
                jammerStatus: resultSwitch,
            },
        }).code(504);
    }

    async switchJammerLan(ip, port, isOn) {
        const expectResult = isOn;
        const username = 'admin';
        const password = 'esp8266';
        const encryptedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
        const authHeader = `Basic ${encryptedCredentials}`;
        return new Promise(async (resolve, reject) => {
            await axios.get(`http://${ip}:${port}/api/${isOn}`, {
                headers: {
                    'authorization': authHeader,
                }
            })
                .then(function (response) {
                    const json = response.data;
                    if (json.status == expectResult) {
                        resolve(json.status);
                    } else {
                        reject("Jammer gagal menyala");
                    }
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    // TODO: Reset Jammer
    async resetJammerHandler(request, h) {
        const statuses = ["MATI", "HIDUP", "ERROR"];
        const { status } = request.payload;
        if (!statuses.includes(status)) {
            status = "MATI";
        }
    }

    async editJammerHandler(request, h) {
        const { jammerId } = request.params;
        await this._jammersService.verifyAnyJammer(jammerId);
        const { alias, ip, port, lat, long, location } = request.payload;
        await this._jammersService.verifyAliasName(alias, jammerId);
        await this._jammersService.verifyIpPort(ip, port, jammerId);
        await this._jammersService.updateJammer(jammerId, { alias, ip, port, lat, long, location});
        return h.response({
            status: 200,
            message: "Berhasil mengubah Jammer"
        });
    }

    async deleteJammerHandler(request, h) {
        const { jammerId } = request.params;
        await this._jammersService.verifyAnyJammer(jammerId);
        await this._jammersService.deleteJammer(jammerId);
        return h.response({
            status: 200,
            message: "Berhasil menghapus Jammer",
        });
    }
}

module.exports = JammersHandler;
