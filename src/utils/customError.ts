export default class CustomError extends Error {
  code: string;
  errorData?: any;

  constructor(code: string, message: string, errorData?: any) {
    super(message);
    this.code = code;
    this.errorData = errorData;
    this.name = "CustomError";
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      errorData: this.errorData,
    };
  }
}
