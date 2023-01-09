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
let inputs = {
    CSVObject:[]
}

const fileSelector = document.getElementById('file-input');
fileSelector.value = null;
fileSelector.addEventListener('change', (event) => {
    enviroment.loading = true
    const file = event.target.files[0];
    file.text()
    .then((csvString) => {
        processCSV(csvString);
        enviroment.loading = false;
    });
});

const durationInput = document.getElementById('duration');

const loadingBar = document.getElementById('loading-bar');
const generateButton = document.getElementById('generate-button');
const previewList = document.getElementById("list");

function processCSV(csvString){
    inputs.CSVObject = csvString.split("\r\n");
    inputs.CSVObject.slice(0,1);
    inputs.CSVObject = inputs.CSVObject.map(line => {
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
    
    localStorage.setItem("list", inputs.CSVObject);
}

function submit(){
    enviroment.loading = true;
    shuffleList();
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
    if(inputs.CSVObject.length > 0){
        generateButton.disabled = false;
    }
}

function createNewFile(){
    let CSVObjRef = inputs.CSVObject.slice(0);
    let textArray = [];
    let dayCount = 0;
    let today = new Date();
    while(CSVObjRef.length > 0){
        let familiesPerDay = Math.floor(CSVObjRef.length / (durationInput.value - dayCount));

        dayText = "Day: " + (dayCount + 1) + ", "
        + (today.getMonth() + 1) + "/" + today.getDate();
        textArray.push(dayText);

        dayCount++;
        today.setDate(today.getDate() + 1)

        for (let i = 0; i < familiesPerDay && CSVObjRef.length > 0 || 
            dayCount == durationInput.value && CSVObjRef.length > 0; i++) {
            
            let familyFromCSV = CSVObjRef.pop();
            textArray.push("    " + familyFromCSV.lastName + ":");
            
            familyFromCSV.people.forEach(personName => {
                textArray.push("        " + personName.trim());
            });

            textArray.push("")
        }
    }

    enviroment.downloadList = textArray.join("\n");
    localStorage.setItem("listForDownload", enviroment.downloadList);

    createDownloadLink("List.txt", enviroment.downloadList)
}

function shuffleList(){
    let newList = [];
    while(inputs.CSVObject.length > 0){
        let index = getRandomInt(inputs.CSVObject.length);
        newList.push(inputs.CSVObject.splice(index ,1)[0]);
    }
    inputs.CSVObject = newList;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createListPreview(){
    previewList.innerHTML = "";
    let CSVObjRef = inputs.CSVObject.slice(0);

    let dayCount = 0;
    let today = new Date();
    while(CSVObjRef.length > 0){
        let familiesPerDay = Math.floor(CSVObjRef.length / (durationInput.value - dayCount));

        let day = document.createElement("li");
        day.innerText = "Day: " + (dayCount + 1) + ", "
        + (today.getMonth() + 1) + "/" + today.getDate();
        
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

function loadLocalStorage(){
    enviroment.loading = true;
    let previewListInnerHTML = localStorage.getItem("previewList"); 
    if(previewListInnerHTML){
        previewList.innerHTML = previewListInnerHTML;
    }

    let listForDownload = localStorage.getItem("listForDownload"); 
    if(listForDownload){
        enviroment.downloadList = listForDownload;
        createDownloadLink("List.txt", listForDownload)
        console.log(listForDownload);
    }
    enviroment.loading = false;
}
loadLocalStorage();

function createDownloadLink(filename, text) {
    var element = document.getElementById('download');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.classList.remove("hidden");
  }