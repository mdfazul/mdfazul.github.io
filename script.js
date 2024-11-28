
function performSearch() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsBox = document.getElementById("info");
    // resultsBox.innerHTML = ""; // Clear previous results

    if (query) {
        
        getResult(query)
        // cloudflairAI(query)

        resultsBox.innerHTML = "<img id='loading' src='img/loading.gif' alt='loading'/>"
     
    } else {
        resultsBox.innerHTML = "<div class='text-center'><h3>Find out which ingredients are healthy or hazardous in your favorite packed foods, beverages, and groceries.<h3></div>";
    }
}

function handleEnter(event) {
    if (event.key === "Enter") {
        performSearch();
    }
}

function startVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById("searchInput").value = transcript;
            performSearch();
        };

        recognition.start();
    } else {
        alert("Voice recognition is not supported in your browser.");
    }
}

function navigateTo(sectionId) {
    const sections = document.querySelectorAll(".container");
    sections.forEach(section => section.classList.add("d-none"));

    document.getElementById(sectionId).classList.remove("d-none");
    if(sectionId == 'home'){
        sectionId = 'info'
        // const sections = document.querySelectorAll(".container");
        // sections.forEach(section => section.classList.add("d-none"));
        var x = document.getElementById("imgdiv");
        // var y = document.getElementById("hazimg");
        document.getElementById("helimg").style.visibility = "visible";

        document.getElementById("hazimg").style.visibility = "visible";

        document.getElementById("imgdiv").style.visibility = "visible";

        document.getElementById(sectionId).classList.remove("d-none");
    }else{
        document.getElementById("helimg").style.visibility = "hidden";

        document.getElementById("hazimg").style.visibility = "hidden";
        document.getElementById("imgdiv").style.visibility = "hidden";
        // y.style.display = "block";

    }
    // performSearch();
}

function getResult(query){

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDKaxSx4KQmuvyB4JRPnCO3n8nXy9VbbaY';
    const data = {
        "contents": [{
          "parts":[{"text": "list the healthy and hazard ingrediants in "+query+" explain in short form and bullet form and the response in json format"
             +" and json should have only healthy,hazard and disclaimer points and dont give json if its not food item"+
             ", share only json and dont add any other content to json and the json should have content in sequence of healthy, hazard and disclaimer."}]
          }]
         };
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    
    fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        outputText=data["candidates"][0]["content"]["parts"][0]["text"]
        // console.log(outputText);
        // JSON.parse(outputText)
        const resultsBox = document.getElementById("info");
             resultsBox.innerHTML =""

        loadResult(outputText)
        // resultsBox.innerHTML=outputText;
        // outputElement.textContent = JSON.stringify(data, null, 2);
      }) .catch(error => {
        // Handle any errors that occurred during the fetch or parsing
        console.error('There was a problem with the fetch operation:', error);
        errorMessage();
      });
}

async function loadResult(outputText){

    
    outputText = stringFormat(outputText);
  
     const info = document.getElementById("info");

     const disclaimer = document.getElementById("disclaimer");
     outputText = ""+outputText
     outputText = outputText.toString()
     outputText = outputText.replaceAll("```","")
     outputText = outputText.replaceAll("json","")
    // console.log(outputText)
    // console.log(outputText.includes("ingredient"))
    var ing = false;
    if (outputText.includes('"ingredient":')) {
        ing = true
    }
    console.log(outputText)

//     if(!isJsonString(outputText) && outputText.includes('"healthy":')){
//         outputText = await splitJSON(outputText);
//     }
// console.log(isJsonString(outputText))
    if(typeof(outputText) != "undefined" && isJsonString(outputText) && outputText.includes('"healthy":')){
        outputText = JSON.parse(outputText);
        // console.log(outputText)
    
    // console.log(outputText);
    const keys = Object.keys(outputText);
    console.log(keys[0]);
    let healthy=""
    // console.log(healthy)
    let hazard=""
    let disclaimerData=""

    if(keys[0] == "disclaimer"){
        healthy=outputText[Object.keys(outputText)[1]]
        // console.log(healthy)

        hazard=outputText[Object.keys(outputText)[2]]

        disclaimerData=outputText[Object.keys(outputText)[0]]
    } else{
        healthy=outputText[Object.keys(outputText)[0]]
        // console.log(healthy)

        hazard=outputText[Object.keys(outputText)[1]]

        disclaimerData=outputText[Object.keys(outputText)[2]]    
    }
    // console.log(disclaimerData);

    const ingName = document.createElement("h1");
    var IngNameValue = document.getElementById("searchInput").value.trim();
    IngNameValue = capitalizeFirstLetter(IngNameValue)
    ingName.innerHTML = IngNameValue+" Ingredients";
    info.appendChild(ingName)

    const ingDesc = document.createElement("p");
    ingDesc.innerHTML = IngNameValue+"'s ingredients vary by flavor. Here's a general overview of healthy and hazardous components:";
    info.appendChild(ingDesc)

    const disc = document.createElement("p");

    const healthyHeading = document.createElement("h2");
    const healthyList = document.createElement("ul");
    // healthyList.style.color="green";
    const hazardousList = document.createElement("ul");
    // hazardousList.style.color="red";

    healthyHeading.innerHTML = "Healthy Ingredients:";
    info.appendChild(healthyHeading)
    info.appendChild(healthyList)

    // console.log(outputText.includes("ingredient"))

    // console.log(healthy.length)
    if(healthy.length == 0 && hazard == 0){
      notFoodItem();
    }else {
    if(healthy.length == 0){
        const li = document.createElement("li");
        li.classList.add("healthy");
        li.innerHTML = "<b>No Healthy Ingrediants Available</b>";
        healthyList.appendChild(li);
    } else {
        // Populate healthy ingredients
        healthy.forEach(item => {
            // console.log(item)
            const li = document.createElement("li");
            li.classList.add("healthy");
            // console.log(item.includes("ingredient"))
            if (ing) {
                description = item[Object.keys(item)[1]];
                // console.log(description);
                li.innerHTML = `<strong>${item.ingredient}:</strong> ${description}`;
            }else{
                li.innerHTML = `<strong>${item}`;
            }
            healthyList.appendChild(li);
            // info.appendChild(healthyList)
        });
    }

    const hazardHeading = document.createElement("h2");
    hazardHeading.innerHTML = "Hazardous Ingredients:";

    info.appendChild(hazardHeading)
    info.appendChild(hazardousList)

    // console.log(hazard.length)
    if(hazard.length == 0){
        const li = document.createElement("li");
        li.classList.add("hazardous");
        li.innerHTML = "<b>No Hazard Ingrediants Available</b>";
        hazardousList.appendChild(li);
    }else {
        // Populate hazardous ingredients
        hazard.forEach(item => {
            const li = document.createElement("li");
            li.classList.add("hazardous");
            if (ing) {
                description = item[Object.keys(item)[1]];
                li.innerHTML = `<strong>${item.ingredient}:</strong> ${description}`;
            }else{
                li.innerHTML = `<strong>${item}`;
            }                    
            hazardousList.appendChild(li);
        });
        }

    // Set disclaimer text
    disc.innerHTML = "<b>Disclaimer: </b>"+disclaimerData;
    info.appendChild(disc)
}
    // } else {
    //     notFoodItem()
    // }
  }else {
    notFoodItem();
  }

// Call the function to render the data
// loadResult();
}

function stringFormat(result){
    // console.log(result);
    if(result)
        result = result.replaceAll("*","");
    return result;
}

async function cloudflairAI(queryStr){

    async function run(model, input) {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/724288a7048e5e871342a51d7bef6b6e/ai/run/${model}`,
          {
            headers: { Authorization: "Bearer 724288a7048e5e871342a51d7bef6b6e"},
            method: "POST",
            mode: 'no-cors',
            body: JSON.stringify(input),
          }
        );
        const result = await response.json();
        return result;
      }
      
      run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          {
            role: "system",
            content: "You are a friendly assistan that helps write stories",
          }
        ],
      }).then((response) => {
        console.log(JSON.stringify(response));
      });

           
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

function notFoodItem(){
    var IngNameValue = document.getElementById("searchInput").value.trim();
    const info = document.getElementById("info");
    info.innerHTML="<h4><b>Oooops...</b>I cannot provide a ingrediant details because <b>"+IngNameValue+
    "</b> is not a recognized food item or we are not aware of it. <br> I need the name of a specific food to analyze its ingredients.</h4>"
}

function errorMessage(){
    // var IngNameValue = document.getElementById("searchInput").value.trim();
    const info = document.getElementById("info");
    info.innerHTML="<h1 style='color:red'>Oops! Something went wrong. Please try again later.</h1>"
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

async function splitJSON(jdata){

    var api_data = await getData(jdata)
      console.log("---------------------------------------------------");
      api_data = api_data.replaceAll("```","")
      api_data = api_data.replaceAll("json","")
      api_data = api_data.replaceAll("Here's the JSON extracted from the text:","")
      console.log(api_data);

      return api_data;

}

async function getData(jdata) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDKaxSx4KQmuvyB4JRPnCO3n8nXy9VbbaY';
    const data = {
        "contents": [{
          "parts":[{"text": "split json from text '"+jdata+"' and provide only json no other text"}]
          }]
         };
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    // output = "";
    const data1 = await fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();      
      })
       .catch(error => {
        // Handle any errors that occurred during the fetch or parsing
        console.error('There was a problem with the fetch operation:', error);
        errorMessage();
      });
    console.log(data1["candidates"][0]["content"]["parts"][0]["text"])
    // console.log(data1)

    return data1["candidates"][0]["content"]["parts"][0].text
  }