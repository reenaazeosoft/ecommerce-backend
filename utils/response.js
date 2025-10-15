/**
 * Unified response helpers
 * statusFlag: 0 (Failure), 1 (Success), 2 (Success with Warning)
 */
function send(res, httpCode, payload) {
  return res.status(httpCode).json(payload);
}
function success(res, message = 'OK', data = [], httpCode = 200) {
  return send(res, httpCode, { errorCode: 0, statusFlag: 1, message, data });
}
function warn(res, message = 'OK (with warnings)', data = [], errorCode = 655, httpCode = 200) {
  return send(res, httpCode, { errorCode, statusFlag: 2, message, data });
}
function failure(res, message = 'Failure', errorCode = 655, httpCode = 500) {
  return send(res, httpCode, { errorCode, statusFlag: 0, message, data: [] });
}
function unauthorized(res, message = 'Unauthorized') {
  return send(res, 401, { errorCode: 302, statusFlag: 0, message, data: [] });
}
function notFound(res, message = 'Not Found') {
  return send(res, 404, { errorCode: 302, statusFlag: 0, message, data: [] });
}
module.exports = { success, warn, failure, unauthorized, notFound };
