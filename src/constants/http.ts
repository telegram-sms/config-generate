const httpStatusMessages: { [key: number]: string } = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    // Add more status codes and messages as needed
};

function getHttpStatusMessage(statusCode: number): string {
    return httpStatusMessages[statusCode] || statusCode.toString();
}
export default getHttpStatusMessage;