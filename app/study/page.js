"use client"
import 'survey-core/defaultV2.min.css';
import useSWR from 'swr'
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { registerLikert } from '../widgets/QuestionLikertModel';
import theme from "../survey-theme";

const fetcher = (...args) => fetch(...args).then(res => res.json())

registerLikert();

export default function Home() {

  const params = useSearchParams()

  let group = parseInt(params.get("group"));
  let session = parseInt(params.get("session"));
  let subject = params.get("subject");

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/', fetcher)
  const { data: dataUser, error: errorUser, isLoading: isLoadingUser }= useSWR('http://localhost:3003/subjects/'+ subject, fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>
  if (errorUser) return <div>échec du chargement</div>
  if (isLoadingUser) return <div>chargement...</div>

  // xhr.open("PATCH", "http://localhost:3003/subjects/"+ subject);

  let surveyJson = data[0]["groups"][group]["time_periods"][session]["protocol"]
  const survey = new Model(surveyJson);

  survey.applyTheme(theme);

  survey.data = dataUser["result-S" + session]

  survey.onCurrentPageChanging.add(function (sender, options) {
    // Display the "Saving..." message (pass a string value to display a custom message)
    if(options.isNextPage){
      const xhr = new XMLHttpRequest();
      xhr.open("PATCH", "http://localhost:3003/subjects/"+ subject);
      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

      xhr.onload = xhr.onerror = function () {
        console.log("Response LOAD: ", xhr);
        if (xhr.status == 200 || xhr.status == 201) {
          // Display the "Success" message (pass a string value to display a custom message)
          // Alternatively, you can clear all messages:
          // options.clearSaveMessages();
        } else {
          // Display the "Error" message (pass a string value to display a custom message)
        }
      };

      let finalData = {}; 
      finalData["result-S" + session] = sender.data; 
      finalData["partial-S" + session] = true;

      xhr.send(JSON.stringify(finalData));
    }
  });

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
    finalData["partial-S" + session] = false;
    xhr.send(JSON.stringify(finalData));
  });


  return (
      <Survey model={survey} />
  )
}
    