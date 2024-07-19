export class CustomError extends Error {
  // stack tells where actually error happend
  // Error base class already traces error stack
  // this class handles future/ potential error
  constructor(message, statusCode) {
    super(message);
    // if status > 400 <500 fail client errors
    // 500>  <599error server errors
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    // Error.captureStackTrace(this, this.constructor);
  }
}
