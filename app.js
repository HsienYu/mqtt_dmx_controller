const mqtt = require('mqtt');
const DMX = require('dmx')
const config = require('./config.json');

const dmx = new DMX();
var universe = dmx.addUniverse('demo', 'enttec-usb-dmx-pro', 'ttyUSB0')



var myLog = function (lbl, vars) {
    if (verbose) console.log(lbl, vars);
}

// check for command line arguments
var args = process.argv.slice(2);
var opts = {};
for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf('=') > 0) {
        var parts = args[i].split('=');
        opts[parts[0]] = parts[1];
    }
}

myLog('Command parameters: ', opts);

var verbose = (opts.verbose) ? true : config.verbose;
var url = 'tcp://';
if (opts.username && opts.password) {
    url += opts.username + ':' + opts.password + '@';
} else {
    url += config.username + ':' + config.password + '@';
}
url += (opts.host) ? opts.host : config.host;
myLog('MQTT subscriber connecting: ', url);
var client = mqtt.connect(url);
var sref = null;
var namespace = opts.namespace || config.namespace;
var playerId = opts.playerId || config.playerId;

client.on('connect', function () {
    myLog('MQTT subscriber connected: ', url);
    var topicSubscription = namespace + '/mqtt-media-player/' + playerId + '/#';
    myLog('MQTT subscribe to: ', topicSubscription);
    client.subscribe(topicSubscription);
});

var fog_on = function () {
    universe.updateAll(250);
    console.log('fog on');
    //client.publish(`${config.namespace}/mqtt-DMX/#`, 'fog_on');
}

var fog_off = function () {
    universe.updateAll(0);
    console.log('fog off');
    //client.publish(`${config.namespace}/mqtt-DMX/#`, 'fog_off');
}


client.on('message', function (topic, message) {
    var action = topic.toString().split('/').pop();
    myLog('MQTT subscriber action: ', action);
    var payload = message.toString();
    myLog('MQTT subscriber payload: ', payload);

    switch (payload) {
        case 'fog_on':
            fog_on();
            console.log('fog on now');
            break;
        case 'fog_off':
            fog_off();
            console.log('fog off now')
            break;
    }
});