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

  // Botão +
  const btnAdd = document.createElement('button');
  btnAdd.className = 'btn-add-manu';
  btnAdd.textContent = '+';
  footer.appendChild(btnAdd);

  // Formulário fullscreen
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

    function pushRecentManutencao(item) {
        try {
            const chave = 'manutencoesRecentes';
            const arr = JSON.parse(localStorage.getItem(chave)) || [];
            // remove qualquer entrada com mesmo id
            const filtered = arr.filter(r => String(r.id) !== String(item.id));
            const recent = {
            id: item.id,
            nome: item.quarto || item.problema || 'Manutenção',
            descricao: item.problema || '',
            tipo: 'manutencao',
            when: new Date().toISOString()
            };
            filtered.unshift(recent);
            if (filtered.length > 10) filtered.length = 10;
            localStorage.setItem(chave, JSON.stringify(filtered));
        } catch (err) {
            console.warn('Erro ao gravar manutencoesRecentes', err);
        }
    }

    // remove um recent por id
    function removeRecentManutencaoById(id) {
        try {
            const chave = 'manutencoesRecentes';
            const arr = JSON.parse(localStorage.getItem(chave)) || [];
            const novo = arr.filter(r => String(r.id) !== String(id));
            localStorage.setItem(chave, JSON.stringify(novo));
        } catch (err) {
            console.warn('Erro ao remover manutencoesRecentes', err);
        }
    }

    // deletar manutenção: remove das 3 listas E do recent
    function deletarManutencao(id) {
        if (!confirm('Tem certeza que deseja apagar esta manutenção?')) return;
        const keys = [KEY_ABERTO, KEY_ANDAMENTO, KEY_ENCERRADO];
        keys.forEach(k => {
            const arr = carregar(k);
            const idx = arr.findIndex(x => String(x.id) === String(id));
            if (idx !== -1) {
            arr.splice(idx, 1);
            salvar(k, arr);
            }
        });

        // também remove do resumo da home
        removeRecentManutencaoById(id);

        renderizar();
    }


  // Renderização
  function renderizar() {
    const arr = pegarArray();
    main.innerHTML = '';

    if (!arr.length) {
      main.innerHTML = `<p class="empty-list-message" style="text-align:center;color:#666;padding:14px 0;">Nenhuma manutenção ${pagina} no momento.</p>`;
      return;
    }

    // agrupamento simples (igual antes)
    let grupos = {};
    arr.forEach((item) => {
      let dataChave = '';
      if (pagina === 'andamento' && item.agendada) {
        dataChave = formatDateTitle(new Date(item.agendada));
      } else if (pagina === 'encerrado' && item.encerradoAt) {
        dataChave = formatDateTitle(new Date(item.encerradoAt));
      } else if (pagina === 'aberto' && item.createdAt) {
        const diff = daysBetween(new Date(item.createdAt), new Date());
        if (diff <= 7) dataChave = 'Essa Semana';
        else if (diff <= 14) dataChave = 'Semana passada';
        else {
          const weeks = Math.floor(diff / 7);
          dataChave = `Há ${weeks} semanas`;
        }
      } else {
        dataChave = 'Outros';
      }
      if (!grupos[dataChave]) grupos[dataChave] = [];
      grupos[dataChave].push(item);
    });

    Object.keys(grupos).forEach((titulo) => {
      const h3 = document.createElement('h3');
      h3.className = 'title';
      h3.textContent = pagina === 'andamento' ? `Agendado: ${titulo}` : titulo;
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
              <div style="margin-top:8px; display:flex; gap:8px;">
                <a href="#" class="manu-edit">Editar</a>
                <a href="#" class="manu-delete" style="color:red;">Apagar</a>
              </div>
            </li>
          </ul>`;
        li.querySelector('.manu-edit').addEventListener('click', (e) => {
          e.preventDefault();
          abrirEdicao(item.id);
        });
        li.querySelector('.manu-delete').addEventListener('click', (e) => {
          e.preventDefault();
          deletarManutencao(item.id);
        });
        ul.appendChild(li);
      });
      main.appendChild(ul);
    });
  }

  // Funções auxiliares
  function formatDateTitle(d) {
    const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${d.getDate()} de ${meses[d.getMonth()]} - ${d.getFullYear()}`;
  }
  function formatTimeOnly(v) {
    const d = new Date(v);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  function daysBetween(a,b){return Math.round((b - a)/(1000*60*60*24));}
  function escape(s){return s?String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])):'';}

  // Formulário
  function abrirForm(){main.style.display='none';formContainer.style.display='block';}
  function fecharForm(){formContainer.style.display='none';main.style.display='';editingId=null;form.reset();renderizar();}

  btnAdd.onclick=()=>{editingId=null;titleForm.textContent='Nova manutenção';form.reset();selectS.value=pagina;ajustarCamposPorStatus(selectS.value);abrirForm();};

  function abrirEdicao(id){
    const todas=[...carregar(KEY_ABERTO),...carregar(KEY_ANDAMENTO),...carregar(KEY_ENCERRADO)];
    const item=todas.find(x=>x.id===id);
    if(!item)return;
    editingId=id;
    titleForm.textContent='Editar manutenção';
    inputP.value=item.problema||'';inputQ.value=item.quarto||'';inputT.value=item.tecnico||'';
    inputAg.value=item.agendada||'';inputEnc.value=item.encerradoAt||'';selectS.value=item.status||pagina;
    ajustarCamposPorStatus(selectS.value);abrirForm();
  }

  btnCancelar.onclick=fecharForm;

  form.onsubmit=(e)=>{
    e.preventDefault();
    const problema=inputP.value.trim(),quarto=inputQ.value.trim(),tecnico=inputT.value.trim(),agendada=inputAg.value||'',encerradoAt=inputEnc.value||'',status=selectS.value;
    if(!problema)return alert('Descreva o problema.');
    if(status==='andamento'&&!tecnico)return alert('Informe o técnico.');
    if(status==='encerrado'&&!encerradoAt)return alert('Informe a data de encerramento.');

    const keys=[KEY_ABERTO,KEY_ANDAMENTO,KEY_ENCERRADO];
    if(editingId){
      keys.forEach(k=>{const arr=carregar(k);const idx=arr.findIndex(x=>x.id===editingId);if(idx!==-1){arr.splice(idx,1);salvar(k,arr);}});
    }
    const createdAt=new Date().toISOString();
    const obj={id:editingId||novoId(),problema,quarto,tecnico,agendada,encerradoAt,status,createdAt};
    const destino=status==='andamento'?KEY_ANDAMENTO:status==='encerrado'?KEY_ENCERRADO:KEY_ABERTO;
    const arrDest=carregar(destino);arrDest.push(obj);salvar(destino,arrDest);
    pushRecentManutencao(obj);
    fecharForm();
  };

  // CSS do botão +
  const st=document.createElement('style');
  st.textContent=`
    .btn-add-manu{position:absolute;right:25px;bottom:25px;background:#2a7b71;color:#fff;border:none;border-radius:50%;width:55px;height:55px;font-size:28px;font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.3);}
    .bottom-nav{position:relative;}
    .manu-edit{color:#1a56a0;text-decoration:underline;cursor:pointer;}
    .manu-delete{color:red;text-decoration:underline;cursor:pointer;}
  `;
  document.head.appendChild(st);

  renderizar();
});
