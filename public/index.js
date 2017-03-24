import $ from 'jquery';
import Burndown from './burndown'

$.get('/trello/info').done(data => {
  new Burndown(data);
})
