import TrelloApi from 'node-trello';
import TrelloCollection from '../config/trello';
import { first, find, filter, some, range, map, uniq, flatten } from 'lodash';
import moment from 'moment';

const settings = find(TrelloCollection, { name: 'settings'});
const done  = find(TrelloCollection, { name: 'done'});

class Trello {
    constructor(response) { 
        this.trello = new TrelloApi(
            process.env.TRELLO_KEY, 
            process.env.TRELLO_TOKEN
        );
        this.response = response;
    };

    getLists() { 
        return new Promise((resolve, reject) => {
            this.trello.get('1/boards/58c824490fc0684259d9f180/lists', {
                cards: 'open'
            }, (err, res) => resolve(res));
        });
    };

    getComments() {
        return new Promise((resolve, reject) => {
            this.trello.get(`1/lists/${settings.id}/actions`, {
                filter: 'commentCard'
            }, (err, res) => resolve(res));
        });
    };

    async get() {
        const lists = await this.getLists();
        const comments = await this.getComments();

        const listsFiltred = filterLists(lists);

        const doneCards = find(lists, { id: done.id }).cards;
        const cards = map(filter(listsFiltred, item => item.id != done.id), 'cards');

        const sprint = {
            startDay: first(
                find(lists, { id: settings.id }).cards
            ).due,
            totalDays: Number(first(comments).data.text),
            totalPoints: getTotalPoints(cards),
            totalTasks: listsFiltred.reduce((prev, curr) => {
                return prev + curr.cards.length
            }, 0)
        };

        sprint.sprintTasks = getSprintTasks(doneCards, sprint.startDay, cards).sprintTasks;
        sprint.sprintIssues = getSprintTasks(doneCards, sprint.startDay, cards).sprintIssues;

        this.response.send(sprint);
    };
};

const filterLists = lists => {
    const collections = filter(TrelloCollection, 'exclude');
    return filter(lists, (item) => !some(collections, { id: item.id }));
};


const getSprintTasks = (doneCards, sprintStartDay, otherCards) => {
    let sprintTasks = [], sprintIssues = [];
    const currentDay = moment();
    const startDay = moment(sprintStartDay);

    const otherCardNames = flatten(map(otherCards, items => {
        return map(items, item => item.name.split(' ').slice(0,2).join(' '));
    }));
    
    while(startDay < currentDay) {
        if (![0, 6].includes(startDay.day())) {
            sprintTasks.push({
                'done': filter(doneCards, (card) => {
                    return startDay.format('YYYY-MM-DD') == moment(card.dateLastActivity).format('YYYY-MM-DD');
                }).length
            });


            let issues = filter(doneCards, (card) => { 
                const doneCardName = card.name.split(' ').slice(0,2).join(' ');
                if(!otherCardNames.includes(doneCardName)) {
                    return startDay.format('YYYY-MM-DD') == moment(card.dateLastActivity).format('YYYY-MM-DD');
                }
            });
            
            if (issues.length > 0) {
                sprintIssues.push({
                    'done': uniq(map(issues, item => item.name.split(' ').slice(0,2).join(' '))).length
                });
            } else {
                sprintIssues.push({ 'done': 0 });
            }
        }

        startDay.add(1, 'days');
    }
    return { 
        'sprintTasks': sprintTasks,
        'sprintIssues': sprintIssues
    };
};

const getTotalPoints = cards => { 
  const cardNames = flatten(map(cards, items => {
    return map(items, item => item.name.split(' ').slice(0,2).join(' '));
  }));

  return uniq(cardNames).reduce((prev, curr) => {
      return prev + Number(curr.split(' ')[1].replace(/[\(\)]/g, ''));
  }, 0);
};

module.exports = Trello;