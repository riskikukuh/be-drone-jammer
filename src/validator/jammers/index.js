const InvariantError = require('../../api/exceptions/InvariantError');
const {
    JammerPayloadSchema,
} = require('./schema');

const JammersValidator = {
  validateJammersPayload: (params) => {
    const validationResult = JammerPayloadSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = JammersValidator;