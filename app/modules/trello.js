import TrelloApi from 'node-trello';
import Lists from '../config/trello';

class Trello {
    constructor() { 
        this.trello = new TrelloApi(
            process.env.TRELLO_KEY, 
            process.env.TRELLO_TOKEN
        );
    };

    getLists() { 
        return this.trello.get('/board/58c824490fc0684259d9f180/lists', {
            cards: 'open'
        }, (err, data) => console.log(data));
    };

    getComments() {
        return this.trello.get(`/list/${Lists.settings.id}/actions`, {
            filter: 'commentCard'
        }, (err, data) => console.log(data));
    };

    get() {
        let lists = this.getLists();
        let comments = this.getComments();

        // const options = {
        //     sprintStartDay: lists.find(item => item.id == Lists.settings.id).cards[0].due,
        // };

        // lists = filterLists(lists);

        // Object.assign(options, {
        //     sprintDays: comments[0][0].data.text,
        //     initialSprintTaks: lists.reduce((prev, curr) => {
        //     return prev + curr.cards.length
        //     }, 0)
        // });

        console.log(lists, comments, this.trello);
    };
};

const filterLists = lists => {
    return lists.filter(item => {
        let valid = true;
        Object.keys(Lists).forEach((value) => {
            let object = Lists[value];

            if (object.exclude && object.id === item.id) {
                valid = false
            }
        });
        return valid;
    });
};

module.exports = Trello;