import * as Utils from '../../../common/lib/util/utils';
import CometTransport from '../../../common/lib/transport/comettransport';
import Logger from '../../../common/lib/util/logger';
import Platform from 'platform';
import XHRRequest from './xhrrequest';

var XHRStreamingTransport = function (connectionManager) {
  var shortName = 'xhr_streaming';

  /* public constructor */
  function XHRStreamingTransport(connectionManager, auth, params) {
    CometTransport.call(this, connectionManager, auth, params);
    this.shortName = shortName;
  }
  Utils.inherits(XHRStreamingTransport, CometTransport);

  XHRStreamingTransport.isAvailable = function () {
    return Platform.xhrSupported && Platform.streamingSupported && Platform.allowComet;
  };

  XHRStreamingTransport.tryConnect = function (connectionManager, auth, params, callback) {
    var transport = new XHRStreamingTransport(connectionManager, auth, params);
    var errorCb = function (err) {
      callback({ event: this.event, error: err });
    };
    transport.on(['failed', 'disconnected'], errorCb);
    transport.on('preconnect', function () {
      Logger.logAction(Logger.LOG_MINOR, 'XHRStreamingTransport.tryConnect()', 'viable transport ' + transport);
      transport.off(['failed', 'disconnected'], errorCb);
      callback(null, transport);
    });
    transport.connect();
  };

  XHRStreamingTransport.prototype.toString = function () {
    return 'XHRStreamingTransport; uri=' + this.baseUri + '; isConnected=' + this.isConnected;
  };

  XHRStreamingTransport.prototype.createRequest = function (uri, headers, params, body, requestMode) {
    return XHRRequest.createRequest(uri, headers, params, body, requestMode, this.timeouts);
  };

  if (typeof connectionManager !== 'undefined' && XHRStreamingTransport.isAvailable()) {
    connectionManager.supportedTransports[shortName] = XHRStreamingTransport;
  }

  return XHRStreamingTransport;
};

export default XHRStreamingTransport;
