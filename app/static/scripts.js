function raceQuery(result){
    console.log(result);

}

const raceSources = ['AI', 'AWM', 'DMG', 'EEPC', 'EGW', 'ERLW', 'FTD', 'GGR', 'LR', 'MOT', 'MTF', 'OGA', 'PHB', 'PSA', 'PSD', 'PSI', 'PSK', 'PSX', 'PSZ', 'TCE', 'TTP', 'UA2021DraconicOptions', 'UA2021FolkOfTheFeywild', 'UA2021GothicLineages', 'UA2021TravelersOfTheMultiverse', 'UACentaursMinotaurs', 'UAEberron', 'UAEladrinAndGith', 'UAGothicHeroes', 'UARacesOfEberron', 'UARacesOfRavnica', 'UAWaterborneAdventures', 'VGM', 'VRGR', 'WBtW']

const CATEGORY_HEADING = $("#categoryHeading");
const BUTTONS_DIV = $("#categoryButtons");
const FORM_DIV = $("#parentFormDiv");
const ITEM_LIST = $("#itemList");
const INFO_HEADER = $("#infoHeader");
const INFO_DIV = $("#infoDiv");


class CategoryPage{
    
    constructor(name){
        this.name = name;
        this.$categoryButton = null;
        this.$formDiv = null;
        this.$form = null;
        this.$submit = null;
        this.recentQueryResults = null;

        console.log(`Constructing ${name} category`);
        // this.$categoryButton = $(`<button id="${name}Button" name="${name}Button" type="button">${name}</button>`);
        this.$categoryButton = $('<button>', 
                                { id: name + "Button",
                                  name: name + "Button",
                                  text: name,
                                  type: "button",
                                }
        );
        this.$categoryButton.appendTo(BUTTONS_DIV);

        this.$formDiv = $(`<div id="${name}FormDiv">`);
        this.$formDiv.appendTo(FORM_DIV);

        this.$form = $(`<form name="${name}Form" id="${name}Form" action="">`);
        this.$form.appendTo(this.$formDiv);

        this.$submit = $("<input>",
                        { type:'submit',
                          value: "Search",
                          id: name + "Submit"
                        }
        );

        this.$submit.appendTo(this.$form);

        this.$categoryButton.on("click", () => {
            if (this.recentQueryResults == null) {
                this.queryGroup(1);
            }
            else{
                this.display();
            }
        });

        // this.$formDiv.hide();



    }

    hide(){
        this.$formDiv.hide();
        this.$categoryButton.prop("disabled",false);

        ITEM_LIST.empty();
    }

    display(){
        for (const [cat, page] of Object.entries(categories)) {
            page.hide();
        }

        CATEGORY_HEADING.text(this.name);
        this.$formDiv.show();
        this.$categoryButton.prop("disabled",true);

        //populate the item list with the data from the most recent query.
        for (const item of this.recentQueryResults['items']){
            // console.log(item.name);
            const $li = $("<li>",
                            {   itemid: item.id,
                                text: `${item.name}: ${item.source}`,
                            }
            );

            ITEM_LIST.append($li);
            $li.on("click", () => {
                // console.log($li.attr("itemid"));
                this.queryDetails($li.attr("itemid"));
            });
        }

        Object.keys(LIST_PAGE_BUTTONS).forEach(key => {
            LIST_PAGE_BUTTONS[key].show();
        });

        // let prevPage = ( (this.recentQueryResults['_meta']['page'] - 1) > 0 ) 
        //     ? this.recentQueryResults['_meta']['page'] - 1 : 1;
        // let nextPage = ( (this.recentQueryResults['_meta']['page'] + 1) 
        //     <= this.recentQueryResults['_meta']['total_pages'] ) 
        //     ? this.recentQueryResults['_meta']['page'] + 1 
        //     : this.recentQueryResults['_meta']['total_pages'];



        let prevPage = 0;
        let nextPage = 0;

        if (this.recentQueryResults['_meta']['page'] <= 1){
            prevPage = 1;
            LIST_PAGE_BUTTONS.prev.prop("disabled", true);
            LIST_PAGE_BUTTONS.first.prop("disabled", true);
        }
        else{
            prevPage = this.recentQueryResults['_meta']['page'] - 1;
            LIST_PAGE_BUTTONS.prev.prop("disabled", false);
            LIST_PAGE_BUTTONS.first.prop("disabled", false);
        }
        
        if (this.recentQueryResults['_meta']['page'] >= this.recentQueryResults['_meta']['total_pages']) {
            nextPage = 1;
            LIST_PAGE_BUTTONS.next.prop("disabled", true);
            LIST_PAGE_BUTTONS.last.prop("disabled", true);
        } 
        else {
            nextPage = this.recentQueryResults['_meta']['page'] + 1;
            LIST_PAGE_BUTTONS.next.prop("disabled", false);
            LIST_PAGE_BUTTONS.last.prop("disabled", false);
        }

    
        LIST_PAGE_BUTTONS.prev.attr("page", prevPage);
        LIST_PAGE_BUTTONS.next.attr("page", nextPage);
        LIST_PAGE_BUTTONS.last.attr("page", this.recentQueryResults['_meta']['total_pages']);

        Object.keys(LIST_PAGE_BUTTONS).forEach(key => {
            LIST_PAGE_BUTTONS[key].off("click");
            LIST_PAGE_BUTTONS[key].on("click", ()=>{
                this.queryGroup(LIST_PAGE_BUTTONS[key].attr("page"));
            });
        });

    }

    queryGroup(pageNum){
        $.getJSON({
            url:this.groupEndpoint,
            crossDomain:true,
            data: `page=${pageNum}`,
            success: (res)=>{
                console.log("queryGroup success:");
                console.log(res);
                this.recentQueryResults = res;
                this.display();
            },
        });
    }

    queryDetails(id){
        $.getJSON({
            url:this.singleEndpoint + "/" + id,
            crossDomain:true,
            success: (res)=>{this.displayDetails(res);}
        });
    }

    displayDetails(res){console.log("displayDetails undefined.");}

    test(){
        console.log("test");
    }

}



// RACE_BUTTON.on("click", ()=>{
//     CATEGORY_HEADING.text("Races");
//     RACE_FORM.show();
// });

// CLASS_BUTTON.on("click", ()=>{
//     CATEGORY_HEADING.text("Classes");
//     CLASS_DIV.show();
// });



var categories = {};
var LIST_PAGE_BUTTONS = {};
var endpoints = {
    race:       {group: "/races", single: "/race"},
    class:      {group: "/classes", single: "/class"},
    background: {group: "/backgrounds", single: "/background"},
    spell:      {group: "/spells", single: "/spell"},
    feat:       {group: "/feats", single: "/feat"},
}

$( document ).ready(function() {

    LIST_PAGE_BUTTONS = {
        first: $("<button>",
            {text:"|<",
             page:1,
            }
        ),
        prev: $("<button>",
            {text:"<",
             page:1,
            }
        ),
        next: $("<button>",
            {text:">",
             page:1,
            }
        ),
        last: $("<button>",
            {text:">|",
             page:1,
            }
        ),
    }

    Object.keys(LIST_PAGE_BUTTONS).forEach(key => {
        $("#listPageButtonsDiv").append(LIST_PAGE_BUTTONS[key]);
        LIST_PAGE_BUTTONS[key].hide();
    });

    categories = {
        race:       new CategoryPage("Race"),
        // class:      new CategoryPage("Class"),
        // background: new CategoryPage("Background"),
        spell:      new CategoryPage("Spell"),
        // feat:       new CategoryPage("Feat"),
    };

    for (const [key, cat] of Object.entries(categories)) {
        cat.groupEndpoint = endpoints[key].group;
        cat.singleEndpoint = endpoints[key].single;

        cat.hide();
    }


    initRaceForm(categories.race);
    // initSpellForm(categories.spell);

});


function initRaceForm(racePage){
    racePage.displayDetails = displayRace;
    
    //name text label
    racePage.$form.append(
        $("<label>", 
        { for:'raceNameField',
            text:'Name',}
        )
    );
    
    //name text input
    racePage.$form.append(
        $("<input>", 
        { type:'text',
        name:'raceNameField',
        id:'raceNameField',}
        )
    );
        

    racePage.$form.append($("<br>"));
    
    //source label
    racePage.$form.append(
        $("<label>", 
        { for:'raceSourceField',
          text:'Source',}
        )
    );
    //source select
    let $srcForm = $("<select>", 
    { name:'raceSourceField',
      id:'raceSourceField',
      form:'raceForm',
    }
    );
    racePage.$form.append($srcForm);
    $srcForm.append($("<option selected>",{value:''}));


    //size small label
    racePage.$form.append(
        $("<label>", { 
            for:'raceSizeSmall',
            text:'Small',
    }));
    //size check box
    racePage.$form.append(
        $("<input>", { 
            type:"radio",
            name:"raceSizeForm",
            id:"raceSizeSmall",
            value:'S'
    }));
    //size small label
    racePage.$form.append(
        $("<label>", { 
            for:'raceSizeMedium',
            text:'Medium',
    }));
    //size check box
    racePage.$form.append(
        $("<input>", { 
            type:"radio",
            name:"raceSizeForm",
            id:"raceSizeMedium",
            value:"M",
    }));
    //size small label
    racePage.$form.append(
        $("<label>", { 
            for:'raceSizeLarge',
            text:'Large',
    }));
    //size check box
    racePage.$form.append(
        $("<input>", { 
            type:"radio",
            name:"raceSizeForm",
            id:"raceSizeLarge",
            value:"L",
    }));

    //language label
    racePage.$form.append(
        $("<label>", 
        { for:'raceLanguageField',
          text:'Languages',}
        )
    );
    //source select
    let $langForm = $("<select>", 
    { name:'raceLanguageField',
      id:'raceLanguageField',
      form:'raceForm',
    }
    );
    racePage.$form.append($langForm);
    $langForm.append($("<option selected>",{value:''}));



    // //speed
    // racePage.$form.append(
    //     $("<input>", 
    //     { }
    //     )
    // );


    // //ability
    // racePage.$form.append(
    //     $("<input>", 
    //     { }
    //     )
    // );

    // //skills
    // racePage.$form.append(
    //     $("<input>", 
    //     { }
    //     )
    // );


    function buildOptions(form, list) {
        list.forEach(opt =>{
            $langForm.append($("<option>", 
                { value:opt,
                  text:opt}
            ));
        });
    }

    //get sources
    $.getJSON({
        url:racePage.singleEndpoint + "/field/source",
        crossDomain:true,
        success: (res)=>{
            console.log(res);
            buildOptions($srcForm, res)
        }
    });

    //get languages
    $.getJSON({
        url:racePage.singleEndpoint + "/field/languageProficiencies",
        crossDomain:true,
        success: (res)=>{
            console.log("Got languages.");
            buildOptions($langForm, res)
        }
    });

    //get skills
    $.getJSON({
        url:racePage.singleEndpoint + "/field/skillProficiencies",
        crossDomain:true,
        success: (res)=>{
            console.log("Got skills.");
            buildOptions($langForm, res)
        }
    });



}


function initSpellForm(spellPage){
    /*
    name:text


    */
    
    spellPage.displayDetails = displaySpell;

}


function displayRace(race) {
    console.log("Displaying race: " + race);
    INFO_HEADER.text(`${race.name}(${race.source})`);
    INFO_DIV.text("");
    Object.keys(race).forEach(key => {
        INFO_DIV.append(`${key}: ${race[key]} <br>`);
    });
}

function displaySpell(spell) {
    console.log("Displaying spell: " + spell);
    INFO_HEADER.text(`${spell.name}(${spell.source})`);
    INFO_DIV.text("");
    Object.keys(spell).forEach(key => {
        INFO_DIV.append(`${key}: ${spell[key]} <br>`);
    });
}



// function displayClass(){
    
//     return;
// }

// function displayBackground(){
//     return;    
// }


// function displayFeat(){
//     return;

// }






// $("#raceForm").on('submit', (e)=>{
//     e.preventDefault();

//     console.log("Race form submitted.")

//     $.get({
//         url:"http://localhost:5000/race/1",
//         crossDomain:true,
//         success: (res)=>{console.log(res);}
//     });
// });
