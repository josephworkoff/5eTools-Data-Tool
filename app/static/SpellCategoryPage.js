import { CategoryPage } from './CategoryPage.js';
import { displaySpell } from "./InfoPage.js";

export class SpellCategoryPage extends CategoryPage{

    constructor(){
        super("Spell");

        this.endpointName = "spell";

        this.elementsArray = [];

        this.buildNameField();
        this.buildSourceField();
        this.buildDurationField();
        this.buildSchoolField();
        this.buildLevelField();



        for (const el of this.elementsArray) {
            this.$form.append(el);
        }

 
        this.displayDetails = displaySpell;

        this.$submit.on("click", (e) => {
            e.preventDefault();
            this.queryData.page = 1
            this.queryData.name         = $("#spellNameField").val();
            this.queryData.source       = $("#spellSourceField").val();
            this.queryData.duration     = $("input[name='spellDurationField']:checked").val();
            this.queryData.school       = $("#spellSchoolField").val();
            this.queryData.level        = $("#spellLevelField").val();
            this.queryGroup();
        });

        this.$reset.on("click", (e)=>{
            console.log("Reseting");
            $("#spellSourceField").val('');
            $("#spellSchoolField").val('');
            $("#spellLevelField").val('');
        })
    }


    buildNameField(){
        this.$nameLabel = $("<label>", 
        { for:'spellNameField',
            text:'Name',}
        );
        
        //name text input
        this.$nameField = $("<input>", 
            { type:'text',
            name:'spellNameField',
            id:'spellNameField',}
        );

        this.elementsArray.push($("<br>"), this.$nameLabel, $("<br>"), this.$nameField, $("<br>"),);
    }


    buildSourceField(){
        //source label
        this.$sourceLabel = $("<label>", { 
                for:'spellSourceField',
                text:'Source',}
        );

        //source select
        this.$sourceField = $("<select>", { 
                name:'spellSourceField',
                id:'spellSourceField',
                form:'spellForm',
        });
        this.$sourceField.append($("<option selected>",{value:''}));

        //get sources
        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "source", this.$sourceField);

        this.elementsArray.push(this.$sourceLabel, $("<br>"), this.$sourceField, $("<br>"),);

    }

    buildDurationField(){
        //duration instant label
        this.$durationInstantLabel = $("<label>", { 
                for:'spellDurationInstant',
                text:'Instant',
        });
        //duration check box
        this.$durationInstantField = $("<input>", { 
                type:"radio",
                name:"spellDurationField",
                id:"spellDurationInstant",
                value:'instant'
        });
        //duration timed label
        this.$durationTimedLabel = $("<label>", { 
                for:'spellDurationTimed',
                text:'Timed',
        });
        //duration timed check box
        this.$durationTimedField = $("<input>", { 
                type:"radio",
                name:"spellDurationField",
                id:"spellDurationTimed",
                value:"timed",
        });

        this.elementsArray.push(
            this.$durationInstantLabel, 
            this.$durationInstantField,
            $("<br>"),
            this.$durationTimedLabel, 
            this.$durationTimedField,
            $("<br>"),
        );
    }


    buildSchoolField(){
        //school label
        this.$schoolLabel = $("<label>", { 
                for:'spellSchoolField',
                text:'School',}
        );
        //school select
        this.$schoolField = $("<select>", { 
                name:'spellSchoolField',
                id:'spellSchoolField',
                form:'spellForm',
        });
        this.$schoolField.append($("<option selected>",{value:''}));

        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "school", this.$schoolField);

        this.elementsArray.push(this.$schoolLabel, $("<br>"), this.$schoolField, $("<br>"),);
    }

    buildLevelField(){
        //level label
        this.$levelLabel = $("<label>", { 
                for:'spellLevelField',
                text:'Level',
        });
        //skills
        this.$levelField = $("<select>", { 
                name:'spellLevelField',
                id:'spellLevelField',
                form:'spellForm',
        });
        this.$levelField.append($("<option selected>",{value:''}));

        CategoryPage.collectAndBuildFieldOptions(this.endpointName, "level", this.$levelField);

        this.elementsArray.push(this.$levelLabel, $("<br>"), this.$levelField, $("<br>"),);
    }
}

