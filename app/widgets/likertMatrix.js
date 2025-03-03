import * as Survey from "survey-core";

// Handle CK and K .. 
function init(Survey) {
  var widget = {
    name: "likertmatrix",
    title: "LikertMatrix",
    widgetIsLoaded: function () {
      return true
    },
    isFit: function (question) {
      return question.getType() === "likertmatrix";
    },
    htmlTemplate: `

    `,
    activatedByChanged: function (activatedBy) {
      Survey.JsonObject.metaData.addClass("likertmatrix", [], null, "empty");

      Survey.JsonObject.metaData.addClass("itemvalue_ex", [{
        name: "Texte2",
        type: "string",
      }], null, "itemvalue");


      Survey.Serializer.addProperty("likertmatrix", {
        name: "choiceValue:itemvalues",
        category: "choices",
        default: [-3,-2,-1,0,1,2,3]
      });

      Survey.Serializer.addProperty("likertmatrix", {
        name: "rows:itemvalues",
        category: "choices",
        type: "itemvalue_ex[]",
        default: ["item1", "item2"]
      });

    },
    afterRender: function (question, el) {
      
      let results;
      question.value !== undefined ? results = question.value : results = new Object();

      let isDisabled = () => { 
        let grandparent = el.parentNode.parentNode;
        return grandparent.classList.contains('sd-question--disabled')
      }

      el.classList.add("likert-matrix", "grid-cols-4", "grid")

      question.createQuestion = () => {
        
        // Cleanup
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        
        question.rows.forEach((questionElement,ind) => {

          // var row = document.createElement("div")
          // row.classList.add("likert-matrix-row")
          // row.classList.add("row-"+ (ind+1))

          var divTextOne= document.createElement('div')
          var divItems= document.createElement('div')
          var divTextTwo= document.createElement('div')

          // First, second texts and div for items
          divTextOne.classList.add("likert-matrix-text")
          divItems.classList.add("likert-matrix-items", "col-span-2")
          divTextTwo.classList.add("likert-matrix-text")

          var titleOne = document.createElement("span");
          var titleTwo = document.createElement("span");

          titleOne.classList.add("sv-string-viewer");
          titleTwo.classList.add("sv-string-viewer");

          titleOne.innerHTML=questionElement.text
          // titleTwo.innerHTML=questionElement.bindingsValue.obj.Texte2
          titleTwo.innerHTML=questionElement.Texte2

          divTextOne.appendChild(titleOne);
          divTextTwo.appendChild(titleTwo);

          var selectedItem = null;

          question.choiceValue.forEach((element, index) => {
            //let item= document.createElement('input')
            //let typeAttrib = item.createAttribute("type"); 
            //typeAttrib.value = "radio";

            let item= document.createElement('div')
            item.classList.add("likert-matrix-item")
            item.classList.add(question.id);
            item.classList.add("row-"+(ind+1));
            item.setAttribute("item-id", index+1);

            // if row result exist 
            if(results[questionElement.value]){
              // check index of the result that equal registred value
              question.choiceValue.forEach((e,i) => {
                if(e.text == results[questionElement.value] && item.getAttribute("item-id") == (i+1) )
                  item.classList.add("likert-matrix-item-selected");
              });
            }

            item.addEventListener("click", () => {
              if(isDisabled()){
                return;
              }
              selectedItem = item.getAttribute("item-id");

              // Take question name 
              // results[`Row ${(ind+1)}`] = element.text
              results[questionElement.value] = element.text;
            
              question.value = results;
              // Loop for active/desactive selected items
              let items = document.getElementsByClassName(`likert-matrix-item ${question.id} row-${(ind+1)}`);
              Array.prototype.forEach.call(items, selectedElement => {
                if (selectedItem != selectedElement.getAttribute("item-id"))
                  selectedElement.classList.remove("likert-matrix-item-selected");
                else 
                  selectedElement.classList.add("likert-matrix-item-selected");
              });
            });

            divItems.appendChild(item)
          })

          el.appendChild(divTextOne);
          el.appendChild(divItems)
          el.appendChild(divTextTwo);
        });

      };

      question.createQuestion(); 
      question.registerFunctionOnPropertiesValueChanged(
        ["choiceValue", "rows"], question.createQuestion
      );

    }, 
    willUnmount: function (question, currentElement) { 
      question.unRegisterFunctionOnPropertiesValueChanged(
        ["choiceValue", "rows"], question.createQuestion
      );
    }
  };

  Survey.CustomWidgetCollection.Instance.add(widget, "customtype");
}

if (typeof Survey !== "undefined") {
  init(Survey);
}else {
  console.log("Cannot init LikertMatrix Widget")
}

export default init;
