# Airport Resource Timeline Usage / 机场资源时间轴用法

This control is especially suitable for airport resource timeline display.

## Suitable scenarios

```text
Gate / stand occupation
Boarding gate usage
Check-in counter opening window
Baggage belt assignment
Ground handling task window
Maintenance block
Bus / crew / equipment service window
```

## What the control should do

```text
Display resource occupation on a time axis
Show now-time line
Locate current time or selected task
Highlight overlapping resource conflicts
Allow light drag/resize adjustment
Support exact time confirmation after dragging
Display planned/estimated/actual time fields
Support multiple languages
```

## What the control should not do

```text
Automatic gate allocation
Resource optimization
AODB/RMS rule engine
Conflict resolution algorithm
Operational decision automation
```

These should remain in the business system.

## Recommended page patterns

### Gate page

```text
Category: Gate Area / Terminal
Series:   Gate / Stand
Task:     Flight occupation
```

### Check-in counter page

```text
Category: Check-in zone
Series:   Counter group
Task:     Airline or flight check-in window
```

### Baggage belt page

```text
Category: Arrival area
Series:   Belt
Task:     Arrival flight baggage delivery window
```

## Recommended options for operation dashboard

```js
{
  viewMode: 'hour',
  multiGantt: true,
  showNowTimeline: true,
  scrollToNowOnLoad: true,
  nowViewportPosition: 'center',
  setRollingWindow: true,
  highlightConflicts: true,
  promptTimeOnHorizontalMove: true,
  timeSnapMinutes: 5,
  minBlockWidth: 8,
  showLegend: true
}
```

Use `setRollingWindow()` to display the running operation window:

```js
gantt.ganttView.setRollingWindow(2, 10, false);
```

## Exact time after drag

For airport operation, mouse dragging alone is often not precise enough. The recommended interaction is:

```text
Drag task roughly to the target range
Prompt exact time input
User enters 09:15-10:30
Control updates the task time
Application confirms or persists the change
```

If the user leaves the prompt empty, the control uses grid alignment based on the drag position.

## Conflict handling

Conflict highlight is a UI warning, not a scheduling decision.

When a conflict appears, the application should decide whether to:

```text
Reject the change
Ask for confirmation
Create a warning workflow
Allow temporary conflict for operation reason
```

## Performance suggestion

For a large number of resources, start with row windowing:

```js
gantt.ganttView.setRowWindow(0, 30, true);
```

Do not introduce full virtual scrolling too early unless the resource count and interaction requirements justify it.
