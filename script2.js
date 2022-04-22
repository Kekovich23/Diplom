//#region ГРУЗ
let cargoJSON;
/**
 * Получает JSON с грузами с сайта и затем добавляет их в datalist.
 */
function getCargo() {
    let requestURL = 'https://isales2.trcont.com/account-back/cargo/reference/?type=container';
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
    let listElement = document.getElementById("cargoList");
    for (let j = 0; j < cargosJSON.length; j++) {
        for (let i = 0; i < cargosJSON[j].children.length; i++) {
            let newOptionElement = document.createElement("option");
            newOptionElement.textContent = cargosJSON[j].children[i].name;

            listElement.appendChild(newOptionElement);
        }
    }
}

/**
 * Ищет JSON груза.
 * @param {*} text Имя груза.
 * @returns JSON груза или null, если груз с таким именем не найден.
 */
function searchCargo(text) {
    for (let j = 0; j < cargosJSON.length; j++) {
        for (let i = 0; i < cargosJSON[j].children.length; i++) {
            if (cargosJSON[j].children[i].name === text) {
                return cargosJSON[j].children[i];
            }
        }
    }
    return null;
}
//#endregion

//#region ПУНКТЫ НАЗНАЧЕНИЯ

/**
 * Id таймера, чтобы контролировать отправку запросов при вызове функции inputNamePoint().
 */
let timerId;

let departurePointsJSON, destinationPointsJSON;
let departurePointsJSONs = [], destinationPointsJSONs = [];

/**
 * Запускает таймер после изменения текстового поля. По истечению таймера загружает доступные пункты отправки/прибытия в соответсвующий datalist.
 * @param {*} input Поле ввода.
 */
function inputNamePoint(input) {
    if (timerId != undefined)
        clearTimeout(timerId);
    if (input.value != "" && input.value.length > 1) {
        if (input.name == "departure") {
            timerId = setTimeout(getDeparturePoint, 1000, input);
        }
        else {
            timerId = setTimeout(getDestinationPoint, 1000, input);
        }
    }
}

/**
 * Отправляет запрос и при получении добавляет полученные данные в соответсвующее поле ввода.
 * @param {*} data Данные запроса JSON для отправки.
 * @param {*} input Поле ввода данных.
 */
function getRequest(data, input) {
    let url = "https://isales2.trcont.com/account-back/calc/available-item/";
    let request = new XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = 'json';
    request.send(data);

    request.onload = function () {
        if (request.response.length != 0) {
            if (input.name == "departure") {
                departurePointsJSON = request.response;
                var id = input.id;
                departurePointsJSONs[id.replace("departure", "")] = departurePointsJSON;
                parsePoint(departurePointsJSON, input);
            }
            else {
                destinationPointsJSON = request.response;
                var id = input.id;
                destinationPointsJSONs[id.replace("destination", "")] = destinationPointsJSON;
                parsePoint(destinationPointsJSON, input);
            }
        }
    }
}

/**
 * Отправляет запрос на получение пунктов отправления и добавляет полученные данные в datalist.
 * @param {*} input поле ввода данных.
 */
function getDeparturePoint(input) {
    let data = JSON.stringify({
        "departure": input.value,
        "transferType": "container"
    });
    getRequest(data, input);
}

/**
 * Отправляет запрос на получение пунктов назначения и добавляет полученные данные в datalist.
 * @param {*} input поле ввода данных.
 */
function getDestinationPoint(input) {
    let data = JSON.stringify({
        "destination": input.value,
        "transferType": "container"
    });
    getRequest(data, input);
}

/**
 * Добавляет точки из JSON в datalist отправления/прибытия.
 * @param {*} input Поле в которое вводится значение и в datalist которого добавляются точки отправления/прибытия.
 */
function parsePoint(pointsJSON, input) {
    let listElement = document.getElementById(input.name + "List");

    let length = listElement.options.length;
    for (i = length - 1; i >= 0; i--) {
        listElement.options[i].remove();
    }
    for (let j = 0; j < pointsJSON.length; j++) {
        let newOptionElement = document.createElement("option");
        newOptionElement.textContent = pointsJSON[j].title;

        listElement.appendChild(newOptionElement);
    }
}

/**
 * Ищет JSON введённого пункта отправления.
 * @param {string} text Имя пункта.
 * @returns Возвращает JSON пункта или null, если JSON не найден.
 */
function searchDeparturePoint(text, id) {
    for (let i = 0; i < departurePointsJSONs[id].length; i++) {
        if (departurePointsJSONs[id][i].title == text) {
            return departurePointsJSONs[id][i];
        }
    }
    return null;
}

/**
 * Ищет JSON введённого пункта прибытия.
 * @param {string} text Имя пункта.
 * @returns Возвращает JSON пункта или null, если JSON не найден.
 */
function searchDestinationPoint(text, id) {
    for (let i = 0; i < destinationPointsJSONs[id].length; i++) {
        if (destinationPointsJSONs[id][i].title == text) {
            return destinationPointsJSONs[id][i];
        }
    }
    return null;
}

//#endregion

//#region ИНТЕРФЕЙС

/**
 * Устанавливает стартовые значения для календаря.
 */
function setDateValue() {
    let date = new Date();
    date.setDate(date.getUTCDate() + 1);
    let moscowHour = date.getUTCHours() + 3;
    let isMore12;
    if (moscowHour >= 12) {
        date.setDate(date.getDate() + 1);
        isMore12 = true;
    }

    document.getElementById("dateOption").value = date.toISOString().substring(0, 10);
    document.getElementById("dateOption").min = date.toISOString().substring(0, 10);

    if (isMore12) {
        date.setDate(date.getDate() + 42);
    }
    else {
        date.setDate(date.getDate() + 43);
    }
    document.getElementById("dateOption").max = date.toISOString().substring(0, 10);
}

/**
 * Id последней добавленной строки таблицы.
 */
let idLastRow = 0;

/**
 * Возвращает новый Id.
 * @returns Id.
 */
function getIdRow() {
    return ++idLastRow;
}

/**
 * Добавляет новую строку в конец таблицы.
 */
function addRow() {
    let tableBody = document.getElementById("mainBody");

    let newRow = document.createElement("tr");

    newRow.id = "tr" + getIdRow();

    let newCell = document.createElement("td");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "ch" + idLastRow;
    checkbox.autocomplete = "off";
    checkbox.setAttribute("onchange", "mainCheckbox.checked = false");

    newCell.appendChild(checkbox);

    newRow.appendChild(newCell);

    newCell = document.createElement("td");

    let inputDeparture = document.createElement("input");
    inputDeparture.className = "inputField";
    inputDeparture.autocomplete = "off";
    inputDeparture.setAttribute("list", "departureList");
    inputDeparture.setAttribute("oninput", "inputNamePoint(this)");
    inputDeparture.id = "departure" + idLastRow;
    inputDeparture.name = "departure";

    newCell.appendChild(inputDeparture);

    newRow.appendChild(newCell);

    newCell = document.createElement("td");

    let inputDestination = document.createElement("input");
    inputDestination.className = "inputField";
    inputDestination.autocomplete = "off";
    inputDestination.setAttribute("list", "destinationList");
    inputDestination.setAttribute("oninput", "inputNamePoint(this)");
    inputDestination.id = "destination" + idLastRow;
    inputDestination.name = "destination";

    newCell.appendChild(inputDestination);

    newRow.appendChild(newCell);

    newCell = document.createElement("td");

    let inputCargo = document.createElement("input");
    inputCargo.className = "inputField";
    inputCargo.autocomplete = "off";
    inputCargo.setAttribute("list", "cargoList");
    inputCargo.id = "cargo" + idLastRow;
    inputCargo.name = "cargo";

    newCell.appendChild(inputCargo);

    newRow.appendChild(newCell);

    newCell = document.createElement("td");

    let weight = document.createElement("input");
    weight.className = "inputField";
    weight.autocomplete = "off";
    weight.type = "number";
    weight.id = "weight" + idLastRow;
    weight.value = "1";

    newCell.appendChild(weight);

    newRow.appendChild(newCell);

    newCell = document.createElement("td");

    let option = document.createElement("input");
    option.className = "inputField";
    option.autocomplete = "off";
    option.id = "option" + idLastRow;

    newCell.appendChild(option);

    newRow.appendChild(newCell);

    newCell = document.createElement("td");

    let price = document.createElement("output");
    price.id = "price" + idLastRow;

    newCell.appendChild(price);

    newRow.appendChild(newCell);

    tableBody.appendChild(newRow);
}

/**
 * Удаляет выбранные строки из таблицы.
 */
function deleteRow() {
    let tableBody = document.getElementById("mainBody");
    for (let i = 0; i <= idLastRow; i++) {
        let checkbox = document.getElementById("ch" + i);
        if (checkbox == null)
            continue;
        if (checkbox.checked) {
            let row = document.getElementById("tr" + i);
            tableBody.removeChild(row);
        }
    }
    if (tableBody.childElementCount == 1)
        addRow();
    document.getElementById("mainCheckbox").checked = false;
}

/**
 * Выбирает или отменяет выбор всех строк таблицы.
 * @param {*} checkbox Общий checkbox.
 */
function clickMainCheckbox(checkbox) {
    if (checkbox.checked) {
        for (let i = 0; i <= idLastRow; i++) {
            let ch = document.getElementById("ch" + i);
            if (ch == null)
                continue;
            ch.checked = true;
        }
    }
    else {
        for (let i = 0; i <= idLastRow; i++) {
            let ch = document.getElementById("ch" + i);
            if (ch == null)
                continue;
            ch.checked = false;
        }
    }
}

/**
 * Рассчитывает цену.
 * @param {*} button Кнопка добавления, нужна для временной блокировки.
 */
function calculate(button) {
    button.disabled = true;
    let date = document.getElementById("dateOption").value;
    for (let i = 0; i <= idLastRow; i++) {
        let row = document.getElementById("tr" + i);
        if (row == null)
            continue;
        let departure = document.getElementById("departure" + i).value,
            destination = document.getElementById("destination" + i).value,
            cargo = document.getElementById("cargo" + i).value,
            weight = document.getElementById("weight" + i).value;

        if (departure == null || destination == null || cargo == null || weight == null) {
            alert("Введены не все данные!");
            button.disabled = false;
            return;
        }

        departure = searchDeparturePoint(departure, i);
        destination = searchDestinationPoint(destination, i);
        cargo = searchCargo(cargo);

        if (departure == null || destination == null || cargo == null) {
            alert("Введённые данные неверны!");
            button.disabled = false;
            return;
        }

        let mainUrl = "https://isales2.trcont.com/account-back/v2/calc/?popular=true";
        let mainRequest = new XMLHttpRequest();
        mainRequest.open("POST", mainUrl, true);
        mainRequest.setRequestHeader("Content-Type", "application/json");
        mainRequest.responseType = 'json';

        let data = JSON.stringify({
            "additional": {
                "client_type": "standart",
                "complete_shipment_wagon": false,
                "complex_service": true,
                "container_owner": "TK",
                "currency": "RUB",
                "empty_equipment": false,
                "equipment_types_together": false,
                "household_exceeds": null,
                "included_in_container_train": false,
                "linked_cargo": null,
                "military_form2_rail": null,
                "military_form2_terminal": null,
                "military_form2_water": null,
                "oversize_index": null,
                "shipment_type_id": 3000,
                "sort_routes_by": "price",
                "wagon_owner": "TK",
                "wagons_in_route": false,
                "wagons_linked": false
            },
            "containers": [
                {
                    "count": 1,
                    "type": "DRV_20FT_30T"
                },
                {
                    "count": 1,
                    "type": "DRV_20FT_24T"
                }
            ],
            "items": [
                {
                    "etsng_id": cargo.code,
                    "weight": weight
                }
            ],
            "location": {
                "from": {
                    "catalog_id": [
                        departure.data.code
                    ],
                    "country_id": departure.countryCode
                },
                "to": {
                    "catalog_id": [
                        destination.data.code
                    ],
                    "country_id": departure.countryCode
                }
            },
            "period": {
                "date_start": {
                    "min": date + "T00:00:00+00:00"
                },
                "priority": "date_start"
            }
        });

        mainRequest.send(data);

        mainRequest.onload = function () {
            let priceOutput = document.getElementById("price" + i);
            let price = String(mainRequest.response.transport_solutions[0].amount);

            let index = price.indexOf(".");

            if (!index == 0) {
                let sum = 0;
                for (let j = index + 1; j < price.length; j++)
                    sum++;
                if (sum == 1)
                    price += "0";
            }

            priceOutput.value = price;
            button.disabled = false;
        }
        mainRequest.onerror = function(){
            let priceOutput = document.getElementById("price" + i);
            priceOutput.value = "Ошибка";
            button.disabled = false;
        }
    }
}

//#endregion

setDateValue();
getCargo();