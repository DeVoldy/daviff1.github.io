document.addEventListener('DOMContentLoaded', function() {
    
    function renderizarMultasRecentes() {
        const menuItems = document.querySelector('.menu-items');
        const ttlRecentes = document.querySelector('#ttl-recentes');
        
        if (!menuItems || !ttlRecentes) return; 

        let multasRecentes = JSON.parse(localStorage.getItem('multasRecentes')) || [];
        
        document.querySelectorAll('.recent-card[data-multa-id]').forEach(card => card.remove());
        
        document.querySelectorAll('.recent-card').forEach(card => {
             if (card.querySelector('.details p').textContent === 'Multa') {
                 card.remove();
            }
        });

        const emptyMessage = menuItems.querySelector('.empty-list-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        if (multasRecentes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.classList.add('empty-list-message');
            emptyMessage.textContent = "Nenhuma notificação recente para exibir no momento.";
            
            menuItems.insertBefore(emptyMessage, ttlRecentes.nextSibling);
            return; 
        }
        multasRecentes.forEach(function(multa) {
            
            const multaCard = document.createElement('article');
            multaCard.classList.add('recent-card');
            multaCard.setAttribute('data-multa-id', multa.id); 

            const cardDescription = multa.descricao;

            multaCard.innerHTML = `
                <span class="name">${multa.nome}</span>
                <section class="details">
                    <p>Multa - ${cardDescription}</p>
                    <p>R$ ${multa.valor}</p>
                </section>
            `;
            menuItems.insertBefore(multaCard, ttlRecentes.nextSibling);
        });
    }

    window.renderizarMultasRecentes = renderizarMultasRecentes;
    
    renderizarMultasRecentes();
});