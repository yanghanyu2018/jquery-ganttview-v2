# Data Model / 数据模型

The control is built around a three-level model:

```text
Categories -> Series -> Tasks
```

This is one of the most important differences from a plain one-dimensional project Gantt chart.

## 1. Category

A category is the outer resource group or business grouping.

Airport examples:

```text
Gate Area A
Check-in Zone C
Baggage Claim Area
Terminal 1 Domestic
Terminal 2 International
```

Common fields:

```js
{
  cId: 'gate-area-a',
  cName: 'Gate Area A',
  resourceType: 'gate',
  series: []
}
```

`resourceType` is optional. It is used for CSS class and legend display.

Common resource types:

```text
gate, checkin, belt, stand, boarding, bus, crew, maintenance, security
```

## 2. Series

A series is usually a resource row or sub-resource under a category.

Airport examples:

```text
A01 gate
A02 gate
C01-C04 counters
Belt 01
Belt 02
```

Common fields:

```js
{
  sId: 'A01',
  sName: 'A01',
  tasks: []
}
```

A series may also have its own `start/end`. If `start/end` exists, it can be rendered as a bar. `isTask` controls editability, not whether the bar can be displayed.

## 3. Task

A task is the actual occupation or operation time block.

Airport examples:

```text
Flight occupies gate A01
Airline check-in window opens
Baggage belt service window
Ground handling job
Maintenance block
```

Basic fields:

```js
{
  tId: 'MU5101',
  tName: 'MU5101',
  start: '2026/06/25 08:20',
  end: '2026/06/25 10:10',
  isTask: true,
  status: 'planned'
}
```

Airport time fields:

```js
{
  plannedStart: '2026/06/25 08:20',
  plannedEnd: '2026/06/25 10:10',
  estimatedStart: '2026/06/25 08:35',
  estimatedEnd: '2026/06/25 10:25',
  actualStart: null,
  actualEnd: null
}
```

Time field selection is controlled by:

```js
timeFieldMode: 'auto' // auto / start / planned / estimated / actual
```

## Status

Supported built-in status labels and CSS classes:

```text
planned, active, estimated, delayed, completed, cancelled, maintenance
```

The control adds classes like:

```text
ganttview-status-delayed
ganttview-status-active
```

## Buffer time

Tasks may include buffer minutes:

```js
{
  bufferBeforeMinutes: 10,
  bufferAfterMinutes: 15
}
```

With `useBufferTime: true`, the displayed occupation range includes buffer time. This is useful for gate cleaning buffer, pushback buffer, counter preparation and baggage belt preparation.

## Conflict detection

Conflict detection is currently performed inside the same resource/series line by overlap of time ranges.

The control uses interval logic close to:

```text
[start, end)
```

So a task ending exactly when the next task starts is not treated as conflict.

## Boundary

The data model supports airport display semantics, but does not implement resource allocation or optimization rules. Complex scheduling should stay in business systems such as RMS/AODB/AROP/operation platform logic.
