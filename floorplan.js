/* Draws the 2D floor plan from window.MACHINES and window.FIXTURES.
   Live status is not shown. Almost done, later, is the last
   window.ALMOST_DONE_MINUTES of a cycle unless FasCard sends its own status. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("floorSvg");
  var detailKicker = document.getElementById("floorDetailKicker");
  var detailTitle = document.getElementById("floorDetailTitle");
  var detailCopy = document.getElementById("floorDetailCopy");
  var list = document.getElementById("floorList");
  var fallback = document.getElementById("floorFallback");
  var floor = window.FLOOR;
  var machines = window.MACHINES || [];
  var fixtures = window.FIXTURES || [];

  if (!svg || !floor || !machines.length) {
    if (fallback) fallback.textContent = "Floor plan data did not load.";
    return;
  }
  if (fallback) fallback.hidden = true;

  svg.setAttribute("viewBox", floor.viewBox);

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    var key;
    if (attrs) {
      for (key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key) && attrs[key] !== undefined && attrs[key] !== null) {
          node.setAttribute(key, attrs[key]);
        }
      }
    }
    return node;
  }

  function addText(parent, value, x, y, attrs) {
    var node = el("text", attrs);
    node.setAttribute("x", x);
    node.setAttribute("y", y);
    node.textContent = value;
    parent.appendChild(node);
    return node;
  }

  function findMachine(id) {
    var i;
    for (i = 0; i < machines.length; i++) {
      if (machines[i].id === id) return machines[i];
    }
    return null;
  }

  function whereText(machine) {
    if (machine.row === "front-island" && machine.facing === "front") {
      return "Front island. Faces the front of the store.";
    }
    if (machine.row === "front-island" && machine.facing === "back") {
      return "Front island. Faces the back of the store.";
    }
    if (machine.row === "middle-island" && machine.facing === "front") {
      return "Middle island. Faces the front of the store.";
    }
    if (machine.row === "middle-island" && machine.facing === "back") {
      return "Middle island. Faces the back of the store.";
    }
    if (machine.row === "back-wall") {
      return "Back wall. Faces the front of the store.";
    }
    if (machine.type === "washer" && machine.row === "right-wall") {
      return "Right wall, between the dryers. Faces into the aisle.";
    }
    if (machine.stack && machine.stack.indexOf("rear") === 0) {
      return "Right wall, rear dryers. Faces into the aisle.";
    }
    if (machine.stack && machine.stack.indexOf("front") === 0) {
      return "Right wall, front dryers. Faces into the aisle.";
    }
    return "";
  }

  function ariaLabel(machine) {
    var kind = machine.type === "washer" ? "Washer" : "Dryer";
    var pocket = "";
    if (machine.stackPosition === "top") pocket = " Top pocket.";
    if (machine.stackPosition === "bottom") pocket = " Bottom pocket.";
    var size = machine.sizeLb ? machine.sizeLb + " pound " : "";
    var pay = machine.hasCard ? " Live status coming soon." : " Coin only, no live status";
    return kind + " " + machine.paintedNumber + ". " + size + machine.brand + "." + pocket + " " + whereText(machine) + pay;
  }

  function doorBar(x, y, w, h, facing) {
    var inset = Math.min(w, h) * 0.2;
    if (facing === "front") {
      return { x: x + inset, y: y + h - 7, w: w - inset * 2, h: 7 };
    }
    if (facing === "back") {
      return { x: x + inset, y: y, w: w - inset * 2, h: 7 };
    }
    return { x: x, y: y + inset, w: 7, h: h - inset * 2 };
  }

  function arm(node, machine) {
    var label = ariaLabel(machine);
    var tip = el("title");
    tip.textContent = label;
    node.appendChild(tip);
    node.setAttribute("data-id", machine.id);
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-pressed", "false");
    node.setAttribute("aria-label", label);
    node.addEventListener("click", function () {
      select(machine.id);
    });
    node.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(machine.id);
      }
    });
  }

  svg.appendChild(el("rect", {
    x: 0, y: 0, width: 1000, height: 1320, fill: "#f4f8fd"
  }));
  svg.appendChild(el("rect", {
    x: floor.room.x,
    y: floor.room.y,
    width: floor.room.w,
    height: floor.room.h,
    rx: 10,
    fill: "#1a4468"
  }));
  svg.appendChild(el("rect", {
    x: floor.floor.x,
    y: floor.floor.y,
    width: floor.floor.w,
    height: floor.floor.h,
    rx: 4,
    fill: "#e7f2fb"
  }));

  function drawFixtures() {
    var i;
    var item;
    for (i = 0; i < fixtures.length; i++) {
      item = fixtures[i];
      if (item.kind === "box") drawBox(item);
      else if (item.kind === "counter") drawCounter(item);
      else if (item.kind === "chair") drawChair(item);
      else if (item.kind === "table") drawTable(item);
      else if (item.kind === "windows") drawWindows(item);
      else if (item.kind === "door") drawDoor(item);
      else if (item.kind === "label") drawLabel(item);
    }
  }

  function drawBox(item) {
    var fill = "#f4f7fb";
    var stroke = "#8aa4bb";
    var text = "#143a5c";
    if (item.variant === "soap") {
      fill = "#f8e7a8";
      stroke = "#c6a24a";
      text = "#5c4a12";
    } else if (item.variant === "change") {
      fill = "#d9ebf8";
      stroke = "#6f9bbd";
    }
    var group = el("g");
    group.appendChild(el("rect", {
      x: item.x, y: item.y, width: item.w, height: item.h, rx: 8,
      fill: fill, stroke: stroke, "stroke-width": 1.5
    }));
    addText(group, item.label, item.x + item.w / 2, item.y + item.h / 2 + 5, {
      "text-anchor": "middle",
      fill: text,
      "font-size": item.label.length > 10 ? 12 : 14,
      "font-weight": 800
    });
    svg.appendChild(group);
  }

  function drawCounter(item) {
    var x = item.x;
    var y = item.y;
    var right = x + item.shortW;
    var longLeft = right - item.longW;
    var bottom = y + item.longH;
    var bend = bottom - item.shortH;
    var labelX = longLeft + item.longW / 2;
    var d = [
      "M", x, bottom,
      "H", right,
      "V", y,
      "H", longLeft,
      "V", bend,
      "H", x,
      "Z"
    ].join(" ");
    var group = el("g");
    group.appendChild(el("path", {
      d: d,
      fill: "#fffdf8",
      stroke: "#b8894f",
      "stroke-width": 3,
      "stroke-linejoin": "round"
    }));
    addText(group, "Service", labelX, y + item.longH * 0.58, {
      "text-anchor": "middle",
      fill: "#6a4b22",
      "font-size": 13,
      "font-weight": 800
    });
    addText(group, "counter", labelX, y + item.longH * 0.58 + 16, {
      "text-anchor": "middle",
      fill: "#6a4b22",
      "font-size": 13,
      "font-weight": 800
    });
    svg.appendChild(group);
  }

  function drawChair(item) {
    var fill = item.variant === "black" ? "#243044" : "#2f8fe0";
    var stroke = item.variant === "black" ? "#101820" : "#1d6eae";
    svg.appendChild(el("rect", {
      x: item.x, y: item.y, width: item.w, height: item.h, rx: 12,
      fill: fill, stroke: stroke, "stroke-width": 1.5
    }));
  }

  function drawTable(item) {
    var fill = item.variant === "wood" ? "#c4925a" : "#9fd0f5";
    var stroke = item.variant === "wood" ? "#8a6232" : "#1d6eae";
    svg.appendChild(el("rect", {
      x: item.x, y: item.y, width: item.w, height: item.h, rx: 6,
      fill: fill, stroke: stroke, "stroke-width": 1.5
    }));
  }

  function drawWindows(item) {
    var group = el("g");
    group.appendChild(el("rect", {
      x: item.x, y: item.y, width: item.w, height: item.h, rx: 2,
      fill: "#c5e4f7", stroke: "#7eafd0", "stroke-width": 1
    }));
    var mullion;
    for (mullion = item.x + 36; mullion < item.x + item.w - 8; mullion += 36) {
      group.appendChild(el("line", {
        x1: mullion, y1: item.y, x2: mullion, y2: item.y + item.h,
        stroke: "#7eafd0", "stroke-width": 1
      }));
    }
    svg.appendChild(group);
  }

  function drawDoor(item) {
    var wallTop = floor.floor.y + floor.floor.h;
    var wallBottom = floor.room.y + floor.room.h;
    var hingeX = item.x;
    var radius = item.w;
    svg.appendChild(el("rect", {
      x: item.x,
      y: wallTop,
      width: item.w,
      height: wallBottom - wallTop + 1,
      fill: "#f4f8fd"
    }));
    svg.appendChild(el("path", {
      d: "M " + hingeX + " " + wallBottom + " L " + hingeX + " " + (wallBottom + radius),
      fill: "none",
      stroke: "#1a4468",
      "stroke-width": 2
    }));
    svg.appendChild(el("path", {
      d: "M " + (hingeX + radius) + " " + wallBottom +
        " A " + radius + " " + radius + " 0 0 1 " +
        hingeX + " " + (wallBottom + radius),
      fill: "none",
      stroke: "#1d6eae",
      "stroke-width": 1.5,
      "stroke-dasharray": "5 4"
    }));
  }

  function drawLabel(item) {
    addText(svg, item.text, item.x, item.y, {
      "text-anchor": item.anchor || "middle",
      fill: "#1a4468",
      "font-size": item.size || 14,
      "font-weight": 800
    });
  }

  function drawWasher(machine) {
    var group = el("g", { class: "machine" });
    var bar = doorBar(machine.x, machine.y, machine.w, machine.h, machine.facing);
    var cx = machine.x + machine.w / 2;
    var cy = machine.y + machine.h / 2 + (machine.facing === "back" ? 4 : 0);
    group.appendChild(el("rect", {
      class: "machine-body",
      x: machine.x, y: machine.y, width: machine.w, height: machine.h, rx: 8
    }));
    group.appendChild(el("circle", {
      class: "machine-door",
      cx: cx,
      cy: cy,
      r: Math.min(machine.w, machine.h) * 0.22
    }));
    addText(group, String(machine.paintedNumber), cx, cy + 5, {
      class: "machine-number",
      "text-anchor": "middle",
      fill: "#0c3058",
      "font-size": 18,
      "font-weight": 800
    });
    addText(group, machine.sizeLb + " lb", cx, machine.facing === "back" ? machine.y + machine.h - 12 : machine.y + 16, {
      class: "machine-size",
      "text-anchor": "middle",
      fill: "#1d5f8a",
      "font-size": 12,
      "font-weight": 800
    });
    group.appendChild(el("rect", {
      class: "door-bar",
      x: bar.x, y: bar.y, width: bar.w, height: bar.h, rx: 2
    }));
    arm(group, machine);
    svg.appendChild(group);
  }

  function drawStack(parts) {
    var top = null;
    var bottom = null;
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i].stackPosition === "top") top = parts[i];
      if (parts[i].stackPosition === "bottom") bottom = parts[i];
    }
    if (!top || !bottom) return;
    var half = top.h / 2;
    drawPocket(top, top.x, top.y, top.w, half, true);
    drawPocket(bottom, top.x, top.y + half, top.w, half, false);
    var bar = doorBar(top.x, top.y, top.w, top.h, top.facing);
    var marker = el("rect", {
      class: "door-bar",
      x: bar.x, y: bar.y, width: bar.w, height: bar.h, rx: 2,
      "pointer-events": "none"
    });
    svg.appendChild(marker);
  }

  function drawPocket(machine, x, y, w, h, isTop) {
    var group = el("g", { class: "machine is-dryer" });
    group.appendChild(el("rect", {
      class: "machine-body",
      x: x, y: y, width: w, height: h,
      rx: 6
    }));
    addText(group, String(machine.paintedNumber), x + w / 2 + 4, y + h * 0.46, {
      class: "machine-number",
      "text-anchor": "middle",
      fill: "#0c3058",
      "font-size": 14,
      "font-weight": 800
    });
    addText(group, isTop ? "top" : "bottom", x + w / 2 + 4, y + h * 0.78, {
      class: "machine-size",
      "text-anchor": "middle",
      fill: "#1d5f8a",
      "font-size": 9,
      "font-weight": 800
    });
    arm(group, machine);
    svg.appendChild(group);
  }

  function drawMachines() {
    var stacks = {};
    var order = [];
    var i;
    var machine;
    var key;
    for (i = 0; i < machines.length; i++) {
      machine = machines[i];
      if (machine.stack) {
        if (!stacks[machine.stack]) {
          stacks[machine.stack] = [];
          order.push(machine.stack);
        }
        stacks[machine.stack].push(machine);
      } else {
        drawWasher(machine);
      }
    }
    for (i = 0; i < order.length; i++) {
      key = order[i];
      drawStack(stacks[key]);
    }
  }

  function scrollIntoFrame(id) {
    var frame = document.getElementById("floorScroll");
    var node = svg.querySelector('[data-id="' + id + '"]');
    if (!frame || !node) return;
    var box = node.getBoundingClientRect();
    var frameBox = frame.getBoundingClientRect();
    if (box.left >= frameBox.left + 8 && box.right <= frameBox.right - 8) return;
    frame.scrollLeft += box.left - frameBox.left - (frameBox.width - box.width) / 2;
  }

  function select(id) {
    var machine = findMachine(id);
    var nodes;
    var chips;
    var i;
    var on;
    var facts;
    if (!machine) return;
    nodes = svg.querySelectorAll(".machine");
    for (i = 0; i < nodes.length; i++) {
      on = nodes[i].getAttribute("data-id") === id;
      nodes[i].classList.toggle("is-selected", on);
      nodes[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (list) {
      chips = list.querySelectorAll("button");
      for (i = 0; i < chips.length; i++) {
        on = chips[i].getAttribute("data-id") === id;
        chips[i].classList.toggle("is-selected", on);
        chips[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
    }
    if (machine.stackPosition === "top") detailKicker.textContent = "Top pocket";
    else if (machine.stackPosition === "bottom") detailKicker.textContent = "Bottom pocket";
    else detailKicker.textContent = machine.type === "washer" ? "Washer" : "Dryer";
    detailTitle.textContent = (machine.type === "washer" ? "Washer " : "Dryer ") + machine.paintedNumber;
    facts = machine.sizeLb ? machine.sizeLb + " lb " + machine.brand + "." : machine.brand + ".";
    detailCopy.textContent = facts + " " + whereText(machine) + " " + (machine.hasCard ? "Live status coming soon." : "Coin only, no live status");
    scrollIntoFrame(id);
  }

  function chipLabel(machine) {
    var kind = machine.type === "washer" ? "Washer " : "Dryer ";
    var pocket = "";
    if (machine.stackPosition === "top") pocket = ", top";
    if (machine.stackPosition === "bottom") pocket = ", bottom";
    var size = machine.sizeLb ? ", " + machine.sizeLb + " lb" : "";
    return kind + machine.paintedNumber + pocket + size;
  }

  function addGroup(title, items) {
    var group = document.createElement("div");
    var heading = document.createElement("h3");
    var chips = document.createElement("div");
    var i;
    var button;
    group.className = "floor-group";
    heading.textContent = title;
    chips.className = "floor-chips";
    items.sort(function (a, b) { return a.paintedNumber - b.paintedNumber; });
    for (i = 0; i < items.length; i++) {
      button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-id", items[i].id);
      button.setAttribute("aria-pressed", "false");
      button.textContent = chipLabel(items[i]);
      button.addEventListener("click", function (event) {
        select(event.currentTarget.getAttribute("data-id"));
      });
      chips.appendChild(button);
    }
    group.appendChild(heading);
    group.appendChild(chips);
    list.appendChild(group);
  }

  function buildList() {
    var front = [];
    var middle = [];
    var back = [];
    var rightWashers = [];
    var rearDryers = [];
    var frontDryers = [];
    var i;
    var machine;
    if (!list) return;
    for (i = 0; i < machines.length; i++) {
      machine = machines[i];
      if (machine.row === "front-island") front.push(machine);
      else if (machine.row === "middle-island") middle.push(machine);
      else if (machine.row === "back-wall") back.push(machine);
      else if (machine.type === "washer") rightWashers.push(machine);
      else if (machine.stack && machine.stack.indexOf("rear") === 0) rearDryers.push(machine);
      else frontDryers.push(machine);
    }
    addGroup("Front island", front);
    addGroup("Middle island", middle);
    addGroup("Back wall", back);
    addGroup("Right wall washers", rightWashers);
    addGroup("Rear dryers", rearDryers);
    addGroup("Front dryers", frontDryers);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var nodes = svg.querySelectorAll(".machine");
    var chips = list ? list.querySelectorAll("button") : [];
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].classList.remove("is-selected");
      nodes[i].setAttribute("aria-pressed", "false");
    }
    for (i = 0; i < chips.length; i++) {
      chips[i].classList.remove("is-selected");
      chips[i].setAttribute("aria-pressed", "false");
    }
    detailKicker.textContent = "Machines";
    detailTitle.textContent = "Select a washer or dryer";
    detailCopy.textContent = "The number, size, and brand show here.";
  });

  drawFixtures();
  drawMachines();
  buildList();
})();
