require('dotenv').config();
const axios = require('axios').default;
const schedule = require('node-schedule');

const JammersService = require('./services/postgres/JammersService');
const StatisticsService = require('./services/postgres/StatisticsService');
const StatisticLogsService = require('./services/postgres/StatisticLogsService');

const { Util } = require('./utils/Util');

const ERROR_TRESHOLD = 3;

const getStats = async (jService, statsService, statisticLogService, mAxios) => {
    const jammers = await jService.getJammers();
    
    console.log(`# Get Statistik di waktu ${Date()} - ${jammers.length} detected`); 

    for (const jammer of jammers) {
        if (jammer.status != 'UNAVAILABLE') {
            try {
                let errorMessage = null;
                const stat = await getJammerStatLan(mAxios, jammer.ip, jammer.port).catch(err => {
                    errorMessage = err;
                    if (err.message) {
                        errorMessage = err.message;
                    }
                });
                if (errorMessage == null) {
                    const { temperature, electricCurrent, voltage } = stat;
                    if (temperature && electricCurrent && voltage) {
                        await statsService.addStatistic({ jammerId: jammer.id, ...stat });
                        await statisticLogService.addLog(jammer, stat, Util.status.SUCCESS);
                    } else {
                        await statsService.addStatistic({ jammerId: jammer.id, ...stat });
                        await setJammerUnavailable(jService, jammer.id, jammer.error_count);
                        await statisticLogService.addLog(jammer, stat, Util.status.FAILED);
                    }
                } else {
                    await statsService.addStatistic({ jammerId: jammer.id, ... {} });
                    await setJammerUnavailable(jService, jammer.id, jammer.error_count);
                    await statisticLogService.addLog(jammer, errorMessage, Util.status.FAILED);
                    console.error(errorMessage);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
};

const setJammerUnavailable = async (jService, jammerId, errorCount) => {
    const newErrorCount = errorCount + 1;
    if (newErrorCount >= ERROR_TRESHOLD) {
        await jService.updateErrorCount(jammerId, 3);
        await jService.markAsUnavailable(jammerId);
    } else {
        await jService.updateErrorCount(jammerId, newErrorCount);
    }
}

const getJammerStatLan = async (axios, ip, port) => {
    return new Promise(async (resolve, reject) => {
        try {
            const username = 'admin';
            const password = 'esp8266';
            const encryptedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
            const authHeader = `Basic ${encryptedCredentials}`;
            await axios.get(`http://${ip}:${port}/getStatistic`, {
                headers: {
                    authorization: authHeader,
                },
            })
            .then((response) => {
                const json = response.data;
                if (json.status == 200) {
                    resolve(json.data);
                } else {
                    reject("Statistik tidak ditemukan");
                }
            })
            .catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

const init = async () => {
    const jammerService = new JammersService();
    const statisticService = new StatisticsService();
    const statisticLogService = new StatisticLogsService();
    const _axios = axios.create({
        // timeout: 3000, // Development
        timeout: 30000, // 30 Second
    });

    const job = schedule.scheduleJob('*/1 * * * * *', async function() {
        await getStats(jammerService, statisticService, statisticLogService, _axios);
    });
};

init();