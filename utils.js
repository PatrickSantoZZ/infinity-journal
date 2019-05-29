"use strict";

const fs = require("fs");
const journalPath = require("path").join(__dirname, "journal.json");

let saveTimer, customLocations;
function save() {
  try { fs.writeFileSync(journalPath, JSON.stringify(customLocations)); }
  catch(e) { console.error("failed to write custom location", e); }
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 1e4);
}

try { customLocations = require(journalPath); }
catch(_) {
  customLocations = [];
  save();
}

const initCtx = mod => {
  const _ = {};
  _.cmd = mod.command;
  _.send = mod.send.bind(mod);
  _.enabled = true;
  _.currentContract =
  _.newCustom =
  _.serverLocations =
  _.customLocations =
  _.gameId =
  _.tpTo = void (_.slotAtlas = -1);
  return _;
};

const makeHook = (_, ctx) => {
  const hook = _.hook;
  return function() { hook.apply(_, arguments).__self = ctx; };
};

const locationSort = (a, b) => a.name.localeCompare(b.name);

const newLocation = (loc, ctx) => ({
  zone: loc.zone,
  x: loc.x,
  y: loc.y,
  z: loc.z,
  name: ctx.newCustom
});

const makeCustom = loc => ({
  unk: 0,
  zone: loc.zone,
  x: loc.x,
  y: loc.y,
  z: loc.z,
  name: ~loc.name.indexOf("\t") ? loc.name : loc.name + "\t"
});

const getCustomLocations = () => customLocations.map(makeCustom);

const atlasIds = new Set([5250, 60486, 60487, 60488, 60489, 60490, 81186, 100701, 100705, 100719, 100721, 139112, 139162, 139187, 139696, 139737, 149035, 149296, 149307, 149336, 149489, 166598, 166599, 166600, 166601, 166602, 166603, 166687, 166688, 166689, 166690, 166691, 166692, 170002, 177339, 181116, 186786, 200528, 201024, 210536, 212782, 213302, 213396, 216000, 220219, 220358, 221635, 222674, 854563, 854564, 854565, 854566, 854567, 854568]);

module.exports = {
  initCtx,
  makeHook,
  atlasIds,
  queueSave,
  newLocation,
  journalPath,
  locationSort,
  customLocations,
  getCustomLocations
};
