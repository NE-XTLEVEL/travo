import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger("HttpExceptionFilter");

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // Get the context of the request
    const response = ctx.getResponse(); // Get the response object
    const request = ctx.getRequest(); // Get the request object

    const status = exception.getStatus(); // Get the HTTP status code from the exception
    const timestamp = new Date().toISOString(); // Get the current timestamp in ISO format

    const errorResponse =
      typeof exception.getResponse() === "string"
        ? { message: exception.getResponse() }
        : (exception.getResponse() as object); // Get the error response from the exception

    this.logger.error(
      JSON.stringify({
        timestamp,
        method: request.method,
        url: request.url,
        status_code: status,
        ip: request.get("x-forwarded-for") || request.ip,
        ...errorResponse,
      }),
    ); // Log the error details

    response.status(status).json({
      status_code: status,
      timestamp,
      ...errorResponse,
    }); // Send the error response to the client
  }
}
