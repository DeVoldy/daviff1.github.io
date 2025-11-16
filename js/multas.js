document.addEventListener('DOMContentLoaded', function() {

    
    // ETAPA 1:"multas-adicionar.html"

    
    
    const formAdicionar = document.querySelector('.form-add');
    
    if (formAdicionar) {
        
        const btnFinalizar = formAdicionar.querySelector('.btn-finalizar');

        btnFinalizar.addEventListener('click', function(event) {
            event.preventDefault(); 

            const nome = document.querySelector('#nome').value;
            const quarto = document.querySelector('#quarto').value;
            const descricao = document.querySelector('#descricao').value;
            const itens = document.querySelector('#itens').value;
            const valor = document.querySelector('#valor').value;

            if (!nome || !valor) {
                alert('Por favor, preencha pelo menos o Nome e o Valor da multa.');
                return;
            }

            const novaMulta = {
                id: new Date().getTime(),
                nome: nome,
                quarto: quarto,
                descricao: descricao,
                itens: itens,
                valor: parseFloat(valor).toFixed(2)
            };

            let multasPendentes = JSON.parse(localStorage.getItem('multasPendentes')) || [];
            multasPendentes.push(novaMulta);
            localStorage.setItem('multasPendentes', JSON.stringify(multasPendentes));

            window.location.href = btnFinalizar.href;
        });
    }
    //ETAPA 2:"multas-pendentes.html"
    

    const abaPendenteAtiva = document.querySelector('.maintenance-tabs a[href="multas-pendentes.html"].active');
    
    if (abaPendenteAtiva) {
        
        const listaDeCards = document.querySelector('.list-cards');
        let multasPendentes = JSON.parse(localStorage.getItem('multasPendentes')) || [];

        if (multasPendentes.length > 0) {
            listaDeCards.innerHTML = ''; 

            for (const multa of multasPendentes) {
                const novoCard = document.createElement('li');
                novoCard.classList.add('card'); 
                novoCard.innerHTML = `
                    <ul class="row">
                        <li class="card-icon">
                            <img src="img/user.png" alt="ícone usuário">
                        </li>
                        <li>    
                            <h2 class="title">${multa.nome}</h2>
                            ${multa.descricao ? `<p>${multa.descricao}</p>` : ''}
                            ${multa.itens ? `<p>${multa.itens} itens</p>` : ''}
                            <p class="pagamento-valor">R$ ${multa.valor}</p>
                        </li>
                    </ul>
                `;
                
                
                novoCard.addEventListener('click', function() {
                    
                    
                    novoCard.style.borderColor = 'red';
                    
                    
                    setTimeout(function() {

                        
                        let multasFinalizadas = JSON.parse(localStorage.getItem('multasFinalizadas')) || [];
                        
                        
                        multasFinalizadas.push(multa);
                        
                        
                        multasPendentes = multasPendentes.filter(function(item) {
                            return item.id !== multa.id;
                        });
                        
                        
                        localStorage.setItem('multasPendentes', JSON.stringify(multasPendentes));
                        localStorage.setItem('multasFinalizadas', JSON.stringify(multasFinalizadas));
                        
                       
                        novoCard.remove();

                       
                        if (multasPendentes.length === 0) {
                            listaDeCards.innerHTML = `
                                <p class="empty-list-message">
                                    Nenhuma multa pendente para exibir no momento.
                                </p>
                            `;
                        }

                    }, 300); // 300 milissegundos de atraso
                });

                listaDeCards.appendChild(novoCard);
            }
        } else {
            listaDeCards.innerHTML = `
                <p class="empty-list-message">
                    Nenhuma multa pendente para exibir no momento.
                </p>
            `;
        }
    }

    
    //ETAPA 3:"multas-finalizadas.html"
    

    
    const abaFinalizadaAtiva = document.querySelector('.maintenance-tabs a[href="multas-finalizadas.html"].active');
    
    if (abaFinalizadaAtiva) {
        
        const listaDeCards = document.querySelector('.list-cards');
        
        let multasFinalizadas = JSON.parse(localStorage.getItem('multasFinalizadas')) || [];

        if (multasFinalizadas.length > 0) {
            listaDeCards.innerHTML = ''; // Limpa a lista

            for (const multa of multasFinalizadas) {
                const novoCard = document.createElement('li');
                novoCard.classList.add('card');
                novoCard.classList.add('card-finalizado');
                
                novoCard.innerHTML = `
                    <ul class="row">
                        <li class="card-icon">
                            <img src="img/user.png" alt="ícone usuário">
                        </li>
                        <li>    
                            <h2 class="title">${multa.nome}</h2>
                            ${multa.descricao ? `<p>${multa.descricao}</p>` : ''}
                            ${multa.itens ? `<p>${multa.itens} itens</p>` : ''}
                            <p class="pagamento-valor">R$ ${multa.valor}</p>
                        </li>
                    </ul>
                `;
                
                
                novoCard.addEventListener('click', function() {
                    
                    
                    novoCard.style.borderColor = 'red';

                   
                    setTimeout(function() {
                        
                        
                        multasFinalizadas = multasFinalizadas.filter(function(item) {
                            return item.id !== multa.id;
                        });

                        
                        localStorage.setItem('multasFinalizadas', JSON.stringify(multasFinalizadas));
                        
                        
                        novoCard.remove();

                        
                        if (multasFinalizadas.length === 0) {
                            listaDeCards.innerHTML = `
                                <p class="empty-list-message">
                                    Nenhuma multa finalizada para exibir no momento.
                                </p>
                            `;
                        }
                    }, 300); // 300 milissegundos de atraso
                });

                listaDeCards.appendChild(novoCard);
            }
        } else {
            listaDeCards.innerHTML = `
                <p class="empty-list-message">
                    Nenhuma multa finalizada para exibir no momento.
                </p>
            `;
        }
    }

}); 