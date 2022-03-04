function loadPage() {
    getCargo();
    setDateValue();
}

/**
 * Устанавливает стартовые значения для календаря.
 */
function setDateValue() {
    let date = new Date();
    date.setTime(date.getTime() + (40 * 60 * 60 * 1000));
    document.getElementById("calendar").value = date.toISOString().substring(0, 10);
    document.getElementById("calendar").min = date.toISOString().substring(0, 10);
    date.setDate(date.getDate() + 43);
    document.getElementById("calendar").max = date.toISOString().substring(0, 10);
}

/**
 * Получает JSON с грузами с сайта и затем добавляет их в datalist.
 */
function getCargo() {
    let requestURL = 'https://isales.trcont.com/account-back/cargo/reference/?type=container';
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onload = function () {
        cargosJSON = request.response;
        parseCargo();
    }
}

/**
* Добавляет грузы из JSON в datalist.
*/
function parseCargo() {
    let listNameElement = document.getElementById("cargo");
    for (let j = 0; j < cargosJSON.length; j++) {
        for (let i = 0; i < cargosJSON[j].children.length; i++) {
            let newOptionElement = document.createElement("option");
            newOptionElement.textContent = cargosJSON[j].children[i].name;

            listNameElement.appendChild(newOptionElement);
        }
    }
}

/**
 * Ищет код груза в JSON грузов.
 * @param {*} cargoJSON JSON грузов.
 * @param {*} text Имя груза.
 * @returns Код груза или -1, если груз с таким именем не найден.
 */
function searchCargo(text) {
    for (let j = 0; j < cargosJSON.length; j++) {
        for (let i = 0; i < cargosJSON[j].children.length; i++) {
            if (cargosJSON[j].children[i].name === text) {
                return cargosJSON[j].children[i];
            }
        }
    }
    return undefined;
}

/**
 * Запускает таймер после изменения текстового поля. По истечению таймера загружает доступные пункты отправки/прибытия в соответсвующий datalist.
 * @param {string} typePoint Тип пункта (отправки(from) или прибытия(to)).
 */
function inputNamePoint(typePoint) {
    let form = document.forms.searchForm;
    let input;

    document.getElementById("addCardButton").disabled = true;

    if (timerId != undefined)
        clearTimeout(timerId);

    if (typePoint == "departure") {
        input = form.elements.departure;
        if (input.value != "")
            timerId = setTimeout(getDeparturePoint, 1000, input);
    }
    else {
        input = form.elements.destination;
        if (input.value != "")
            timerId = setTimeout(getDestinationPoint, 1000, input);
    }
}

/**
 * Получает и добавляет пункты отправки/прибытия в соответсвующий datalist.
 * @param {*} point Поле, в котором изменяются данные (from или to).
 */
function getDeparturePoint(input) {
    let url = "https://isales.trcont.com/account-back/calc/available-item/";
    let request = new XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = 'json';
    let data = JSON.stringify({
        "departure": input.value,
        "transferType": "container"
    });
    request.send(data);

    request.onload = function () {
        if (request.response.length != 0) {
            departurePointJSON = request.response;
            parsePoint(request.response, input);
        }
        document.getElementById("addCardButton").disabled = false;
    }
}

function getDestinationPoint(input) {
    let url = "https://isales.trcont.com/account-back/calc/available-item/";
    let request = new XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = 'json';
    let data = JSON.stringify({
        "destination": input.value,
        "transferType": "container"
    });
    request.send(data);

    request.onload = function () {
        if (request.response.length != 0) {
            destinationPointJSON = request.response;
            parsePoint(request.response, input);
        }
        document.getElementById("addCardButton").disabled = false;
    }
}

/**
 * Добавляет точки из JSON в datalist отправления/прибытия.
 * @param {json} jsonObj JSON с точками отправления/прибытия.
 * @param {*} input Поле в которое вводится значение и в datalist которого добавляются точки отправления/прибытия.
 */
function parsePoint(jsonObj, input) {
    let listNameElement = document.getElementById(input.id + "List");

    let length = listNameElement.options.length;
    for (i = length - 1; i >= 0; i--) {
        listNameElement.options[i].remove();
    }
    for (let j = 0; j < jsonObj.length; j++) {
        let newOptionElement = document.createElement("option");
        newOptionElement.textContent = jsonObj[j].title;

        listNameElement.appendChild(newOptionElement);
    }
}

function searchDeparturePoint(text) {
    for (let i = 0; i < departurePointJSON.length; i++) {
        if (departurePointJSON[i].title == text) {
            return departurePointJSON[i];
        }
    }
    return undefined;
}

function searchDestinationPoint(text) {
    for (let i = 0; i < destinationPointJSON.length; i++) {
        if (destinationPointJSON[i].title == text) {
            return destinationPointJSON[i];
        }
    }
    return undefined;
}

/**
 * Создаёт новую карточку-запрос и кнопку удаления к ней.
 */
function clickAddRequestCard() {
    cargoJSON = searchCargo(document.getElementById("cargolist").value);

    if (cargoJSON == undefined) {
        alert("Груз не найден!");
        return;
    }

    let departure = searchDeparturePoint(document.getElementById("departure").value),
        destination = searchDestinationPoint(document.getElementById("destination").value);

    if (departure == undefined || destination == undefined) {
        alert("Не указаны все пункты!");
        return;
    }

    if (document.getElementById("calendar").value == "") {
        alert("Отсутсвует дата!");
        return;
    }

    let drv = [];

    if(document.getElementById("box1").checked == true && document.getElementById("box2").checked == true){
        drv = (["DRV_20FT_30T", "DRV_20FT_24T", "DRV_40FT_30T"]);
    }
    else{
        if (document.getElementById("box1").checked == true) {
            drv = (["DRV_20FT_30T", "DRV_20FT_24T"]);
        }
        else{
            drv = (["DRV_40FT_30T"]);
        }
    }

    let requestJSON = JSON.stringify({
        "containers": drv,
        "destAutoZones": null,
        "request": {
            "containerCount": document.getElementById("containerCount").value,
            "containerTrain": "N",
            "contOwnerCNSI": "TK",
            "contTypeCNSI": "",
            "customer": null,
            "date": Date.parse(document.getElementById("calendar").value),
            "declaredCost": null,
            "destAZ": null,
            "destCountry": {
                "countryNumber": destination.countryСode
            },
            "destLocation": destination.data.code,
            "externalSystemRequestID": null,
            "form2List": null,
            "homeStuffWeightExceeds": null,
            "intPreference": "RUB",
            "isComplex": "Y",
            "items": [
                {
                    "etsng": cargoJSON.code,
                    "gng": null,
                    "nettoWeight": document.getElementById("weight").value
                }
            ],
            "rank": "6",
            "sourceAZ": null,
            "sourceCountry": {
                "countryNumber": departure.countryСode
            },
            "sourceLocation": departure.data.code,
            "wagonOwnerCNSI": "TK"
        },
        "sourceAutoZones": null
    });

    requestJSONS.push(requestJSON);

    let from = document.getElementById("departure"),
        to = document.getElementById("destination"),
        cargolist = document.getElementById("cargolist"),
        calendar = document.getElementById("calendar");

    let newiframeElement = document.createElement("iframe");
    newiframeElement.width = "200";
    newiframeElement.height = "200";
    newiframeElement.marginheight = "0";
    newiframeElement.marginwidth = "0";
    newiframeElement.id = "iframe" + idFrame++;
    let string = "<html> <body> " + "<p><label id=from>" + from.value + "</label></p>" + "<p><label id=to>" + to.value + "</label></p>" + "<p><label id=cargolist>" + cargolist.value + "</label></p>" + "<p><label id=calendar></p>" + calendar.value + "</label>";

    newiframeElement.srcdoc = string;

    requestCards.append(newiframeElement);

    
    let newDelButton = document.createElement("input");
    newDelButton.type = "button";
    newDelButton.id = "button" + (idFrame - 1);
    newDelButton.setAttribute("onclick", "clickDelRequestCard(" + (idFrame - 1) + ")");
    newDelButton.value = "Удалить";

    requestCards.append(newDelButton);
}

/**
 * Удаляет карточку-запрос и кнопку удаления к ней.
 * @param {Number} id Id карточки и кнопки удаления.
 */
function clickDelRequestCard(id) {
    let deliframe = document.getElementById("iframe" + id);
    let delButton = document.getElementById("button" + id);
    deliframe.remove();
    delButton.remove();
    requestJSONS[id] = undefined;
}

function clickSearch() {
    document.getElementById("resultButton").disabled = true;
    let requestCards = document.getElementById("requestCards");

    for(let i = 0; i < requestCards.childNodes.length; i++){
        var element = requestCards.childNodes[i];
        if(element.id.indexOf('button') != -1) continue;
        let mainUrl = "https://isales.trcont.com/account-back/fcalc/prepare?popular=true";
        let mainRequest = new XMLHttpRequest();
        mainRequest.open("POST", mainUrl, true);
        mainRequest.setRequestHeader("Content-Type", "application/json");
        mainRequest.responseType = 'json';

        let id = element.id.replace('iframe', '');

        //let data = JSON.stringify(requestJSONS[id]);

        mainRequest.send(requestJSONS[id]);

        mainRequest.onload = function () {
            for (let i = 0; i < mainRequest.response.length; i++) {
                let url = "https://isales.trcont.com/account-back/fcalc/";
                let request = new XMLHttpRequest();
                request.open("POST", url, true);
                request.setRequestHeader("Content-Type", "application/json");
                request.responseType = 'json';

                request.send(JSON.stringify(mainRequest.response[i]));

                request.onload = function () {
                    if (request.status == 200) {
                        addResultCard(getSumResult(request.response));
                        document.getElementById("resultButton").disabled = false;
                    }
                }
            }
        }
    }
}

function getSumResult(jsonObj) {
    let sum = 0;
    for (let i = 0; i < jsonObj.routes[0].routeShipments.length; i++) {
        sum += jsonObj.routes[0].routeShipments[i].shipmentTotal;
    }
    return sum;
}

function addResultCard(sum) {
    let stringSum = String(sum);
    let returnString = "";
    let countOfNumbers = 0;
    for (let i = stringSum.length - 1; i >= 0; i--) {
        if (stringSum[i] == '.') {
            if (returnString.length == 1) {
                var str = returnString;
                returnString = '0' + str + ',';
            }
            else {
                returnString += ',';
            }
            countOfNumbers = 0;
            continue;
        }
        returnString += stringSum[i];
        countOfNumbers++;
        if (countOfNumbers == 3 && i != 0) {
            countOfNumbers = 0;
            returnString += ' ';
        }
    }
    stringSum = returnString;
    returnString = "";
    for (let i = stringSum.length - 1; i >= 0; i--) {
        returnString += stringSum[i];
    }

    let form = document.forms.searchForm;

    let departure = form.elements.departure,
        destination = form.elements.destination,
        cargolist = form.elements.cargolist,
        calendar = form.elements.calendar;

    let newiframeElement = document.createElement("iframe");
    newiframeElement.width = "200";
    newiframeElement.height = "250";
    newiframeElement.marginheight = "0";
    newiframeElement.marginwidth = "0";
    let string = "<html> <body> " + "<p><label id=from>" + departure.value + "</label></p>" + "<p><label id=to>" + destination.value + "</label></p>" + "<p><label id=cargolist>" + cargolist.value + "</label></p>" + "<p><label id=calendar></p>" + calendar.value + "</label><p>" + returnString + " ₽</p>";

    newiframeElement.srcdoc = string;

    let resultCards = document.getElementById("resultCards");
    resultCards.append(newiframeElement);
    //alert(returnString + ' ₽');
}
/**
 * Id текущей карточки-запроса.
 */
let idFrame = 0;

/**
 * Id таймера, чтобы контролировать отправку запросов при вызове функции inputNamePoint().
 */
let timerId = undefined;

let requestJSONS = [];

let cargosJSON;

let cargoJSON,
    departurePointJSON,
    destinationPointJSON;