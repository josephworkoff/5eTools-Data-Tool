/*!	\file CategoryPage.js
*	\brief Class file for CategoryPage.
*
*   \b Author: Joseph Workoff\n
*   \b Major: CS/SD MS\n
*   \b Creation Date: 11/01/2021\n
*   \b Due Date: 12/15/2021\n
*   \b Course: CSC521\n
*   \b Professor Name: Dr. Spiegel\n
*   \b Assignment: #3\n
*   \b Filename: CategoryPage.js\n
*   \b Purpose: Create the front end UI.\n
*   \n
*
*/

const CATEGORY_HEADING = $("#categoryHeading");
const BUTTONS_DIV = $("#categoryButtons");
const FORM_DIV = $("#parentFormDiv");
const ITEM_LIST = $("#itemList");


import { LIST_PAGE_BUTTONS } from "./PageButtons.js";

export class CategoryPage{
    
    constructor(name){
        this.name = name;
        this.$categoryButton = null;
        this.$formDiv = null;
        this.$form = null;
        this.$submit = null;
        this.recentQueryResults = null;
        this.queryData = {};
        
        console.log(`Constructing ${name} category`);

        //Create form button
        this.$categoryButton = $('<button>', { 
            id: name + "Button",
            name: name + "Button",
            text: name,
            type: "button",
        });
        this.$categoryButton.appendTo(BUTTONS_DIV);


        //Create form div
        this.$formDiv = $(`<div id="${name}FormDiv">`);
        this.$formDiv.appendTo(FORM_DIV);

        //create form element
        this.$form = $(`<form name="${name}Form" id="${name}Form" action="">`);
        this.$form.appendTo(this.$formDiv);

        //create submit button
        //submit onclick set in subclasses
        this.$submit = $("<input>",
                        { type:'submit',
                          value: "Search",
                          id: name + "Submit"
                        }
        );
        this.$submit.appendTo(this.$form);

        //create submit button
        //submit onclick set in subclasses
        this.$reset = $("<input>",
                        { type:'reset',
                          value: "Clear",
                          id: name + "Reset"
                        }
        );

        this.$reset.appendTo(this.$form);



        //add category button on click
        //gets initial 10
        //populates table
        this.$categoryButton.on("click", () => {
            if (this.recentQueryResults == null) {
                this.queryData = {source: "PHB",}
                this.queryGroup(1);
                // this.queryData = {}
            }
            else{
                this.display();
            }
        });
    }

    hide(){
        this.$formDiv.hide();
        this.$categoryButton.prop("disabled",false);

        ITEM_LIST.empty();
    }

    display(){
        for (const [cat, page] of Object.entries(this.categories)) {
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
                        // style: "",
                        class: "itemListElement",
                    }
            );

            ITEM_LIST.append($li);
            $li.on("click", () => {
                // console.log($li.attr("itemid"));
                this.queryDetails($li.attr("itemid"));
            });
        }

        //Set the page buttons to request the proper pages

        Object.keys(LIST_PAGE_BUTTONS).forEach(key => {
            LIST_PAGE_BUTTONS[key].show();
        });

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

    static buildOptions(form, list) {
        list.forEach(opt =>{
            form.append($("<option>", 
                { value:opt,
                text:opt}
            ));
        });
    }

    static collectAndBuildFieldOptions(categoryName, fieldName, fieldFormElement){
        //get sources
        $.getJSON({
            url:`${categoryName}/field/${fieldName}`,
            crossDomain:true,
            success: (res)=>{
                res.forEach(opt =>{
                    fieldFormElement.append($("<option>", { 
                            value:opt,
                            text:opt
                    }));
                });
            }
        });
    }


}