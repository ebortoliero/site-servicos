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
  setTimeout(() => { $("#problem").focus(); }, 50);
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

// Helpers
function normalizeWhitespace(s){
  return (s || "").replace(/\s+/g, " ").trim();
}
function shortSummary(text, maxLen=180){
  const t = normalizeWhitespace(text);
  if(t.length <= maxLen) return t;
  return t.slice(0, maxLen-1).trim() + "…";
}
function nowStamp(){
  const d = new Date();
  const pad = n => String(n).padStart(2,"0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Lead form (no server): copy to clipboard
const form = $("#leadForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const problem = $("#problem").value.trim();
  const whatsapp = $("#whatsapp").value.trim();

  // WhatsApp-directed opening message (for YOU to paste when contacting)
  const resumo = shortSummary(problem, 220);

  const msg =
`LEAD — SITE (CAPTURA MÍNIMA)
Data/hora: ${nowStamp()}
WhatsApp informado: ${whatsapp}

Problema descrito:
${problem}

MENSAGEM INICIAL (WhatsApp dirigido):
Olá! Tudo bem?

Vi que você descreveu este problema no site:
"${resumo}"

Antes de avançar, preciso confirmar alguns pontos rápidos para verificar se consigo entregar uma solução dentro do modelo de entrega em até 7 dias.
Essa conversa é apenas para validar o encaixe, tudo bem?
`;

  const status = $("#formStatus");
  const confirm = $("#confirmBox");

  try{
    await navigator.clipboard.writeText(msg);

    status.style.display = "block";
    status.classList.add("ok");
    status.textContent = "Enviado! (Resumo copiado para a área de transferência.)";

    // Show confirmation message
    confirm.style.display = "block";

    // Optional: clear fields
    form.reset();

    // Auto-close after a bit
    setTimeout(closeModal, 2200);
  }catch(err){
    status.style.display = "block";
    status.classList.add("bad");
    status.textContent = "Não consegui copiar automaticamente. Selecione e copie manualmente o texto abaixo:";

    // Fallback textarea
    let ta = $("#fallbackMsg");
    if(ta) ta.remove();

    ta = document.createElement("textarea");
    ta.id = "fallbackMsg";
    ta.className = "mono";
    ta.value = msg;
    ta.readOnly = true;
    ta.style.width = "100%";
    ta.style.minHeight = "180px";
    ta.style.marginTop = "10px";

    form.appendChild(ta);
    ta.focus();
    ta.select();

    confirm.style.display = "block";
  }
});
