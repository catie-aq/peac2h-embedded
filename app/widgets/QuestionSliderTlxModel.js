// noUiSlider React / SurveyJS
import React from "react";
import { Question, Serializer, ElementFactory } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";

// Nom de notre question custom
const CUSTOM_TYPE = "nouislidertlx";

// Modèle de question custom
export class QuestionNoUiSliderTlxModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }

  get textLowLimit() {
    return this.getPropertyValue("textLowLimit");
  }
  set textLowLimit(val) {
    this.setPropertyValue("textLowLimit", val);
  }

  get textHighLimit() {
    return this.getPropertyValue("textHighLimit");
  }
  set textHighLimit(val) {
    this.setPropertyValue("textHighLimit", val);
  }
}

// Enregistre la question custom
export function registerNoUiSliderTlx() {
  // 2.a – Ajouter les propriétés au Serializer
  Serializer.addClass(
    CUSTOM_TYPE,
    [
      {
        name: "textLowLimit:string",
        category: "Textes",
        default: "Très faible"
      },
      {
        name: "textHighLimit:string",
        category: "Textes",
        default: "Très élevé"
      }
    ],
    function () {
      return new QuestionNoUiSliderTlxModel("");
    },
    "question" // hérite du type question
  );

  // 2.b – Enregistrer dans ElementFactory (pour la création)
  ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new QuestionNoUiSliderTlxModel(name);
  });

  // 2.c – Associer le composant React
  ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
    return <SurveyQuestionNoUiSliderTlx {...props} />;
  });
}


export class SurveyQuestionNoUiSliderTlx extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    this.sliderRoot = React.createRef();
    this.sliderInstance = null;
  }

  get question() {
    return this.questionBase;
  }

  // Au montage, on crée le slider
  componentDidMount() {
    super.componentDidMount();
    this.initSlider();
  }

  // À chaque update, on peut synchroniser la valeur
  componentDidUpdate(prevProps, prevState) {
    if (!this.sliderInstance || !this.question) return;

    // Ajuster la valeur si la question.value a changé
    const currentValue = Number(this.sliderInstance.get());
    const questionValue = Number(this.question.value ?? 50); // Valeur par défaut 50
    if (currentValue !== questionValue) {
      this.sliderInstance.set(questionValue);
    }

    // Gérer lecture seule
    
    if (this.question.survey.getPropertyValue("mode") === "display") {
      this.sliderRoot.current.setAttribute("disabled", true);
    } else {
      this.sliderRoot.current.removeAttribute("disabled");
    }
  }

  // Au démontage, on détruit l’instance
  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.sliderInstance) {
      this.sliderInstance.destroy();
      this.sliderInstance = null;
    }
  }

  initSlider() {
    if (!this.sliderRoot.current) return;
    const el = this.sliderRoot.current;
    
    const startValue = this.question.value ?? 50;
    const pipsValues = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];

    // Crée l’instance noUiSlider
    this.sliderInstance = noUiSlider.create(el.children[0], {
      start: startValue,
      step: 1,
      range: {
        min: 0,
        max: 100
      },
      pips: {
        mode: "values",
        values: pipsValues,
        density: 5,
        format: {
          to: (pVal) => {
            // Si c'est la 1ère pip => textLowLimit
            if (pVal == 0) {
              return this.question.textLowLimit;
            }
            // Si c'est la dernière pip => textHighLimit
            if (pVal == 100) {
              return this.question.textHighLimit;
            }
            // Sinon, ne rien afficher (ou un label vide)
            return "";
          }
        }
      },
      orientation: "horizontal",
      direction: "ltr"
    });

    // Gérer le changement => met à jour question.value
    this.sliderInstance.on("change", () => {
      const val = Number(this.sliderInstance.get());
      this.question.value = val;
    });

    // Lire question.isReadOnly
    if (this.question.survey.getPropertyValue("mode") === "display") {
      el.setAttribute("disabled", true);
    }
  }

  // Rendu principal
  renderElement() {
    // On crée un container .slider-tlx et un <div> à l'intérieur pour noUiSlider
    return (
      <div className="slider-tlx" ref={this.sliderRoot}>
        <div />
      </div>
    );
  }
}

