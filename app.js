
const { default: data } = 
    await import("/data.json", { assert: { type: "json" } });

import PopupMessage from './popup-message.js';
import API from './api.js';


const Labels = {
    Vacation: "UW", // Відпустка
    Absent: "AB", // Відсутній
    // ...
};

// Масив для збереження вручу відредагованих карток
const changedCards = new Array();

// Start point
window.addEventListener("load", initialize());


function initialize() {

    //const data = API.send("PRODUCTION_TASKS", 'GET');

    console.log(API.response)
    


    const title = document.getElementById('title');
    const projectName = document.getElementById('project-name');
    const projectTerms = document.getElementById('project-terms');
    const projectExec = document.getElementById('project-exec');
    const cards = document.getElementById('cards');
    const factCount = document.getElementById('fact-count');

    title.append(data.stage_work);
    projectName.append(data.stage);
    projectTerms.append(new Date(data.date).toLocaleDateString("uk-UK"));
    projectExec.append(
        `${data.plan_amount}/${data.fact_amount} 
        (${Math.round(data.fact_amount/data.plan_amount)}%)`);

    factCount.placeholder = `Загальна кількість, всього ${data.unit}`;

    factCount.addEventListener("change", () => updateCards());

    factCount.addEventListener("input", () => {
        factCount.classList.remove('error');
        PopupMessage.Hide();
    });

    //window.Telegram.WebApp.MainButton.show();

    createCards(cards, data);
    
    trackingInputChanges();
}

function createCards(container, data) {

    data.persons_list.forEach(person => {

        let card = document.createElement("div");
        card.className = "card rounded";
        card.dataset.id = person.tabnum;
        card.dataset.absent = person.absent ?? true;

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
                    placeholder="${ data.unit }" name="unit-count" disabled />
                <i class='error-icon'>
                    <img src='icons/danger.svg' />
                </i>
            </div>
    
            <div class="label-input rounded">
                <span>Кількість в %</span>
                <input type="text" class="transparent" 
                    placeholder="%" name="precent-count" disabled />
            </div>
        </div>`;
    
        container.append(card);
    });

}

function explodeCount() {

    let cards = document.querySelectorAll(".card");
    let factCount = parseFloat(document.getElementById('fact-count').value);

    let availableAmount = getAvailableAmount();
    let hoursAmount = getWorkingHoursAmount();

    let rate = availableAmount / hoursAmount;

    cards.forEach(card => {

        let workingHours = parseFloat(card.querySelector(".indicator").textContent);

        // If it is absent or vacation don't calculate
        if(isNaN(workingHours)) {
            return;
        }

        let precentInput = card.querySelector("input[name='precent-count']");
        let unitInput = card.querySelector("input[name='unit-count']");
        
        if(!changedCards.includes(card.dataset.id)) {

            if(!isNaN(unitInput.value)) {

                let value = Number(workingHours * rate).toFixed(2);

                unitInput.value = value == 0 ? '' : value;

            }
        }
    
        precentInput.value = `${((unitInput.value * 100) / factCount).toFixed(2)} %`;   

    });
}


function trackingInputChanges() {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        let input = card.querySelector("input[name='unit-count']");

        input.addEventListener("input", function(event) {
            
            // if(input.value.startsWith('0')) {
            //     input.value = 0;
            //     event.preventDefault();
            // }

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

        input.addEventListener("change", function() {
            input.value = parseFloat(input.value);
            explodeCount();
        });


    });

    // Prevent using leading and trailing zeros in inputs!
    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {

        input.onblur = () => {
            input.value = parseFloat(input.value);
        }

        input.onkeydown = (event) => {

            if(event.key === '+' || event.key === '-') {
                PopupMessage.Show("Використання символів заборонено", input.parentElement);
                event.preventDefault();
            }
            
            if(event.key === '0') {

                if(Number(input.value) <= 0) {
                    event.preventDefault();
                }

                if(input.id === 'fact-count' && Number(input.value) <= 0) {
            
                    PopupMessage.Show("Обсяг не може бути менше 1", input);
                    
                    input.value = '';
                    input.classList.add("error");
        
                    event.preventDefault();
                    return false;
                }
            }   
        }

        input.addEventListener("focusout", function() {
            input.parentElement.classList.remove("error");
            input.classList.remove("error");
            PopupMessage.Hide();
        });
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

        if(!isNaN(value)) {
            availableAmount -= value;
        }

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
    const hours = document.querySelectorAll('.card-header>.indicator');

    hours.forEach(hour => {

        let value = Number(hour.textContent).toFixed(2);

        if(!isNaN(value)) {
            amount += parseFloat(value);
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






