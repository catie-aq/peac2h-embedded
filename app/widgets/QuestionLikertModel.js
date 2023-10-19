import { createElement } from "react";
import { Question, ElementFactory,  Serializer  } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";

const CUSTOM_TYPE = "likert";

export class QuestionLikertModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }
  get likertType() {
    return this.getPropertyValue("likertType");
  }
  set likertType(val) {
    this.setPropertyValue("likertType", val);
  }

  // Methods --- from example 
  get disableAlpha() {
    return this.getPropertyValue("disableAlpha");
  }
  set disableAlpha(val) {
    this.setPropertyValue("disableAlpha", val);
  }
  // END From example
}

// Load the custom widget 
export function registerLikert() {
  ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new QuestionLikertModel(name);
  });
}

// Data serialization
Serializer.addClass(
  CUSTOM_TYPE,
  [{
    name: "likertType",
    default: "Slider",
    choices: ["Slider", "Sketch", "Compact"],
    category: "general",
    visibleIndex: 2 // Place after the Name and Title
  },
  
  {
    name: "rateDataValues:itemvalues",
    category: "Barème",
    default: [{value: 0, text: "Pas du tout d'accord"},
              {value: 1, text: "Pas d’accord"},
              {value: 2, text: "Neutre"},
              {value: 3, text: "D'accord"}, 
              {value: 4, text: "Tout à fait d'accord"}],
  },
  
  {
    name: "disableAlpha:boolean",
    dependsOn: "likertType",
    visibleIf: function (obj) {
      return obj.likertType === "Sketch";
    },
    category: "general",
    visibleIndex: 3 // Place after the Name, Title, and Color Picker Type
  }],
  function () {
    return new QuestionLikertModel("");
  },
  "question"
);



// Widget rendering 


// Register our widget
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
  return createElement(SurveyQuestionLikert, props);
});

export class SurveyQuestionLikert extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    this.state = { value: this.question.value };
  }
  get question() {
    return this.questionBase;
  }
  get value() {
    return this.question.value;
  }

  // get rateDataValues(){
  //   return this.qu
  // }
  get disableAlpha() {
    return this.question.disableAlpha;
  }
  get type() {
    return this.question.LikertType;
  }
  handleColorChange = (data) => {
    this.question.value = data.hex;
  };

  // Support the read-only and design modes
  get style() {
    return this.question.getPropertyValue("readOnly")
      || this.question.isDesignMode ? { pointerEvents: "none" } : undefined;
  }

  renderLikert(type) {

    let rateDataValues = this.question.rateDataValues

    if(rateDataValues === undefined){
      // TODO: find how to reference the serializer.. 
      rateDataValues = [{value: 0, text: "Pas du tout d'accord"},
                                    {value: 1, text: "Pas d’accord"},
                                    {value: 2, text: "Neutre"},
                                    {value: 3, text: "D'accord"}, 
                                    {value: 4, text: "Tout à fait d'accord"}]
    }

    console.log(rateDataValues)
    // console.log(this, this.question)
    if(this.question === undefined ) {
      return (
        <h1> Question undefined... </h1>
      )
    }

    return ( 
      <>
      <h1> Hello World </h1>

      { 
        rateDataValues.map( (rateDataValue) =>{
          return (<div onClick={ () => {this.question.value = rateDataValue.value} }> {rateDataValue.text} - {rateDataValue.value } </div>)
        }
      )
      }
      </>
    )


  } 

  renderElement() {
    
    return (
      <div style={this.style}>
        {this.renderLikert(this.type)}
      </div>
    );
  }
}
