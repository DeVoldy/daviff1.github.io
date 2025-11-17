document.addEventListener('DOMContentLoaded', function() {
    
// substitua a função renderizarMultasRecentes() inteira por isto em js/index.js

function renderizarMultasRecentes() {
    const menuItems = document.querySelector('.menu-items');
    const ttlRecentes = document.querySelector('#ttl-recentes');
    if (!menuItems || !ttlRecentes) return;

    // lê as duas chaves (se nenhuma existir, vira array vazio)
    let multasRecentes = JSON.parse(localStorage.getItem('multasRecentes')) || [];
    let manutencoesRecentes = JSON.parse(localStorage.getItem('manutencoesRecentes')) || [];

    // --- limpeza preventiva: remove recents de manutencoes que não existem mais nas listas reais ---
    // carrega listas reais de manutenção (se o seu manutencao.js usa outras chaves, adapte aqui)
    const aberto = JSON.parse(localStorage.getItem('manutencoes_aberto')) || [];
    const andamento = JSON.parse(localStorage.getItem('manutencoes_andamento')) || [];
    const encerrado = JSON.parse(localStorage.getItem('manutencoes_encerrado')) || [];
    const todasManuts = aberto.concat(andamento, encerrado).map(x => String(x.id));

    manutencoesRecentes = manutencoesRecentes.filter(r => {
      // mantém o recent se ainda existir uma manutenção com esse id
      if (!r.id) return false;
      return todasManuts.includes(String(r.id));
    });
    // salva a versão "limpa" de volta
    localStorage.setItem('manutencoesRecentes', JSON.stringify(manutencoesRecentes));

    // remove apenas cards dinâmicos já inseridos antes (evita tocar no HTML estático)
    document.querySelectorAll('.recent-card[data-multa-id]').forEach(card => card.remove());

    // remove mensagem vazia anterior
    const emptyMessage = menuItems.querySelector('.empty-list-message');
    if (emptyMessage) emptyMessage.remove();

    // normaliza ambos os arrays para estrutura comum e marca tipo
    const normMultas = multasRecentes.map(m => ({
        id: m.id,
        nome: m.nome || '',
        descricao: m.descricao || '',
        valor: m.valor || '',
        tipo: 'multa',
        when: m.when || m.createdAt || new Date().toISOString()
    }));

    const normManuts = manutencoesRecentes.map(m => ({
        id: m.id,
        // mostrar como nome o campo que você usava no card verde (usar quarto quando disponível)
        nome: m.nome || m.quarto || '',
        descricao: m.descricao || m.problema || '',
        valor: m.valor || '',
        tipo: 'manutencao',
        when: m.when || m.createdAt || new Date().toISOString()
    }));

    // junta e ordena por 'when' (mais recentes primeiro)
    const all = normMultas.concat(normManuts).sort((a,b) => new Date(b.when) - new Date(a.when));

    if (all.length === 0) {
        const empty = document.createElement('p');
        empty.classList.add('empty-list-message');
        empty.textContent = "Nenhuma notificação recente para exibir no momento.";
        menuItems.insertBefore(empty, ttlRecentes.nextSibling);
        return;
    }

    // Insere cada card usando **a mesma estrutura HTML** que seu index já usa para multas
    all.forEach(item => {
        const card = document.createElement('article');
        card.classList.add('recent-card');
        card.setAttribute('data-multa-id', item.id || '');

        if (item.tipo === 'multa') {
            // mesmo layout que existia antes para multas (mantém o visual verde)
            card.innerHTML = `
                <span class="name">${escapeHtml(item.nome)}</span>
                <section class="details">
                    <p>Multa - ${escapeHtml(item.descricao)}</p>
                    <p>R$ ${item.valor}</p>
                </section>
            `;
        } else {
            // manutenção: mantém o mesmo card, só troca o texto do detalhe
            card.innerHTML = `
                <span class="name">${escapeHtml(item.nome)}</span>
                <section class="details">
                    <p>Manutenção - ${escapeHtml(item.descricao)}</p>
                </section>
            `;
        }

        // insere logo abaixo do título "Recentes"
        menuItems.insertBefore(card, ttlRecentes.nextSibling);
    });
}


// helper (cole se não existir no seu index.js)
function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
}


    window.renderizarMultasRecentes = renderizarMultasRecentes;
    
    renderizarMultasRecentes();
});