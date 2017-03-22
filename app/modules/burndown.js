class Burndown {
    constructor(template) { 
        this.template = template;
    };

    get() {  
        return this.template.render('burndown');
    };
};

module.exports = Burndown;