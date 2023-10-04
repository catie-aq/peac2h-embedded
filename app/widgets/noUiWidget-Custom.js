// import noUiSlider from "nouislider";

function init(Survey, noUiSlider) {
  var widget = {
    name: "nouislidercustom",
    title: "Slider visuel customisé",
    widgetIsLoaded: function () {
      return typeof noUiSlider != "undefined";
    },
    isFit: function (question) {
      return question.getType() === "nouislidercustom";
    },
    htmlTemplate: "<div class='slider-custom'><div></div></div>",
    activatedByChanged: function (activatedBy) {
      Survey.JsonObject.metaData.addClass("nouislidercustom", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("nouislidercustom", []);

      Survey.Serializer.addProperty("nouislidercustom", {
        name: "numberOfPoints:number",
        text: "Échelle",
        category: "Configuration",
        default: 7,
      });

      Survey.Serializer.addProperty("nouislidercustom", {
        name: "textLow:string",
        category: "Textes",
        default: "Very low",
      });

      Survey.Serializer.addProperty("nouislidercustom", {
        name: "textMiddle:string",
        category: "Textes",
        default: "",
      });

      Survey.Serializer.addProperty("nouislidercustom", {
        name: "textHigh:string",
        category: "Textes",
        default: "Very high",
      });

    },
    afterRender: function (question, el) {
            
      // List of pips value. 
      let initSlider = () => {
        let numberOfPoints = parseInt(question.numberOfPoints);
        let pipsValues = Array.from(Array(numberOfPoints).keys())
        let middlePip = pipsValues[(numberOfPoints-1) / 2];

        let slider = noUiSlider.create(el, {
            start: 0,
            step: 1,
            range: {
              min: 0,
              max: numberOfPoints-1,
            },
            pips: {
              mode: "values",
              values: pipsValues,
              density:  (1.0 / (numberOfPoints)) * 100.0,
              filter: ((value, type) => { 
                if(value == 0){
                  return 1;
                }
                if(value == question.numberOfPoints-1){
                  return 1;
                }
                if(value == middlePip){
                  return 1;
                }
                return 0;
              }), 
    
              format: {
                to: (v) => {
                  if(v == 0){ 
                    return question.textLow;
                  }
                  if(v == question.numberOfPoints-1){
                    return question.textHigh;
                  }
                  if(v == middlePip) { // question.numberOfPoints / 2){
                    return question.textMiddle;
                  }
                  return v;
                }
              },          
            },
            orientation: "horizontal",
            direction: "ltr",
        });
        return slider;
      }

      let updateSlider = () => {
        let numberOfPoints = parseInt(question.numberOfPoints);
        let pipsValues = Array.from(Array(question.numberOfPoints).keys())
        let middlePip = pipsValues[(numberOfPoints-1) / 2];

        slider.updateOptions({
          range: {
            min: 0,
            max: numberOfPoints-1,
          },
          pips: {
            mode: "values",
            values: pipsValues,
            density:  (1.0 / (numberOfPoints)) * 100.0,
            filter: ((value, type) => { 
              if(value == 0){
                return 1;
              }
              if(value == middlePip){
                return 1;
              }
              if(value == numberOfPoints-1){
                return 1
              }
              return 0;
            }), 

            format: {
              to: (v) => {
                if(v == 0){ 
                  return question.textLow;
                }
                if(v == numberOfPoints-1){
                  return question.textHigh;
                }
                if(v == middlePip){
                  return question.textMiddle;
                }
                return v;
              }
            }
          }
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

      question.registerFunctionOnPropertyValueChanged("numberOfPoints", updateSlider);
      question.registerFunctionOnPropertyValueChanged("textLow", updateSlider);
      question.registerFunctionOnPropertyValueChanged("textHigh", updateSlider);
      question.registerFunctionOnPropertyValueChanged("textMiddle", updateSlider);

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
  init(Survey);
}

export default init;