"use client"
import 'survey-core/defaultV2.min.css';
import useSWR from 'swr'
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { registerLikert } from '../widgets/QuestionLikertModel';
import theme from "../survey-theme";
import useSWRImmutable from 'swr/immutable'

const fetcher = (...args) => fetch(...args).then(res => res.json())
const subjectFetcher = (...args) => fetch(...args).then(res => res.json())

registerLikert();

export default function Home() {

  // let study = fetchStudies();
  const params = useSearchParams()
  let group = parseInt(params.get("group"));
  let session = parseInt(params.get("session"));
  let subject = params.get("subject");

  // const { data: study, error: studyError, isLoading: loading1 }= useSWR('http://localhost:3003/studies/', fetcher)
  // const { data: subjectData, error: subjectError, isLoading: loading2 }= useSWR('http://localhost:3003/subjects/' + subject, subjectFetcher)

  const { data: study, error: studyError, isLoading: loading1 }= useSWRImmutable('http://localhost:3003/studies/', fetcher)
  const { data: subjectData, error: subjectError, isLoading: loading2 }= useSWRImmutable('http://localhost:3003/subjects/' + subject, subjectFetcher)

  if (studyError || subjectError) return <div>échec du chargement</div>

  if (loading1) return <div>chargement 1...</div>
  if (loading2) return <div>chargement 2...</div>

  //let surveyJson = study[0]["groups"][group]["time_periods"][session]["protocol"]
  let group_data = data[0]["groups"][group]["time_periods"]
  let session_data = group_data.find((time_period) => time_period["position"] == session);
  let surveyJson = session_data["protocol"]

  const survey = new Model(surveyJson);
  survey.applyTheme(theme);

  if(subjectData){
    let SurveyData = subjectData["result-S" + session];
    survey.data = SurveyData;
    survey.mode = "display";
  // survey.showPreview();
  }

  return (
    <Survey model={survey} />
  )
}
    