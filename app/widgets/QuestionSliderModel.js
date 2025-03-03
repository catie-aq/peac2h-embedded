import React from "react";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";

import { Question, Serializer, ElementFactory } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";

// Nom de la question
const CUSTOM_TYPE = "nouislider";

// 1) Modèle de question
export class QuestionNoUiSliderModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }

  // On crée des getters/setters pour chaque propriété
  get step() {
    return this.getPropertyValue("step");
  }
  set step(val) {
    this.setPropertyValue("step", val);
  }

  get rangeMin() {
    return this.getPropertyValue("rangeMin");
  }
  set rangeMin(val) {
    this.setPropertyValue("rangeMin", val);
  }

  get rangeMax() {
    return this.getPropertyValue("rangeMax");
  }
  set rangeMax(val) {
    this.setPropertyValue("rangeMax", val);
  }

  get pipsMode() {
    return this.getPropertyValue("pipsMode");
  }
  set pipsMode(val) {
    this.setPropertyValue("pipsMode", val);
  }

  get pipsValues() {
    return this.getPropertyValue("pipsValues");
  }
  set pipsValues(val) {
    this.setPropertyValue("pipsValues", val);
  }

  get pipsText() {
    return this.getPropertyValue("pipsText");
  }
  set pipsText(val) {
    this.setPropertyValue("pipsText", val);
  }

  get pipsDensity() {
    return this.getPropertyValue("pipsDensity");
  }
  set pipsDensity(val) {
    this.setPropertyValue("pipsDensity", val);
  }

  get orientation() {
    return this.getPropertyValue("orientation");
  }
  set orientation(val) {
    this.setPropertyValue("orientation", val);
  }

  get direction() {
    return this.getPropertyValue("direction");
  }
  set direction(val) {
    this.setPropertyValue("direction", val);
  }

  get tooltips() {
    return this.getPropertyValue("tooltips");
  }
  set tooltips(val) {
    this.setPropertyValue("tooltips", val);
  }
}

// 2) Fonction d’enregistrement de la question
export function registerNoUiSliderQuestion() {
  // Déclare la classe + propriétés dans le Serializer
  Serializer.addClass(
    CUSTOM_TYPE,
    [
      { name: "step:number", category: "slider", default: 1 },
      { name: "rangeMin:number", category: "slider", default: 0 },
      { name: "rangeMax:number", category: "slider", default: 100 },
      { name: "pipsMode", category: "slider", default: "positions" },
      {
        name: "pipsValues:itemvalues",
        category: "slider",
        default: [0, 25, 50, 75, 100]
      },
      {
        name: "pipsText:itemvalues",
        category: "slider",
        default: [0, 25, 50, 75, 100]
      },
      { name: "pipsDensity:number", category: "slider", default: 5 },
      {
        name: "orientation",
        category: "slider",
        default: "horizontal",
        choices: ["horizontal", "vertical"]
      },
      { name: "direction:string", category: "slider", default: "ltr" },
      { name: "tooltips:boolean", category: "slider", default: true }
    ],
    () => new QuestionNoUiSliderModel(""),
    "question" // Hérite de la classe "question"
  );

  // Enregistre dans l’ElementFactory (pour la création)
  ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new QuestionNoUiSliderModel(name);
  });

  // Associe ce type de question à un composant React
  ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
    return <SurveyQuestionNoUiSlider {...props} />;
  });
}

// 3) Le composant React qui gère l’affichage / interactions
export class SurveyQuestionNoUiSlider extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    this.sliderRoot = React.createRef();
    this.sliderInstance = null;
  }

  get question() {
    return this.questionBase;
  }

  componentDidMount() {
    super.componentDidMount();
    this.initSlider();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.sliderInstance || !this.question) return;

    // Si la valeur a changé côté SurveyJS, on recale le slider
    const currentVal = parseFloat(this.sliderInstance.get());
    const newVal = parseFloat(
      this.question.value !== undefined
        ? this.question.value
        : (this.question.rangeMin + this.question.rangeMax) / 2
    );
    if (currentVal !== newVal) {
      this.sliderInstance.set(newVal);
    }

    // Gérer lecture seule
    if (this.question.isReadOnly) {
      this.sliderRoot.current.setAttribute("disabled", true);
    } else {
      this.sliderRoot.current.removeAttribute("disabled");
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.sliderInstance) {
      this.sliderInstance.destroy();
      this.sliderInstance = null;
    }
  }

  // Crée noUiSlider
  initSlider() {
    if (!this.sliderRoot.current) return;

    const el = this.sliderRoot.current.children[0];
    const question = this.question;
    const startValue =
      question.value !== undefined
        ? question.value
        : (question.rangeMin + question.rangeMax) / 2;

    this.sliderInstance = noUiSlider.create(el, {
      start: startValue,
      step: question.step,
      tooltips: question.tooltips,
      pips: {
        mode: question.pipsMode || "positions",
        values: (question.pipsValues || [0, 25, 50, 75, 100]).map((pVal) => {
          // si itemvalue => on prend pVal.value, sinon pVal direct
          return pVal?.value !== undefined ? pVal.value : pVal;
        }),
        density: question.pipsDensity || 5,
        format: {
          to: (pVal) => {
            // Remplacer la valeur par le texte défini si pVal == un pipsText.value
            let pipText = pVal;
            (question.pipsText || []).forEach((el) => {
              if (el.text !== undefined && pVal == el.value) {
                pipText = el.text;
              }
            });
            return pipText;
          }
        }
      },
      range: {
        min: question.rangeMin,
        max: question.rangeMax
      },
      orientation: question.orientation,
      direction: question.direction
    });

    this.sliderInstance.on("change", () => {
      const val = Number(this.sliderInstance.get());
      // Met à jour la valeur SurveyJS
      question.value = val;
    });

    // Lecture seule initiale
    if (question.isReadOnly) {
      this.sliderRoot.current.setAttribute("disabled", true);
    }
  }

  // Rendu du composant
  renderElement() {
    return (
      <div className="slider-standard" ref={this.sliderRoot}>
        <div />
      </div>
    );
  }
}
