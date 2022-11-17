const ClientError = require("../api/exceptions/ClientError");

const Util = {
    generateId: () => {
        const date = new Date();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    },
    ACTION: {
        /*
            Action Jammer CRUD
        */
        ADD_JAMMER: "ADD JAMMER",
        GET_JAMMER_BY_ID: "GET JAMMER BY ID",
        EDIT_JAMMER: "EDIT JAMMER",
        EDIT_FREQ_JAMMER: "SWITCH FREQ JAMMER",
        DELETE_JAMMER: "DELETE JAMMER",
        SWITCH_JAMMER: "SWITCH JAMMER",
        SWITCH_JAMMER_ON: "SWITCH JAMMER ON",
        SWITCH_JAMMER_OFF: "SWITCH JAMMER OFF",

        /*
            Action Temperatures Jammers
        */
       ADD_TEMPERATURE_JAMMER: "ADD TEMPERATURE JAMMER",
    },
    ACTION_STATUS: {
        SUCCESS: "SUCCESS",
        ERROR: "ERROR",
    },
}

async function handleError(logic, action, type) {
    try {
        return await logic();
    } catch (e) {
        if (e instanceof ClientError) {
            e.action = action;
            e.type = type;
        }
        throw e;
    }
}

module.exports = { Util, handleError };
