
const COOKIE_TIMEOUT = 60 * 60 * 24 * 7;
const COOKIE_TIMEOUT_DAYS = 7;


import { displayBackground, displayFeat, displayRace, displaySpell } from "./InfoPage.js";
import Cookies from "./js.cookie.mjs";

const buildAttrData = {
    race:       null,
    background: null,
    feat:       [],
    spell:      [],
};

const buildAttrEles = {
    race:       $("#buildRaceSelectionSpan"),
    background: $("#buildBackgroundSelectionSpan"),
    feat:       $("#buildFeatList"),
    spell:      $("#buildSpellList"),
};

const buildAttrDisplayFunctions = {
    race:       displayRace,
    background: displayBackground,
    feat:       displayFeat,
    spell:      displaySpell,
};


function displayBuildAttr(attrCategory) {

    
    buildAttrEles[attrCategory].empty();

    if (buildAttrData[attrCategory] === null || buildAttrData[attrCategory].length < 1) {
        return;
    } 
    else {
        if (Array.isArray(buildAttrData[attrCategory])) {
    
            for (const item of buildAttrData[attrCategory]) {
                let buildEle = $("<li>", {
                    text: `${item.name} (${item.source})`,
                });
                buildEle.on("click", (params) => {
                    console.log("clicked build: " + item.name); 
                    buildAttrDisplayFunctions[attrCategory](item);
                });
                
                buildAttrEles[attrCategory].append(buildEle);
            }
        } 
        else {
            let item = buildAttrData[attrCategory];
            let buildEle = $("<span>", {
                text: `${item.name} (${item.source})`,
            });
            
            buildEle.on("click", (params) => {
                console.log("clicked build: " + item.name); 
                buildAttrDisplayFunctions[attrCategory](item);
            });
            
            buildAttrEles[attrCategory].append(buildEle);
        }
    }

}


export function selectBuildAttr(attrCategory, attrVal, isRemove) {

    if (!isRemove) {
        if (Array.isArray(buildAttrData[attrCategory])) {
            buildAttrData[attrCategory].push(attrVal);
        } else {
            buildAttrData[attrCategory] = attrVal;
        }
    } else {
        console.log("SBA: Removing");
        if (Array.isArray(buildAttrData[attrCategory])) {
            console.log("SBA: Array removing");
            buildAttrData[attrCategory] = buildAttrData[attrCategory].filter(i => i._id != attrVal._id);
            console.log(buildAttrData[attrCategory]);
        } else {
            buildAttrData[attrCategory] = null;
        }
    }

    setBuildAttrCookie(attrCategory);
    displayBuildAttr(attrCategory);
}




export function isSelected(attrCategory, attrValueID) {
    return ( 
        (Array.isArray(buildAttrData[attrCategory]) && buildAttrData[attrCategory].some(i => i._id === attrValueID))
        || (buildAttrData[attrCategory] != null && buildAttrData[attrCategory]._id === attrValueID)) 

}



export function initBuildPage() {

    const raceSelection = getBuildAttrCookie("race");
    const backgroundSelection = getBuildAttrCookie("background");
    const featSelections = getBuildAttrCookie("feat");
    const spellSelections = getBuildAttrCookie("spell");

    let displayed = false;

    /*
    Requests item info for each ID in the passed array from the passed endpoint.
    Sets buildAttrDatas for each.
    Replaces value for Race/Background.
    Appends values for Feat/Spell.
    */
    const retrieveCacheDataForBuildAttr = (attrCategory, attrValueIDArray, isAppend) =>{

        for (const ID of attrValueIDArray) {
            $.getJSON({
                url: attrCategory + "/" + ID,
                crossDomain:true,
                success: (res)=>{
                    if (isAppend) {
                        buildAttrData[attrCategory].push(res);
                    } else {
                        buildAttrData[attrCategory] = res;
                    }
                    displayBuildAttr(attrCategory);
                    if (displayed === false) {
                        displayed = true;
                        buildAttrDisplayFunctions[attrCategory](res);
                    }
                }
            });
        }
    };

    retrieveCacheDataForBuildAttr("race", raceSelection, false);
    retrieveCacheDataForBuildAttr("background", backgroundSelection, false);
    retrieveCacheDataForBuildAttr("feat", featSelections, true);
    retrieveCacheDataForBuildAttr("spell", spellSelections, true);

}


/*
Checks if there is a cookie for the requested build attribute.
If there isn't, returns empty array.
Else, returns array of item id's.
*/
function getBuildAttrCookie(category) {
    const cookieData = Cookies.get(category);
    console.log(cookieData);

    return (cookieData === "" || typeof cookieData === 'undefined') ? [] : cookieData.replace('[', '').replace(']', '').split([',']).map(Number)
}


function setBuildAttrCookie(attrCategory) {
    let cookieValue;

    // if (["race", "class", "background"].includes(category)) {
    //     console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    //     if (remove) {
    //         Cookies.remove(category);
    //         return;
    //     }
    //     else {
    //         Cookies.set(category, selectionID, { expires: COOKIE_TIMEOUT_DAYS });
    //         cookieValue = selectionID;
    //     }
    // }
    // else if (["spell", "feat"].includes(category)){
    //     console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
    //     if (remove){
    //         cookieValue = getBuildAttrCookie(category).filter(i => i != selectionID);
    //     }
    //     else{
    //         cookieValue = 
    //     }
    // }

    if (buildAttrData[attrCategory] === [] || buildAttrData[attrCategory] === null) {
        cookieValue = "";
    } else {
        if (Array.isArray(buildAttrData[attrCategory])) {
            cookieValue = buildAttrData[attrCategory].map(i => i._id);
        } else {
            cookieValue = buildAttrData[attrCategory]._id;
        }
    }

    Cookies.set(attrCategory, cookieValue, {expires: COOKIE_TIMEOUT_DAYS} );

}