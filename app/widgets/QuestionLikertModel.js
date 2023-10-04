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
  }, {
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

    return ( 
      <h1> Hello World </h1>
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
