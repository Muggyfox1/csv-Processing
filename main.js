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
}
let inputs = {
    CSVObject:[]
}

const fileSelector = document.getElementById('file-input');
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
        .concat(otherPeople);

        let family = {lastName: lineSplits[0], people: people};
        return family;
    })
    .filter(f => f != undefined)
    .slice(1);
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
    console.log("creating new file")
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
    while(CSVObjRef.length > 0){
        let familiesPerDay = Math.floor(CSVObjRef.length / (durationInput.value - dayCount));
        console.log(familiesPerDay);

        let day = document.createElement("li");
        day.innerText = "Day";
        dayCount++;
        let familyListOfDay = document.createElement("ul");

        for (let i = 0; i < familiesPerDay && CSVObjRef.length > 0 || 
            dayCount == durationInput.value && CSVObjRef.length > 0; i++) {
            let family = document.createElement("li");
            let familyFromCSV = CSVObjRef.pop();
            family.innerText = familyFromCSV.lastName;
            familyListOfDay.append(family);
        }
        day.append(familyListOfDay);
        previewList.append(day);
    }
}