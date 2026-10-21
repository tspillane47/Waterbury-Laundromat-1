/* Floor plan data for Waterbury Laundromat.
   Diagram coordinates, with the front of the store at the bottom.
   Not measured dimensions.
   fascardId stays empty until the numbers are confirmed in FasCard admin.
   Later status values: open, almost_done, running, offline.
   almost_done means the last 5 minutes of a cycle, unless FasCard sends its own status.
   running includes minutes left.
   This file has no live status. */
window.ALMOST_DONE_MINUTES = 5;

window.FLOOR = {
  viewBox: "0 0 1000 1320",
  room: { x: 32, y: 44, w: 936, h: 1088 },
  floor: { x: 50, y: 62, w: 900, h: 1052 }
};

(function () {
  function machine(entry) {
    return {
      id: entry.id,
      fascardId: null,
      paintedNumber: entry.paintedNumber,
      type: entry.type,
      sizeLb: entry.sizeLb,
      brand: entry.brand,
      facing: entry.facing,
      row: entry.row,
      stack: entry.stack || null,
      stackPosition: entry.stackPosition || null,
      x: entry.x,
      y: entry.y,
      w: entry.w,
      h: entry.h
    };
  }

  function washer(number, brand, sizeLb, facing, row, x, y, w, h) {
    return machine({
      id: "washer-" + number,
      paintedNumber: number,
      type: "washer",
      sizeLb: sizeLb,
      brand: brand,
      facing: facing,
      row: row,
      x: x,
      y: y,
      w: w,
      h: h
    });
  }

  function dryerStack(stack, x, y, topNumber, bottomNumber) {
    var shared = {
      type: "dryer",
      sizeLb: 30,
      brand: "Huebsch",
      facing: "into-room",
      row: "right-wall",
      x: x,
      y: y,
      w: 82,
      h: 72
    };
    return [
      machine({
        id: "dryer-" + topNumber,
        paintedNumber: topNumber,
        type: shared.type,
        sizeLb: shared.sizeLb,
        brand: shared.brand,
        facing: shared.facing,
        row: shared.row,
        stack: stack,
        stackPosition: "top",
        x: shared.x,
        y: shared.y,
        w: shared.w,
        h: shared.h
      }),
      machine({
        id: "dryer-" + bottomNumber,
        paintedNumber: bottomNumber,
        type: shared.type,
        sizeLb: shared.sizeLb,
        brand: shared.brand,
        facing: shared.facing,
        row: shared.row,
        stack: stack,
        stackPosition: "bottom",
        x: shared.x,
        y: shared.y,
        w: shared.w,
        h: shared.h
      })
    ];
  }

  var machines = [];

  /* Front island, street side, left to right: 1, 2, 3, 4. Doors face the front. */
  machines.push(washer(1, "Huebsch", 20, "front", "front-island", 308, 662, 88, 82));
  machines.push(washer(2, "Huebsch", 20, "front", "front-island", 408, 662, 88, 82));
  machines.push(washer(3, "Speed Queen", 20, "front", "front-island", 508, 662, 88, 82));
  machines.push(washer(4, "Speed Queen", 20, "front", "front-island", 608, 662, 88, 82));

  /* Front island, back side, left to right: 8, 7, 6, 5. Doors face the back. */
  machines.push(washer(8, "Speed Queen", 20, "back", "front-island", 308, 560, 88, 82));
  machines.push(washer(7, "Speed Queen", 20, "back", "front-island", 408, 560, 88, 82));
  machines.push(washer(6, "Speed Queen", 20, "back", "front-island", 508, 560, 88, 82));
  machines.push(washer(5, "Speed Queen", 20, "back", "front-island", 608, 560, 88, 82));

  /* Middle island, street side, left to right: 9, 10, 11. Doors face the front. */
  machines.push(washer(9, "Speed Queen", 30, "front", "middle-island", 340, 392, 98, 92));
  machines.push(washer(10, "Speed Queen", 30, "front", "middle-island", 452, 392, 98, 92));
  machines.push(washer(11, "Speed Queen", 30, "front", "middle-island", 564, 392, 98, 92));

  /* Middle island, back side, left to right: 14, 13, 12. Three 40 lb. Doors face the back. */
  machines.push(washer(14, "Speed Queen", 40, "back", "middle-island", 328, 268, 106, 100));
  machines.push(washer(13, "Speed Queen", 40, "back", "middle-island", 448, 268, 106, 100));
  machines.push(washer(12, "Speed Queen", 40, "back", "middle-island", 568, 268, 106, 100));

  /* Back wall, left to right: 15, 16, 17, 18. Doors face the front. */
  machines.push(washer(15, "Speed Queen", 40, "front", "back-wall", 428, 82, 86, 92));
  machines.push(washer(16, "Speed Queen", 40, "front", "back-wall", 524, 82, 86, 92));
  machines.push(washer(17, "Speed Queen", 40, "front", "back-wall", 620, 82, 86, 92));
  machines.push(washer(18, "Speed Queen", 40, "front", "back-wall", 716, 82, 86, 92));

  /* Right wall, between the dryer banks. Doors face into the aisle. Back to front: 19, 20, 21. */
  machines.push(washer(19, "Speed Queen", 60, "into-room", "right-wall", 828, 424, 114, 102));
  machines.push(washer(20, "Wascomat", 45, "into-room", "right-wall", 840, 542, 102, 84));
  machines.push(washer(21, "Wascomat", 45, "into-room", "right-wall", 840, 642, 102, 84));

  /* Right wall dryers, back to front. Odd numbers are the top pockets. */
  var dryerRows = [
    ["rear-1", 82, 1, 2],
    ["rear-2", 160, 3, 4],
    ["rear-3", 238, 5, 6],
    ["rear-4", 316, 7, 8],
    ["front-1", 762, 9, 10],
    ["front-2", 840, 11, 12],
    ["front-3", 918, 13, 14],
    ["front-4", 996, 15, 16]
  ];
  var s;
  var pair;
  for (s = 0; s < dryerRows.length; s++) {
    pair = dryerStack(dryerRows[s][0], 858, dryerRows[s][1], dryerRows[s][2], dryerRows[s][3]);
    machines.push(pair[0]);
    machines.push(pair[1]);
  }

  window.MACHINES = machines;
})();

window.FIXTURES = [
  { id: "soap", kind: "box", variant: "soap", label: "Soap", x: 66, y: 78, w: 112, h: 70 },
  { id: "change", kind: "box", variant: "change", label: "Change", x: 188, y: 78, w: 120, h: 70 },
  { id: "office", kind: "box", variant: "office", label: "Back office", x: 318, y: 78, w: 100, h: 70 },
  {
    id: "counter",
    kind: "counter",
    label: "Service counter",
    x: 66,
    y: 190,
    shortW: 196,
    shortH: 60,
    longW: 76,
    longH: 320
  },
  { id: "chair-1", kind: "chair", variant: "blue", x: 66, y: 536, w: 60, h: 56 },
  { id: "chair-2", kind: "chair", variant: "blue", x: 66, y: 608, w: 60, h: 56 },
  { id: "chair-3", kind: "chair", variant: "blue", x: 66, y: 680, w: 60, h: 56 },
  { id: "chair-4", kind: "chair", variant: "blue", x: 66, y: 752, w: 60, h: 56 },
  { id: "armchair-1", kind: "chair", variant: "black", x: 346, y: 1004, w: 114, h: 72 },
  { id: "table-front", kind: "table", variant: "wood", x: 474, y: 1016, w: 58, h: 48 },
  { id: "armchair-2", kind: "chair", variant: "black", x: 546, y: 1004, w: 114, h: 72 },
  { id: "storefront", kind: "windows", x: 172, y: 1096, w: 760, h: 12 },
  { id: "entrance", kind: "door", label: "Entrance", x: 68, w: 88, swing: "out", hinge: "left" },
  { id: "label-back", kind: "label", text: "Back wall", x: 500, y: 30, size: 16 },
  { id: "label-middle", kind: "label", text: "Middle island", x: 500, y: 252, size: 14 },
  { id: "label-front", kind: "label", text: "Front island", x: 500, y: 544, size: 14 },
  { id: "label-entrance", kind: "label", text: "Entrance", x: 176, y: 1246, size: 14, anchor: "start" },
  { id: "label-street", kind: "label", text: "Front / street", x: 500, y: 1292, size: 16 }
];
