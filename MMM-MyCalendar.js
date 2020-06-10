/***************************************

  Module: MMM-MyCalendar
  By Jeff Clarke
 
  Based on the default Calendar module
  By Michael Teeuw http://michaelteeuw.nl
 
  MIT Licensed.

***************************************/

Module.register("MMM-MyCalendar", {

	// Define module defaults
	defaults: {
		maximumEntries: 10, // Total Maximum Entries
		maximumNumberOfDays: 365,
		displaySymbol: true,
		defaultSymbol: "calendar", // Fontawesome Symbol see http://fontawesome.io/cheatsheet/
		displayRepeatingCountTitle: false,
		defaultRepeatingCountTitle: "",
		maxTitleLength: 25,
		fetchInterval: 5 * 60 * 1000, // Update every 5 minutes.
		animationSpeed: 2000,
		fade: true,
		urgency: 7,
		useRelativeDates: false,
		dayOfWeekFormat: "dddd",
		dateFormat: "MMMM D",
		timeFormat: "h:mm A",
		joiningWord: "at",
		getRelative: 6,
		fadePoint: 0.25, // Start on 1/4th of the list.
		hidePrivate: false,
		colored: false,
		calendars: [
			{
				symbol: "calendar",
				url: "http://www.calendarlabs.com/templates/ical/US-Holidays.ics",
			},
		],
		titleReplace: {
			"De verjaardag van ": "",
			"'s birthday": ""
		},
		broadcastEvents: true,
		excludedEvents: [],
    showLocation: true
	},

	// Define required scripts.
	getStyles: function () {
		return ["MMM-MyCalendar.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Override start method.
	start: function () {
		Log.log("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		for (var c in this.config.calendars) {
			var calendar = this.config.calendars[c];
			calendar.url = calendar.url.replace("webcal://", "http://");

			var calendarConfig = {
				maximumEntries: calendar.maximumEntries,
				maximumNumberOfDays: calendar.maximumNumberOfDays
			};

			// we check user and password here for backwards compatibility with old configs
			if(calendar.user && calendar.pass){
				calendar.auth = {
					user: calendar.user,
					pass: calendar.pass
				}
			}

			this.addCalendar(calendar.url, calendar.auth, calendarConfig);
		}

		this.calendarData = {};
		this.loaded = false;
	},

	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "CALENDAR_EVENTS") {
			if (this.hasCalendarURL(payload.url)) {
				this.calendarData[payload.url] = payload.events;
				this.loaded = true;

				if (this.config.broadcastEvents) {
					this.broadcastEvents();
				}
			}
		} else if (notification === "FETCH_ERROR") {
			Log.error("Calendar Error. Could not fetch calendar: " + payload.url);
		} else if (notification === "INCORRECT_URL") {
			Log.error("Calendar Error. Incorrect url: " + payload.url);
		} else {
			Log.log("Calendar received an unknown socket notification: " + notification);
		}

		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function () {

		var events = this.createEventList();
		var wrapper = document.createElement("table");
		wrapper.className = "small";

		if (events.length === 0) {
			if (this.config.hideWhenEmpty) {
				return null;
			} else {
				wrapper.innerHTML = (this.loaded) ? this.translate("EMPTY") : this.translate("LOADING");
				wrapper.className = "small dimmed";
				return wrapper;
			}
		}

		for (var e in events) {
			var event = events[e];

			var excluded = false;
			for (var f in this.config.excludedEvents) {
				var filter = this.config.excludedEvents[f];
				if (event.title.toLowerCase().includes(filter.toLowerCase())) {
					excluded = true;
					break;
				}
			}

			if (excluded) {
				continue;
			}

			var eventWrapper = document.createElement("td");

      if (this.config.colored) {
        //eventWrapper.style.cssText = "color:" + this.colorForUrl(event.url);
      }

      eventWrapper.className = "normal";
      eventWrapper.classList.add("calendar-event");

			if (this.config.displaySymbol) {
        eventWrapper.classList.add("with-symbol");
				var symbolWrapper = document.createElement("span");
        symbolWrapper.className = "symbol";
        // console.log("Start: " + event.startDate);
        symbolWrapper.innerHTML = moment(event.startDate, "x").format("D");
        // var symbols = this.symbolsForUrl(event.url);
        // if(typeof symbols === "string") {
        //   symbols = [symbols];
        // }

        // for(var i = 0; i < symbols.length; i++) {
        //   var symbol = document.createElement("span");
        //   symbol.className = "fa fa-" + symbols[i];
        //   if(i > 0){
        //     // symbol.style.paddingLeft = "5px";
        //   }
        //   //symbolWrapper.appendChild(symbol);
        // }
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttributeNS(null, "class", "calendar-icon");
        var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-MyCalendar/icon_sprite.svg#calendar");
        svg.appendChild(use);

        symbolWrapper.appendChild(svg);

        if (this.config.colored) {
          symbolWrapper.style.color = this.colorForUrl(event.url);
        }        
        eventWrapper.appendChild(symbolWrapper);
			}

			var titleWrapper = document.createElement("span"),
				repeatingCountTitle = "";


			if (this.config.displayRepeatingCountTitle) {

				repeatingCountTitle = this.countTitleForUrl(event.url);

				if (repeatingCountTitle !== "") {
					var thisYear = new Date(parseInt(event.startDate)).getFullYear(),
						yearDiff = thisYear - event.firstYear;

					repeatingCountTitle = ", " + yearDiff + ". " + repeatingCountTitle;
				}
			}

			titleWrapper.innerHTML = this.titleTransform(event.title) + repeatingCountTitle;

			if (!this.config.colored) {
				titleWrapper.className = "title bright";
			} else {
				titleWrapper.className = "title";
			}

			eventWrapper.appendChild(titleWrapper);

			var timeWrapper = document.createElement("span");
			//console.log(event.today);
			var now = new Date();
			var momentNow = moment();
			var momentEventStart = moment(event.startDate, "x")
			// Define second, minute, hour, and day variables
			var oneSecond = 1000; // 1,000 milliseconds
			var oneMinute = oneSecond * 60;
			var oneHour = oneMinute * 60;
			var oneDay = oneHour * 24;
			if (event.fullDayEvent) {
				if (event.today) {
					timeWrapper.innerHTML = this.capFirst(this.translate("TODAY"));
				} else if (event.startDate - now < oneDay && event.startDate - now > 0) {
					timeWrapper.innerHTML = this.capFirst(this.translate("TOMORROW"));
				} else if (event.startDate - now < 6 * oneDay && event.startDate - now > 0) {
          timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").format(this.config.dayOfWeekFormat));
				} else {
					/* Check to see if the user displays absolute or relative dates with their events
					 * Also check to see if an event is happening within an 'urgency' time frameElement
					 * For example, if the user set an .urgency of 7 days, those events that fall within that
					 * time frame will be displayed with 'in xxx' time format or moment.fromNow()
					 *
					 * Note: this needs to be put in its own function, as the whole thing repeats again verbatim
					 */
					if (!this.config.useRelativeDates) {
						if ((this.config.urgency > 1) && (event.startDate - now < (this.config.urgency * oneDay))) {
							// This event falls within the config.urgency period that the user has set
							timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").fromNow());
						} else {
							timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").format(this.config.dateFormat));
						}
					} else {
						timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").fromNow());
					}
				}
			} else {
				if (event.startDate >= new Date()) {
					if (event.startDate - now < 6 * oneDay) {
						if (event.startDate - now < this.config.getRelative * oneHour) {
							// If event is within 6 hour, display 'in xxx' time format or moment.fromNow()
							timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").fromNow());
						} else if (momentEventStart.isSame(momentNow, "day")) {
							timeWrapper.innerHTML = this.capFirst(this.translate("TODAY")) + " " + this.config.joiningWord + " " + this.capFirst(moment(event.startDate, "x").format(this.config.timeFormat));
						} else if (momentEventStart.isSame(moment(momentNow).add(1, "day"), "day")) {
							// This event is tomorrow
							timeWrapper.innerHTML = this.capFirst(this.translate("TOMORROW")) + " " + this.config.joiningWord + " " + this.capFirst(moment(event.startDate, "x").format(this.config.timeFormat));
					  } else {
							timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").format(this.config.dayOfWeekFormat + " [" + this.config.joiningWord + "] " + this.config.timeFormat));
						}
					} else {
						/* Check to see if the user displays absolute or relative dates with their events
						 * Also check to see if an event is happening within an 'urgency' time frameElement
						 * For example, if the user set an .urgency of 7 days, those events that fall within that
						 * time frame will be displayed with 'in xxx' time format or moment.fromNow()
						 *
						 * Note: this needs to be put in its own function, as the whole thing repeats again verbatim
						 */
						if (!this.config.useRelativeDates) {
							if ((this.config.urgency > 1) && (momentEventStart.isSameOrBefore(moment(momentNow).add(this.config.urgency, "days")) )) {
								// This event falls within the config.urgency period that the user has set
								timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").fromNow());
							} else {
								timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").format(this.config.dateFormat + " [" + this.config.joiningWord + "] " + this.config.timeFormat));
							}
						} else {
							timeWrapper.innerHTML = this.capFirst(moment(event.startDate, "x").fromNow());
						}
					}
				} else {
					timeWrapper.innerHTML = this.capFirst(this.translate("RUNNING")) + " " + moment(event.endDate, "x").fromNow(true);
				}
			}

			timeWrapper.className = "time light";

			eventWrapper.appendChild(timeWrapper);

      if (event.location && this.config.showLocation) { 
        var locationWrapper = document.createElement("span");
        locationWrapper.classList.add("location");
        locationWrapper.innerHTML = event.location;
        eventWrapper.appendChild(locationWrapper);
      }

      var eventWrapperOuter = document.createElement("tr");
      eventWrapperOuter.appendChild(eventWrapper)
			wrapper.appendChild(eventWrapperOuter);

			// Create fade effect.
			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = events.length * this.config.fadePoint;
				var steps = events.length - startingPoint;
				if (e >= startingPoint) {
					var currentStep = e - startingPoint;
					eventWrapper.style.opacity = 1 - (1 / steps * currentStep);
				}
			}
		}

		return wrapper;
	},

	/* hasCalendarURL(url)
	 * Check if this config contains the calendar url.
	 *
	 * argument url string - Url to look for.
	 *
	 * return bool - Has calendar url
	 */
	hasCalendarURL: function (url) {
		for (var c in this.config.calendars) {
			var calendar = this.config.calendars[c];
			if (calendar.url === url) {
				return true;
			}
		}

		return false;
	},

	/* createEventList()
	 * Creates the sorted list of all events.
	 *
	 * return array - Array with events.
	 */
	createEventList: function () {
		var events = [];
		var today = moment().startOf("day");
		for (var c in this.calendarData) {
			var calendar = this.calendarData[c];
			for (var e in calendar) {
				var event = calendar[e];
				if(this.config.hidePrivate) {
					if(event.class === "PRIVATE") {
						  // do not add the current event, skip it
						  continue;
					}
				}
				event.url = c;
				event.today = event.startDate >= today && event.startDate < (today + 24 * 60 * 60 * 1000);
				events.push(event);
			}
		}

		events.sort(function (a, b) {
			return a.startDate - b.startDate;
		});

		return events.slice(0, this.config.maximumEntries);
	},

	/* createEventList(url)
	 * Requests node helper to add calendar url.
	 *
	 * argument url string - Url to add.
	 */
	addCalendar: function (url, auth, calendarConfig) {
		this.sendSocketNotification("ADD_CALENDAR", {
			url: url,
			maximumEntries: calendarConfig.maximumEntries || this.config.maximumEntries,
			maximumNumberOfDays: calendarConfig.maximumNumberOfDays || this.config.maximumNumberOfDays,
			fetchInterval: this.config.fetchInterval,
			auth: auth
		});
	},

	/* symbolsForUrl(url)
	 * Retrieves the symbols for a specific url.
	 *
	 * argument url string - Url to look for.
	 *
	 * return string/array - The Symbols
	 */
	symbolsForUrl: function (url) {
		return this.getCalendarProperty(url, "symbol", this.config.defaultSymbol);
	},

	/* colorForUrl(url)
	 * Retrieves the color for a specific url.
	 *
	 * argument url string - Url to look for.
	 *
	 * return string - The Color
	 */
	colorForUrl: function (url) {
		return this.getCalendarProperty(url, "color", "#fff");
	},

	/* countTitleForUrl(url)
	 * Retrieves the name for a specific url.
	 *
	 * argument url string - Url to look for.
	 *
	 * return string - The Symbol
	 */
	countTitleForUrl: function (url) {
		return this.getCalendarProperty(url, "repeatingCountTitle", this.config.defaultRepeatingCountTitle);
	},

	/* getCalendarProperty(url, property, defaultValue)
	 * Helper method to retrieve the property for a specific url.
	 *
	 * argument url string - Url to look for.
	 * argument property string - Property to look for.
	 * argument defaultValue string - Value if property is not found.
	 *
	 * return string - The Property
	 */
	getCalendarProperty: function (url, property, defaultValue) {
		for (var c in this.config.calendars) {
			var calendar = this.config.calendars[c];
			if (calendar.url === url && calendar.hasOwnProperty(property)) {
				return calendar[property];
			}
		}

		return defaultValue;
	},

	/* shorten(string, maxLength)
	 * Shortens a string if it's longer than maxLength.
	 * Adds an ellipsis to the end.
	 *
	 * argument string string - The string to shorten.
	 * argument maxLength number - The max length of the string.
	 *
	 * return string - The shortened string.
	 */
	shorten: function (string, maxLength) {
		if (string.length > maxLength) {
			return string.slice(0, maxLength) + "&hellip;";
		}

		return string;
	},

	/* capFirst(string)
	 * Capitalize the first letter of a string
	 * Return capitalized string
	 */

	capFirst: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	/* titleTransform(title)
	 * Transforms the title of an event for usage.
	 * Replaces parts of the text as defined in config.titleReplace.
	 * Shortens title based on config.maxTitleLength
	 *
	 * argument title string - The title to transform.
	 *
	 * return string - The transformed title.
	 */
	titleTransform: function (title) {
		for (var needle in this.config.titleReplace) {
			var replacement = this.config.titleReplace[needle];

			var regParts = needle.match(/^\/(.+)\/([gim]*)$/);
			if (regParts) {
			  // the parsed pattern is a regexp.
			  needle = new RegExp(regParts[1], regParts[2]);
			}

			title = title.replace(needle, replacement);
		}

		title = this.shorten(title, this.config.maxTitleLength);
		return title;
	},

	/* broadcastEvents()
	 * Broadcasts the events to all other modules for reuse.
	 * The all events available in one array, sorted on startdate.
	 */
	broadcastEvents: function () {
		var eventList = [];
		for (url in this.calendarData) {
			var calendar = this.calendarData[url];
			for (e in calendar) {
				var event = cloneObject(calendar[e]);
				delete event.url;
				eventList.push(event);
			}
		}

		eventList.sort(function(a,b) {
			return a.startDate - b.startDate;
		});

		this.sendNotification("CALENDAR_EVENTS", eventList);

	}
});
