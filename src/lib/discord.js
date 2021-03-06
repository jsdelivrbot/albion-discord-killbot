var debug = require('debug')('Albion:Bot');
var Discord = require('discord.js');

class Bot {
  constructor(token) {
    this.client = new Discord.Client();
    this.token = token;
    this.plugins = [];
  }
  setupHandlers() {
    this.plugins.forEach(plugin => {
      this.client.on('message', msg => {
        // Don't handle bot messages
        if(msg.author.bot) {
          return;
        }
        plugin.onMessage(msg);
      });
    });
  }

  login(cb) {
    debug('Setting up handlers before logging in');
    this.setupHandlers();
    debug('Handlers setup finished.');

    this.client.on('ready', () => {
      debug("Event: ready triggered");
      var startDate = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '');
      this.client.user.setGame(`since ${startDate}`);

      this.plugins.forEach(plugin => {
        if (plugin.onInit) {
          debug('Calling onInit for plugin');
          plugin.onInit();
        }
      });
    });

    debug('Logging in...');
    this.client.login(this.token, (token) => {
      debug('Logged in.');
      cb();
    });
  }

  use(pluginList) {
    debug('Registering plugins');
    pluginList.forEach(PluginClass => {
      var plugin = new PluginClass(this);
      this.plugins.push(plugin);
    });
  }

}

module.exports = Bot;
