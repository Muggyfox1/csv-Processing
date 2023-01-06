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
    CSVObject:[],
    duration:1
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
durationInput.addEventListener('change', (event) => {
    duration = event.target.value;
});

const loadingBar = document.getElementById('loading-bar');

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
    shuffleList();
    createNewFile();
    console.log("submitted")
}

function isLoading(){
    loadingBar.classList.remove("hidden");
}

function doneLoading(){
    loadingBar.classList.add("hidden");
}

function createNewFile(){
    console.log("creating new file")
}

function shuffleList(){
    let newList = [];
    while(inputs.CSVObject.length > 0){
        let index = getRandomInt(inputs.CSVObject.length - 1);
        newList.push(inputs.CSVObject.splice(index ,1)[0]);
    }
    inputs.CSVObject = newList;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}