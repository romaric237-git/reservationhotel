let globalData = {}


document.querySelectorAll('.accordion-button').forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        button.classList.toggle('active');
        const content = button.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null; // Ferme la section
        } else {
            content.style.maxHeight = content.scrollHeight + 'px'; // Ouvre la section
        }
    });
});

function UpdateLinesListeners() {
    document.querySelectorAll(".room-list li").forEach((line) => {
    line.addEventListener('click', () => {
        if (line.parentElement.dataset.selection == line.id) {
            line.classList.remove("selected");
            line.parentElement.dataset.selection = "";
        } else if (line.parentElement.dataset.selection == "") {
            line.parentElement.dataset.selection = line.id;
            line.classList.add("selected");
            document.getElementById("errorMsg2").innerText = "";
        } else {
            document.querySelectorAll("#"+line.parentElement.dataset.selection).forEach((line) => {
                line.classList.remove("selected");
            });
            line.parentElement.dataset.selection = line.id;
            line.classList.add("selected");
            document.getElementById("errorMsg2").innerText = "";
        }
    })
});
}


document.querySelectorAll("button#next-1").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (checkformvalidity("form-1")) {
            let data = {}
            data['check-in'] = document.getElementById("check-in").value;
            data['check-out'] = document.getElementById("check-out").value;
            if (data['check-out'] <= data['check-in'] || Date.parse(data['check-in']) < Date.now()) {
                document.getElementById("errorMsg1").innerText = "La plage sélectionnée n'est pas valide.";
            } else {
                document.getElementById("errorMsg1").innerText = "";
                globalData['lastname'] = document.getElementById("lastname").value;
                globalData['firstname'] = document.getElementById("firstname").value;
                globalData['email'] = document.getElementById("email").value;
                globalData['phonenumber'] = document.getElementById("phonenumber").value;
                globalData['check-in'] = document.getElementById("check-in").value;
                globalData['check-out'] = document.getElementById("check-out").value;
                console.log(globalData);
                document.getElementById("step1").classList.add("hide");
                document.getElementById("step2").classList.remove("hide");
            }
        }
    })
});

document.querySelectorAll("button#next-2").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (document.querySelector(".room-list").dataset.selection == "") {
            document.getElementById("errorMsg2").innerText = "Aucune chambre sélectionnée.";
        }else{
            globalData["room-selected"] = document.querySelector(".room-list").dataset.selection;
            globalData["nb-pers"] = document.getElementById("nb-pers").value;
            document.querySelectorAll('[id^="supp"]').forEach((supp) => {
                globalData[supp.id] = supp.checked ? "1" : "0";
            }) 
            console.log(globalData);
            document.getElementById("step2").classList.add("hide");
            document.getElementById("step3").classList.remove("hide");
            document.querySelectorAll("button#next-3").disabled = false;
            document.querySelectorAll("button#next-4").disabled = false;
        } 
    })
});

document.querySelectorAll("button#return-1").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        document.getElementById("step2").classList.add("hide");
        document.getElementById("step1").classList.remove("hide");
        document.getElementById("loading").style.display = "none";
    })
});

document.querySelectorAll("button#return-2").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        document.getElementById("step4").classList.add("hide");
        document.getElementById("step3").classList.add("hide");
        document.getElementById("step2").classList.remove("hide");
        document.getElementById("loading").style.display = "none";
    })
});

document.querySelectorAll(".room-selection-option").forEach((opt) => {
    opt.addEventListener('change', (e)=>{
        e.preventDefault();
        UpdateRoomList();
    })
});

document.querySelectorAll("button#next-3").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        SendConfirmationCode(true);
    })
});

document.querySelectorAll("button#next-4").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        SendConfirmationCode(false);
    })
});

document.querySelectorAll("button#next-5").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        VerifyConfirmationCode();
    })
});

function UpdateRoomList() {
    let data = {}
    data["nb-pers"] = document.getElementById("nb-pers").value;
    data["pref1"] = document.getElementById("pref1").checked ? "1" : "0"; 
    data["pref2"] = document.getElementById("pref2").checked ? "1" : "0"; 
    data["pref3"] = document.getElementById("pref3").checked ? "1" : "0"; 

    data['csrfmiddlewaretoken'] = getCookie('csrftoken');
    $.ajax({
        url: 'updateroomslist',
        type: 'POST',
        data: data,
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            if (response['state'] == "success") {
                container = document.querySelector(".room-list")
                container.innerHTML = "";
                for (const room in response["rooms"]) {
                    container.innerHTML += `
                    <li id="room-` + response["rooms"][room]['pk'] + `">
                        <img src="` + response["rooms"][room]['imageurl'] + `" alt="` + response["rooms"][room]['name'] + `">
                        <p>` + response["rooms"][room]['name'] + `<br><span>` + response["rooms"][room]['price'] + ` FCFA</span></p>
                    </li>
                    `;
                }
                UpdateLinesListeners()
            }
            else alert(response['errorThrown'])
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
        }
    })
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function SendConfirmationCode(byEmail) {
    globalData["confirmMode"] = byEmail ? "email" : "sms";
    document.querySelectorAll("button#next-3").disabled = true;
    document.querySelectorAll("button#next-4").disabled = true;
    document.getElementById("loading").style.display = "block";
    
    globalData['csrfmiddlewaretoken'] = getCookie('csrftoken');
    $.ajax({
        url: 'sendconfirmationcode',
        type: 'POST',
        data: globalData,
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            if (response['state'] == "success") {
                document.getElementById("loading").style.display = "none";
                document.getElementById("step3").classList.add("hide");
                document.getElementById("step4").classList.remove("hide");
                globalData['reservation-id'] = response['reservation-id'];
            }
            else document.getElementById("errorMsg3").innerText = "Impossible d'envoyer le code";
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
            document.getElementById("errorMsg3").innerText = "Impossible d'envoyer le code";
        }
    })
}

function VerifyConfirmationCode(byEmail) {
    document.getElementById("loading").style.display = "block";
    globalData["code"] = document.getElementById("confirmationCode").value;
    globalData['csrfmiddlewaretoken'] = getCookie('csrftoken');
    $.ajax({
        url: 'verifyconfirmationcode',
        type: 'POST',
        data: globalData,
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            if (response['state'] == "success") {
                document.getElementById("loading").style.display = "none";
                alert("Réservation enregistrée avec succès");
                window.location.href = "my-reservations";
            }
            else if (response['state'] == "error1") {
                document.getElementById("errorMsg4").innerText = "Code incorrect";
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
            document.getElementById("errorMsg3").innerText = "Impossible d'envoyer le code";
        }
    })
}

function checkformvalidity(groupId) {
    const form = document.getElementById(groupId);
    if (!form) {
        return 0;
    }
    let counter = form.querySelectorAll("input, select").length
    const elements = form.querySelectorAll("input, select")
    let result = true;
    for (let i = counter - 1; i >= 0; i--) {
        const element = elements[i];
        if (element.offsetWidth > 0 || element.offsetHeight > 0)
            if (!element.reportValidity())
                result = false;
    }
    return result;
}

UpdateRoomList();