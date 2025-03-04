import React, { createElement } from "react";
import { Question, ElementFactory, Serializer } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";

const CUSTOM_TYPE = "likertmatrix";

import "./widgets.scss";

// 1) Modèle de question
export class QuestionLikertMatrixModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }
  // Propriété "rows" (tableau d'itemvalues, ici de type itemvalue_ex)
  get rows() {
    return this.getPropertyValue("rows");
  }
  set rows(val) {
    this.setPropertyValue("rows", val);
  }
  // Propriété "choiceValue" (tableau d'itemvalues)
  get choiceValue() {
    return this.getPropertyValue("choiceValue");
  }
  set choiceValue(val) {
    this.setPropertyValue("choiceValue", val);
  }
}

// 2) Enregistrement du modèle
export function registerLikertMatrix() {
  // Enregistrer le modèle dans ElementFactory
  ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new QuestionLikertMatrixModel(name);
  });
}

// Sérialisation
// Déclare la sous-classe "itemvalue_ex" pour ajouter la propriété "Texte2"
// Survey.JsonObject.metaData.addClass(
//   "itemvalue_ex",
//   [{ name: "Texte2:string" }],
//   function () {
//     return {};
//   },
//   "itemvalue"
// );

// Déclare la classe "likertmatrix"
Serializer.addClass(CUSTOM_TYPE, [], null, "empty");

// Ajoute la propriété "choiceValue"
Serializer.addClass(
  CUSTOM_TYPE, 
  [{
    name: "choiceValue:itemvalues",
    category: "choices",
    default: [-3, -2, -1, 0, 1, 2, 3]
  },
  {
    name: "rows:itemvalues",
    category: "choices",
    type: "itemvalue_ex[]",
    default: ["item1", "item2"]
  }],
  function () {
    return new QuestionLikertMatrixModel("");
  },
  "question"
);

// 3) Composant React
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
  return createElement(SurveyQuestionLikertMatrix, props);
});

export class SurveyQuestionLikertMatrix extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    this.state = { value: this.question.value };
  }
  get question() {
    return this.questionBase;
  }

  // Vérifie si la question est en mode "display" ou design
  isDisabled() {
    return (
      this.question.survey.getPropertyValue("mode") === "display" ||
      this.question.isDesignMode
    );
  }

  renderMatrix() {
    const question = this.question;
    // L'objet results contient les réponses pour chaque ligne
    const results = question.value || {};

    return (
      <div className="likert-matrix grid-cols-4 grid">
        {Array.isArray(question.rows) &&
          question.rows.map((row, rowIndex) => {
            if(row.Texte2 === undefined){
              row.Texte2 = "undefined"
            }
            // Utilise row.value comme identifiant, ou crée "rowX" par défaut
            const rowKey = row.value || `row${rowIndex + 1}`;
            return (
              <React.Fragment key={rowIndex}>
                {/* Colonne de gauche */}
                <div className="likert-matrix-text">
                  <span className="sv-string-viewer">{row.text}</span>
                </div>
                {/* Zone centrale avec les choix (col-span-2) */}
                <div className="likert-matrix-items col-span-2">
                  {Array.isArray(question.choiceValue) &&
                    question.choiceValue.map((choice, choiceIndex) => {
                      const choiceText =
                        choice.text !== undefined
                          ? choice.text
                          : String(choice);
                      const isSelected = results[rowKey] === choiceText;
                      const classes = [
                        "likert-matrix-item",
                        question.id,
                        `row-${rowIndex + 1}`
                      ];
                      if (isSelected) {
                        classes.push("likert-matrix-item-selected");
                      }
                      return (
                        <div
                          key={choiceIndex}
                          className={classes.join(" ")}
                          onClick={() => {
                            if (this.isDisabled()) return;
                            const newResults = { ...results, [rowKey]: choiceText };
                            question.value = newResults;
                            this.setState({ value: newResults });
                          }}
                        />
                      );
                    })}
                </div>
                {/* Colonne de droite */}
                <div className="likert-matrix-text">
                  <span className="sv-string-viewer">{row.Texte2}</span>
                </div>
              </React.Fragment>
            );
          })}
      </div>
    );
  }

  renderElement() {
    return (
      <div>{this.renderMatrix()}</div>
    );
  }
}
