
const nb_subjects = 10;
const studySubjects = Array.from({ length: nb_subjects }, (_, i) => i + 1);


console.log(process.env.NEXT_PUBLIC_JSON_SERVER_URL)

studySubjects.map(id => {
  fetch("http://localhost:3003" + `/subjects/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `s_${id}`, // name instead of id to avoid duplicate ids within multiple studies, maybe to reconsider
      group: 0,
      studyId: 3
    })
  })
    .then(response => response.json())
    .then(data => { 
      // console.log("Deleted subject", subject.name)
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
})
