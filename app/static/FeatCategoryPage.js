import { CategoryPage } from './CategoryPage.js';
import { displayFeat } from "./InfoPage.js";

export class FeatCategoryPage extends CategoryPage{

    constructor(){
        super("Feat");

        this.endpointName = "feat";

        this.elementsArray = [];

        this.buildNameField();
        this.buildSourceField();
        this.buildSkillForm();
        this.buildAbilityForm();


        for (const el of this.elementsArray) {
            this.$form.append(el);
        }

        this.displayDetails = displayFeat;

        this.$submit.on("click", (e) => {
            e.preventDefault();
            this.queryData.page = 1
            this.queryData.name         = $("#featNameField").val();
            this.queryData.source       = $("#featSourceField").val();
            this.queryData.skill        = $("#featSkillField").val();
            this.queryData.ability      = $("#featAbilityField").val();
            this.queryGroup();
        });

        this.$reset.on("click", (e)=>{
            console.log("Reseting");
            $("#backgroundSourceField").val('');
            $("#featSourceField").val('');
            $("#featSkillField").val('');
            $("#featAbilityField").val('');
        })
    }


    buildNameField(){
        this.$nameLabel = $("<label>", 
        { for:'featNameField',
            text:'Name',}
        );
        
        //name text input
        this.$nameField = $("<input>", 
            { type:'text',
            name:'featNameField',
            id:'featNameField',}
        );

        this.elementsArray.push($("<br>"),this.$nameLabel, $("<br>"), this.$nameField, $("<br>"));
    }


    buildSourceField(){
        //source label
        this.$sourceLabel = $("<label>", 
            { for:'featSourceField',
            text:'Source',}
        );

        //source select
        this.$sourceField = $("<select>", 
            { name:'featSourceField',
            id:'featSourceField',
            form:'featForm',
            }
        );
        this.$sourceField.append($("<option selected>",{value:''}));

        //get sources
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "source", this.$sourceField);

        this.elementsArray.push(this.$sourceLabel, $("<br>"), this.$sourceField, $("<br>"),);

    }

    buildSkillForm(){
        //skill label
        this.$skillLabel = $("<label>", { 
                for:'featSkillField',
                text:'Skill Proficiencies',
        });
        //skills
        this.$skillField = $("<select>",{ 
                name:'featSkillField',
                id:'featSkillField',
                form:'featForm',
        });
        this.$skillField.append($("<option selected>",{value:''}));
        
        //get skills
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "skillProficiencies", this.$skillField);

        this.elementsArray.push(this.$skillLabel, $("<br>"), this.$skillField, $("<br>"),);
    }

    buildAbilityForm(){
        //ability label
        this.$abilityLabel = $("<label>", { 
                for:'featAbilityField',
                text:'Ability Bonus',
        });
        //ability
        this.$abilityField = $("<select>", { 
                name:'featAbilityField',
                id:'featAbilityField',
                form:'featForm',
        });
        this.$abilityField.append($("<option selected>",{value:''}));

        //get abilities
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "ability", this.$abilityField);

        this.elementsArray.push(this.$abilityLabel, $("<br>"), this.$abilityField, $("<br>"),);
    }

}
