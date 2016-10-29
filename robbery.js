'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = true;

var DAYS_OF_WEEK = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
var POTENTIAL_DAYS_OF_ROBBERY = ['ПН', 'ВТ', 'СР'];
var MILLISECONDS_IN_MINUTE = 60 * 1000;

function TimeInterval(from, to) {
    this.from = from;
    this.to = to;
    this.duration = function () {
        return this.to.date - this.from.date;
    };
}

function DateTime(date, timeZone) {
    this.date = date;
    this.timeZone = timeZone;
    this.valueOf = function () {
        return this.date.getTime();
    };
}

function parseDate(dateStr) {
    var matches = dateStr.match(/([а-я]{2})*\s*(\d{2}):(\d{2})\+(\d{1,2})/i);
    var dayOfMonth = 1 + DAYS_OF_WEEK.indexOf(matches[1]);
    var currentTimeZone = Number(matches[4]);
    var hours = Number(matches[2]) - currentTimeZone;
    var minutes = Number(matches[3]);
    var date = new Date(Date.UTC(2016, 10, dayOfMonth, hours, minutes));

    return new DateTime(date, currentTimeZone);
}

function parseInterval(interval) {
    return new TimeInterval(parseDate(interval.from), parseDate(interval.to));
}

function getTimeIntervalsOfBankWork(workingHours) {
    return POTENTIAL_DAYS_OF_ROBBERY.map(function (day) {
        var newFrom = day + ' ' + workingHours.from;
        var newTo = day + ' ' + workingHours.to;

        return parseInterval({ from: newFrom, to: newTo });
    });
}

function getBusyTimeIntervals(scheduleOfGangs) {
    var gangs = Object.keys(scheduleOfGangs);

    return gangs.reduce(function (intervals, gang) {
        var timeIntervals = scheduleOfGangs[gang].map(parseInterval);

        return intervals.concat(timeIntervals);
    },
    []);
}

function intervalDifference(currentInterval, interval) {
    if (interval.to < currentInterval.from || interval.from > currentInterval.to) {
        return [currentInterval];
    }

    var difference = [];

    if (interval.from > currentInterval.from) {
        difference.push(new TimeInterval(currentInterval.from, interval.from));
    }

    if (interval.to < currentInterval.to) {
        difference.push(new TimeInterval(interval.to, currentInterval.to));
    }

    return difference;
}

function subtractTimeInterval(timeIntervals, interval) {
    return timeIntervals.reduce(function (result, currentInterval) {
        return result.concat(intervalDifference(currentInterval, interval));
    }, []);
}

function toMillisecond(minutes) {
    return minutes * MILLISECONDS_IN_MINUTE;
}

function formatTime(time) {
    return ((time < 10) ? '0' : '') + time;
}

function getLaterTime(dateTime, minutes) {
    var date = new Date(dateTime.date);
    date.setUTCMinutes(date.getUTCMinutes() + minutes);

    return new DateTime(date, dateTime.timeZone);
}

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);

    var timeZoneOfBank = parseDate(workingHours.from).timeZone;
    var busyTimeIntervals = getBusyTimeIntervals(schedule);
    var timeIntervalsOfBankWork = getTimeIntervalsOfBankWork(workingHours);
    var workTime = toMillisecond(duration);

    function isSuitable(timeInterval) {
        return timeInterval.duration() >= workTime;
    }

    var suitableTimeIntervals = busyTimeIntervals
                                        .reduce(subtractTimeInterval, timeIntervalsOfBankWork)
                                        .filter(isSuitable);

    return {
        exists: function () {
            return suitableTimeIntervals.length !== 0;
        },

        format: function (template) {
            if (!this.exists()) {
                return '';
            }

            var date = getLaterTime(suitableTimeIntervals[0].from, 60 * timeZoneOfBank).date;
            var day = DAYS_OF_WEEK[date.getUTCDate() - 1];
            var hours = formatTime(date.getUTCHours());
            var minutes = formatTime(date.getUTCMinutes());

            return template.replace('%HH', hours)
                           .replace('%DD', day)
                           .replace('%MM', minutes);
        },

        tryLater: function () {
            if (!this.exists()) {
                return false;
            }

            var to = getLaterTime(suitableTimeIntervals[0].from, 30);
            var delay = new TimeInterval(suitableTimeIntervals[0].from, to);
            var intervals = subtractTimeInterval(suitableTimeIntervals, delay).filter(isSuitable);
            var existsLaterTimeInterval = intervals.length !== 0;

            if (existsLaterTimeInterval) {
                suitableTimeIntervals = intervals;
            }

            return existsLaterTimeInterval;
        }
    };
};
