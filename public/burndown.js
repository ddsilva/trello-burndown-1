import Chart from 'chart.js';

function Burndown(options = {}) {
  const SPRINT_START_DAY      = options.startDay    || '01/01', //month/day
        SPRINT_DAYS           = options.totalDays        || 10, //number
        INITIAL_SPRINT_TASKS  = options.totalTasks || 20, //number
        INITIAL_SPRINT_POINTS = options.totalPoints || 30, //number
        EXCEPTION_DAYS        = options.exceptionDays || [];

  //{done: Number, extras: Number}
  const SPRINT_TASKS = options.sprintTasks || [
    {done: 1, extras: 0},
    {done: 2, extras: 0}
  ];
  const SPRINT_ISSUES = options.sprintIssues || [
    {done: 10, extras: 0},
    {done: 8, extras: 0}
  ];

  const DAYS = this.DAYS = this.getDays(SPRINT_START_DAY, SPRINT_DAYS, EXCEPTION_DAYS);

  const LINES_TASKS = this.LINES_TASKS = [
    this.getDataConfig("Ideal", "rgba(0, 0, 0,.5)", this.getIdealLineCoords(
      INITIAL_SPRINT_TASKS,
      DAYS
    )),
    this.getDataConfig("Tasks", "rgba(0,121,191,1)", this.getDoneCoords(
      SPRINT_TASKS,
      INITIAL_SPRINT_TASKS
    )),
    this.getDataConfig("Extras", "rgba(255,171,74,.5)", this.getExtrasCoords(
      SPRINT_TASKS
    )),
    this.getDataConfig("Average per day: " + this.getAveragePerDay(this.getDoneCoords(
      SPRINT_TASKS,
      INITIAL_SPRINT_TASKS
    ), DAYS), "#000", [0])
  ];

  const LINES_ISSUES = this.LINES_ISSUES = [
    this.getDataConfig("Ideal", "rgba(0, 0, 0,.5)", this.getIdealLineCoords(
      INITIAL_SPRINT_POINTS,
      DAYS
    )),
    this.getDataConfig("Issues", "rgba(0,121,191,1)", this.getDoneCoords(
      SPRINT_ISSUES,
      INITIAL_SPRINT_POINTS
    )),
    this.getDataConfig("Extras", "rgba(255,171,74,.5)", this.getExtrasCoords(
      SPRINT_ISSUES
    )),
    this.getDataConfig("Average per day: " + this.getAveragePerDay(this.getDoneCoords(
      SPRINT_ISSUES,
      INITIAL_SPRINT_POINTS
    ), DAYS), "#000", [0])
  ];

  this.generateChart("myTasksChart", {
    labels: DAYS,
    datasets: LINES_TASKS
  });
  this.generateChart("myIssuesChart", {
    labels: DAYS,
    datasets: LINES_ISSUES
  });
}

Object.assign(Burndown.prototype, {
  getDays: (startDay, sprintDays, exceptionDays) => {
    let days = [0];
    let exceptionDates = exceptionDays.map((date) => {
      return new Date(date).getTime();
    });

    for (let i = 1; i < sprintDays; i ++) {
      let date = new Date(startDay);
      date.setDate(date.getDate() + i);

      while (
        date.getDay() === 0
        || date.getDay() === 6
        || exceptionDates.includes(date.getTime())
      ) {
        sprintDays ++;
        i ++;
        date.setDate(date.getDate() + 1);
      }

      days.push((date.getDate()) + '/' + (date.getMonth() + 1));
    }

    return days;
  },

  getDoneCoords: (sprint, initial) => {
    let coords = [initial];
    let done = initial;
    let extras = 0;

    for (let i = 0; i < sprint.length; i ++) {
      done -= sprint[i].done;
      extras += sprint[i].extras || 0;
      coords.push(done + extras);
    }

    return coords;
  },

  getExtrasCoords: (sprint) => {
    let coords = [0];
    let extras = 0;

    for (let i = 0; i < sprint.length; i ++) {
      extras += sprint[i].extras || 0;
      coords.push(extras);
    }

    return coords;
  },

  getIdealLineCoords: (total, days) => {
    let totalDays = days.length;
    let totalPerDay = total / (totalDays - 1);
    let idealLineCoords = [];

    for (let i = 0; i < totalDays; i ++) {
      idealLineCoords.push(total - totalPerDay * i);
    }

    return idealLineCoords;
  },

  getDataConfig: (dataLabel, chartLineColor, chartLineData) => {
    return {
      label: dataLabel,
      fill: false,
      lineTension: 0.1,
      backgroundColor: "#fff",
      borderColor: chartLineColor,
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: "rgba(0,0,0,.5)",
      pointBackgroundColor: "#000",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: chartLineColor,
      pointHoverBorderColor: chartLineColor,
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: chartLineData,
      spanGaps: false
    }
  },

  round: (number, limit) => {
    return +(Math.round(number + "e+" + limit)  + "e-" + limit);
  },

  getAveragePerDay: function (doneCoords, days) {
    let remaining = doneCoords[doneCoords.length - 1];
    let remainingDays = days.length - doneCoords.length;

    return this.round(remaining / remainingDays, 2);
  },

  generateChart: (id, chartData) => {
    return new Chart(
      document.getElementById(id),
      {
        type: 'line',
        data: chartData
      }
    );
  }
});

module.exports = Burndown;