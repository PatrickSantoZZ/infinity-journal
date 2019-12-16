"use strict";

/**
 * IMPORTS
 */
const {
    initCtx,
    makeHook,
    atlasIds,
    queueSave,
    newLocation,
    locationSort,
    customLocations,
    getCustomLocations
} = require("./utils");
const journalOptions = require("./commands");
const webui = require("./ui");

/**
 * UNBREAK SOME REGIONS
 */
const specialCases = {
    "7015": 71001,
    "7013": 75001,
    "7021": 80001,
    "7022": 79001,
    "7023": 77001
};

/**
 * HELPERS
 */
function onLogin(evt) {
    const ctx = this.__self;
    ctx.gameId = evt.gameId;
    ctx.tpTo = ctx.currentContract = null;
    ctx.slotAtlas = -1;
}

function getContract(evt) {
    this.__self.currentContract = evt.type;
}

function nullContract() {
    this.__self.currentContract = null;
}

function nullDestination() {
    this.__self.tpTo = null;
}

/**
 * TO INFINITY AND BEYOND
 */
function teleportTo(evt) {
    const ctx = this.__self;
    return ctx.tpTo ? (
        Object.assign(evt.loc, ctx.tpTo), true
    ) : null;
}

function onVilList(evt) {
    const ctx = this.__self;
    if (!ctx.enabled || !ctx.tpTo) return;
    const zone = ctx.tpTo.zone;
    const special = specialCases[zone];
    if (special) {
        ctx.send("C_TELEPORT_TO_VILLAGE", 1, {
            id: special
        });
        return false;
    }
    for (let i = 0, arr = evt.locations, len = arr.length; i < len; ++i) {
        const loc = arr[i];
        if (loc.zone === zone) {
            ctx.send("C_TELEPORT_TO_VILLAGE", 1, {
                id: loc.id
            });
            return false;
        }
    }
    ctx.cmd.message(`<font color="#ff0000">Zone ${zone} cannot be teleported to.</font>`);
    ctx.tpTo = null;
}

function onLoadTpList(evt) {
    const ctx = this.__self;
    ctx.tpTo = null;
    if (!ctx.enabled) return;
    for (let i = 0, arr = evt.locations, len = arr.length; i < len; ++i) {
        const loc = arr[i];
        if (!loc) continue;
        if (loc.name === "*\t*") {
            if (ctx.newCustom) {
                customLocations[customLocations.length] = newLocation(loc, ctx);
                queueSave(customLocations.sort(locationSort));
                ctx.cmd.message("Journal saved.");
                ctx.newCustom = "";
            }
            ctx.send("C_DELETE_TELEPORT_TO_POS_LIST", 1, {
                index: i
            });
            evt.locations.splice(i, 1);
            --i;
            --len;
            continue;
        }
        loc.name += " *";
    }
    ctx.serverLocations = evt.locations;
    evt.locations = [...evt.locations, ...getCustomLocations()];
    return true;
}

function onPcBangDatalist(evt) {
    const ctx = this.__self;
    ctx.slotAtlas = -1;
    for (let set of evt.sets) {
        for (let inv of set.inventory) {
            if (atlasIds.has(inv.id)) {
                return void(ctx.slotAtlas = {
                    set: set.id,
                    slot: inv.slot,
                    type: inv.type,
                    id: inv.id
                })
            }
        }
    }
}

function onActionEnd(evt) {
    const ctx = this.__self;
    if (evt.gameId === ctx.gameId && evt.type !== 37) {
        ctx.tpTo = ctx.currentContract = null;
    }
}

function onTpToPos(evt) {
    const ctx = this.__self;
    if (!ctx.enabled) return;
    const idx = evt.index;
    const len = ctx.serverLocations.length;
    if (idx >= len) {
        if (ctx.slotAtlas !== -1) {
            ctx.tpTo = customLocations[idx - len];
            ctx.send("C_USE_PREMIUM_SLOT", 1,
                ctx.slotAtlas
            );
        } else {
            ctx.cmd.message(`<font color="#ff0000">You must have Elite status to teleport to a custom location.</font>`);
        }
        return false;
    }
}

function onDelTpPos(evt) {
    const ctx = this.__self;
    if (!ctx.enabled) return;
    const idx = evt.index;
    const len = ctx.serverLocations.length;
    if (idx >= len) {
        queueSave(customLocations.splice(idx - len, 1));
        ctx.send("S_LOAD_TELEPORT_TO_POS_LIST", 1, {
            locations: [...ctx.serverLocations, ...getCustomLocations()]
        });
        return false;
    }
}

/**
 * INIT
 */
function InfiniteJournalism(_) {
    const ctx = initCtx(_);
    const hook = makeHook(_, ctx);
    webui(_, ctx);

    _.command.add("journal", journalOptions, ctx);

    const r = "raw";
    hook("S_LOGIN", 14, onLogin);
    hook("S_SPAWN_ME", 3, teleportTo);
    hook("S_LOAD_TOPO", 3, teleportTo);
    hook("S_ACTION_END", 5, onActionEnd);
    hook("C_TELEPORT_TO_POS", 1, onTpToPos);
    hook("C_TELEPORT_TO_POS", r, nullDestination);
    hook("S_CANCEL_CONTRACT", r, nullContract);
    hook("S_REQUEST_CONTRACT", 1, getContract);
    hook("S_VILLAGE_LIST_TO_TELEPORT", 1, onVilList);
    hook("S_PREMIUM_SLOT_DATALIST", 2, onPcBangDatalist);
    hook("S_LOAD_TELEPORT_TO_POS_LIST", 1, onLoadTpList);
    hook("C_DELETE_TELEPORT_TO_POS_LIST", 1, onDelTpPos);
}

module.exports = InfiniteJournalism;