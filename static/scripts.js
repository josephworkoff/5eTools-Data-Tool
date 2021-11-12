function raceQuery(result){
    console.log(result);

}

const raceSources = ['AI', 'AWM', 'DMG', 'EEPC', 'EGW', 'ERLW', 'FTD', 'GGR', 'LR', 'MOT', 'MTF', 'OGA', 'PHB', 'PSA', 'PSD', 'PSI', 'PSK', 'PSX', 'PSZ', 'TCE', 'TTP', 'UA2021DraconicOptions', 'UA2021FolkOfTheFeywild', 'UA2021GothicLineages', 'UA2021TravelersOfTheMultiverse', 'UACentaursMinotaurs', 'UAEberron', 'UAEladrinAndGith', 'UAGothicHeroes', 'UARacesOfEberron', 'UARacesOfRavnica', 'UAWaterborneAdventures', 'VGM', 'VRGR', 'WBtW']

const CATEGORY_HEADING = $("#categoryHeading");
const BUTTONS_DIV = $("#categoryButtons");
const FORM_DIV = $("#parentFormDiv");
const ITEM_LIST = $("#itemList");
const INFO_HEADER = $("#infoHeader");

class CategoryPage{
    
    constructor(name){
        this.name = name;
        this.$categoryButton = null;
        this.$formDiv = null;
        this.$form = null;
        this.$submit = null;
        this.results = [];

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

        this.$form = $(`<form id="${name}Form" action="">`);
        this.$form.appendTo(this.$formDiv);

        this.$submit = $("<input>",
                        { type:'submit',
                          value: "Search",
                          id: name + "Submit"
                        }
        );

        this.$submit.appendTo(this.$form);

        this.$categoryButton.on("click", () => {
            this.display();
        });

        // this.$formDiv.hide();



    }

    hide(){
        this.$formDiv.hide();
        this.$categoryButton.prop("disabled",false);
    }

    display(){console.error("Display has not been defined.");}

    queryGroup(page){

        endpoint = this.name + 's'

        $.getJSON({
            url:"http://localhost:5000/" + endpoint,
            crossDomain:true,
            page: page,
            success: (res)=>{console.log(res);}
        });
    }

    queryDetails(id){
        return;
    }

    test(){
        console.log("test");
    }

    updateList(){
        ITEM_LIST.empty();
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





$( document ).ready(function() {

    const categories = {
        raceCategory:       new CategoryPage("Race"),
        classCategory:      new CategoryPage("Class"),
        backgroundCategory: new CategoryPage("Background"),
        spellCategory:      new CategoryPage("Spell"),
        featCategory:       new CategoryPage("Feat"),
    };

    for (const [cat, page] of Object.entries(categories)) {
        page.display = () => {

            for (const [cat2, page2] of Object.entries(categories)) {
                page2.hide();
            }

            CATEGORY_HEADING.text(page.name);
            page.$formDiv.show();
            page.$categoryButton.prop("disabled",true);
            for (let index = 0; index < 3; index++) {
                const $item = $("<li>",
                                { type:'submit',
                                itemid: index,
                                text: page.name + " " + index,
                                id: page.name + "Li" + index
                        });
                ITEM_LIST.append($item);
                $item.on("click", () => {
                    console.log($item.attr("itemid"));
                });
                
            }

            

        }
    }

});






$("#raceForm").on('submit', (e)=>{
    e.preventDefault();

    console.log("Race form submitted.")

    $.get({
        url:"http://localhost:5000/race/1",
        crossDomain:true,
        success: (res)=>{console.log(res);}
    });
});
