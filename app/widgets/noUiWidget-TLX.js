import * as Survey from "survey-core";
import noUiSlider from "nouislider";

function init(Survey, noUiSlider) {
  var widget = {
    name: "nouislidertlx",
    title: "Slider visuel analogique",
    iconName: "icon-right",
    widgetIsLoaded: function () {
      return typeof noUiSlider != "undefined";
    },
    isFit: function (question) {
      return question.getType() === "nouislidertlx";
    },
    htmlTemplate: "",
    activatedByChanged: function (activatedBy) {
      Survey.JsonObject.metaData.addClass("nouislidertlx", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("nouislidertlx", []);

      Survey.Serializer.addProperty("nouislidertlx", {
        name: "textLowLimit:string",
        category: "Textes",
        default: "Très faible",
      });

      Survey.Serializer.addProperty("nouislidertlx", {
        name: "textHighLimit:string",
        category: "Textes",
        default: "Très élevé",
      });

      Survey.Serializer.addProperty("nouislidertlx", {
        name: "Graduation:boolean",
        category: "general",
        default: "true",
      });

    },
    afterRender: function (question, el) {

      if(question.Graduation === false){
        el.className = "slider-tlx-nograd noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr";
      }else{
        el.className = "slider-tlx noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr";
      };

      el.classList.add("slider-tlx");

      var pipsValues = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];

      // List of pips value.
      let initSlider = () => {
        let slider = noUiSlider.create(el, {
          start: question.value || 50,
          step: 1,
          pips: {
            mode: "values",
            values: pipsValues.map(function (pVal) {
              var pipValue = pVal;
              if (pVal.value !== undefined) {
                pipValue = pVal.value;
              }
              return parseInt(pipValue);
            }),
            density: 5,
            format: {
              to: function (pVal) {
                var pipText = pVal;
                pipsValues.map(function (el) {
                  if (el.text !== undefined && pVal === el.value) {
                    pipText = el.text;
                  }  
                });
                if(pipsValues.indexOf(pVal) === 0)
                  return question.textLowLimit
                else if(pipsValues.indexOf(pVal) === (pipsValues.length -1) )
                  return question.textHighLimit
                return "";
              },
            },
          },
          range: {
            min: 0,
            max: 100,
          },
          orientation: "horizontal",
          direction: "ltr",
        });
        return slider;
      }

      let updateSlider = () => {
        slider.updateOptions({

          pips: {
            mode: "values",
            values: pipsValues.map(function (pVal) {
              var pipValue = pVal;
              if (pVal.value !== undefined) {
                pipValue = pVal.value;
              }
              return parseInt(pipValue);
            }),
            density: 5,
            format: {
              to: function (pVal) {
                var pipText = pVal;
                pipsValues.map(function (el) {
                  if (el.text !== undefined && pVal === el.value) {
                    pipText = el.text;
                  }  
                });
                if(pipsValues.indexOf(pVal) === 0)
                  return question.textLowLimit
                else if(pipsValues.indexOf(pVal) === (pipsValues.length -1) )
                  return question.textHighLimit
                return "";
              },
            },
          },
        });
      }

      var slider = initSlider(question, el);

      slider.on("change", function () {
        question.value = Number(slider.get());
      });
      var updateValueHandler = function () {
        slider.set(question.value);
      };
      if (question.isReadOnly) {
        el.setAttribute("disabled", true);
      }
      updateValueHandler();
      question.noUiSlider = slider;
      question.valueChangedCallback = updateValueHandler;
      question.readOnlyChangedCallback = function () {
        if (question.isReadOnly) {
          el.setAttribute("disabled", true);
        } else {
          el.removeAttribute("disabled");
        }
      };

      question.registerFunctionOnPropertyValueChanged("textLowLimit", updateSlider);
      question.registerFunctionOnPropertyValueChanged("textHighLimit", updateSlider);
      // change the htmlTemplate to class='slider-tlx-nograd' when Graduation is false
      question.registerFunctionOnPropertyValueChanged("Graduation", function () {
        if (question.Graduation === false) {
          el.className = "slider-tlx-nograd noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr";
        } else {
          el.className = "slider-tlx noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr";
        }
      });
    },
    willUnmount: function (question, el) {
      if (!!question.noUiSlider) {
        question.noUiSlider.destroy();
        question.noUiSlider = null;
      }
      question.readOnlyChangedCallback = null;
    },
    pdfRender: function (_, options) {
      if (options.question.getType() === "nouislider") {
        var point = options.module.SurveyHelper.createPoint(
          options.module.SurveyHelper.mergeRects.apply(null, options.bricks)
        );
        point.xLeft += options.controller.unitWidth;
        point.yTop +=
          options.controller.unitHeight *
          options.module.FlatQuestion.CONTENT_GAP_VERT_SCALE;
        var rect = options.module.SurveyHelper.createTextFieldRect(
          point,
          options.controller
        );
        var textboxBrick = new options.module.TextFieldBrick(
          options.question,
          options.controller,
          rect,
          true,
          options.question.id,
          options.question.value || options.question.defaultValue || "",
          "",
          options.question.isReadOnly,
          false,
          "text"
        );
        options.bricks.push(textboxBrick);
      }
    },
  };
  Survey.CustomWidgetCollection.Instance.add(widget, "customtype");
}

if (typeof Survey !== "undefined") {
  init(Survey, noUiSlider);
}else {
  console.log("Connot init TLX Widget")
}

export default init;