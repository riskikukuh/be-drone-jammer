const InvariantError = require("../exceptions/InvariantError");
const axios = require('axios').default;
const { Util, handleError } = require('../../utils/util');

class JammersHandler {
    constructor(service, jammersValidator, logService) {
        this._jammersService = service;
        this._jammersValidator = jammersValidator;
        this._logService = logService;
        this._axios = axios.create({
            timeout: 1000, // 30s for timeout
        });

        this.getJammersHandler = this.getJammersHandler.bind(this);
        this.addJammerHandler = this.addJammerHandler.bind(this);
        this.editFreqJammerHandler = this.editFreqJammerHandler.bind(this);
        this.toggleJammerHandler = this.toggleJammerHandler.bind(this);
        this.editJammerHandler = this.editJammerHandler.bind(this);
        this.deleteJammerHandler = this.deleteJammerHandler.bind(this);
    }

    async getJammersHandler(request, h) {
        let { freqs } = request.query;
        freqs = freqs?.split(',');
        
        await this._jammersValidator.validateJammerFrequenciesParams({freqs});
        
        const jammers = (await this._jammersService.getJammers(freqs)).map((jammer) => {
            const config = {
                activated: jammer.activated_freq.split(','),
                f900: jammer.f900,
                f1200: jammer.f1200,
                f1500: jammer.f1500,
                f2400: jammer.f2400,
                f5800: jammer.f5800,
            };
            
            delete jammer['activated_freq'];
            delete jammer['f900'];
            delete jammer['f1200'];
            delete jammer['f1500'];
            delete jammer['f2400'];
            delete jammer['f5800'];

            return { ...jammer, config };
        });
        
        return h.response({
            status: 'success',
            data: jammers,
        });
    }

    async addJammerHandler(request, h) {
        return await handleError(async () =>{
            await this._jammersValidator.validateFullJammerPayload(request.payload);
            const { name, ip, port } = request.payload;
            
            await this._jammersService.verifyName(name);
            await this._jammersService.verifyIpPort(ip, port);
            
            const jammer = await this._jammersService.addJammer(request.payload);
            
            await this._logService.addJammerLog({...request.payload, id: jammer.id}, { action: Util.ACTION.ADD_JAMMER, actionStatus: Util.ACTION_STATUS.SUCCESS, errorMessage: '' });

            return h.response({
                status: 'success',
                data: {
                    ...jammer
                },
            }).code(201);
        }, Util.ACTION.ADD_JAMMER, 'Jammer');
    }

    async editFreqJammerHandler(request, h) {
        return await handleError(async () => {
            const { jammerId } = request.params;
            await this._jammersService.verifyAnyJammer(jammerId);
            await this._jammersValidator.validateJammerFreqs(request.payload);
            const jammerFreq = await this._jammersService.verifyActivatedFreq(jammerId, request.payload);
            await this._jammersService.updateFreq(jammerId, jammerFreq);

            await this._logService.addJammerLog({...request.payload}, { action: Util.ACTION.EDIT_FREQ_JAMMER, actionStatus: Util.ACTION_STATUS.SUCCESS, errorMessage: '' });
            
            return h.response({
                status: 'success',
            });

        }, Util.ACTION.EDIT_FREQ_JAMMER, 'Jammer');
    }

    async toggleJammerHandler(request, h) {
        let action = Util.ACTION.SWITCH_JAMMER_ON;
        let castedIsOn = "on";
        let jammerIdFinalized = null;
        await handleError(async () => {
            const defaultStatus = ["on", "off"];
            const { jammerId, isOn } = request.params;
            jammerIdFinalized = jammerId;
            await this._jammersService.verifyAnyJammer(jammerId);
            castedIsOn = isOn.toLowerCase();
            if (!defaultStatus.includes(castedIsOn)) {
                throw new InvariantError('Status tidak diketahui');
            }
            if (castedIsOn == "off") {
                action = Util.ACTION.SWITCH_JAMMER_OFF;
            }
        }, Util.ACTION.SWITCH_JAMMER, 'Jammer');
        
        return await handleError( async () => {
            const jammer = await this._jammersService.getJammerById(jammerIdFinalized);
            const { ip, port } = jammer;
            let errorMessage;
            const resultSwitch = await this.switchJammerLan(ip, port, castedIsOn).catch(err => {
                console.error("====> ERROR");
                console.error(err);
                errorMessage = err;
            });
            if (resultSwitch == castedIsOn) {
                await this._jammersService.switchJammerById(jammerIdFinalized, resultSwitch == "on");
                
                await this._logService.addJammerLog(jammer, { action, actionStatus: Util.ACTION_STATUS.SUCCESS, errorMessage: resultSwitch });
                
                return h.response({
                    status: 'success',
                    data: {
                        jammerStatus: resultSwitch,
                    },
                });
            } else if (resultSwitch) {
                await this._logService.addJammerLog(jammer, { action, actionStatus: Util.ACTION_STATUS.ERROR, errorMessage: 'Gagal menghidupkan jammer, silahkan coba kembali nanti' });

                return h.response({
                    status: 'error',
                    message: 'Gagal menghidupkan jammer, silahkan coba kembali nanti',
                }).code(500);
            }

            await this._logService.addJammerLog(jammer, { action, actionStatus: Util.ACTION_STATUS.ERROR, errorMessage: errorMessage.message });

            return h.response({
                status: 'error',
                message: errorMessage.message,
            }).code(504);
        }, action, 'Jammer');
    }

    async switchJammerLan(ip, port, isOn) {
        const expectResult = isOn;
        const username = 'admin';
        const password = 'esp8266';
        const encryptedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
        const authHeader = `Basic ${encryptedCredentials}`;
        return new Promise(async (resolve, reject) => {
            try {
                await this._axios.get(`http://${ip}:${port}/api/${isOn}`, {
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
            } catch(error) {
                reject(error);
            }
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
        return await handleError( async () => {
            const { jammerId } = request.params;
            await this._jammersService.verifyAnyJammer(jammerId);
            await this._jammersValidator.validateFullJammerPayload(request.payload);
            const { name, ip, port } = request.payload;
            await this._jammersService.verifyName(name, jammerId);
            await this._jammersService.verifyIpPort(ip, port, jammerId);
            await this._jammersService.updateJammer(jammerId, request.payload);
            return h.response({
                status: 200,
                message: "Berhasil mengubah Jammer"
            });
        }, Util.ACTION.EDIT_JAMMER, 'Jammer');
    }

    async deleteJammerHandler(request, h) {
        return await handleError(async () => {
            const { jammerId } = request.params;
            const jammer = await this._jammersService.getJammerById(jammerId);
            await this._jammersService.deleteJammer(jammerId);
            
            await this._logService.addJammerLog(jammer, { action: Util.ACTION.DELETE_JAMMER, actionStatus: Util.ACTION_STATUS.SUCCESS, errorMessage: '' });

            return h.response({
                status: 200,
                message: "Berhasil menghapus Jammer",
            });
        }, Util.ACTION.DELETE_JAMMER, 'Jammer');
    }
}

module.exports = JammersHandler;
