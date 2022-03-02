
function loadPage() {
    getCargo();
    setDateValue();
}

/**
 * Устанавливает стартовые значения для календаря.
 */
function setDateValue() {
    let date = new Date();
    date.setTime(date.getTime() + (40*60*60*1000));
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
        departurePointJSON = undefined;
        input = form.elements.departure;
        if (input.value != "")
            timerId = setTimeout(getDeparturePoint, 1000, input);
    }
    else {
        destinationPointJSON = undefined;
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
        if (input == "to") {
            toPointJSON = request.response;
        }
        else {
            fromPointJSON = request.response;
        }
        parsePoint(request.response, input);
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
        if (input == "to") {
            toPointJSON = request.response;
        }
        else {
            fromPointJSON = request.response;
        }
        parsePoint(request.response, input);
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

/**
 * Создаёт новую карточку-запрос и кнопку удаления к ней.
 */
function clickAddRequestCard() {
    cargoJSON = searchCargo(document.getElementById("cargolist").value);

    if (cargoJSON == undefined) {
        alert("Груз не найден!");
        return;
    }

    if (document.getElementById("destination").value == "" || document.getElementById("departure").value == "") {
        alert("Не указаны все пункты!");
        return;
    }

    if (document.getElementById("calendar").value == "") {
        alert("Отсутсвует дата!");
        return;
    }

    let requestJSON = JSON.stringify({

    });

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

    /*
    newiframeElement.onload = function () {
        let iframecontent = document.getElementById("iframe" + (idFrame - 1));
        let fromLabel = iframecontent.contentWindow.document.getElementById("from");
        alert(fromLabel.textContent);
    }
    */

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
}

function clickSearch() {



    document.getElementById("resultButton").disabled = true;
    let resultCards = document.getElementById("resultCards");
    resultCards.childNodes.forEach(element => {
        element.remove();
    });

    let url = "https://isales.trcont.com/account-back/fcalc/";
    let request = new XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = 'json';

    let data = JSON.stringify({
        "containerCount": 1,
        "containerTrain": "N",
        "contOwnerCNSI": "TK",
        "contTypeCNSI": "DRV_20FT_24T",
        "customer": "MANAGER",
        "date": 1645488000000,
        "destCountry": {
            "countryNumber": "643"
        },
        "destLocation": "W_RU_KUN",
        "destLocations": [
            "T_RU_KUN_TK"
        ],
        "externalSystem": {
            "requestId": "192e3c6f-4b81-4285-a64b-05d0a91eef80",
            "systemName": "TRCONT.ISALES_PRO"
        },
        "intPreference": "RUB",
        "invalid": false,
        "isComplex": "Y",
        "isContainerTrain": "N",
        "items": [
            {
                "etsng": "253014",
                "nettoWeight": 1
            }
        ],
        "itineraryGid": "TRCONT.AW_RU_KLE-KLE_TK-KUN_TK-AW_RU_KUN_3LEG",
        "language": "RU",
        "rank": 6,
        "salesChannel": "TRCONT.ISALES",
        "sourceCountry": {
            "countryNumber": "643"
        },
        "sourceLocation": "W_RU_KLE",
        "sourceLocations": [
            "T_RU_KLE_TK"
        ],
        "wagonOwnerCNSI": "TK"
    });

    request.send(data);

    request.onload = function () {
        addResultCard(getSumResult(request.response));
        document.getElementById("resultButton").disabled = false;
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

    let from = form.elements.from,
        to = form.elements.to,
        cargolist = form.elements.cargolist,
        calendar = form.elements.calendar;

    let newiframeElement = document.createElement("iframe");
    newiframeElement.width = "200";
    newiframeElement.height = "250";
    newiframeElement.marginheight = "0";
    newiframeElement.marginwidth = "0";
    newiframeElement.id = "iframe" + idFrame++;
    let string = "<html> <body> " + "<p><label id=from>" + from.value + "</label></p>" + "<p><label id=to>" + to.value + "</label></p>" + "<p><label id=cargolist>" + cargolist.value + "</label></p>" + "<p><label id=calendar></p>" + calendar.value + "</label><p>" + returnString + " ₽</p>";

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

let requestJSONS = new Set();

let cargosJSON;

let cargoJSON,
    departurePointJSON,
    destinationPointJSON;

console.log(Date.parse("2022-02-23"));
console.log(1645574400000);