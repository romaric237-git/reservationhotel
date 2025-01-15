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

document.querySelectorAll("button#next-2").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (document.querySelector(".room-list").dataset.selection == "") {
            document.getElementById("errorMsg2").innerText = "Aucune chambre sélectionnée.";
        }else{
            if (data['check-out'] <= data['check-in'] || Date.parse(data['check-in']) < Date.now())
                document.getElementById("errorMsg2").innerText = "La plage sélectionnée n'est pas valide.";
            else
                UpdateReservation();
        } 
    })
});

document.querySelectorAll(".room-selection-option").forEach((opt) => {
    opt.addEventListener('change', (e)=>{
        e.preventDefault();
        UpdateRoomList();
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
                document.querySelectorAll("#"+container.dataset.selection).forEach((line) =>{
                    line.classList.add("selected");
                });
                UpdateLinesListeners()
            }
            else alert(response['errorThrown'])
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
        }
    })
}

function UpdateReservation() {
    let data = {}
    data["room-selected"] = document.querySelector(".room-list").dataset.selection;
    data["reservation-id"] = document.getElementById("reservation-id").value;
    document.querySelectorAll('[id^="supp"]').forEach((supp) => {
        data[supp.id] = supp.checked ? "1" : "0";
    })
    data['check-in'] = document.getElementById("check-in").value;
    data['check-out'] = document.getElementById("check-out").value;
    data['csrfmiddlewaretoken'] = getCookie('csrftoken');
    console.log(data);
    $.ajax({
        url: 'updatereservation',
        type: 'POST',
        data: data,
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            if (response['state'] == "success") {
                alert("Réservation mise à jour");
                window.location.href = "my-reservations"
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