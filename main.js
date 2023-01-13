let enviroment = {
    set loading(value){
        this._loading = value;
        if(value){
            isLoading();
        } else {
            doneLoading();
        }
    },
    get loading(){
        return this._loading;
    },
    _loading: false,
    downloadList:""
}
let data = {
    CSVObject:[],
    shuffledCSV:"",
    origionalCSV:""
}

const fileSelector = document.getElementById('file-input');
fileSelector.value = null;
fileSelector.addEventListener('change', (event) => {
    enviroment.loading = true
    const file = event.target.files[0];
    file.text()
    .then((csvString) => {
        localStorage.setItem("valueSource", csvString)
        data.origionalCSV = csvString
        enviroment.loading = false;
    });
});

const durationInput = document.getElementById('duration');
const loadingBar = document.getElementById('loading-bar');
const generateButton = document.getElementById('generate-button');
const previewList = document.getElementById("list");

function submit(){
    enviroment.loading = true;
    shuffleList();
    processCSV();
    createListPreview();
    createNewFile();
    enviroment.loading = false;
}

function isLoading(){
    loadingBar.classList.remove("hidden");
    generateButton.disabled = true;
}

function doneLoading(){
    loadingBar.classList.add("hidden");
    if(data.origionalCSV.length > 0){
        generateButton.disabled = false;
    }
}

function processCSV(){
    data.CSVObject = data.shuffledCSV.split("\r\n");
    data.CSVObject.slice(0,1);
    data.CSVObject = data.CSVObject.map(line => {
        let lineSplits = line.split(";")
        if (lineSplits.length < 3){
            return;
        }
        let otherPeople = lineSplits[2].split(", ");
        otherPeople[otherPeople.length - 1].trim();
        otherPeople = otherPeople.filter(p => p.length > 0);
        
        let people = lineSplits[1].split("&")
        .concat(otherPeople).map(person => person.trim());

        let family = {lastName: lineSplits[0], people: people};
        return family;
    })
    .filter(f => f != undefined)
    .slice(1);
    
    localStorage.setItem("list", data.CSVObject);
}

function createNewFile(){
    let csvStringRef = data.shuffledCSV.slice(0)
    .split("\r\n")
    .filter(l => l.length > 0);
    let headers = csvStringRef.shift()
    headers = "Day;" + headers;
    csvStringRef = csvStringRef.map(line => ";" + line);

    let dayCount = 0;
    let textArray = [];
    while(csvStringRef.length > 0){
        let familiesPerDay = Math.floor(csvStringRef.length / (durationInput.value - dayCount));

        let dayText = "Day: " + (dayCount + 1);
        dayCount++;

        for (let i = 0; i < familiesPerDay && csvStringRef.length > 0 || 
            dayCount == durationInput.value && csvStringRef.length > 0; i++) {
            
            let familyFromCSV = csvStringRef.pop();
            textArray.push(dayText + familyFromCSV)
            dayText = "";
        }
    }

    textArray.unshift(headers);
    enviroment.downloadList = textArray.join("\n");
    localStorage.setItem("listForDownload", enviroment.downloadList);
    createDownloadLink("List.csv", enviroment.downloadList)
}

function shuffleList(){
    let splitCSV = data.origionalCSV.slice(0).split("\r\n");
    let headers = splitCSV.shift();

    let newList = [];
    while(splitCSV.length > 0){
        let index = getRandomInt(data.CSVObject.length);
        newList.push(splitCSV.splice(index ,1)[0]);
    }
    newList.unshift(headers);
    data.shuffledCSV = newList.join("\r\n");
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createListPreview(){
    previewList.innerHTML = "";
    let CSVObjRef = data.CSVObject.slice(0);

    let dayCount = 0;
    let today = new Date();
    while(CSVObjRef.length > 0){
        let familiesPerDay = Math.floor(CSVObjRef.length / (durationInput.value - dayCount));

        let day = document.createElement("div");
        day.innerText = "Day: " + (dayCount + 1) + ", ";
        
        dayCount++;
        today.setDate(today.getDate() + 1)

        let familyListOfDay = document.createElement("ul");

        for (let i = 0; i < familiesPerDay && CSVObjRef.length > 0 || 
            dayCount == durationInput.value && CSVObjRef.length > 0; i++) {
            let family = document.createElement("li");
            let familyFromCSV = CSVObjRef.pop();
            family.innerText = familyFromCSV.lastName;
            
            let peopleInFamily = document.createElement("ul");
            familyFromCSV.people.forEach(personName => {
                let person = document.createElement("li");
                person.innerText = personName.trim();
                peopleInFamily.append(person);
            });

            family.append(peopleInFamily);
            familyListOfDay.append(family);

        }
        day.append(familyListOfDay);
        previewList.append(day);
    }

    localStorage.setItem("previewList", previewList.innerHTML);
}

function createDownloadLink(filename, text) {
    var element = document.getElementById('download');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.classList.remove("hidden");
}

function loadLocalStorage(){
    enviroment.loading = true;
    let csvString = localStorage.getItem("valueSource");
    if(csvString){
        data.origionalCSV = csvString;
        processCSV(csvString);
    }
    
    let previewListInnerHTML = localStorage.getItem("previewList"); 
    if(previewListInnerHTML){
        previewList.innerHTML = previewListInnerHTML;
    }

    let listForDownload = localStorage.getItem("listForDownload"); 
    if(listForDownload){
        enviroment.downloadList = listForDownload;
        createDownloadLink("List.txt", listForDownload)
    }
    enviroment.loading = false;
}
loadLocalStorage();