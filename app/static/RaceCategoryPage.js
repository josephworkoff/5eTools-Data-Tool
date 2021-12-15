import { CategoryPage } from './CategoryPage.js';
import { displayRace } from "./InfoPage.js";

export class RaceCategoryPage extends CategoryPage{

    constructor(){
        super("Race");

        this.endpointName = "race";

        this.elementsArray = [];

        this.buildNameField();
        this.buildSourceField();
        this.buildSizeField();
        this.buildLanguageForm();
        this.buildSkillForm();
        this.buildAbilityForm();


        for (const el of this.elementsArray) {
            this.$form.append(el);
        }

 
        this.displayDetails = displayRace;

        this.$submit.on("click", (e) => {
            e.preventDefault();
            this.queryData.page = 1
            this.queryData.name         = $("#raceNameField").val();
            this.queryData.source       = $("#raceSourceField").val();
            this.queryData.size         = $("input[name='raceSizeField']:checked").val();
            this.queryData.language     = $("#raceLanguageField").val();
            this.queryData.skill        = $("#raceSkillField").val();
            this.queryData.ability      = $("#raceAbilityField").val();
            this.queryGroup();
        });

        this.$reset.on("click", (e)=>{
            console.log("Reseting");
            $("#raceSourceField").val('');
            $("#raceLanguageField").val('');
            $("#raceSkillField").val('');
            $("#raceAbilityField").val('');
        })
    }


    buildNameField(){
        this.$nameLabel = $("<label>", 
        { for:'raceNameField',
            text:'Name',}
        );
        
        //name text input
        this.$nameField = $("<input>", 
            { type:'text',
            name:'raceNameField',
            id:'raceNameField',}
        );

        this.elementsArray.push($("<br>"), this.$nameLabel, $("<br>"), this.$nameField, $("<br>"));
    }


    buildSourceField(){
        //source label
        this.$sourceLabel = $("<label>", 
            { for:'raceSourceField',
            text:'Source',}
        );

        //source select
        this.$sourceField = $("<select>", 
            { name:'raceSourceField',
            id:'raceSourceField',
            form:'raceForm',
            }
        );
        this.$sourceField.append($("<option selected>",{value:'', selected: "selected"}));

        //get sources
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "source", this.$sourceField);

        this.elementsArray.push(this.$sourceLabel, $("<br>"), this.$sourceField, $("<br>"));

    }

    buildSizeField(){
        //size small label
        this.$sizeSmallLabel = $("<label>", { 
                for:'raceSizeSmall',
                text:'Small',
        });
        //size check box
        this.$sizeSmallField = $("<input>", { 
                type:"radio",
                name:"raceSizeField",
                id:"raceSizeSmall",
                value:'S'
        });

        //size med label
        this.$sizeMediumLabel = $("<label>", { 
                for:'raceSizeMedium',
                text:'Medium',
        });
        //size check box
        this.$sizeMediumField = $("<input>", { 
                type:"radio",
                name:"raceSizeField",
                id:"raceSizeMedium",
                value:"M",
        });

        //size small label
        this.$sizeLargeLabel = $("<label>", { 
                for:'raceSizeLarge',
                text:'Large',
        });
        //size check box
        this.$sizeLargeField = $("<input>", { 
                type:"radio",
                name:"raceSizeField",
                id:"raceSizeLarge",
                value:"L",
        });

        this.elementsArray.push(
            this.$sizeSmallLabel,
            this.$sizeSmallField,
            $("<br>"),
            this.$sizeMediumLabel,
            this.$sizeMediumField,
            $("<br>"),
            this.$sizeLargeLabel,
            this.$sizeLargeField,
            $("<br>"),
        );
    }

    buildLanguageForm(){
        //language label
        this.$languageLabel = $("<label>", { 
                for:'raceLanguageField',
                text:'Language Proficiencies',
        });
        //language select
        this.$languageField = $("<select>", { 
                name:'raceLanguageField',
                id:'raceLanguageField',
                form:'raceForm',
        });
        this.$languageField.append($("<option selected>",{value:''}));

        //get languages
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "languageProficiencies", this.$languageField);

        this.elementsArray.push(this.$languageLabel, $("<br>"), this.$languageField, $("<br>"));
    }

    buildSkillForm(){
        //skill label
        this.$skillLabel = $("<label>", { 
                for:'raceSkillField',
                text:'Skill Proficiencies',
        });
        //skills
        this.$skillField = $("<select>",{ 
                name:'raceSkillField',
                id:'raceSkillField',
                form:'raceForm',
        });
        this.$skillField.append($("<option selected>",{value:''}));
        
        //get skills
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "skillProficiencies", this.$skillField);

        this.elementsArray.push(this.$skillLabel, $("<br>"), this.$skillField, $("<br>"));
    }

    buildAbilityForm(){
        //ability label
        this.$abilityLabel = $("<label>", { 
                for:'raceAbilityField',
                text:'Ability Bonus',
        });
        //ability
        this.$abilityField = $("<select>", { 
                name:'raceAbilityField',
                id:'raceAbilityField',
                form:'raceForm',
        });
        this.$abilityField.append($("<option selected>",{value:''}));

        //get abilities
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "ability", this.$abilityField);

        this.elementsArray.push(this.$abilityLabel, $("<br>"), this.$abilityField, $("<br>"));
    }



}
