# Examples / 示例说明

The `example/` directory contains runnable HTML files.

## index.html

Legacy-style demo with day and hour views.

Includes:

```text
current time range button
locale selector
basic drag/resize interaction
```

## index2.html

Multi-task demo with additional rows and locale selector.

Useful for checking:

```text
multiGantt behavior
same-row multiple blocks
basic conflict display
```

## airport-resources.html

Airport resource timeline demo.

Covers:

```text
gates
check-in counters
baggage belts
resourceType labels
status classes
planned/estimated/actual time fields
time layers
buffer time
short task display
current time positioning
rolling time window
row windowing
conflict highlight
multi-instance isolation
```

This is the most important demo for airport industry usage.

## i18n.html

Focused i18n demo.

Covers:

```text
zh-CN
en-US
fr-FR
de-DE
th-TH
runtime locale switch
```

## Local opening notes

The examples use local `jquery.min.js` and `jquery-ui-1.13.0.js` bundled in this package. They should be openable directly in a browser for basic visual checks.

For project integration, use your own dependency management instead of copying the example dependency paths directly.
