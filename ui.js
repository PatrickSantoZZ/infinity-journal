"use strict";
const { join } = require("path");
const { existsSync } = require("fs");
const {
  queueSave,
  customLocations
} = require("./utils");
const pathname = "/infinityjournal/";
const getId = (() => { let id = 0; return () => id++; })();
const paramRegex = /(\d*)(\D*)/;

function getData(param) {
  const data = param.match(paramRegex);
  data.shift();
  return data;
}

function api(req, res) {
  const api = getData(req.params[0]);
  switch(api[1]) {
   case "L":
    return res.status(200).json(customLocations);
   case "T":
    if (this.slotAtlas !== -1) {
      this.tpTo = customLocations[Number(api[0])];
      this.send("C_USE_PREMIUM_SLOT", 1, this.slotAtlas);
      return res.status(200).json({ close: 1 });
    }
    else {
      return res.status(200).json({ close: "You must have Elite status to teleport to a custom location." });
    }
   case "D":
    customLocations.splice(Number(api[0]), 1);
    queueSave();
    return res.status(200).json("ok");
   default:
    return res.status(404).send("404");
  }
}

function open() {
  this.ui.open(`${pathname}${this.id}/`);
}

function webui(mod, ctx) {
  const path = join(__dirname, "..", "ui", "index.js");
  if (!existsSync(path)) return;
  const UI = require(path);
  const ui = UI(mod);
  const id = getId();

  ui.use(`${pathname}${id}/`, UI.static(join(__dirname, "ui")));
  ui.get(`${pathname}${id}/api/*`, api.bind(ctx));

  ctx.webui = { ui, id, open };
}

module.exports = webui;


