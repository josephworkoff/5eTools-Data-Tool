import { CategoryPage } from './CategoryPage.js';
import { displayBackground } from "./InfoPage.js";

export class BackgroundCategoryPage extends CategoryPage{

    constructor(){
        super("Background");

        this.endpointName = "background";

        this.elementsArray = [];

        this.buildNameField();
        this.buildSourceField();
        this.buildLanguageForm();
        this.buildSkillForm();
        this.buildToolForm();


        for (const el of this.elementsArray) {
            this.$form.append(el);
        }

 
        this.displayDetails = displayBackground;

        this.$submit.on("click", (e) => {
            e.preventDefault();
            this.queryData.page = 1
            this.queryData.name         = $("#backgroundNameField").val();
            this.queryData.source       = $("#backgroundSourceField").val();
            this.queryData.language     = $("#backgroundLanguageField").val();
            this.queryData.skill        = $("#backgroundSkillField").val();
            this.queryData.tool         = $("#backgroundToolField").val();
            this.queryGroup();
        });

        this.$reset.on("click", (e)=>{
            console.log("Reseting");
            $("#backgroundSourceField").val('');
            $("#backgroundLanguageField").val('');
            $("#backgroundSkillField").val('');
            $("#backgroundToolField").val('');
        })
    }


    buildNameField(){
        this.$nameLabel = $("<label>", 
        { for:'backgroundNameField',
            text:'Name',}
        );
        
        //name text input
        this.$nameField = $("<input>", 
            { type:'text',
            name:'backgroundNameField',
            id:'backgroundNameField',}
        );

        this.elementsArray.push($("<br>"),this.$nameLabel, $("<br>"), this.$nameField, $("<br>"),);
    }


    buildSourceField(){
        //source label
        this.$sourceLabel = $("<label>", 
            { for:'backgroundSourceField',
            text:'Source',}
        );

        //source select
        this.$sourceField = $("<select>", 
            { name:'backgroundSourceField',
            id:'backgroundSourceField',
            form:'backgroundForm',
            }
        );
        this.$sourceField.append($("<option selected>",{value:''}));

        //get sources
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "source", this.$sourceField);

        this.elementsArray.push(this.$sourceLabel, $("<br>"), this.$sourceField, $("<br>"),);

    }

    buildLanguageForm(){
        //language label
        this.$languageLabel = $("<label>", { 
                for:'backgroundLanguageField',
                text:'Language Proficiencies',
        });
        //language select
        this.$languageField = $("<select>", { 
                name:'backgroundLanguageField',
                id:'backgroundLanguageField',
                form:'backgroundForm',
        });
        this.$languageField.append($("<option selected>",{value:''}));

        //get languages
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "languageProficiencies", this.$languageField);

        this.elementsArray.push(this.$languageLabel, $("<br>"), this.$languageField, $("<br>"));
    }

    buildSkillForm(){
        //skill label
        this.$skillLabel = $("<label>", { 
                for:'backgroundSkillField',
                text:'Skill Proficiencies',
        });
        //skills
        this.$skillField = $("<select>",{ 
                name:'backgroundSkillField',
                id:'backgroundSkillField',
                form:'backgroundForm',
        });
        this.$skillField.append($("<option selected>",{value:''}));
        
        //get skills
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "skillProficiencies", this.$skillField);

        this.elementsArray.push(this.$skillLabel, $("<br>"), this.$skillField, $("<br>"));
    }

    buildToolForm(){
        //tool label
        this.$toolLabel = $("<label>", { 
                for:'backgroundToolField',
                text:'Tool Proficiencies',
        });
        //tools
        this.$toolField = $("<select>", { 
                name:'backgroundToolField',
                id:'backgroundToolField',
                form:'backgroundForm',
        });
        this.$toolField.append($("<option selected>",{value:''}));

        //get abilities
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "toolProficiencies", this.$toolField);

        this.elementsArray.push(this.$toolLabel, $("<br>"), this.$toolField, $("<br>"));
    }

}

