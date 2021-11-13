function raceQuery(result){
    console.log(result);

}

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
                this.queryData.page = LIST_PAGE_BUTTONS[key].attr("page");
                this.queryGroup();
            });
        });
    }

    queryData = {};

    queryGroup(){
        console.log("queryData: ", this.queryData);
        $.getJSON({
            url:this.groupEndpoint,
            crossDomain:true,
            data: this.queryData,
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
        background: new CategoryPage("Background"),
        spell:      new CategoryPage("Spell"),
        feat:       new CategoryPage("Feat"),
    };

    for (const [key, cat] of Object.entries(categories)) {
        cat.groupEndpoint = endpoints[key].group;
        cat.singleEndpoint = endpoints[key].single;

        cat.hide();
    }


    initRaceForm(categories.race);
    initSpellForm(categories.spell);
    initBackgroundForm(categories.background);
    initFeatForm(categories.feat);

});


function buildOptions(form, list) {
    list.forEach(opt =>{
        form.append($("<option>", 
            { value:opt,
              text:opt}
        ));
    });
}

function initRaceForm(racePage){
    racePage.displayDetails = displayRace;
    
    racePage.$form.append($("<br>"));
    //name text label
    racePage.$form.append($("<label>", 
    { for:'raceNameField',
        text:'Name',}
    ));
    
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

    racePage.$form.append($("<br>"));

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
            name:"raceSizeField",
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
            name:"raceSizeField",
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
            name:"raceSizeField",
            id:"raceSizeLarge",
            value:"L",
    }));

    racePage.$form.append($("<br>"));

    //language label
    racePage.$form.append(
        $("<label>", 
        { for:'raceLanguageField',
          text:'Language Proficiencies',}
        )
    );
    //language select
    let $langForm = $("<select>", 
    { name:'raceLanguageField',
      id:'raceLanguageField',
      form:'raceForm',
    }
    );
    racePage.$form.append($langForm);
    $langForm.append($("<option selected>",{value:''}));

    racePage.$form.append($("<br>"));

    //language label
    racePage.$form.append(
        $("<label>", 
        { for:'raceSkillField',
            text:'Skill Proficiencies',}
        )
    );
    //skills
    let $skillForm = $("<select>", 
    { name:'raceSkillField',
      id:'raceSkillField',
      form:'raceForm',
    }
    );
    racePage.$form.append($skillForm);
    $skillForm.append($("<option selected>",{value:''}));

    racePage.$form.append($("<br>"));

    //ability label
    racePage.$form.append(
        $("<label>", 
        { for:'raceAbilityField',
            text:'Ability Bonus',}
        )
    );
    //ability
    let $abilityForm = $("<select>", 
    { name:'raceAbilityField',
      id:'raceAbilityField',
      form:'raceForm',
    }
    );
    racePage.$form.append($abilityForm);
    $abilityForm.append($("<option selected>",{value:''}));



    racePage.$submit.on("click", (e) => {
        e.preventDefault();
        racePage.queryData.page = 1
        racePage.queryData.name         = $("#raceNameField").val();
        racePage.queryData.source       = $("#raceSourceField").val();
        racePage.queryData.size         = $("input[name='raceSizeField']:checked").val();
        racePage.queryData.language     = $("#raceLanguageField").val();
        racePage.queryData.skill        = $("#raceSkillField").val();
        racePage.queryData.ability      = $("#raceAbilityField").val();
        racePage.queryGroup();
    });

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
            buildOptions($skillForm, res)
        }
    });

    //get abilities
    $.getJSON({
        url:racePage.singleEndpoint + "/field/ability",
        crossDomain:true,
        success: (res)=>{
            console.log("Got race abilities.");
            buildOptions($abilityForm, res)
        }
    });

}


function initSpellForm(spellPage){
    spellPage.displayDetails = displaySpell;
    
    spellPage.$form.append($("<br>"));
    //name text label
    spellPage.$form.append($("<label>", 
    { for:'spellNameField',
        text:'Name',}
    ));
    
    //name text input
    spellPage.$form.append(
        $("<input>", 
        { type:'text',
        name:'spellNameField',
        id:'spellNameField',}
        )
    );
        
    spellPage.$form.append($("<br>"));
    
    //source label
    spellPage.$form.append(
        $("<label>", 
        { for:'spellSourceField',
          text:'Source',}
        )
    );
    //source select
    let $srcForm = $("<select>", 
    { name:'spellSourceField',
      id:'spellSourceField',
      form:'spellForm',
    }
    );
    spellPage.$form.append($srcForm);
    $srcForm.append($("<option selected>",{value:''}));

    spellPage.$form.append($("<br>"));

    //duration instant label
    spellPage.$form.append(
        $("<label>", { 
            for:'spellDurationInstant',
            text:'Instant',
    }));
    //duration check box
    spellPage.$form.append(
        $("<input>", { 
            type:"radio",
            name:"spellDurationField",
            id:"spellDurationInstant",
            value:'instant'
    }));
    //duration timed label
    spellPage.$form.append(
        $("<label>", { 
            for:'spellDurationTimed',
            text:'Timed',
    }));
    //duration timed check box
    spellPage.$form.append(
        $("<input>", { 
            type:"radio",
            name:"spellDurationField",
            id:"spellDurationTimed",
            value:"timed",
    }));

    spellPage.$form.append($("<br>"));

    //school label
    spellPage.$form.append(
        $("<label>", 
        { for:'spellSchoolField',
          text:'School',}
        )
    );
    //school select
    let $schoolField = $("<select>", 
    { name:'spellSchoolField',
      id:'spellSchoolField',
      form:'spellForm',
    }
    );
    spellPage.$form.append($schoolField);
    $schoolField.append($("<option selected>",{value:''}));

    spellPage.$form.append($("<br>"));

    //level label
    spellPage.$form.append(
        $("<label>", 
        { for:'spellLevelField',
            text:'Level',}
        )
    );
    //skills
    let $levelForm = $("<select>", 
    { name:'spellLevelField',
      id:'spellLevelField',
      form:'spellForm',
    }
    );
    spellPage.$form.append($levelForm);
    $levelForm.append($("<option selected>",{value:''}));


    spellPage.$submit.on("click", (e) => {
        e.preventDefault();
        spellPage.queryData.page = 1
        spellPage.queryData.name         = $("#spellNameField").val();
        spellPage.queryData.source       = $("#spellSourceField").val();
        spellPage.queryData.duration     = $("input[name='spellDurationField']:checked").val();
        spellPage.queryData.school       = $("#spellSchoolField").val();
        spellPage.queryData.level        = $("#spellLevelField").val();
        spellPage.queryGroup();
    });


    //get sources
    $.getJSON({
        url:spellPage.singleEndpoint + "/field/source",
        crossDomain:true,
        success: (res)=>{
            console.log("Got spell sources.");
            buildOptions($srcForm, res)
        }
    });

    //get levels
    $.getJSON({
        url:spellPage.singleEndpoint + "/field/level",
        crossDomain:true,
        success: (res)=>{
            console.log("Got levels.");
            buildOptions($levelForm, res)
        }
    });

    //get schools
    $.getJSON({
        url:spellPage.singleEndpoint + "/field/school",
        crossDomain:true,
        success: (res)=>{
            console.log("Got schools.");
            buildOptions($schoolField, res)
        }
    });
}



function initBackgroundForm(backgroundPage){
    backgroundPage.displayDetails = displayBackground;
    
    backgroundPage.$form.append($("<br>"));
    //name text label
    backgroundPage.$form.append($("<label>", 
    { for:'backgroundNameField',
        text:'Name',}
    ));
    
    //name text input
    backgroundPage.$form.append(
        $("<input>", 
        { type:'text',
        name:'backgroundNameField',
        id:'backgroundNameField',}
        )
    );
        

    backgroundPage.$form.append($("<br>"));
    
    //source label
    backgroundPage.$form.append(
        $("<label>", 
        { for:'backgroundSourceField',
          text:'Source',}
        )
    );
    //source select
    let $srcForm = $("<select>", 
    { name:'backgroundSourceField',
      id:'backgroundSourceField',
      form:'backgroundForm',
    }
    );
    backgroundPage.$form.append($srcForm);
    $srcForm.append($("<option selected>",{value:''}));

    backgroundPage.$form.append($("<br>"));


    //language label
    backgroundPage.$form.append(
        $("<label>", 
        { for:'backgroundLanguageField',
          text:'Language Proficiencies',}
        )
    );
    //language select
    let $langForm = $("<select>", 
    { name:'backgroundLanguageField',
      id:'backgroundLanguageField',
      form:'backgroundForm',
    }
    );
    backgroundPage.$form.append($langForm);
    $langForm.append($("<option selected>",{value:''}));

    backgroundPage.$form.append($("<br>"));

    //skill label
    backgroundPage.$form.append(
        $("<label>", 
        { for:'backgroundSkillField',
            text:'Skill Proficiencies',}
        )
    );
    //skills
    let $skillForm = $("<select>", 
    { name:'backgroundSkillField',
      id:'backgroundSkillField',
      form:'backgroundForm',
    }
    );
    backgroundPage.$form.append($skillForm);
    $skillForm.append($("<option selected>",{value:''}));
    
    backgroundPage.$form.append($("<br>"));

    //tool label
    backgroundPage.$form.append(
        $("<label>", 
        { for:'backgroundToolField',
            text:'Tool Proficiencies',}
        )
    );
    //tools
    let $toolForm = $("<select>", 
    { name:'backgroundToolField',
      id:'backgroundToolField',
      form:'backgroundForm',
    }
    );
    backgroundPage.$form.append($toolForm);
    $toolForm.append($("<option selected>",{value:''}));




    backgroundPage.$submit.on("click", (e) => {
        e.preventDefault();
        backgroundPage.queryData.page = 1
        backgroundPage.queryData.name         = $("#backgroundNameField").val();
        backgroundPage.queryData.source       = $("#backgroundSourceField").val();
        backgroundPage.queryData.language     = $("#backgroundLanguageField").val();
        backgroundPage.queryData.skill        = $("#backgroundSkillField").val();
        backgroundPage.queryData.tool        = $("#backgroundToolField").val();
        backgroundPage.queryGroup();
    });

    //get sources
    $.getJSON({
        url:backgroundPage.singleEndpoint + "/field/source",
        crossDomain:true,
        success: (res)=>{
            console.log("Got Background sources");
            buildOptions($srcForm, res)
        }
    });

    //get languages
    $.getJSON({
        url:backgroundPage.singleEndpoint + "/field/languageProficiencies",
        crossDomain:true,
        success: (res)=>{
            console.log("Got Background languages.");
            buildOptions($langForm, res)
        }
    });

    //get skills
    $.getJSON({
        url:backgroundPage.singleEndpoint + "/field/skillProficiencies",
        crossDomain:true,
        success: (res)=>{
            console.log("Got Background skills.");
            buildOptions($skillForm, res)
        }
    });

    //get tools
    $.getJSON({
        url:backgroundPage.singleEndpoint + "/field/toolProficiencies",
        crossDomain:true,
        success: (res)=>{
            console.log("Got Background tools.");
            buildOptions($toolForm, res)
        }
    });
}


function initFeatForm(featPage){
    featPage.displayDetails = displayFeat;
    
    featPage.$form.append($("<br>"));
    //name text label
    featPage.$form.append($("<label>", 
    { for:'featNameField',
        text:'Name',}
    ));
    
    //name text input
    featPage.$form.append(
        $("<input>", 
        { type:'text',
        name:'featNameField',
        id:'featNameField',}
        )
    );
        

    featPage.$form.append($("<br>"));
    
    //source label
    featPage.$form.append(
        $("<label>", 
        { for:'featSourceField',
          text:'Source',}
        )
    );
    //source select
    let $srcForm = $("<select>", 
    { name:'featSourceField',
      id:'featSourceField',
      form:'featForm',
    }
    );
    featPage.$form.append($srcForm);
    $srcForm.append($("<option selected>",{value:''}));

    featPage.$form.append($("<br>"));

    //skill label
    featPage.$form.append(
        $("<label>", 
        { for:'featSkillField',
            text:'Skill Proficiencies',}
        )
    );
    //skills
    let $skillForm = $("<select>", 
    { name:'featSkillField',
      id:'featSkillField',
      form:'featForm',
    }
    );
    featPage.$form.append($skillForm);
    $skillForm.append($("<option selected>",{value:''}));
    
    //ability label
    featPage.$form.append(
        $("<label>", 
        { for:'featAbilityField',
            text:'Ability Bonus',}
        )
    );
    //ability
    let $abilityForm = $("<select>", 
    { name:'featAbilityField',
      id:'featAbilityField',
      form:'featForm',
    }
    );
    featPage.$form.append($abilityForm);
    $abilityForm.append($("<option selected>",{value:''}));


    featPage.$submit.on("click", (e) => {
        e.preventDefault();
        featPage.queryData.page = 1
        featPage.queryData.name         = $("#featNameField").val();
        featPage.queryData.source       = $("#featSourceField").val();
        featPage.queryData.skill        = $("#featSkillField").val();
        featPage.queryData.ability      = $("#featAbilityField").val();
        featPage.queryGroup();
    });

    //get sources
    $.getJSON({
        url:featPage.singleEndpoint + "/field/source",
        crossDomain:true,
        success: (res)=>{
            console.log("Got feat sources");
            buildOptions($srcForm, res)
        }
    });

    //get skills
    $.getJSON({
        url:featPage.singleEndpoint + "/field/skillProficiencies",
        crossDomain:true,
        success: (res)=>{
            console.log("Got feat skills.");
            buildOptions($skillForm, res)
        }
    });

    //get abilities
    $.getJSON({
        url:featPage.singleEndpoint + "/field/ability",
        crossDomain:true,
        success: (res)=>{
            console.log("Got feat abilities.");
            buildOptions($abilityForm, res)
        }
    });

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


function displayBackground(background){
    console.log("Displaying Background: " + background);
    INFO_HEADER.text(`${background.name}(${background.source})`);
    INFO_DIV.text("");
    Object.keys(background).forEach(key => {
        INFO_DIV.append(`${key}: ${background[key]} <br>`);
    });
}


function displayFeat(feat){
    console.log("Displaying feat: " + feat);
    INFO_HEADER.text(`${feat.name}(${feat.source})`);
    INFO_DIV.text("");
    Object.keys(feat).forEach(key => {
        INFO_DIV.append(`${key}: ${feat[key]} <br>`);
    });
}



