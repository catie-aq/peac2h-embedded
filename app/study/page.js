"use client"
import 'survey-core/defaultV2.min.css';
import useSWR from 'swr'
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const fetcher = (...args) => fetch(...args).then(res => res.json())

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

  console.log("Current Group: ", params.get("group"));
  console.log("Current Session: ", params.get("session"));

  let group = parseInt(params.get("group"));
  let session = parseInt(params.get("session"));

  console.log("Loading: group: ", group, " session:", session);

  let surveyJson = data[0]["groups"][group]["time_periods"][session]["protocol"]
  const survey = new Model(surveyJson);


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">
        Hello World 
      </h1>
      <Survey model={survey} />
    </main>
  )
}
    