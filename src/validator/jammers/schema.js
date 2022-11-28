const Joi = require('joi');

const JammerFullPayloadSchema = Joi.object({
  name: Joi.string().required(),
  ip: Joi.string().required().regex(/^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/).message('IP Address tidak sesuai format'),
  port: Joi.number().required().min(0).max(65536)
    .message('Port tidak boleh melebihi 65536'),
  lat: Joi.number().required(),
  long: Joi.number().required(),
  location: Joi.string().required(),
  active_freq: Joi.array().items(Joi.number().valid(900, 1200, 1500, 2400, 5800)),
});

const JammerPayloadSchema = Joi.object({
  name: Joi.string().required(),
  ip: Joi.string().required().regex(/^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/).message('IP Address tidak sesuai format'),
  port: Joi.number().required().min(0).max(65536)
    .message('Port tidak boleh melebihi 65536'),
  lat: Joi.number().required(),
  long: Joi.number().required(),
  location: Joi.string().required(),
});

const JammerFrequenciesSchema = Joi.object({
  frequency: Joi.number().required().valid(900, 1200, 1500, 2400, 5800),
  status: Joi.boolean().required(),
});

const JammerFrequenciesParamsSchema = Joi.object({
  freqs: Joi.array().items(Joi.string().valid('900', '1200', '1500', '2400', '5800').required()),
});

const JammerTemperatureSchema = Joi.object({
  temperature: Joi.number().required(),
});

module.exports = {
  JammerPayloadSchema,
  JammerFrequenciesSchema,
  JammerFrequenciesParamsSchema,
  JammerFullPayloadSchema,
  JammerTemperatureSchema,
};
