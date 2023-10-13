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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">
        Hello World 
      </h1>
      <Survey model={survey} />
    </main>
  )
}
    