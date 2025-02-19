## Event object
This is a JavaScript object that the Event Calendar uses to store information about a calendar event.

Here are all properties that exist in Event object:
<table>
<tr>
<td>

`id`
</td>
<td>A unique string identifier of the event</td>
</tr>
<tr>
<td>

`resourceIds`
</td>
<td>An array of resource IDs that the event is associated with</td>
</tr>
<tr>
<td>

`allDay`
</td>
<td>

`true` or `false`. Determines if the event is shown in the `all-day` slot</td>
</tr>
<tr>
<td>

`start`
</td>
<td>JavaScript Date object holding the event’s start time</td>
</tr>
<tr>
<td>

`end`
</td>
<td>JavaScript Date object holding the event’s end time</td>
</tr>
<tr>
<td>

`title`
</td>
<td>

`Content` The text appearing on the event. See [Content](#content)</td>
</tr>
<tr>
<td>

`editable`
</td>
<td>

`true`, `false` or `undefined`. The value overriding the [editable](#editable) setting for this specific event
</td>
</tr>
<tr>
<td>

`startEditable`
</td>
<td>

`true`, `false` or `undefined`. The value overriding the [eventStartEditable](#eventstarteditable) setting for this specific event
</td>
</tr>
<tr>
<td>

`durationEditable`
</td>
<td>

`true`, `false` or `undefined`. The value overriding the [eventDurationEditable](#eventdurationeditable) setting for this specific event
</td>
</tr>
<tr>
<td>

`display`
</td>
<td>

The rendering type of the event. Can be `'auto'` or `'background'`

In addition, in your callback functions, you may get the `'ghost'`, `'preview'` and `'pointer'` for this property, which are internal values and are used, for example, to display events during drag-and-drop operations
</td>
</tr>
<tr>
<td>

`backgroundColor`
</td>
<td>

The [eventBackgroundColor](#eventbackgroundcolor) override for this specific event
</td>
</tr>
<tr>
<td>

`textColor`
</td>
<td>

The [eventTextColor](#eventtextcolor) override for this specific event
</td>
</tr>
<tr>
<td>

`classNames`
</td>
<td>

An array of additional CSS classes for this specific event
</td>
</tr>
<tr>
<td>

`styles`
</td>
<td>

An array of additional inline styling declarations for this specific event
</td>
</tr>
<tr>
<td>

`extendedProps`
</td>
<td>

A plain object holding miscellaneous properties specified during parsing in the explicitly given `extendedProps` field
</td>
</tr>
</table>

### Parsing event from a plain object
When Event Calendar receives an array of plain event’s objects either from the `events` option or as a result of an HTTP request to a URL of an event source, it parses the input objects into proper Event objects.

Here are all admissible fields for the event’s input object:
<table>
<tr>
<td>

`id`
</td>
<td>

`string` or `integer` A unique identifier of the event. Default `auto-generated value`
</td>
</tr>
<tr>
<td>

`allDay`
</td>
<td>

`boolean` Determines if the event is shown in the all-day slot. Defaults to `true` if `start` and `end` are both passed without a time part, `false` otherwise
</td>
</tr>
<tr>
<td>

`start`
</td>
<td>

`string` or `Date` This should be either an ISO8601 datetime string like `'2022-12-31 09:00:00'`, or a JavaScript Date object holding the event’s start time
</td>
</tr>
<tr>
<td>

`end`
</td>
<td>

`string` or `Date` This should be either an ISO8601 datetime string like `'2022-12-31 13:00:00'`, or a JavaScript Date object holding the event’s end time
</td>
</tr>
<tr>
<td>

`title`
</td>
<td>

`Content` The text that will appear on the event. See [Content](#content). Default `''`
</td>
</tr>
<tr>
<td>

`editable`
</td>
<td>

`boolean` Overrides the master [editable](#editable) option for this single event. Default `undefined`
</td>
</tr>
<tr>
<td>

`startEditable`
</td>
<td>

`boolean` Overrides the master [eventStartEditable](#eventstarteditable) option for this single event. Default `undefined`
</td>
</tr>
<tr>
<td>

`durationEditable`
</td>
<td>

`boolean` Overrides the master [eventDurationEditable](#eventdurationeditable) option for this single event. Default `undefined`
</td>
</tr>
<tr>
<td>

`resourceIds` or `resourceId`
</td>
<td>

`string`, `integer` or `array`  An ID of a resource or an array of resource IDs that the event is associated with. Default `[]`
</td>
</tr>
<tr>
<td>

`display`
</td>
<td>

`string` The rendering type of the event. Can be `'auto'` or `'background'`. Default `'auto'`
</td>
</tr>
<tr>
<td>

`backgroundColor`
</td>
<td>

`string` Sets the event’s background color just like the calendar-wide [eventBackgroundColor](#eventbackgroundcolor) option. Default `undefined`
</td>
</tr>
<tr>
<td>

`textColor`
</td>
<td>

`string` Sets the event’s text color just like the calendar-wide [eventTextColor](#eventtextcolor) option. Default `undefined`
</td>
</tr>
<tr>
<td>

`color`
</td>
<td>

`string` This is currently an alias for the `backgroundColor` field. Default `undefined`
</td>
</tr>
<tr>
<td>

`classNames` or `className`
</td>
<td>

`string` or `array` Sets additional CSS classes for this single event. See [eventClassNames](#eventclassnames). Default `[]`
</td>
</tr>
<tr>
<td>

`styles` or `style`
</td>
<td>

`string` or `array` Sets additional inline styling declarations for this single event. This value can be either a string containing styles `'font-size: 24px; border-radius: 4px; ...'` or an array of strings `['font-size: 24px', 'border-radius: 4px', ...]`. Default `[]`
</td>
</tr>
<tr>
<td>

`extendedProps`
</td>
<td>

`object` A plain object with any miscellaneous properties. It will be directly transferred to the `extendedProps` property of the Event object. Default `{}`
</td>
</tr>
</table>

## Duration object
This is a JavaScript object that the Event Calendar uses to store information about a period of time, like _30 minutes_ or _1 day and 6 hours_.

Here are all properties that exist in Duration object:
<table>
<tr>
<td>

`years`
</td>
<td>The number of years in duration</td>
</tr>
<tr>
<td>

`months`
</td>
<td>The number of months in duration</td>
</tr>
<tr>
<td>

`days`
</td>
<td>The number of days in duration</td>
</tr>
<tr>
<td>

`seconds`
</td>
<td>The number of seconds in duration. If you want hours and minutes, you need to do division on this property</td>
</tr>
<tr>
<td>

`inWeeks`
</td>
<td>Determines whether the duration represents a time period in weeks. This value is set during parsing the input data</td>
</tr>
</table>

### Parsing duration from input values
When Event Calendar receives a value for options like `duration`, `scrollTime`, `slotDuration` and others, it parses it into a proper Duration object.

The admissible input value can be specified in one of three formats:
- an object with any of the following keys: `year`, `years`, `month`, `months`, `day`, `days`, `minute`, `minutes`, `second`, `seconds`
- a string in the format `hh:mm:ss` or `hh:mm`. For example, `'05:00'` specifies 5 hours
- an integer specifying the total number of seconds

## Resource object
This is a JavaScript object that the Event Calendar uses to store information about a resource. Calendar events can be associated with resources and displayed separately using the resource view.

Here are all properties that exist in Resource object:
<table>
<tr>
<td>

`id`
</td>
<td>The unique string identifier for the resource</td>
</tr>
<tr>
<td>

`title`
</td>
<td>

The title of the resource. See [Content](#content)
</td>
</tr>
<tr>
<td>

`eventBackgroundColor`
</td>
<td>Default background color for this resource's events</td>
</tr>
<tr>
<td>

`eventTextColor`
</td>
<td>Default text color for this resource's events</td>
</tr>
<tr>
<td>

`extendedProps`
</td>
<td>

A plain object holding miscellaneous properties specified during parsing in the explicitly given `extendedProps` field
</td>
</tr>
</table>

### Parsing resource from a plain object
When Event Calendar receives an array of plain resource’s objects for the `resources` option, it parses the input objects into proper Resource objects.

Here are all admissible fields for the resource’s input object:
<table>
<tr>
<td>

`id`
</td>
<td>

`integer` or `string` Uniquely identifies the resource. [Event](#event-object) objects with a corresponding `resourceIds` field will be linked to this resource. Will be coerced into a `string`
</td>
</tr>
<tr>
<td>

`title`
</td>
<td>

`Content` Text that will be displayed on the resource when it is rendered. See [Content](#content). Default `''`
</td>
</tr>
<tr>
<td>

`eventBackgroundColor`
</td>
<td>

`string` Sets the default background color for this resource's events just like the calendar-wide [eventBackgroundColor](#eventbackgroundcolor) option. Default `undefined`
</td>
</tr>
<tr>
<td>

`eventTextColor`
</td>
<td>

`string` Sets the default text color for this resource's events just like the calendar-wide [eventTextColor](#eventtextcolor) option. Default `undefined`
</td>
</tr>
<tr>
<td>

`extendedProps`
</td>
<td>

`object` A plain object with any miscellaneous properties. It will be directly transferred to the `extendedProps` property of the Resource object. Default `{}`
</td>
</tr>
<tr>
<td>

`children`
</td>
<td>Nested resources. See below</td>
</tr>
</table>

The `timeline` views support displaying nested resources. Nested resources can be collapsed or expanded using an additional button that appears before the parent resource name. To pass nested resources, use the `children` field:

```js
resources: [
  {
    id: 1,
    title: 'Resource A',
    children: [
      {
        id: 11,
        title: 'Resource A1'
      },
      {
        id: 12,
        title: 'Resource A2'
      }
    ]
  }
]
```

## View object
A View object contains information about a calendar view, such as title and date range.

Here are all properties that exist in View object:
<table>
<tr>
<td>

`type`
</td>
<td>Name of the view</td>
</tr>
<tr>
<td>

`title`
</td>
<td>Title text that is displayed at the top of the header toolbar</td>
</tr>
<tr>
<td>

`currentStart`
</td>
<td>JavaScript Date that is the start of the interval the view is trying to represent. For example, in month view, this will be the first day of the month. This value disregards hidden days</td>
</tr>
<tr>
<td>

`currentEnd`
</td>
<td>JavaScript Date that is the end of the interval the view is trying to represent. Note: This value is exclusive. For example, in month view, this will be the day after the last day of the month. This value disregards hidden days</td>
</tr>
<tr>
<td>

`activeStart`
</td>
<td>JavaScript Date that is the first visible day. In month view, this value is often before the 1st day of the month, because most months do not begin on the first day-of-week</td>
</tr>
<tr>
<td>

`activeEnd`
</td>
<td>JavaScript Date that is the last visible day. Note: This value is exclusive</td>
</tr>
</table>