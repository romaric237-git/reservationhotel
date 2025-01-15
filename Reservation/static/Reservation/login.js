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

document.querySelectorAll("button#next-1").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (checkformvalidity("form-1")) {
            document.getElementById("errorMsg1").innerText = "";
            globalData['email'] = document.getElementById("email").value;
            document.getElementById("loading").style.display = "block";
            console.log(globalData);
            //Vérifier si l'email existe ou pas
            globalData['csrfmiddlewaretoken'] = getCookie('csrftoken');
            $.ajax({
                url: 'verifyemailaccount',
                type: 'POST',
                data: globalData,
                dataType: 'json',
                timeout: 10000,
                success: function(response) {
                    if (response['state'] == "success") {
                        document.getElementById("loading").style.display = "none";
                        document.getElementById("step1").classList.add("hide");
                        if (response['exists'] == "1") {
                            document.getElementById("step3").classList.remove("hide");
                            globalData["user-id"] = response['user-id'];
                            globalData["phonenumber"] = response['phonenumber'];
                        } else {
                            document.getElementById("step2").classList.remove("hide");
                        }
                    }
                    else document.getElementById("errorMsg3").innerText = "Impossible d'envoyer le code";
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
                    document.getElementById("errorMsg3").innerText = "Impossible d'envoyer le code";
                }
            })
        }
    })
});

document.querySelectorAll("button#next-2").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (checkformvalidity("form-2")) {
            document.getElementById("errorMsg1").innerText = "";
            globalData['lastname'] = document.getElementById("lastname").value;
            globalData['firstname'] = document.getElementById("firstname").value;
            globalData['phonenumber'] = document.getElementById("phonenumber").value;
            console.log(globalData);
            document.getElementById("step2").classList.add("hide");
            document.getElementById("step3").classList.remove("hide");
        }
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
        url: 'sendconfirmationcodetolog',
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
        url: 'verifyconfirmationcodetolog',
        type: 'POST',
        data: globalData,
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            if (response['state'] == "success") {
                document.getElementById("loading").style.display = "none";
                alert("Connexion effectuée avec succès");
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
