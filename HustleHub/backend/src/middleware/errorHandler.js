// Central error handler: logs details server-side, never leaks internals to the client.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Duplicate key (unique email) - e.g. two simultaneous registrations
  if (err && err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Unable to register with the provided details.' });
  }

  // Malformed JSON body
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }

  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
}

module.exports = errorHandler;
