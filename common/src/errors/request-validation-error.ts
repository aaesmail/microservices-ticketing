import { Result, ValidationError } from 'express-validator'
import { CustomError } from './custom-error'

export class RequestValidationError extends CustomError {
  statusCode = 400

  constructor(private errors: Result<ValidationError>) {
    super('Invalid request parameters')
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }

  serializeErrors() {
    return this.errors.array().map(err => ({
      message: err.msg,
      field: err.param,
    }))
  }
}
