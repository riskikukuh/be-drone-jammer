const Joi = require('joi');

const JammerPayloadSchema = Joi.object({
    alias: Joi.string().required(),
    ip: Joi.string().required().regex(/^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/).message("IP Address tidak sesuai format"),
    port: Joi.number().required().min(0).max(65536).message("Port tidak boleh melebihi 65536"),
    lat: Joi.number().required(),
    long: Joi.number().required(),
    location: Joi.string().required(),
});

module.exports = {
    JammerPayloadSchema,
};