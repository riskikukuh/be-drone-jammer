const { override } = require("joi");

class ClientError extends Error {
  constructor({ message, action = 'Default', type = 'Default', statusCode = 400 }) {
    super(message);
    this.action = action;
    this.type = type;
    this.statusCode = statusCode;
    this.name = 'ClientError';
  }

  toString() {
    return JSON.stringify(this);
  }

}

module.exports = ClientError;
