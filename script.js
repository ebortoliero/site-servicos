const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

$("#year").textContent = new Date().getFullYear();

// Modal open/close
const backdrop = $("#modalBackdrop");
const openBtns = $$("[data-open-modal]");
const closeBtns = $$("[data-close-modal]");

function openModal(){
  backdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
  // reset UI state
  $("#formStatus").style.display = "none";
  $("#formStatus").textContent = "";
  $("#formStatus").className = "status";
  $("#confirmBox").style.display = "none";
  $("#leadForm").style.display = "grid";
  setTimeout(() => { $("#name").focus(); }, 50);
}
function closeModal(){
  backdrop.style.display = "none";
  document.body.style.overflow = "";
}

openBtns.forEach(b => b.addEventListener("click", openModal));
closeBtns.forEach(b => b.addEventListener("click", closeModal));
backdrop.addEventListener("click", (e) => { if(e.target === backdrop) closeModal(); });
document.addEventListener("keydown", (e) => { if(e.key === "Escape" && backdrop.style.display === "flex") closeModal(); });

// Smooth scroll
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if(!id || id === "#") return;
    const target = document.querySelector(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
});

// Lead form: Formspree integration
const form = $("#leadForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = $("#name").value.trim();
  const problem = $("#problem").value.trim();
  const whatsapp = $("#whatsapp").value.trim();
  const status = $("#formStatus");
  const confirm = $("#confirmBox");

  // Validação: campos obrigatórios
  if (!name || !problem || !whatsapp) {
    status.style.display = "block";
    status.className = "status bad";
    status.textContent = "Preencha todos os campos obrigatórios (Nome, Descrição do problema e WhatsApp).";
    return;
  }

  // Preencher campos ocultos antes do envio
  form.querySelector('input[name="page_url"]').value = window.location.href;
  form.querySelector('input[name="page_title"]').value = document.title;
  form.querySelector('input[name="submitted_at"]').value = new Date().toISOString();

  try {
    const response = await fetch("https://formspree.io/f/maqdwakn", {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    });

    if (response.ok) {
      status.style.display = "block";
      status.className = "status ok";
      status.textContent = "Enviado com sucesso!";
      confirm.style.display = "block";
      form.reset();
      setTimeout(closeModal, 2200);
    } else {
      const data = await response.json().catch(() => ({}));
      status.style.display = "block";
      status.className = "status bad";
      status.textContent = data.error || "Ocorreu um erro ao enviar. Tente novamente.";
    }
  } catch (err) {
    status.style.display = "block";
    status.className = "status bad";
    status.textContent = "Erro de conexão. Verifique sua internet e tente novamente.";
  }
});
