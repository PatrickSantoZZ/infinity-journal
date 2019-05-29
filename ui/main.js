/* global _tera_client_proxy_, List */
/* eslint-disable strict */
(function(d) {
  "use strict";
  var pending,
      list,
      current,
      name,
      province,
      zone,
      x,
      y,
      z,
      coords;
  function unsetPending() {
    pending = false;
    return;
  }

  function xhr(url, cb) {
    var x = new XMLHttpRequest();
    pending = true;
    x.open("GET", "api/" + url, true);
    x.onload = cb;
    x.send();
    return;
  }

  function renderList() {
    var accumulator,
        i,
        arr,
        item,
        length,
        _name,
        _province;
    current = null;
    name.textContent =
    province.textContent =
    zone.textContent =
    x.textContent =
    y.textContent =
    z.textContent = "---";
    list.clear();
    coords = [];
    accumulator = [];
    arr = JSON.parse(this.responseText);
    length = arr.length;
    for (i = 0; i < length; ++i) {
      item = arr[i];
      _name = item.name.split("\t");
      _province = _name.shift();
      accumulator[i] = {
        name: _name.join(" "),
        province: _province,
        id: i
      };
      coords[i] = [item.zone, item.x, item.y, item.z];
    }
    list.add(accumulator, unsetPending);
    return;
  }

  function reloadHandler() {
    if (pending) return;
    xhr("L", renderList);
    return;
  }

  function tpResponseHandler() {
    var response = JSON.parse(this.responseText).close;
    if (response === 1) {
      _tera_client_proxy_.close();
    }
    else {
      pending = false;
      _tera_client_proxy_.alert(response);
    }
    return;
  }

  function deleteResponseHandler() {
    var response = JSON.parse(this.responseText).ok;
    pending = false;
    if (response === 1) {
      xhr("L", renderList);
    }
    return;
  }

  function teleportHandler() {
    if (pending || current == null) return;
    xhr(current + "T", tpResponseHandler);
    return;
  }

  function deleteHandler() {
    if (pending || current == null) return;
    xhr(current + "D", deleteResponseHandler);
    return;
  }

  function listClickHandler(e) {
    var target,
        coord,
        body;
    if (pending) return;
    target = e.target;
    body = d.getElementsByTagName("body")[0];
    while(target && target.getAttribute && target.getAttribute("class") !== "item")
      if (target === body)
        return;
      else
        target = target.parentNode;
    current = Number(target.firstElementChild.nextElementSibling.textContent);
    name.textContent = target.firstElementChild.textContent;
    province.textContent = target.lastElementChild.textContent;
    coord = coords[current];
    zone.textContent = coord[0];
    x.textContent = coord[1];
    y.textContent = coord[2];
    z.textContent = coord[3];
    return;
  }

  function init() {
    pending = true;
    list = new List("list", { 
      valueNames: [
        "name",
        "province",
        "id"
      ],
      item: "<li class=\"item\"><span class=\"name\"></span><span class=\"id\"></span><span class=\"province\"></span></li>"
    });
    name = d.getElementById("name_text");
    province = d.getElementById("province_text");
    zone = d.getElementById("zone");
    x = d.getElementById("x");
    y = d.getElementById("y");
    z = d.getElementById("z");
    xhr("L", renderList);
    d.getElementById("reload").addEventListener("click", reloadHandler, true);
    d.getElementById("teleport").addEventListener("click", teleportHandler, true);
    d.getElementById("delete").addEventListener("click", deleteHandler, true);
    list.list.addEventListener("click", listClickHandler, true);
    return;
  }

  window.addEventListener("error", function(e) {
    _tera_client_proxy_.alert("Error: " + e.message);
    return;
  });

  window.onload = function() {
    _tera_client_proxy_.resize_to(1000, 700);
    _tera_client_proxy_.set_title("Infinity Journal WebUI");
    init();
    return;
  };

  return;
}(document, void 0));