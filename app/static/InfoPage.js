import { isSelected, selectBuildAttr } from "./BuildPage.js";
import { convertSpellSchool } from "./Tables.js";

const INFO_HEADER = $("#infoHeader");
const INFO_DIV = $("#infoDiv");

const $buildSelectionButton = $('<button>', { 
        id: "buildSelectionButton",
        name: "buildSelectionButton",
        text: "Select",
        type: "button",
});

$("#buildSelectionButtonDiv").append($buildSelectionButton);

var currentCategory, currentData;

let currentDataIsSelected = false;


const displayingSelectedItem = (isSelectedB)=>{
    if (isSelectedB) {
        currentDataIsSelected = true;
        $buildSelectionButton.text("Remove from build");
        $buildSelectionButton.prop("style", "color:red;");
        console.log("item is selected");
    } else {
        currentDataIsSelected = false;
        $buildSelectionButton.text("Add to build");
        $buildSelectionButton.prop("style", "color:green;");
        console.log("item is not selected");
    }
}


const commonDisplay = (itemObj, attrCategory) => {
    // console.log("Displaying " + attrCategory + ": " + itemObj.name + );
    console.log(`Displaying: ${attrCategory} ${itemObj._id} ${itemObj.name}`);
    currentData = itemObj;
    INFO_DIV.empty();

    displayingSelectedItem(isSelected(attrCategory, itemObj._id));
    INFO_HEADER.text(`${itemObj.name}(${itemObj.source})`);
}



$buildSelectionButton.on("click", () => {
    if (currentDataIsSelected){
        console.log("removing");
        selectBuildAttr(currentCategory, currentData, true);
        displayingSelectedItem(false);
    }
    else{
        console.log("selecting"); 
        selectBuildAttr(currentCategory, currentData, false);
        displayingSelectedItem(true);
    }
});


const stringFromProperty = (property, obj) => {

    console.log(property);
    console.log(obj[property]);

    let str = "";
    if (obj.hasOwnProperty(property) && Object.keys(obj[property]).length !== 0) {

        if (property === "ability") {

            //Feats store as list. Others store as object
            let abilData = (Array.isArray(obj["ability"])) ? obj["ability"][0] : obj["ability"];

            for (const [key, score] of Object.entries(abilData)) {
                if (key === "choose") {
                    str += `Increase one of ${score.from} by 1.`;
                } else {
                    str += `${key} +${score}; `;
                }
            }
        } 
        else if (property === "languageProficiencies") {
            for (const [key, lang] of Object.entries(obj["languageProficiencies"])) {
                if (key === "choose") {
                    str += `Choose 1 from among ${lang.from}`;
                } 
                else if (key === "anyStandard") {
                    str += `Choose any ${lang} standard languages; `;
                }
                else {
                    str += `${key}; `;
                }
            }
        }
        else if (property === "skillProficiencies") {
            console.log("Skills");
            for (const [key, score] of Object.entries(obj["skillProficiencies"])) {
                if (key === "choose") {
                    str += `Choose ${score.count} from among ${score.from}`;
                } else {
                    str += `${key}; `;
                }
            }
        }
        else if (property === "toolProficiencies") {
            console.log("Tools");
            for (const [key, score] of Object.entries(obj["toolProficiencies"])) {
                if (key === "choose") {
                    str += `Choose from among ${score.from}`;
                } else {
                    str += `${key}; `;
                }
            }
        }
    } 
    return str;

}



/**
 * Iterate through the entries array.
 * If the item has an entries array, create a div for it.
 * For each entry, create a title element
 * and a text element for each paragraph in the entry.
 * Append those to div, append div to info div. 
 */
const displayEntries = (itemObj, key, label) => {
    console.log(itemObj);
    if (Object.keys(itemObj).includes(key) && itemObj[key].length > 0) {

        INFO_DIV.append($("<h2>",{
            text : label,
            class : "infoEntryFeatureHeader",
        }));

        let $dl = $("<dl>", {
            class : "infoEntryDL",
        });

        for (const entry of itemObj[key]) {
            $dl.append($("<dt>", {
                text :  entry[0],
                class : "infoEntryHeaderDT",
            }));
            
            for (const entryValue of entry[1]) {
                $dl.append($("<dd>", {
                    text :  entryValue,
                    class : "infoEntryTextDD",
                }));
            }
        }

        INFO_DIV.append($dl);
    }
}


export function displayRace(raceObj) {
    currentCategory = "race";
    commonDisplay(raceObj, currentCategory);


    //ability scores text
    let abilityStr = stringFromProperty("ability", raceObj);

    if (abilityStr !== "") {
        INFO_DIV.append($("<div>",{
            text : `Ability Scores: ${abilityStr}`,
            class : "infoDataText",
        }));
    }
    
    //entries/fluff
    displayEntries(raceObj, "fluff", "Info:");
    displayEntries(raceObj, "entries", "Features:");
 
}


export function displaySpell(spellObj) {
    currentCategory = "spell";
    commonDisplay(spellObj, currentCategory);

    // Level/School  text
    INFO_DIV.append($("<div>",{
        text : `Level ${spellObj.level} ${convertSpellSchool(spellObj.school, null)} Spell`,
        class : "infoDataText",
    }));   
    
    /**
     *   {
     "type": "timed",
     "duration": {
         "type": "hour",
         "amount": 8
        }
    }
    {
        "type": "timed",
        "duration": {
            "type": "hour",
            "amount": 1
        },
        "concentration": true
    }
    {
        "type": "instant"
    }
    */
   
    let durationText;
   
    //Duration Text
    if (spellObj.duration.type === "timed") {
        durationText = `Duration: Up to ${spellObj.duration.duration.amount} ${spellObj.duration.duration.type}s`
    } else {
        durationText = "Duration: Instantaneous"
    }

    INFO_DIV.append($("<div>",{
        text : durationText,
        class : "infoDataText",
    }));


    //Description
    INFO_DIV.append($("<h2>",{
        text : "Description:",
        class : "infoEntryFeatureHeader",
    }));


    //Entries
    let $dl = $("<dl>", {
        class : "infoEntryDL",
    });

    for (const entry of spellObj["entries"]) {


        /**
        * 	"entries": [
            "You assume a different form. When you cast the spell, choose one of the following options, the effects of which last for the duration of the spell. While the spell lasts, you can end one option as an action to gain the benefits of a different one.",
            {
                "type": "entries",
                "name": "Aquatic Adaptation",
                "entries": [
                    "You adapt your body to an aquatic environment, sprouting gills and growing webbing between your fingers. You can breathe underwater and gain a swimming speed equal to your walking speed."
                ]
            },
            {
                "type": "entries",
                "name": "Change Appearance",
                "entries": [
                    "You transform your appearance. You decide what you look like, including your height, weight, facial features, sound of your voice, hair length, coloration, and distinguishing characteristics, if any. You can make yourself appear as a member of another race, though none of your statistics change. You also can't appear as a creature of a different size than you, and your basic shape stays the same; if you're bipedal, you can't use this spell to become quadrupedal, for instance. At any time for the duration of the spell, you can use your action to change your appearance in this way again."
                ]
            }
         */
        if (typeof entry === 'object'){
            if ("type" in entry && entry["type"] === "entries") {
                $dl.append($("<dt>", {
                    text :  entry["name"],
                    class : "infoEntryHeaderDT",
                }));

                for (const item of entry["entries"]) {
                    $dl.append($("<dd>", {
                        text :  item,
                        class : "infoEntryTextDD",
                    }));
                }
            }
            else if ("items" in entry) {
                let $ul = ($("<ul>", {
                    class : "infoEntryItemList",
                }));
                for (const item of entry["items"]) {
                    $ul.append($("<li>", {
                        text :  item,
                        class : "infoEntryItemListElement",
                    }));
                }
                $dl.append($ul);
            }
        }
        else{
            $dl.append($("<dt>", {
                text :  entry,
                class : "infoEntryDL",
            }));
        }

    }

    INFO_DIV.append($dl);
}


export function displayBackground(backgroundObj){
    currentCategory = "background";
    commonDisplay(backgroundObj, currentCategory);



    //languages
    let langStr = stringFromProperty("languageProficiencies", backgroundObj);
    if (langStr !== "") {
        INFO_DIV.append($("<div>",{
            text : `Language Proficiencies: ${langStr}`,
            class : "infoDataText",
        }));
    }


    //Skills
    let skillStr = stringFromProperty("skillProficiencies", backgroundObj);
    if (skillStr !== "") {
        INFO_DIV.append($("<div>",{
            text : `Skill Proficiencies: ${skillStr}`,
            class : "infoDataText",
        }));
    }


    //Tools
    let toolStr = stringFromProperty("toolProficiencies", backgroundObj);;
    if (toolStr !== "") {
        INFO_DIV.append($("<span>",{
            text : `Tool Proficiencies: ${toolStr}`,
            class : "infoDataText",
        }));
    }      

    //Entries/Fluff
    displayEntries(backgroundObj, "fluff", "Info:");
    displayEntries(backgroundObj, "entries", "Features:");
}






export function displayFeat(featObj){
    currentCategory = "feat";
    commonDisplay(featObj, currentCategory);


let abilityStr = stringFromProperty("ability", featObj);
    if (abilityStr !== "") {
        INFO_DIV.append($("<div>",{
            text : `Ability Scores: ${abilityStr}`,
            class : "infoDataText",
        }));
    }

    let key = "entries"
    let itemObj = featObj;

    //Features
    if (Object.keys(itemObj).includes(key) && itemObj[key].length > 0) {

        //Features header
        INFO_DIV.append($("<h2>",{
            text : "Features:",
            class : "infoEntryFeatureHeader",
        }));

        let $dl = $("<dl>", {
            class : "infoEntryDL",
        });



        //Display entries
        for (const entry of itemObj[key]) {
            console.log(entry);


            if (Array.isArray(entry)) {
                console.log("1 " + entry);
                $dl.append($("<dt>", {
                    text :  entry[0],
                    class : "infoEntryDL",
                }));
            } 
            else if (typeof entry === 'object'){
                console.log("2 " + entry);
                if ("items" in entry) {
                    let $ul = ($("<ul>", {
                        class : "infoEntryItemList",
                    }));
                    for (const item of entry["items"]) {
                        $ul.append($("<li>", {
                            text :  item,
                            class : "infoEntryItemListElement",
                        }));
                    }
                    $dl.append($ul);
                }
            }
            else{
                $dl.append($("<dt>", {
                    text :  entry,
                    class : "infoEntryHeaderDT",
                }));

            }

        }

        INFO_DIV.append($dl);
    }


}