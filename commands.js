"use strict";

const {
  journalPath,
  customLocations
} = require("./utils");
const { push } = Array.prototype;
const tryRequire = () => {
  delete require.cache[require.resolve(journalPath)];
  try { return require(journalPath); }
  catch(_) { return []; }
};

function journalOptions(...args) {
  const argLen = args.length;
  let tmp;
  if (!argLen) {
    if (!this.enabled) {
      customLocations.length = 0;
      push.apply(customLocations, tryRequire());
    }
    return this.cmd.message(`Journal ${(this.enabled = !this.enabled) ? "ena" : "disa"}bled`);
  }
  else switch((tmp = args[0]) && tmp.toLowerCase()) {
   case "ui":
   case "webui":
    if (this.webui) {
      this.webui.open();
    }
    else {
      this.cmd.message(`<font color="#ff0000">WebUI dependency is not present.</font>`);
    }
    return;
  }
  if (this.currentContract !== 54) {
    return this.cmd.message(`<font color="#ff0000">Travel journal must be open to save custom locations.</font>`);
  }
  const name = args.join(" ").split(":");
  const province = name.length > 1 ? name.shift() : "";
  this.newCustom = province ? `${name.join(":")}\t${province}` : name.join(":");
  this.send("C_ADD_TELEPORT_TO_POS_LIST", 1, { name: "*\t*" });
}

module.exports = journalOptions;