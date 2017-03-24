import $ from 'jquery';
import Chart from 'chart.js';
import Burndown from './burndown';

$.get('/trello/info').done(data => {
  data.tasksDOMId  = 'myTasksChart';
  data.issuesDOMId = 'myIssuesChart';

  return new Burndown(data);
})
