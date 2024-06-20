export class HttpError extends Error {
  code;
  constructor(message: string, errorCode: number) {
    super(message);
    this.code = errorCode;
  }
}
