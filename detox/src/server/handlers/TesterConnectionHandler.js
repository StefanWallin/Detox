const DetoxRuntimeError = require('../../errors/DetoxRuntimeError');

class TesterConnectionHandler {
  constructor({ api, session }) {
    this._api = api;
    this._api.appendLogDetails({
      trackingId: 'tester',
      role: 'tester',
      sessionId: session.id,
    });

    this._session = session;
  }

  handle(action) {
    if (!this._session.tester) {
      throw new DetoxRuntimeError({
        message: 'Failed to reach the app over the web socket connection.',
        hint: `\
1. Check if your app is actually running on the device.
If not, have you forgotten to call 'device.launchApp()', maybe?
2. If your app is running on the device, yet you see this message`,
        debugInfo: action,
      });
    }

    this._session.app.sendAction(action);
  }

  onError(error, action) {
    try {
      this._api.sendAction({
        type: 'error',
        params: {
          error: error.message,
        },
        messageId: action && action.messageId,
      });
    } catch (err) {
      this._log.error('Cannot forward the error details to the tester, printing it here:\n')
      throw err;
    }
  }
}

module.exports = TesterConnectionHandler;
