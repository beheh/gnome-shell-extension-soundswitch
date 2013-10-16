//
// Soundswitch
// Switch the audio output device in the system status area.
//
// Benedict Etzel <developer@beheh.de>
// Based on Advanced Volume Mixer by Harry Karvonen <harry.karvonen@gmail.com>
//
//

const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Gvc = imports.gi.Gvc;
const Signals = imports.signals;
const St = imports.gi.St;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

let advMixer;

function AdvMixer(menu, soundcontrol) {
  this._init(menu, soundcontrol);
}


AdvMixer.prototype = {
  _init: function(menu, soundcontrol) {
    this.menu = menu;
    this.control = soundcontrol._control;
    this.outputs = {};
    this.menuItem = false;
    this.section = new PopupMenu.PopupMenuSection();
    this.switchMenu = new PopupMenu.PopupSubMenuMenuItem(_("Sound Output"), true);
    this.switchMenu.icon.icon_name = 'audio-card-symbolic';

    this._streamAddedId = this.control.connect("stream-added", Lang.bind(this, this._streamAdded));
    this._streamRemovedId = this.control.connect("stream-removed", Lang.bind(this, this._streamRemoved));
    this._defaultSinkChangedId = this.control.connect("default-sink-changed", Lang.bind(this, this._defaultSinkChanged));

    // Add the selector
    this.section.addMenuItem(this.switchMenu);
    this.menu.menu.addMenuItem(this.section, this.menu.menu.numMenuItems - 2);

    // Add streams
    let streams = this.control.get_streams();
    for (let i = 0; i < streams.length; i++) {
      this._streamAdded(this.control, streams[i].id);
    }

    if (this.control.get_default_sink() != null) {
      this._defaultSinkChanged(this.control, this.control.get_default_sink().id);
    }

  },

  _streamAdded: function(control, id) {
    if (id in this.outputs) {
      return;
    }

    let stream = control.lookup_stream_id(id);

    if (!stream["is-event-stream"] && stream instanceof Gvc.MixerSink) {
      let output = new PopupMenu.PopupMenuItem(stream.description);

      output.connect("activate", function (item, event) { control.set_default_sink(stream); });

      this.switchMenu.menu.addMenuItem(output);
      this.outputs[id] = output;

      if (!this.menuItem && Object.keys(this.outputs).length > 1) {
	// show menu when multiple outputs
        this.section.actor.visible = true;
      }

    }
  },

  _streamRemoved: function(control, id) {
    if (id in this.outputs) {
      this.outputs[id].destroy();
      delete this.outputs[id];
      if (Object.keys(this.outputs).length < 2) {
	// hide menu when only a single output
	this.section.actor.visible = false;
      }
    }
  },

  _defaultSinkChanged: function(control, id) {
    /*for (let output in this.outputs) {
      this.outputs[output].setShowDot(output == id);
    }*/
  },

  destroy: function() {
    this.control.disconnect(this._streamAddedId);
    this.control.disconnect(this._streamRemovedId);
    this.control.disconnect(this._defaultSinkChangedId);

    this.emit("destroy");
  }
};

Signals.addSignalMethods(AdvMixer.prototype);


function main() {
  init();
  enable();
}

function init() {
}


function enable() {
  //if (Main.panel.statusArea.aggregateMenu['volume'] && !advMixer) {
    advMixer = new AdvMixer(Main.panel.statusArea.aggregateMenu, Main.panel.statusArea.aggregateMenu._volume);
  //}
}


function disable() {
  if (advMixer) {
    advMixer.destroy();
    advMixer = null;
  }
}

