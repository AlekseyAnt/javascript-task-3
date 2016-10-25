'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = true;

function subtractTimeInterval(timeIntervals, interval) {
    var difference = [];
    interval = { from: interval.from, to: interval.to };

    for (var i = 0; i < timeIntervals.length; i++) {
        if (interval.to <= timeIntervals.from) {
            return difference.concat(timeIntervals.slice(i));
        }

        if (interval.from > timeIntervals[i].to) {
            difference.push(timeIntervals[i]);
            continue;
        }

        if (interval.from > timeIntervals[i].from) {
            difference.push({ from: timeIntervals[i].from, to: interval.from });
        }

        if (interval.to < timeIntervals[i].to) {
            difference.push({ from: interval.to, to: timeIntervals[i].to });

            return difference.concat(timeIntervals.slice(i + 1));
        }

        interval.from = timeIntervals[i].to;
    }

    return difference;
}

var potentialDaysOfRobbery = ['ПН', 'ВТ', 'СР'];

function getTimeIntervalsOfBankWork(workingHours) {
    return potentialDaysOfRobbery.map(function (day) {
        var newFrom = day + ' ' + workingHours.from;
        var newTo = day + ' ' + workingHours.to;

        return { from: newFrom, to: newTo };
    });
}

function getNonFreeTimeIntervals(scheduleOfGangs) {
    var gangs = Object.keys(scheduleOfGangs);

    return gangs.reduce(function (intervals, gang) {
        return intervals.concat(scheduleOfGangs[gang]);
    },
    []);
}

var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

function parseDate(date, initialReferencePoint) {
    var newDate = rewriteDay(date);
    newDate = changeTimeZone(newDate, initialReferencePoint);

    return new Date(newDate);
}

function changeTimeZone(date, initialReferencePoint) {
    return date.replace(/\+(\d{1,2})/i, function (timeZone) {
        var newTimeZone = parseInt(timeZone, 10) - initialReferencePoint;
        var sign = (timeZone >= 0) ? '+' : '';

        return ' GMT' + sign + newTimeZone + '00';
    });
}

function rewriteDay(date) {
    return date.replace(/([а-я]{2})/i, function (dayOfWeek) {
        var dayOfMonth = 1 + week.indexOf(dayOfWeek);

        return '2016 Oct ' + dayOfMonth;
    });
}

function parseTimeIntervals(intervals, initialReferencePoint) {
    return intervals.map(function (interval) {
        return {
            from: parseDate(interval.from, initialReferencePoint),
            to: parseDate(interval.to, initialReferencePoint)
        };
    });
}

function toMillisecond(minutes) {
    return minutes * 60 * 1000;
}

function formatTime(time) {
    return ((time < 10) ? '0' : '') + time.toString();
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

    var timeZoneOfBank = parseInt(workingHours.from.slice(5, 8), 10);

    var nonFreeTimeIntervals = getNonFreeTimeIntervals(schedule);
    var timeIntervalsOfBankWork = getTimeIntervalsOfBankWork(workingHours);

    var nonFreeIntervals = parseTimeIntervals(nonFreeTimeIntervals, timeZoneOfBank);
    var intervalsOfBankWork = parseTimeIntervals(timeIntervalsOfBankWork, timeZoneOfBank);

    var workTime = toMillisecond(duration);

    function isSuitable(timeInterval) {
        return timeInterval.to - timeInterval.from >= workTime;
    }

    var suitableTimeIntervals = nonFreeIntervals.reduce(subtractTimeInterval, intervalsOfBankWork)
                                                .filter(isSuitable);

    function toNewFormat(s) {
        var date = suitableTimeIntervals[0].from;
        switch (s) {
            case '%DD':
                return week[date.getUTCDate() - 1];
            case '%HH':
                return formatTime(date.getUTCHours());
            case '%MM':
                return formatTime(date.getUTCMinutes());
            default:
                return '';
        }
    }

    return {
        exists: function () {
            return suitableTimeIntervals.length !== 0;
        },
        format: function (template) {
            return (this.exists()) ? template.replace(/%[dhm]{2}/ig, toNewFormat) : '';
        },
        tryLater: function () {
            var start = new Date(suitableTimeIntervals[0].from);
            start.setUTCMinutes(start.getUTCMinutes() + 30);
            var delay = { from: suitableTimeIntervals[0].from, to: start };
            var newIntervals = subtractTimeInterval(suitableTimeIntervals, delay).filter(isSuitable);

            if (newIntervals.length !== 0) {
                suitableTimeIntervals = e;
            }

            return newIntervals.lenght !== 0;
        }
    };
};
