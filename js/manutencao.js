// js/manutencao.js
document.addEventListener('DOMContentLoaded', () => {
  // pegar todas as listas (existem múltiplas seções no HTML)
  const listas = Array.from(document.querySelectorAll('.list-cards'));
  // usamos a primeira lista como nosso "container" principal para inserir os cards
  const lista = listas[0];
  const footer = document.querySelector('.bottom-nav');
  const main = document.querySelector('main');
  const titleEls = Array.from(document.querySelectorAll('h3.title'));
  if (!lista || !footer || !main) return;

  const href = window.location.href.toLowerCase();
  let pagina = 'aberto';
  if (href.includes('andamento')) pagina = 'andamento';
  else if (href.includes('encerrado')) pagina = 'encerrado';

  const KEY_ABERTO = 'manutencoes_aberto';
  const KEY_ANDAMENTO = 'manutencoes_andamento';
  const KEY_ENCERRADO = 'manutencoes_encerrado';

  const carregar = (k) => JSON.parse(localStorage.getItem(k)) || [];
  const salvar = (k, arr) => localStorage.setItem(k, JSON.stringify(arr));
  const pegarArray = () => (pagina === 'andamento' ? carregar(KEY_ANDAMENTO) : pagina === 'encerrado' ? carregar(KEY_ENCERRADO) : carregar(KEY_ABERTO));

  // create + button
  const btnAdd = document.createElement('button');
  btnAdd.className = 'btn-add-manu';
  btnAdd.title = 'Adicionar manutenção';
  btnAdd.textContent = '+';
  footer.appendChild(btnAdd);

  // form (full screen)
  const formContainer = document.createElement('div');
  formContainer.className = 'manu-fullscreen-form';
  formContainer.style.display = 'none';
  formContainer.innerHTML = `
    <section style="padding:30px; max-width:760px; margin:40px auto; background:#fff; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.12);">
      <h2 id="manu-form-title" style="margin-top:0;">Nova manutenção</h2>
      <form id="manu-full-form">
        <div style="margin-bottom:14px;">
          <label style="display:block;font-weight:700;margin-bottom:6px;">Problema</label>
          <input name="problema" type="text" required style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-weight:700;margin-bottom:6px;">Quarto / Responsável</label>
          <input name="quarto" type="text" placeholder="Quarto 5 - João" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;" />
        </div>
        <div style="margin-bottom:14px;" id="wrap-tecnico">
          <label style="display:block;font-weight:700;margin-bottom:6px;">Técnico</label>
          <input name="tecnico" type="text" placeholder="Nome do técnico" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;" />
        </div>
        <div style="margin-bottom:14px;" id="wrap-agendada">
          <label style="display:block;font-weight:700;margin-bottom:6px;">Quando (agendada)</label>
          <input name="agendada" type="datetime-local" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;" />
        </div>
        <div style="margin-bottom:14px; display:none;" id="wrap-encerrado">
          <label style="display:block;font-weight:700;margin-bottom:6px;">Data/Hora de encerramento</label>
          <input name="encerradoAt" type="datetime-local" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;" />
        </div>
        <div style="margin-bottom:18px;">
          <label style="display:block;font-weight:700;margin-bottom:6px;">Status</label>
          <select name="status" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
            <option value="aberto">Aberto</option>
            <option value="andamento">Em andamento</option>
            <option value="encerrado">Encerrado</option>
          </select>
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button type="button" id="manu-full-cancel" style="padding:8px 14px;border-radius:6px;border:1px solid #888;background:#f0f0f0;cursor:pointer;">Cancelar</button>
          <button type="submit" id="manu-full-save" style="padding:8px 14px;border-radius:6px;border:none;background:#2a7b71;color:#fff;cursor:pointer;">Salvar</button>
        </div>
      </form>
    </section>
  `;
  footer.parentNode.insertBefore(formContainer, footer);

  // refs
  const form = formContainer.querySelector('#manu-full-form');
  const titleEl = formContainer.querySelector('#manu-form-title');
  const inputP = form.elements['problema'];
  const inputQ = form.elements['quarto'];
  const inputT = form.elements['tecnico'];
  const inputAg = form.elements['agendada'];
  const inputEnc = form.elements['encerradoAt'];
  const selectS = form.elements['status'];
  const wrapTecnico = formContainer.querySelector('#wrap-tecnico');
  const wrapAgendada = formContainer.querySelector('#wrap-agendada');
  const wrapEncerrado = formContainer.querySelector('#wrap-encerrado');
  const btnCancel = formContainer.querySelector('#manu-full-cancel');

  let editingId = null;
  const novoId = () => Date.now() + Math.floor(Math.random() * 1000);

  // adjust fields per status
  function ajustarCamposPorStatus(status) {
    if (status === 'aberto') {
      wrapTecnico.style.display = 'none';
      wrapAgendada.style.display = 'none';
      wrapEncerrado.style.display = 'none';
    } else if (status === 'andamento') {
      wrapTecnico.style.display = '';
      wrapAgendada.style.display = '';
      wrapEncerrado.style.display = 'none';
    } else if (status === 'encerrado') {
      wrapTecnico.style.display = '';
      wrapAgendada.style.display = 'none';
      wrapEncerrado.style.display = '';
    }
  }
  selectS.addEventListener('change', () => ajustarCamposPorStatus(selectS.value));

  // render with title adjustments and card time display
  function renderizar() {
    // ---- NEW: clear ALL existing .list-cards (removes static old cards in HTML) ----
    listas.forEach(l => l.innerHTML = '');
    // -----------------------------------------------------------------------------

    const arr = pegarArray();

    // update page title(s) minimally: use first h3.title if present
    try {
      if (pagina === 'andamento') {
        const withAg = arr.filter(x => x.agendada).map(x => ({...x, d: parseDate(x.agendada)}))
                          .filter(x => x.d && !isNaN(x.d.getTime()));
        if (withAg.length) {
          withAg.sort((a,b) => a.d - b.d);
          const nearest = withAg[0].d;
          const diffDays = daysBetween(new Date(), nearest);
          const txt = diffDays === 0 ? 'Agendado: Hoje' : diffDays === 1 ? 'Agendado: Amanhã' : `Agendado: em ${diffDays} dias`;
          if (titleEls[0]) titleEls[0].textContent = txt;
        } else {
          if (titleEls[0]) titleEls[0].textContent = 'Agendado';
        }
      } else if (pagina === 'aberto') {
        const withCreated = arr.filter(x => x.createdAt).map(x => ({...x, d: parseDate(x.createdAt)}))
                            .filter(x => x.d && !isNaN(x.d.getTime()));
        if (withCreated.length) {
          withCreated.sort((a,b) => b.d - a.d);
          const most = withCreated[0].d;
          const diffDays = daysBetween(most, new Date());
          let txt = 'Essa Semana';
          if (diffDays <= 7) txt = 'Essa Semana';
          else if (diffDays <= 14) txt = 'Semana passada';
          else {
            const weeks = Math.floor(diffDays/7);
            txt = weeks === 1 ? 'Há 1 semana' : `Há ${weeks} semanas`;
          }
          if (titleEls[0]) titleEls[0].textContent = txt;
        } else {
          if (titleEls[0]) titleEls[0].textContent = 'Aberto';
        }
      } else if (pagina === 'encerrado') {
        const withEnc = arr.filter(x => x.encerradoAt).map(x => ({...x, d: parseDate(x.encerradoAt)}))
                         .filter(x => x.d && !isNaN(x.d.getTime()));
        if (withEnc.length) {
          withEnc.sort((a,b) => b.d - a.d);
          const most = withEnc[0].d;
          if (titleEls[0]) titleEls[0].textContent = formatDateTitle(most);
        } else {
          if (titleEls[0]) titleEls[0].textContent = 'Encerrado';
        }
      }
    } catch (e) {
      console.warn('Erro ao atualizar título:', e);
    }

    if (!arr.length) {
      // coloca mensagem de vazio na primeira lista
      lista.innerHTML = `<p class="empty-list-message" style="text-align:center;color:#666;padding:14px 0;">Nenhuma manutenção ${pagina} no momento.</p>`;
      return;
    }

    // rendera todos os itens na PRIMEIRA lista (mantemos aparência consistente)
    arr.forEach(item => {
      const li = document.createElement('li');
      li.className = 'card';
      li.setAttribute('data-id', item.id);

      let timeLine = '';
      if (pagina === 'andamento') {
        if (item.agendada) timeLine = `<p>Agendada às ${formatTimeOnly(item.agendada)}</p>`;
        else if (item.createdAt) timeLine = `<p>Adicionado às ${formatTimeOnly(item.createdAt)}</p>`;
      } else if (pagina === 'aberto') {
        if (item.createdAt) timeLine = `<p>Adicionado às ${formatTimeOnly(item.createdAt)}</p>`;
      } else if (pagina === 'encerrado') {
        if (item.encerradoAt) timeLine = `<p>Encerrado às ${formatTimeOnly(item.encerradoAt)}</p>`;
      }

      const tecnicoLine = item.tecnico ? `<p>Técnico: ${escape(item.tecnico)}</p>` : '';

      li.innerHTML = `
        <ul class="row">
          <li class="card-icon"><img src="img/wrench.png" alt="ícone ferramenta"></li>
          <li>
            <h3>${escape(item.problema)}</h3>
            <p>${escape(item.quarto || '')}</p>
            ${tecnicoLine}
            ${timeLine}
            <div style="margin-top:8px;"><a href="#" class="manu-edit">Editar</a></div>
          </li>
        </ul>
      `;

      li.querySelector('.manu-edit').addEventListener('click', (ev) => {
        ev.preventDefault();
        abrirEdicao(item.id);
      });

      lista.appendChild(li);
    });
  }

  // open/close form functions
  function abrirForm() {
    main.style.display = 'none';
    formContainer.style.display = 'block';
    window.scrollTo({ top: 0 });
  }
  function fecharForm() {
    formContainer.style.display = 'none';
    main.style.display = '';
    editingId = null;
    form.reset();
    renderizar();
  }

  // new
  btnAdd.addEventListener('click', () => {
    editingId = null;
    titleEl.textContent = 'Nova manutenção';
    form.reset();
    selectS.value = pagina === 'andamento' ? 'andamento' : pagina === 'encerrado' ? 'encerrado' : 'aberto';
    ajustarCamposPorStatus(selectS.value);
    inputAg.value = '';
    inputEnc.value = '';
    abrirForm();
    inputP.focus();
  });

  // open edit (search all lists)
  function abrirEdicao(id) {
    const todas = [...carregar(KEY_ABERTO), ...carregar(KEY_ANDAMENTO), ...carregar(KEY_ENCERRADO)];
    const item = todas.find(x => x.id === id);
    if (!item) return;
    editingId = id;
    titleEl.textContent = 'Editar manutenção';
    inputP.value = item.problema || '';
    inputQ.value = item.quarto || '';
    inputT.value = item.tecnico || '';
    inputAg.value = item.agendada || '';
    inputEnc.value = item.encerradoAt || '';
    selectS.value = item.status || pagina;
    ajustarCamposPorStatus(selectS.value);
    abrirForm();
    inputP.focus();
  }

  btnCancel.addEventListener('click', (e) => {
    e.preventDefault();
    fecharForm();
  });

  // form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const problema = inputP.value.trim();
    if (!problema) { alert('Descreva o problema.'); inputP.focus(); return; }
    const quarto = inputQ.value.trim();
    const tecnico = inputT.value.trim();
    const agendada = inputAg.value || '';
    const encerradoAt = inputEnc.value || '';
    const status = selectS.value;

    if (status === 'andamento' && !tecnico) {
      alert('No status "Em andamento" é obrigatório informar o técnico.');
      inputT.focus();
      return;
    }
    if (status === 'encerrado' && !encerradoAt) {
      alert('Para encerrar, informe a data/hora de encerramento.');
      inputEnc.focus();
      return;
    }

    const keys = [KEY_ABERTO, KEY_ANDAMENTO, KEY_ENCERRADO];
    if (editingId) {
      keys.forEach(k => {
        const arr = carregar(k);
        const idx = arr.findIndex(x => x.id === editingId);
        if (idx !== -1) { arr.splice(idx, 1); salvar(k, arr); }
      });
      // try preserve createdAt from previous storage (if present)
      let createdAt = '';
      const allBefore = [...carregar(KEY_ABERTO), ...carregar(KEY_ANDAMENTO), ...carregar(KEY_ENCERRADO)];
      const orig = allBefore.find(x => x.id === editingId);
      if (orig && orig.createdAt) createdAt = orig.createdAt;

      const atualizado = { id: editingId, problema, quarto, tecnico, agendada, encerradoAt, status, createdAt: createdAt || '' };
      const destino = status === 'andamento' ? KEY_ANDAMENTO : status === 'encerrado' ? KEY_ENCERRADO : KEY_ABERTO;
      const destArr = carregar(destino);
      destArr.push(atualizado);
      salvar(destino, destArr);
      fecharForm();
      return;
    }

    // creating new => set createdAt now
    const createdAt = new Date().toISOString();
    const novo = { id: novoId(), problema, quarto, tecnico, agendada, encerradoAt, status, createdAt };
    const destino = status === 'andamento' ? KEY_ANDAMENTO : status === 'encerrado' ? KEY_ENCERRADO : KEY_ABERTO;
    const arrDest = carregar(destino);
    arrDest.push(novo);
    salvar(destino, arrDest);
    fecharForm();
  });

  // helpers: parse datetime-local string into Date
  function parseDate(v) {
    if (!v) return null;
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
    try { return new Date(v.replace(' ', 'T')); } catch { return null; }
  }
  function formatTimeOnly(v) {
    const d = parseDate(v);
    if (!d) return '';
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
  }
  function formatDateTitle(d) {
    if (!(d instanceof Date)) d = new Date(d);
    if (isNaN(d.getTime())) return '';
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${d.getDate()} de ${months[d.getMonth()]} - ${d.getFullYear()}`;
  }
  function daysBetween(a,b) {
    const A = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const B = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    const diff = Math.round((B - A) / (1000*60*60*24));
    return diff;
  }

  function escape(s) {
    return s ? String(s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])) : '';
  }

  // minimal CSS (button inside app)
  const st = document.createElement('style');
  st.textContent = `
    .btn-add-manu {
      position: absolute;
      right: 25px;
      bottom: 25px;
      background:#2a7b71;
      color:#fff;
      border:none;
      border-radius:50%;
      width:55px;
      height:55px;
      font-size:28px;
      font-weight:bold;
      cursor:pointer;
      box-shadow:0 4px 10px rgba(0,0,0,.3);
      transition: transform 0.2s ease;
    }
    .btn-add-manu:hover { transform: scale(1.08); }
    .bottom-nav { position: relative; }
    .empty-list-message { text-align:center;color:#666;padding:14px 0; }
    .manu-edit { color:#1a56a0; text-decoration:underline; cursor:pointer; }
  `;
  document.head.appendChild(st);

  // initial render
  renderizar();
});

