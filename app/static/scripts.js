/*!	\file scripts.js
*	\brief Front end script file.
*
*   \b Author: Joseph Workoff\n
*   \b Major: CS/SD MS\n
*   \b Creation Date: 11/01/2021\n
*   \b Due Date: 12/15/2021\n
*   \b Course: CSC521\n
*   \b Professor Name: Dr. Spiegel\n
*   \b Assignment: #3\n
*   \b Filename: scripts.js\n
*   \b Purpose: Create the front end UI.\n
*   \n
*
*/

const endpoints = {
    race:       {group: "/races", single: "/race"},
    class:      {group: "/classes", single: "/class"},
    background: {group: "/backgrounds", single: "/background"},
    spell:      {group: "/spells", single: "/spell"},
    feat:       {group: "/feats", single: "/feat"},
}

import { RaceCategoryPage } from './RaceCategoryPage.js';
import { SpellCategoryPage } from './SpellCategoryPage.js';
import { BackgroundCategoryPage } from './BackgroundCategoryPage.js';
import { FeatCategoryPage } from './FeatCategoryPage.js';
import { initBuildPage } from "./BuildPage.js";


$( document ).ready(function() {
    const categories = {
        race:       new RaceCategoryPage(),
        // class:      new CategoryPage("Class"),
        background: new BackgroundCategoryPage(),
        spell:      new SpellCategoryPage(),
        feat:       new FeatCategoryPage(),
    };

    for (const [key, cat] of Object.entries(categories)) {
        cat.groupEndpoint = endpoints[key].group;
        cat.singleEndpoint = endpoints[key].single;
        cat.categories = categories;
        // cat.LIST_PAGE_BUTTONS = LIST_PAGE_BUTTONS;
        

        cat.hide();
    }

    initBuildPage();

});

