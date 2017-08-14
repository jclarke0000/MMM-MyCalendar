# Module: MMM-MyCalendar

This calendar module is functionally the same as the default calendar app, however its presentation is different.

This module displays events from a public .ical calendar. It can combine multiple calendars.

## Using the module

**NOTE: Some configuration parameters have changed.  See below if you are updating from a previous version.**

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "MMM-MyCalendar",
		position: "top_left",	// This can be any of the regions. Best results in left or right regions.
		config: {
			// The config property is optional.
			// If no config is set, an example calendar is shown.
			// See 'Configuration options' for more information.
		}
	}
]
````

## Configuration options

The following properties can be configured:

**Note** if you are updating, some of the configuration options have changed, as follows:

* `timeFormat` no longer refers to whether you would like to see 'relative' or 'absolute' dates.  You now use `useRelativeDates` and specifiy either `true` or `false`.
* `timeFormat` is now used to specify the display format for time (e.g.: `"h:mm A"` for 12 hour time, `"HH:mm"` for 24 hour time, etc.)
* `dateFormat` is now just used for specifying how date portions of the display should format (e.g.: `"MMMM D"` for January 1, `"DD-MMM"` for 01-Jan, etc.).
* `dayOfWeekFormat` is new and allows you to specify a format for weekday names (e.g. `"dddd"` for Tuesday, `"ddd"` for Tue, etc.)
* `joiningWord` is new and allows you to specify the word to be displayed between the day/date and time of the event (e.g.: specify `"at"` for Tuesday `at` 1:15 PM).  If you do not want a joining word, then specify an empty string (i.e.: `""`).


| Option                       | Description
| ---------------------------- | -----------
| `maximumEntries`             | The maximum number of events shown. / **Possible values:** `0` - `100` <br> **Default value:** `10`
| `maximumNumberOfDays`        | The maximum number of days in the future. <br><br> **Default value:** `365`
| `maxTitleLength`             | The maximum title length. <br><br> **Possible values:** `10` - `50` <br> **Default value:** `25`
| `fetchInterval`              | How often does the content needs to be fetched? (Milliseconds) <br><br> **Possible values:** `1000` - `86400000` <br> **Default value:** `300000` (5 minutes)
| `animationSpeed`             | Speed of the update animation. (Milliseconds) <br><br> **Possible values:**`0` - `5000` <br> **Default value:** `2000` (2 seconds)
| `fade`                       | Fade the future events to black. (Gradient) <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `fadePoint`                  | Where to start fade? <br><br> **Possible values:** `0` (top of the list) - `1` (bottom of list) <br> **Default value:** `0.25`
| `calendars`                  | The list of calendars. <br><br> **Possible values:** An array, see _calendar configuration_ below. <br> **Default value:** _An example calendar._
| `titleReplace`               | An object of textual replacements applied to the tile of the event. This allow to remove or replace certains words in the title. <br><br> **Example:** `{'Birthday of ' : '', 'foo':'bar'}` <br> **Default value:** `{	"De verjaardag van ": "", "'s birthday": ""	}`
| `displayRepeatingCountTitle` | Show count title for yearly repeating events (e.g. "X. Birthday", "X. Anniversary") <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `dayOfWeekFormat`            | Format to use for weekday names. <br><br>**Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/)<br> **Default value:** `dddd` (e.g. Tuesday)
| `timeFormat`                 | Format to use for time display. <br><br>**Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/)<br> **Default value:** `h:mm A` (e.g. 1:15 PM)
| `dateFormat`                 | Format to use for the date of events (when using absolute dates) <br><br> **Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/) <br> **Default value:** `MMMM D` (e.g. January 18)
| `joiningWord`                | Word to display between the day/date and the time of the event (e.g.: Tuesday `at` 1:15 PM). If you do not want one, you need to explicitly specify an epmty string (i.e.: `""`)<br> **Default value:** `at`
| `useRelativeDates`           | Display event times as relative time (`true`) or absolute dates (`false`)<br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`<br>**NOTE** This used to be named `timeFormat`, but I felt that din't make a lot of sense.  So `timeFormat` is now used to specify the format for time display (as one would expect).
| `getRelative`                | How much time (in hours) should be left until calendar events start getting relative? <br><br> **Possible values:** `0` (events stay absolute) - `48` (48 hours before the event starts) <br> **Default value:** `6`
| `urgency`                    | When using a timeFormat of `absolute`, the `urgency` setting allows you to display events within a specific time frame as `relative`. This allows events within a certain time frame to be displayed as relative (in xx days) while others are displayed as absolute dates <br><br> **Possible values:** a positive integer representing the number of days for which you want a relative date, for example `7` (for 7 days) <br><br> **Default value:** `7`
| `broadcastEvents`            | If this property is set to true, the calendar will broadcast all the events to all other modules with the notification message: `CALENDAR_EVENTS`. The event objects are stored in an array and contain the following fields: `title`, `startDate`, `endDate`, `fullDayEvent`, `location` and `geo`. <br><br> **Possible values:** `true`, `false` <br><br> **Default value:** `true`
| `hidePrivate`                | Hides private calendar events. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `excludedEvents`             | An array of words / phrases from event titles that will be excluded from being shown. <br><br> **Example:** `['Birthday', 'Hide This Event']` <br> **Default value:** `[]`

### Calendar configuration

The `calendars` property contains an array of the configured calendars.
The `colored` property gives the option for an individual color for each calendar.

#### Default value:
````javascript
config: {
	colored: false,
	calendars: [
		{
			url: 'http://www.calendarlabs.com/templates/ical/US-Holidays.ics',
			symbol: 'calendar',
			auth: {
			    user: 'username',
			    pass: 'superstrongpassword',
			    method: 'basic'
			}
		},
	],
}
````

#### Calendar configuration options:
| Option                | Description
| --------------------- | -----------
| `url`	                | The url of the calendar .ical. This property is required. <br><br> **Possible values:** Any public accessble .ical calendar.
| `color`              | The font color of an event from this calendar. This property should be set if the config is set to colored: true. <br><br> **Possible values:** HEX, RGB or RGBA values (#efefef, rgb(242,242,242), rgba(242,242,242,0.5)).
| `repeatingCountTitle`	| The count title for yearly repating events in this calendar.  <br><br> **Example:** `'Birthday'`
| `maximumEntries`      | The maximum number of events shown.  Overrides global setting. **Possible values:** `0` - `100`
| `maximumNumberOfDays` | The maximum number of days in the future.  Overrides global setting
| `auth`                | The object containing options for authentication against the calendar.


#### Calendar authentication options:
| Option                | Description
| --------------------- | -----------
| `user`                | The username for HTTP authentication.
| `pass`                | The password for HTTP authentication. (If you use Bearer authentication, this should be your BearerToken.)
| `method`              | Which authentication method should be used. HTTP Basic, Digest and Bearer authentication methods are supported. Basic authentication is used by default if this option is omitted. **Possible values:** `digest`, `basic`, `bearer` **Default value:** `basic`
