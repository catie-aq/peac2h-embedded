export function convertResultsToCSV(result) {
  let headers = ["Sujet"];
  let rows = [];

  let row = {};
  row["Sujet"] = result.name;
  
  Object.entries(result["result-S0"]).forEach(([key, value]) => {
      let formattedKey = formatKey(key);
      
      if (typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([subKey, subValue]) => {
              if (typeof subValue === 'object') {
                  Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
                      let nestedKey = `${formattedKey}${subKey}_${subSubKey}`;
                      row[nestedKey] = subSubValue;
                      if (!headers.includes(nestedKey)) headers.push(nestedKey);
                  });
              } else {
                  let nestedKey = `${formattedKey}${subKey}`;
                  row[nestedKey] = subValue;
                  if (!headers.includes(nestedKey)) headers.push(nestedKey);
              }
          });
      } else {
          row[formattedKey] = Array.isArray(value) ? value.join("::") : value;
          if (!headers.includes(formattedKey)) headers.push(formattedKey);
      }
  });
  rows.push(row);

  let csvContent = headers.join(";") + "\n";
  rows.forEach(row => {
      csvContent += headers.map(header => row[header] || "").join(";") + "\n";
  });

  console.log(csvContent)

  return csvContent;
}

function formatKey(key) {
  return key.replace(/GP:(\d+)-TP:(\d+)-EC:(\d+)::/, "GP-$1::SE-$2::question::page$3::");
}

// 📌 Fonction pour télécharger le CSV en React
export function downloadCSV(result, session) {
  const csvData = convertResultsToCSV(result);
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Resultats_${result.name}_S${session}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
