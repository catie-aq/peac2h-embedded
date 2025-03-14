// Survey React
import React from "react";
import { Question, Serializer, ElementFactory } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";
// Import noUiSlider
import noUiSlider from "nouislider";
// Import de styles CSS noUiSlider (si besoin)
import "nouislider/dist/nouislider.css";

// Le type de notre question
const CUSTOM_TYPE = "nouislidercustom";

// 1. Modèle de question custom
export class QuestionNoUiSliderCustomModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }
  // On peut ajouter des getters/setters pour un accès plus direct
  get numberOfPoints() {
    return this.getPropertyValue("numberOfPoints");
  }
  set numberOfPoints(val) {
    this.setPropertyValue("numberOfPoints", val);
  }

  get textLow() {
    return this.getPropertyValue("textLow");
  }
  set textLow(val) {
    this.setPropertyValue("textLow", val);
  }

  get textMiddle() {
    return this.getPropertyValue("textMiddle");
  }
  set textMiddle(val) {
    this.setPropertyValue("textMiddle", val);
  }

  get textHigh() {
    return this.getPropertyValue("textHigh");
  }
  set textHigh(val) {
    this.setPropertyValue("textHigh", val);
  }
}

// 2. Enregistrement dans SurveyJS
export function registerNoUiSliderCustom() {
  // Enregistrer la classe custom
  ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new QuestionNoUiSliderCustomModel(name);
  });

  // Déclarer les propriétés via le Serializer
  Serializer.addClass(
    CUSTOM_TYPE,
    [
      {
        name: "numberOfPoints:number",
        category: "Configuration",
        default: 7
      },
      {
        name: "textLow:string",
        category: "Textes",
        default: "Very low"
      },
      {
        name: "textMiddle:string",
        category: "Textes",
        default: ""
      },
      {
        name: "textHigh:string",
        category: "Textes",
        default: "Very high"
      }
    ],
    function() {
      return new QuestionNoUiSliderCustomModel("");
    },
    "question" // hérite du type "question"
  );

  // Lier ce type de question à un composant React
  ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
    return React.createElement(SurveyQuestionNoUiSliderCustom, props);
  });
}

// 3. Composant React
export class SurveyQuestionNoUiSliderCustom extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    // On crée une ref pour cibler l'élément DOM où placer le slider
    this.sliderRoot = React.createRef();
    this.sliderInstance = null;
    // Pour éviter les soucis lors de l'unregister, stockons un seul "updateSliderFn"
    this.updateSliderFn = this.updateSlider.bind(this);
  }

  get question() {
    return this.questionBase;
  }

  // Au montage, on initialise le slider
  componentDidMount() {
    super.componentDidMount();
    this.initSlider();
    // On enregistre les callbacks de changement de propriété
    this.question.registerFunctionOnPropertyValueChanged("numberOfPoints", this.updateSliderFn);
    this.question.registerFunctionOnPropertyValueChanged("textLow", this.updateSliderFn);
    this.question.registerFunctionOnPropertyValueChanged("textMiddle", this.updateSliderFn);
    this.question.registerFunctionOnPropertyValueChanged("textHigh", this.updateSliderFn);
  }

  // À chaque mise à jour, on peut recaler la valeur s'il y a des changements
  componentDidUpdate(prevProps, prevState) {
    // S’il n’y a pas de slider ou pas de question, rien à faire
    if (!this.sliderInstance || !this.question) return;
    // Actualise la valeur visible dans le slider si la question.value a changé
    const currentValue = Number(this.sliderInstance.get());
    const questionValue = Number(this.question.value);
    if (currentValue !== questionValue) {
      this.sliderInstance.set(questionValue);
    }
    // Désactiver ou activer le slider en fonction de isReadOnly
    if (this.question.survey.getPropertyValue("mode") === "display") {
      this.sliderRoot.current.setAttribute("disabled", true);
    } else {
      this.sliderRoot.current.removeAttribute("disabled");
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    // Détruire le slider
    if (this.sliderInstance) {
      this.sliderInstance.destroy();
      this.sliderInstance = null;
    }
    // Désenregistrer les callbacks
    this.question.unRegisterFunctionOnPropertyValueChanged("numberOfPoints", this.updateSliderFn);
    this.question.unRegisterFunctionOnPropertyValueChanged("textLow", this.updateSliderFn);
    this.question.unRegisterFunctionOnPropertyValueChanged("textMiddle", this.updateSliderFn);
    this.question.unRegisterFunctionOnPropertyValueChanged("textHigh", this.updateSliderFn);
  }

  // -- Méthodes internes --

  initSlider() {
    if (!this.sliderRoot.current) return;
    const el = this.sliderRoot.current; // <div class="slider-custom"><div></div></div>

    // Créer l'instance noUiSlider
    this.sliderInstance = noUiSlider.create(el.children[0], {
      start: this.question.value || 0,
      step: 1,
      range: {
        min: 0,
        max: this.question.numberOfPoints - 1
      },
      pips: this.getPipsConfig(), // Voir getPipsConfig() ci-dessous
      orientation: "horizontal",
      direction: "ltr"
    });

    // Écoute l’événement de changement => met à jour question.value
    this.sliderInstance.on("change", () => {
      const val = Number(this.sliderInstance.get());
      this.question.value = val;
    });

    // Désactiver si isReadOnly
    if (this.question.survey.getPropertyValue("mode") === "display") {
      el.setAttribute("disabled", true);
    }
  }

  updateSlider() {
    if (!this.sliderInstance || !this.question) return;

    // Met à jour la plage et les pips
    this.sliderInstance.updateOptions({
      range: {
        min: 0,
        max: this.question.numberOfPoints - 1
      },
      pips: this.getPipsConfig()
    });

    // Ré-actualise la valeur
    const val = this.question.value || 0;
    this.sliderInstance.set(val);

    // Désactiver si isReadOnly
    if (this.question.isReadOnly) {
      this.sliderRoot.current.setAttribute("disabled", true);
    } else {
      this.sliderRoot.current.removeAttribute("disabled");
    }
  }

  getPipsConfig() {
    const numberOfPoints = parseInt(this.question.numberOfPoints, 10);
    const pipsValues = [...Array(numberOfPoints).keys()];
    const middlePipIndex = (numberOfPoints - 1) / 2;

    return {
      mode: "values",
      values: pipsValues,
      density: (1.0 / numberOfPoints) * 100.0,
      filter: (value /*, type */) => {
        // On affiche seulement les extrémités et le milieu
        if (value === 0) return 1;
        if (value === numberOfPoints - 1) return 1;
        if (value === middlePipIndex) return 1;
        return 0; // pas de pip
      },
      format: {
        to: (v) => {
          // On remplace les libellés 0 / middle / max
          if (v == 0) {
            return this.question.textLow;
          }
          if (v == numberOfPoints - 1) {
            return this.question.textHigh;
          }
          if (v == middlePipIndex) {
            return this.question.textMiddle;
          }
          return v;
        }
      }
    };
  }

  // Rendu React
  renderElement() {
    // Un conteneur .slider-custom + un <div> interne pour noUiSlider
    return (
      <div className="slider-custom" ref={this.sliderRoot}>
        <div />
      </div>
    );
  }
}
