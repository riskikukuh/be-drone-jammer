const InvariantError = require('../../api/exceptions/InvariantError');
const {
  JammerPayloadSchema,
  JammerFrequenciesSchema,
  JammerFrequenciesParamsSchema,
  JammerFullPayloadSchema,
  JammerTemperatureSchema,
} = require('./schema');

const JammersValidator = {
  validateFullJammerPayload: (payload) => {
    const validationResult = JammerFullPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateJammersPayload: (params) => {
    const validationResult = JammerPayloadSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateJammerFreqs: (payload) => {
    const validationResult = JammerFrequenciesSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateJammerFrequenciesParams: (params) => {
    const validationResult = JammerFrequenciesParamsSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateJammerTemperaturePayload: (payload) => {
    const validationResult = JammerTemperatureSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = JammersValidator;
