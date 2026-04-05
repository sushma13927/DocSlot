/*****************************************
 APPOINTMENT BOOKING + RESCHEDULE
******************************************/

let selectedDoctor = JSON.parse(localStorage.getItem("selectedDoctor"));
let loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

let rescheduleId = localStorage.getItem("rescheduleId") || null;

document.getElementById("doctorDetailsCard").innerHTML = `
    <h3>${selectedDoctor.name}</h3>
    <p>${selectedDoctor.specialty}</p>
    <small>${selectedDoctor.address}</small>
`;

/* TIME SLOT MOCK BY SPECIALTY */
const specialtySlots = {
    Cardiology:["09:00","09:30","10:00","10:30","11:00"],
    Pediatrics:["14:00","14:30","15:00","15:30","16:00"],
    Dermatology:["11:00","11:30","13:30","14:30","15:30"],
    Orthopedics:["10:00","11:00","15:00","16:00"],
    General:["09:00","09:30","10:00","10:30","11:30","15:00","16:30"]
};

let slotDiv = document.getElementById("timeSlots");
let dateInput = document.getElementById("rescheduleDate");

let selectedSlot = null;

/* RENDER SLOTS */
specialtySlots[selectedDoctor.specialty].forEach(s=>{
    let div = document.createElement("div");
    div.textContent=s;
    div.onclick=()=>{
        Array.from(slotDiv.children).forEach(c=>{
            c.style.background="#e3eafc";
            c.style.color="black";
        });
        div.style.background="#0066cc";
        div.style.color="white";
        selectedSlot=s;
    };
    slotDiv.appendChild(div);
});

/* CONFIRM */
document.getElementById("confirmAppointmentBtn").onclick = () => {
    if (!selectedSlot) return alert("Select time");
    if (!dateInput.value) return alert("Select date");

    const reason = document.getElementById("reasonInput").value.trim();
    if (!reason) return alert("Enter reason");

    if (rescheduleId) {
        let ap = appointments.find(a=>a.id===rescheduleId);
        ap.status="Rescheduled";
        ap.date=dateInput.value;
        ap.time=selectedSlot;
        ap.reason=reason;
        ap.updatedAt=Date.now();

        localStorage.removeItem("rescheduleId");
    } else {
        appointments.push({
            id:"AP"+Date.now(),
            doctorId:selectedDoctor.id,
            doctorName:selectedDoctor.name,
            specialty:selectedDoctor.specialty,
            patientEmail:loggedUser.email,
            date:dateInput.value,
            time:selectedSlot,
            reason,
            status:"Scheduled",
            createdAt:Date.now()
        });
    }

    localStorage.setItem("appointments",JSON.stringify(appointments));
    alert("Appointment Saved!");
    window.location.href="index.html";
};
