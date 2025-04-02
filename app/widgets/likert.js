import * as Survey from "survey-core";

function init(Survey) {
  var widget = {
    name: "likert",
    title: "Likert",
    questionJSON: {
      type: "rating",
      isReadOnly: true
    },
    widgetIsLoaded: function () {
      return true
    },
    isFit: function (question) {
      return question.getType() === "likert";
    },
    htmlTemplate: `
      <div class='likert flex flex-nowrap gap-1 xl:gap-2 flex-row items-center justify-evenly'>
        
      </div>
    `,
    activatedByChanged: function (activatedBy) {
      Survey.JsonObject.metaData.addClass("likert", [], null, "empty");
      Survey.Serializer.addProperties("likert", [
        {
          name: "rateMin:number",
          category: "choices",
          default: 1
        }, 
        {
          name: "rateMax:number",
          category: "choices",
          default: 5,
        },
        {
          name: "rateDataValues",
          type: "itemvalues",
          category: "choices",
          default: [{value: 0, text: "Pas du tout d'accord"},
                    {value: 1, text: "Pas d’accord"},
                    {value: 2, text: "Neutre"},
                    {value: 3, text: "D'accord"}, 
                    {value: 4, text: "Tout à fait d'accord"}],
      }]) 
    },

    afterRender: function (question, currentElement) {
      let el = currentElement.children[0];
      var selectedItem = null;


      let isDisabled = () => { 
        let grandparent = currentElement.parentNode.parentNode;
        return grandparent.classList.contains('sd-question--disabled')
      }

      // TODO: update elementText when changed
      question.updateLikert = () => {
        // empty the el and then fill it with new values
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        
        // set all rateDataValues
        question.rateDataValues.forEach((element, index) => {
          var mainDiv = document.createElement("div");
          mainDiv.classList.add("likert-item");
          mainDiv.classList.add(question.id);
          mainDiv.setAttribute("item-id", index);

          if(question.value == element.value){
            mainDiv.classList.add("likert-item-selected");
          }
        
          var title = document.createElement("h5");
          var elementText = document.createTextNode(element.text);
          title.appendChild(elementText);
          mainDiv.appendChild(title);
          mainDiv.addEventListener("click", () => {
            if(isDisabled()){
              return;
            }
            selectedItem= mainDiv.getAttribute("item-id");
            question.value = element.value;
            let items = document.getElementsByClassName(`likert-item ${question.id}`);
            Array.prototype.forEach.call(items, ele => {
              if (selectedItem != ele.getAttribute("item-id"))
                ele.classList.remove("likert-item-selected");
              else
                ele.classList.add("likert-item-selected");
            });
          }); 

        el.appendChild(mainDiv);
      });
      }
      // first display
      question.updateLikert(); 
      question.registerFunctionOnPropertiesValueChanged(
        ["rateDataValues", "rateMin", "rateMax"],question.updateLikert
      );
    },
    willUnmount: function (question, currentElement) {
      question.unRegisterFunctionOnPropertiesValueChanged(
        ["rateDataValues", "rateMin", "rateMax"], question.updateLikert);
    }
  };

  Survey.CustomWidgetCollection.Instance.add(widget, "customtype");
}

if (typeof Survey !== "undefined") {
  init(Survey);
}else {
  console.log("Cannot init Likert widget");
}

export default init;
