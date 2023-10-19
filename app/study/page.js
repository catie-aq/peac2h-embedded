"use client"
import 'survey-core/defaultV2.min.css';
import useSWR from 'swr'
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { registerLikert } from '../widgets/QuestionLikertModel';

const fetcher = (...args) => fetch(...args).then(res => res.json())

registerLikert();

export default function Home() {

  // let study = fetchStudies();

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/', fetcher)
  const params = useSearchParams()

  // let surveyJson = {
  //   elements: [{
  //     name: "FirstName",
  //     title: "Enter your first name:",
  //     type: "text"
  //   }, {
  //     name: "LastName",
  //     title: "Enter your last name:",
  //     type: "text"
  //   }]
  // };

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>


  let group = parseInt(params.get("group"));
  let session = parseInt(params.get("session"));
  let subject = params.get("subject");

  let surveyJson = data[0]["groups"][group]["time_periods"][session]["protocol"]
  const survey = new Model(surveyJson);

  survey.applyTheme({
 
    "colorPalette": "light",
    "cssVariables": {
        "--sjs-general-backcolor": "rgba(255, 255, 255, 1)",
        "--sjs-general-backcolor-dark": "rgba(248, 248, 248, 1)",
        "--sjs-general-backcolor-dim": "#ffffff",
        "--sjs-general-backcolor-dim-light": "rgba(249, 249, 249, 1)",
        "--sjs-general-backcolor-dim-dark": "rgba(243, 243, 243, 1)",
        "--sjs-general-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-general-dim-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-dim-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-primary-backcolor": "rgba(25, 179, 148, 1)",
        "--sjs-primary-backcolor-light": "rgba(25, 179, 148, 0.1)",
        "--sjs-primary-backcolor-dark": "rgba(20, 164, 139, 1)",
        "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
        "--sjs-base-unit": "8px",
        "--sjs-corner-radius": "4px",
        "--sjs-secondary-backcolor": "rgba(255, 152, 20, 1)",
        "--sjs-secondary-backcolor-light": "rgba(255, 152, 20, 0.1)",
        "--sjs-secondary-backcolor-semi-light": "rgba(255, 152, 20, 0.25)",
        "--sjs-secondary-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-secondary-forecolor-light": "rgba(255, 255, 255, 0.25)",
        "--sjs-shadow-small": "0px 1px 2px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-medium": "0px 2px 6px 0px rgba(0, 0, 0, 0.1)",
        "--sjs-shadow-large": "0px 8px 16px 0px rgba(0, 0, 0, 0.1)",
        "--sjs-shadow-inner": "inset 0px 1px 2px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-border-light": "rgba(0, 0, 0, 0.09)",
        "--sjs-border-default": "rgba(0, 0, 0, 0.16)",
        "--sjs-border-inside": "rgba(0, 0, 0, 0.16)",
        "--sjs-special-red": "rgba(229, 10, 62, 1)",
        "--sjs-special-red-light": "rgba(229, 10, 62, 0.1)",
        "--sjs-special-red-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-special-green": "rgba(25, 179, 148, 1)",
        "--sjs-special-green-light": "rgba(25, 179, 148, 0.1)",
        "--sjs-special-green-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-special-blue": "rgba(67, 127, 217, 1)",
        "--sjs-special-blue-light": "rgba(67, 127, 217, 0.1)",
        "--sjs-special-blue-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-special-yellow": "rgba(255, 152, 20, 1)",
        "--sjs-special-yellow-light": "rgba(255, 152, 20, 0.1)",
        "--sjs-special-yellow-forecolor": "rgba(255, 255, 255, 1)",
        "--sjs-article-font-xx-large-textDecoration": "none",
        "--sjs-article-font-xx-large-fontWeight": "700",
        "--sjs-article-font-xx-large-fontStyle": "normal",
        "--sjs-article-font-xx-large-fontStretch": "normal",
        "--sjs-article-font-xx-large-letterSpacing": "0",
        "--sjs-article-font-xx-large-lineHeight": "64px",
        "--sjs-article-font-xx-large-paragraphIndent": "0px",
        "--sjs-article-font-xx-large-textCase": "none",
        "--sjs-article-font-x-large-textDecoration": "none",
        "--sjs-article-font-x-large-fontWeight": "700",
        "--sjs-article-font-x-large-fontStyle": "normal",
        "--sjs-article-font-x-large-fontStretch": "normal",
        "--sjs-article-font-x-large-letterSpacing": "0",
        "--sjs-article-font-x-large-lineHeight": "56px",
        "--sjs-article-font-x-large-paragraphIndent": "0px",
        "--sjs-article-font-x-large-textCase": "none",
        "--sjs-article-font-large-textDecoration": "none",
        "--sjs-article-font-large-fontWeight": "700",
        "--sjs-article-font-large-fontStyle": "normal",
        "--sjs-article-font-large-fontStretch": "normal",
        "--sjs-article-font-large-letterSpacing": "0",
        "--sjs-article-font-large-lineHeight": "40px",
        "--sjs-article-font-large-paragraphIndent": "0px",
        "--sjs-article-font-large-textCase": "none",
        "--sjs-article-font-medium-textDecoration": "none",
        "--sjs-article-font-medium-fontWeight": "700",
        "--sjs-article-font-medium-fontStyle": "normal",
        "--sjs-article-font-medium-fontStretch": "normal",
        "--sjs-article-font-medium-letterSpacing": "0",
        "--sjs-article-font-medium-lineHeight": "32px",
        "--sjs-article-font-medium-paragraphIndent": "0px",
        "--sjs-article-font-medium-textCase": "none",
        "--sjs-article-font-default-textDecoration": "none",
        "--sjs-article-font-default-fontWeight": "400",
        "--sjs-article-font-default-fontStyle": "normal",
        "--sjs-article-font-default-fontStretch": "normal",
        "--sjs-article-font-default-letterSpacing": "0",
        "--sjs-article-font-default-lineHeight": "28px",
        "--sjs-article-font-default-paragraphIndent": "0px",
        "--sjs-article-font-default-textCase": "none"
    },
    "themeName": "default",
    "isPanelless": false
  });

  // const SurveyPdf = await import(/* webpackChunkName: "survey-viewer" */ 'survey-pdf/survey.pdf');
   // New import 
  //  noUiWidget(SurveyCore, noUiSlider);
  //  noUiWidget(SurveyCore, noUiSlider);
  //  noUiWidgetTLX(SurveyCore, noUiSlider);
  //  noUiWidgetCustom(SurveyCore, noUiSlider);
   // likert(survey);

  //  likertMatrix(SurveyCore);
  
  // Saving in progress...

    survey.onComplete.add(function (sender, options) {
      // Display the "Saving..." message (pass a string value to display a custom message)
      options.showSaveInProgress();
      const xhr = new XMLHttpRequest();
      xhr.open("PATCH", "http://localhost:3003/subjects/"+ subject);
      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

      xhr.onload = xhr.onerror = function () {

        console.log("Response LOAD: ", xhr);
        if (xhr.status == 200 || xhr.status == 201) {
          // Display the "Success" message (pass a string value to display a custom message)
          options.showSaveSuccess();
          // Alternatively, you can clear all messages:
          // options.clearSaveMessages();
        } else {
          // Display the "Error" message (pass a string value to display a custom message)
          options.showSaveError();
        }
      };

      let finalData = {}; 
      finalData["result-S" + session] = sender.data;

      xhr.send(JSON.stringify(finalData));
    });


  return (
   
      <Survey model={survey} />

  )
}
    