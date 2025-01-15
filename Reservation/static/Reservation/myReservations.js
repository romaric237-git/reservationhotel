
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

document.querySelectorAll(".room-list li").forEach((line) => {
    line.addEventListener('click', () => {
        if (line.parentElement.dataset.selection == line.id) {
            line.classList.remove("selected");
            line.parentElement.dataset.selection = "";
        } else if (line.parentElement.dataset.selection == "") {
            line.parentElement.dataset.selection = line.id;
            line.classList.add("selected");
        } else {
            document.getElementById(line.parentElement.dataset.selection).classList.remove("selected");
            line.parentElement.dataset.selection = line.id;
            line.classList.add("selected");
        }
        if (line.parentElement.dataset.selection == "") {
            document.getElementById("modifyBtn").classList.add("hide");
            document.getElementById("cancelBtn").classList.add("hide");
        } else {
            document.getElementById("modifyBtn").classList.remove("hide");
            document.getElementById("cancelBtn").classList.remove("hide");
        }
    })
});

document.getElementById("modifyBtn").addEventListener('click', ()=>{
    window.location.href = "modifyreservation?reservation-id=" + document.querySelector(".room-list").dataset.selection.replace("reservation-", "");
})

document.querySelectorAll("#cancelBtn").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (confirm("Voulez-vous vraiment annuler votre réservation ?")) {
            let data = {}
            data['reservation-id'] = document.querySelector(".room-list").dataset.selection.replace("reservation-", "");

            $.ajax({
                url: 'deletereservation',
                type: 'POST',
                data: data,
                dataType: 'json',
                timeout: 10000,
                success: function(response) {
                    if (response['state'] == "success") {
                        window.location.href = "my-reservations";
                    }
                    else alert(response['errorThrown'])
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
                }
            })
        }
    })
})

document.querySelectorAll("#logoutBtn").forEach((btn) => {
    btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
            let data = {}
            $.ajax({
                url: 'logout',
                type: 'POST',
                data: data,
                dataType: 'json',
                timeout: 10000,
                success: function(response) {
                    if (response['state'] == "success") {
                        window.location.href = "./";
                    }
                    else alert(response['errorThrown'])
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Une erreur est survenue: "+ textStatus + ". " + errorThrown, "error");
                }
            })
        }
    })
})
