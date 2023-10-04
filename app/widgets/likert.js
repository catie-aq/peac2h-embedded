

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
      <div class='likert'>
        <div class='likert-container'>
        </div>
      </div>
    `,
    activatedByChanged: function (activatedBy) {
      Survey.JsonObject.metaData.addClass("likert", [], null, "empty");
      Survey.Serializer.addProperties("likert", [
        {
          name: "rateMin:number",
          category: "Barème",
          default: 1
        }, 
        {
          name: "rateMax:number",
          category: "Barème",
          default: 5,
        },
        {
          name: "rateDataValues:itemvalues",
          category: "Barème",
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

      // set all rateDataValues
      question.rateDataValues.forEach((element, index) => {
        var mainDiv = document.createElement("div");
        mainDiv.classList.add("likert-item");
        mainDiv.classList.add(question.id);
        mainDiv.setAttribute("item-id", index);
        var title = document.createElement("h5");
        var elementText = document.createTextNode(element.text);
        title.appendChild(elementText);
        mainDiv.appendChild(title);

        if(question.value == index)
          mainDiv.classList.add("likert-item-selected");
          mainDiv.addEventListener("click", function displayDate() {
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

      // TODO: update elementText when changed
      let updateLikert = () => {

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
          var title = document.createElement("h5");
          var elementText = document.createTextNode(element.text);
          title.appendChild(elementText);
          mainDiv.appendChild(title);
          mainDiv.addEventListener("click", function displayDate() {
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


      question.registerFunctionOnPropertiesValueChanged(
        ["rateDataValues", "rateMin", "rateMax"],
        updateLikert
      );

      // question.registerFunctionOnPropertyValueChanged("rateDataValues", updateLikert);
      // question.registerFunctionOnPropertyValueChanged("rateMin", updateLikert);
      // question.registerFunctionOnPropertyValueChanged("rateMax", updateLikert);


    }
  };

  Survey.CustomWidgetCollection.Instance.add(widget, "customtype");
}

if (typeof Survey !== "undefined") {
  init(Survey);
}

export default init;
