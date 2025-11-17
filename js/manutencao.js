// js/manutencao.js
document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('.bottom-nav');
  const main = document.querySelector('main');
  if (!footer || !main) return;

  const href = window.location.href.toLowerCase();
  let pagina = 'aberto';
  if (href.includes('andamento')) pagina = 'andamento';
  else if (href.includes('encerrado')) pagina = 'encerrado';

  const KEY_ABERTO = 'manutencoes_aberto';
  const KEY_ANDAMENTO = 'manutencoes_andamento';
  const KEY_ENCERRADO = 'manutencoes_encerrado';

  const carregar = (k) => JSON.parse(localStorage.getItem(k)) || [];
  const salvar = (k, arr) => localStorage.setItem(k, JSON.stringify(arr));
  const pegarArray = () =>
    pagina === 'andamento'
      ? carregar(KEY_ANDAMENTO)
      : pagina === 'encerrado'
      ? carregar(KEY_ENCERRADO)
      : carregar(KEY_ABERTO);

  const btnAdd = document.createElement('button');
  btnAdd.className = 'btn-add-manu';
  btnAdd.textContent = '+';
  footer.appendChild(btnAdd);

  const formContainer = document.createElement('div');
  formContainer.className = 'manu-fullscreen-form';
  formContainer.style.display = 'none';
  formContainer.innerHTML = `
    <section style="padding:30px; max-width:760px; margin:40px auto; background:#fff; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.12);">
      <h2 id="manu-form-title" style="margin-top:0;">Nova manutenção</h2>
      <form id="manu-full-form">
        <div style="margin-bottom:14px;">
          <label>Problema</label>
          <input name="problema" required style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
        </div>
        <div style="margin-bottom:14px;">
          <label>Quarto / Responsável</label>
          <input name="quarto" placeholder="Quarto 5 - João" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
        </div>
        <div id="wrap-tecnico" style="margin-bottom:14px;">
          <label>Técnico</label>
          <input name="tecnico" placeholder="Nome do técnico" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
        </div>
        <div id="wrap-agendada" style="margin-bottom:14px;">
          <label>Quando (agendada)</label>
          <input name="agendada" type="datetime-local" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
        </div>
        <div id="wrap-encerrado" style="margin-bottom:14px;display:none;">
          <label>Data/Hora de encerramento</label>
          <input name="encerradoAt" type="datetime-local" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
        </div>
        <div style="margin-bottom:18px;">
          <label>Status</label>
          <select name="status" style="width:100%;padding:10px;border:1px solid #999;border-radius:8px;">
            <option value="aberto">Aberto</option>
            <option value="andamento">Em andamento</option>
            <option value="encerrado">Encerrado</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button type="button" id="cancelar" style="padding:8px 14px;border:1px solid #888;background:#eee;border-radius:6px;">Cancelar</button>
          <button type="submit" id="salvar" style="padding:8px 14px;border:none;background:#2a7b71;color:#fff;border-radius:6px;">Salvar</button>
        </div>
      </form>
    </section>`;
  footer.parentNode.insertBefore(formContainer, footer);

  const form = formContainer.querySelector('form');
  const titleForm = formContainer.querySelector('#manu-form-title');
  const inputP = form.elements['problema'];
  const inputQ = form.elements['quarto'];
  const inputT = form.elements['tecnico'];
  const inputAg = form.elements['agendada'];
  const inputEnc = form.elements['encerradoAt'];
  const selectS = form.elements['status'];
  const wrapTec = formContainer.querySelector('#wrap-tecnico');
  const wrapAg = formContainer.querySelector('#wrap-agendada');
  const wrapEnc = formContainer.querySelector('#wrap-encerrado');
  const btnCancelar = formContainer.querySelector('#cancelar');

  let editingId = null;
  const novoId = () => Date.now() + Math.floor(Math.random() * 1000);

  function ajustarCamposPorStatus(s) {
    wrapTec.style.display = s === 'aberto' ? 'none' : '';
    wrapAg.style.display = s === 'andamento' ? '' : 'none';
    wrapEnc.style.display = s === 'encerrado' ? '' : 'none';
  }
  selectS.addEventListener('change', () => ajustarCamposPorStatus(selectS.value));

  function renderizar() {
    const arr = pegarArray();
    main.innerHTML = '';

    if (!arr.length) {
      main.innerHTML = `<p class="empty-list-message" style="text-align:center;color:#666;padding:14px 0;">Nenhuma manutenção ${pagina} no momento.</p>`;
      return;
    }

    let grupos = {};

    arr.forEach((item) => {
      let dataChave = '';

      if (pagina === 'andamento' && item.agendada) {
        const d = new Date(item.agendada);
        dataChave = `Agendado: ${formatDateTitle(d)}`;
      } else if (pagina === 'encerrado' && item.encerradoAt) {
        const d = new Date(item.encerradoAt);
        dataChave = formatDateTitle(d);
      } else if (pagina === 'aberto' && item.createdAt) {
        const d = new Date(item.createdAt);
        const diff = daysBetween(d, new Date());
        if (diff <= 7) dataChave = 'Essa Semana';
        else if (diff <= 14) dataChave = 'Semana passada';
        else {
          const weeks = Math.floor(diff / 7);
          dataChave = `Há ${weeks} semanas`;
        }
      }

      if (!dataChave) dataChave = 'Outros';
      if (!grupos[dataChave]) grupos[dataChave] = [];
      grupos[dataChave].push(item);
    });

    const ordem = Object.keys(grupos).sort((a, b) => {
      const da = parseTitleDate(a);
      const db = parseTitleDate(b);
      return da - db;
    });

    ordem.forEach((titulo) => {
      const h3 = document.createElement('h3');
      h3.className = 'title';
      h3.textContent = titulo;
      main.appendChild(h3);

      const ul = document.createElement('ul');
      ul.className = 'list-cards';
      grupos[titulo].forEach((item) => {
        const li = document.createElement('li');
        li.className = 'card';
        const tecnicoLine = item.tecnico ? `<p>Técnico: ${escape(item.tecnico)}</p>` : '';
        let hora = '';
        if (pagina === 'andamento' && item.agendada)
          hora = `<p>Agendada às ${formatTimeOnly(item.agendada)}</p>`;
        if (pagina === 'encerrado' && item.encerradoAt)
          hora = `<p>Encerrado às ${formatTimeOnly(item.encerradoAt)}</p>`;
        if (pagina === 'aberto' && item.createdAt)
          hora = `<p>Adicionado às ${formatTimeOnly(item.createdAt)}</p>`;
        li.innerHTML = `
          <ul class="row">
            <li class="card-icon"><img src="img/wrench.png" alt="ícone"></li>
            <li>
              <h3>${escape(item.problema)}</h3>
              <p>${escape(item.quarto || '')}</p>
              ${tecnicoLine}
              ${hora}
              <div style="margin-top:8px;"><a href="#" class="manu-edit">Editar</a></div>
            </li>
          </ul>`;
        li.querySelector('.manu-edit').addEventListener('click', (e) => {
          e.preventDefault();
          abrirEdicao(item.id);
        });
        ul.appendChild(li);
      });
      main.appendChild(ul);
    });
  }

  function parseTitleDate(titulo) {
    const partes = titulo.match(/(\d+)\s+de\s+(\w+)\s*-\s*(\d+)/i);
    if (!partes) return new Date(0);
    const dia = parseInt(partes[1]);
    const mes = [
      'janeiro','fevereiro','março','abril','maio','junho',
      'julho','agosto','setembro','outubro','novembro','dezembro'
    ].indexOf(partes[2].toLowerCase());
    const ano = parseInt(partes[3]);
    return new Date(ano, mes, dia);
  }

  function daysBetween(a, b) {
    const A = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const B = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((B - A) / (1000 * 60 * 60 * 24));
  }

  function formatDateTitle(d) {
    if (!(d instanceof Date)) d = new Date(d);
    const meses = [
      'janeiro','fevereiro','março','abril','maio','junho',
      'julho','agosto','setembro','outubro','novembro','dezembro'
    ];
    return `${d.getDate()} de ${meses[d.getMonth()]} - ${d.getFullYear()}`;
  }

  function formatTimeOnly(v) {
    const d = new Date(v);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function escape(s) {
    return s ? s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : '';
  }

  function abrirForm() {
    main.style.display = 'none';
    formContainer.style.display = 'block';
  }
  function fecharForm() {
    formContainer.style.display = 'none';
    main.style.display = '';
    editingId = null;
    form.reset();
    renderizar();
  }

  btnAdd.onclick = () => {
    editingId = null;
    titleForm.textContent = 'Nova manutenção';
    form.reset();
    selectS.value = pagina;
    ajustarCamposPorStatus(selectS.value);
    abrirForm();
  };

  function abrirEdicao(id) {
    const todas = [...carregar(KEY_ABERTO), ...carregar(KEY_ANDAMENTO), ...carregar(KEY_ENCERRADO)];
    const item = todas.find((x) => x.id === id);
    if (!item) return;
    editingId = id;
    titleForm.textContent = 'Editar manutenção';
    inputP.value = item.problema || '';
    inputQ.value = item.quarto || '';
    inputT.value = item.tecnico || '';
    inputAg.value = item.agendada || '';
    inputEnc.value = item.encerradoAt || '';
    selectS.value = item.status || pagina;
    ajustarCamposPorStatus(selectS.value);
    abrirForm();
  }

  btnCancelar.onclick = fecharForm;

  form.onsubmit = (e) => {
    e.preventDefault();
    const problema = inputP.value.trim();
    const quarto = inputQ.value.trim();
    const tecnico = inputT.value.trim();
    const agendada = inputAg.value || '';
    const encerradoAt = inputEnc.value || '';
    const status = selectS.value;
    if (!problema) return alert('Descreva o problema.');

    const createdAt = new Date().toISOString();
    const obj = { id: editingId || novoId(), problema, quarto, tecnico, agendada, encerradoAt, status, createdAt };

    const destino =
      status === 'andamento' ? KEY_ANDAMENTO :
      status === 'encerrado' ? KEY_ENCERRADO : KEY_ABERTO;

    const arr = carregar(destino).filter((x) => x.id !== obj.id);
    arr.push(obj);
    salvar(destino, arr);
    fecharForm();
  };

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
    }
    .bottom-nav { position: relative; }
    .manu-edit { color:#1a56a0; text-decoration:underline; cursor:pointer; }
  `;
  document.head.appendChild(st);

  renderizar();
});
