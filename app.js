import PopupMessage from './popup-message.js';
import API from './api.js';
import Theme from './theme.js';


const Labels = {
    Vacation: "UW", // Відпустка
    Absent: "AB", // Відсутній
    // ...
};

// Масив для збереження вручу відредагованих карток
const changedCards = new Array();

const spreadAmounts = {
    accordingToHours: true,
    wholeBrigade: false
};

// Start point
window.addEventListener("load", initialize());

document.getElementById("error_frame_close").onclick 
    = () => closeConnectionError();

function initialize() {

    // For now just changing icons color to primary Telegram color    
    Theme.init();

    API.send("GET_PRODUCTION_TASKS", null, {
        id: getCryptoId()
    }).then(response => {

        if(response === undefined || response === null) {
            showEmptyFrame();
            throw new Error(`API.SEND: Response data is undefined or empty!`);
        }
        if (response.data?.data?.spreadAmounts?.accordingToHours || response.data?.data?.spreadAmounts?.wholeBrigade) {
            spreadAmounts.accordingToHours = response.data.data.spreadAmounts.accordingToHours;
            spreadAmounts.wholeBrigade = response.data.data.spreadAmounts.wholeBrigade;
            showSpreadingAmountLabel()
        }
        hideEmptyFrame();

        const title = document.getElementById('title');
        const projectName = document.getElementById('project-name');
        const projectTerms = document.getElementById('project-terms');
        const projectExec = document.getElementById('project-exec');
        const cards = document.getElementById('cards');
        const factCount = document.getElementById('fact-count');

        //const sendButton = document.getElementById('send-button');
    
        // Назва роботи/проєкту
        title.append(response.data.data.stage_work);

        // Поточна стадія виконання проєкту
        projectName.append(response.data.data.stage);

        // Терміни по проєкту/дата
        projectTerms.append(
            new Date(response.data.data.date)
                .toLocaleDateString("uk", {timeZone: "UTC"}));
        
        // План/факт виконання
        projectExec.append(
            `${response.data.data.plan_amount}/${response.data.data.fact_amount} 
            (${Math.round(response.data.data.fact_amount/response.data.data.plan_amount*100)}%)`);
    
        // Загальна кількість виконаних робіт, од. виміру
        factCount.placeholder = `Загальна кількість, всього ${response.data.data.unit}`;

        factCount.addEventListener("change", () => updateCards());
    
        factCount.addEventListener("input", () => {
            factCount.classList.remove('error');
            PopupMessage.Hide();
        });

        window.Telegram.WebApp.MainButton.setParams({
            text: "Зареєструвати",
            color: window.Telegram.WebApp.MainButton.color,
            text_color: "#ffffff",
        });

        window.Telegram.WebApp.MainButton.show();

        window.Telegram.WebApp.MainButton.onClick(function() {

            if(!factCountValid())
                return;

            if(document.activeElement !== undefined)
                document.activeElement.blur();
            
            let json = getJsonData(response);

            sendJsonData(json).then(result => {
                
                if(!result) {
                    showConnectionError();
                    return;
                }

                window.Telegram.WebApp.close();

                //showSuccessFrame();

            });

        });

        createCards(cards, response.data.data);
        
        trackingInputChanges();

    })
    .catch(exception => {
        console.error(`Response cannot received: ${exception.message}`);
    })
}



function showSpreadingAmountLabel() {
    document.getElementById("spread_by_hours").style.display = spreadAmounts.accordingToHours ? "" : "none";
    document.getElementById("spread_among_brigade").style.display = spreadAmounts.wholeBrigade ? "" : "none";
}

function showEmptyFrame() {
    document.getElementById("main_frame").style.display = "none";
    document.getElementById("empty_frame").style.display = "";
}

function hideEmptyFrame() {
    document.getElementById("main_frame").style.display = "";
    document.getElementById("empty_frame").style.display = "none";
}

function showConnectionError() {
    document.getElementById("error_frame").classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeConnectionError() {
    document.getElementById("error_frame").classList.remove("show");
    document.body.style.overflow = "scroll";
}

function showSuccessFrame() {
    document.getElementById("main_frame").style.display = "none";
    document.getElementById("success_frame").style.display = "";

    
    //window.Telegram.WebApp.MainButton.hide();
}


function factCountValid() {

    let factCount = document.getElementById("fact-count");

    if(!isNumber(factCount.value)) 
    {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });

        // Певний костиль, бо попап зникає при скроллі, 
        // тож очікуємо на завершення скролу і виводимо
        setTimeout(function() {
            factCount.focus();
            PopupMessage.Show("Введіть значення!", factCount.parentElement);
        }, 600);

        factCount.classList.add("error");

        return false;
    }

    return true;
}



function getJsonData(response) {

    const json = {
        id: response.data.cryptoId,
        data: {
            type: "construction",
            stage_code: response.data.data.stage_code,
            stage_work_code: response.data.data.stage_work_code,
            amount: document.getElementById('fact-count').value,
            persons_list: []
        },
        initData: window.Telegram.WebApp.initData ?? {},
        initDataUnsafe: window.Telegram.WebApp.initDataUnsafe ?? {}
    };

    let cards = document.querySelectorAll('.card');

    cards.forEach(card => {

        let factCountField = card.querySelector('input[name="unit-count"]');

        let factCountValue = parseFloat(factCountField.value);

        if(!isNumber(factCountValue)) {
            factCountValue = 0;
        }

        let employee = response.data.data.persons_list.find(
            person => person.tabnum === card.dataset.id);

        json.data.persons_list.push({
            absent: employee.absent,
            tabnum: employee.tabnum,
            fact: factCountValue
        });
    });

    return json;
}

async function sendJsonData(json) {
    return await API.send("POST_PRODUCTION_TASKS", JSON.stringify(json), {
        cryptoId: getCryptoId()
    })
        .then(result => {
            
            if(result === undefined || result === null)
                return false;

            return true;
        })
        .catch(exception => {
            console.error(`POST request cannot sended: ${exception.message}`);
            return false;
        })
        .finally(() => { return false } );
}

function getCryptoId() {
    return new URLSearchParams(window.location.search).get("cryptoId");
}

function isNumber(value) {
    if(value === undefined || value === null || value === NaN
        || value === "" || value == '')
        return false;
    
    return String(value).match(/^[0-9.,]+$/) ? true : false;
}


function createCards(container, data) {
    let enteredAmount = 0
    data.persons_list.forEach(person => {
        enteredAmount += person.amount || 0
    })

    if (enteredAmount) {
        const factCount = document.getElementById('fact-count');
        factCount.value = enteredAmount
    }

    data.persons_list.forEach(person => {
        let card = document.createElement("div");
        card.className = "card rounded";
        card.dataset.id = person.tabnum;
        card.dataset.absent = person.absent ?? (spreadAmounts.wholeBrigade ? false : true);
        card.dataset.spreadAmountsWholeBrigade = spreadAmounts.wholeBrigade;
        card.dataset.spreadAmountsAccordingToHours = spreadAmounts.accordingToHours;

        const enteredPersent = person.amount ? ((parseFloat(person.amount) * 100) / enteredAmount).toFixed(2) : 0
        card.innerHTML += `
            
        <div class="card-header">
            <span class="indicator ${person.absent ? 'yellow-800' : ''} rounded-sm">
                ${ person.absent ? Labels.Vacation : person.enteredTime }
            </span>
            <p class="title">
                ${ person.fio }
            </p>
        </div>
    
        <div class="card-body cols-2">
            <div class="label-input rounded">
                <span>Кількість в ${ data.unit }</span>
                <input type="number" class="transparent" 
                    placeholder="${ data.unit }" name="unit-count" ${person.amount ? 'value="' + person.amount + '"': 'disabled'}/>
                <i class='error-icon'>
                    <img src='icons/danger.svg' />
                </i>
            </div>
    
            <div class="label-input rounded">
                <span>Кількість в %</span>
                <input type="text" class="transparent" 
                    placeholder="%" name="percent-count" ${person.amount ? 'value="' + enteredPersent + '"': ''} disabled/>
            </div>
        </div>`;

        container.append(card);
    });
}

function explodeCount() {

    let cards = document.querySelectorAll(".card");
    let factCount = parseFloat(document.getElementById('fact-count').value);
    const presentWorkers = getPresentWorkersAmount() - changedCards.length;

    cards.forEach(card => {

        let workingHours = parseFloat(card.querySelector(".indicator").textContent);
    
        // If it is absent or vacation don't calculate
        if(card.dataset.absent === 'true' || (!isNumber(workingHours) && !spreadAmounts.wholeBrigade)) {
            return;
        }

        let percentInput = card.querySelector("input[name='percent-count']");
        let unitInput = card.querySelector("input[name='unit-count']");

        if(!changedCards.includes(card.dataset.id)) {

            let availableAmount = getAvailableAmount();
            let hoursAmount = getWorkingHoursAmount();
            
            let rate = availableAmount / (spreadAmounts.wholeBrigade ? presentWorkers : hoursAmount);
            
            let value = (spreadAmounts.wholeBrigade ? rate : parseFloat(workingHours * rate)).toFixed(2)
            
            unitInput.value = isNumber(value) ? value : "";
        }
        
        percentInput.value = isNumber(unitInput.value) 
            ? `${((parseFloat(unitInput.value) * 100) / factCount).toFixed(2)} %` 
            : "";

    });
}


function trackingInputChanges() {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        let input = card.querySelector("input[name='unit-count']");

        input.addEventListener("input", function(event) {

            if(!changedCards.includes(card.dataset.id)) {
                changedCards.push(card.dataset.id);
            }

            if(getAvailableAmount() < 0) {
                input.value = '';
                input.parentElement.classList.add("error");
                PopupMessage.Show(
                    `Немає вільного залишку
                    <br>
                    Вільний залишок: ${getAvailableAmount().toFixed(4)}`, 
                    input.parentElement);

                event.preventDefault();

            } else {
                input.parentElement.classList.remove("error");
                PopupMessage.Hide();
            }
        })

        // input.addEventListener("blur", function() {
        //     input.value = parseFloat(input.value);
        // });


    });

    // Prevent using leading and trailing zeros in inputs!
    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {

        input.onkeydown = (event) => {

            if(event.key === "Enter" || event.key === "Backspace" 
            || event.key === "Tab" || event.key === "Escape") {
                return true; 
            }

            if(!isNumber(event.key)) {
                PopupMessage.Show("Використання символів заборонено", input);
                event.preventDefault();
            }
        }

        input.onchange = (event) => {

            input.value = isNumber(input.value) ? parseFloat(input.value) : "";

            window.Telegram.WebApp.MainButton.show();

            explodeCount();

        }

        input.onfocus = () => {
            input.oldValue = input.value;
            window.Telegram.WebApp.MainButton.hide();
        }

        // input.onkeydown = (event) => {

        //     // Allow to input only numeric value
        //     //if(event.key === '+' || event.key === '-') {
        //     // if(((event.code < 48) && (event.code > 57)) || (event.code == 13) 
        //     //  || (event.key === '+' || event.key === '-')) {
        //     //     event.preventDefault();
        //     // }
            
        //     // if(event.key === '0') {

        //     //     if(Number(input.value) <= 0) {
        //     //         event.preventDefault();
        //     //     }

        //     //     if(input.id === 'fact-count' && Number(input.value) <= 0) {
            
        //     //         PopupMessage.Show("Обсяг не може бути менше 1", input);
                    
        //     //         input.value = '';
        //     //         input.classList.add("error");
        
        //     //         event.preventDefault();
        //     //         return false;
        //     //     }
        //     // }   
        // }

        input.addEventListener("focusout", function() {
            input.parentElement.classList.remove("error");
            input.classList.remove("error");
            PopupMessage.Hide();
        });
    });

    // Hide keyboard in Safari when focus out of input area
    document.addEventListener("touchstart", function(e) {
        if(document.activeElement !== undefined 
            && document.activeElement.nodeName === "INPUT") {
                document.activeElement.blur();
            }
    });

}


function updateCards() {

    const factCount = document.getElementById('fact-count');

    if(factCount.value !== '') {

        changedCards.length = 0;

        const cardInputs = document.querySelectorAll("input[name='unit-count']");

        cardInputs.forEach(input => {
            input.disabled = false;
        });

        disableAbsentCards();
        explodeCount();
    }
    else 
    {
        const cardInputs = document.querySelectorAll(".label-input > input");

        cardInputs.forEach(input =>  {
            input.value = "";
            input.disabled = true;
        });
    }

}


function getAvailableAmount() 
{
    let availableAmount = parseFloat(document.getElementById('fact-count').value);

    if(!Array.isArray(changedCards) || !changedCards.length)
        return availableAmount;

    changedCards.forEach(card => {

        let element = document.querySelector(`[data-id='${card}']`);
        let value = parseFloat(element.querySelector("input[name='unit-count']").value);

        availableAmount -= isNumber(value) ? value : 0;

    });

    return availableAmount;
}

function getCardsCurrentAmount() {

    const cards = document.querySelectorAll(".card");

    let amount = 0;

    cards.forEach(card => {
        amount += parseFloat(card.querySelector("input[name='unit-count']").value);
    });

    return amount;

}


function getWorkingHoursAmount() {

    let amount = 0;

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {

        if(changedCards.includes(card.dataset.id)) {
            return;
        }

        const cardHours = card.querySelector('.indicator');
        const hourValue = parseFloat(cardHours.textContent);
        
        amount += isNumber(hourValue) ? hourValue : 0;

    });

    return amount;
}

function getPresentWorkersAmount() {
    let amount = 0;

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        if (card.dataset.absent !== 'true') {
            amount++;
        }
    });

    return amount;
}


function disableAbsentCards() {

    const absentCards = document.querySelectorAll(".card[data-absent='true']");

    absentCards.forEach(card => {
        
        let inputs = card.querySelectorAll("input");

        inputs.forEach(input => {
            input.disabled = true;
        });
    });

} 






