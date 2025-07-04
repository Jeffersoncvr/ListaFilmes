// Removido: Nenhuma configuração ou importação do Firebase aqui, pois não estamos usando.

document.addEventListener('DOMContentLoaded', () => {
    const mediaTableBody = document.querySelector('#mediaTable tbody');
    const mediaGridDiv = document.getElementById('mediaGrid');
    const displayContainer = document.getElementById('displayContainer');
    const randomBtn = document.getElementById('randomBtn');
    const randomResult = document.getElementById('randomResult');
    const clearListBtn = document.getElementById('clearListBtn');
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    
    // Referências aos botões de toggle do formulário
    const toggleAddFormBtnDesktop = document.getElementById('toggleAddFormBtnDesktop');
    const toggleAddFormBtnMobile = document.getElementById('toggleAddFormBtnMobile'); // O botão flutuante

    const addMediaSection = document.getElementById('addMediaSection');

    const manualTitleInput = document.getElementById('manualTitleInput');
    const manualTypeInput = document.getElementById('manualTypeInput');
    const manualPosterInput = document.getElementById('manualPosterInput');
    const addCustomEntryBtn = document.getElementById('addCustomEntryBtn');

    // Carrega a lista do localStorage ou inicia vazia
    let mediaList = JSON.parse(localStorage.getItem('mediaList')) || [];
    let currentViewMode = localStorage.getItem('viewMode') || 'list';

    // --- Funções de Visualização ---

    function setInitialView() {
        displayContainer.classList.remove('list-view', 'grid-view');
        displayContainer.classList.add(currentViewMode + '-view');
        toggleViewBtn.textContent = `Alternar Visualização (${currentViewMode === 'list' ? 'Grade' : 'Lista'})`;
    }

    function toggleAddForm() {
        if (addMediaSection.style.display === 'none' || addMediaSection.style.display === '') {
            addMediaSection.style.display = 'block';
            // Altera o texto do botão DESKTOP
            toggleAddFormBtnDesktop.textContent = 'Fechar Formulário';
            // Altera o ícone e a cor do botão MOBILE (se ele existe)
            if (toggleAddFormBtnMobile) {
                toggleAddFormBtnMobile.querySelector('.plus-icon').textContent = 'X';
                toggleAddFormBtnMobile.style.backgroundColor = 'var(--danger-color)';
            }
        } else {
            addMediaSection.style.display = 'none';
            // Altera o texto do botão DESKTOP
            toggleAddFormBtnDesktop.textContent = 'Adicionar Novo Filme/Série';
            // Altera o ícone e a cor do botão MOBILE (se ele existe)
            if (toggleAddFormBtnMobile) {
                toggleAddFormBtnMobile.querySelector('.plus-icon').textContent = '+';
                toggleAddFormBtnMobile.style.backgroundColor = 'var(--primary-color)';
            }
            // Limpa os campos
            manualTitleInput.value = '';
            manualPosterInput.value = '';
            manualTypeInput.value = 'Filme';
        }
    }

    // FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO
    function renderMedia() {
        mediaTableBody.innerHTML = '';
        mediaGridDiv.innerHTML = '';

        if (mediaList.length === 0) {
            const message = "Nenhum filme ou série na lista. Adicione um acima!";
            
            const tableRow = document.createElement('tr');
            const tableCell = document.createElement('td');
            tableCell.colSpan = 5;
            tableCell.textContent = message;
            tableCell.style.textAlign = 'center';
            tableCell.style.fontStyle = 'italic';
            tableCell.style.padding = '20px';
            tableCell.style.color = 'var(--text-color)';
            tableRow.appendChild(tableCell);
            mediaTableBody.appendChild(tableRow);
            
            const gridMessageDiv = document.createElement('div');
            gridMessageDiv.textContent = message;
            gridMessageDiv.style.textAlign = 'center';
            gridMessageDiv.style.fontStyle = 'italic';
            gridMessageDiv.style.padding = '20px';
            gridMessageDiv.style.color = 'var(--text-color)';
            mediaGridDiv.appendChild(gridMessageDiv);

        } else {
            mediaList.forEach((media, index) => {
                const tableRow = document.createElement('tr');
                tableRow.classList.toggle('watched', media.watched);

                const posterCell = document.createElement('td');
                const titleCell = document.createElement('td');
                const typeCell = document.createElement('td');
                const watchedCell = document.createElement('td');
                const actionsCell = document.createElement('td');
                actionsCell.classList.add('actions');

                const tableImg = document.createElement('img');
                tableImg.alt = `Poster de ${media.title}`;
                tableImg.classList.add('poster-img');
                tableImg.onerror = () => { tableImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster'; }; 
                if (media.poster && media.poster !== 'N/A' && isValidHttpUrl(media.poster)) {
                    tableImg.src = media.poster;
                } else {
                    tableImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster';
                }
                posterCell.appendChild(tableImg);

                titleCell.textContent = media.title;
                typeCell.textContent = media.type;
                watchedCell.textContent = media.watched ? 'Sim' : 'Não';

                const markWatchedBtnTable = document.createElement('button');
                markWatchedBtnTable.textContent = media.watched ? 'Desmarcar' : 'Assistido';
                markWatchedBtnTable.classList.add('mark-watched-btn');
                markWatchedBtnTable.addEventListener('click', () => toggleWatched(index));
                actionsCell.appendChild(markWatchedBtnTable);

                const removeBtnTable = document.createElement('button');
                removeBtnTable.textContent = 'Remover';
                removeBtnTable.classList.add('remove-btn');
                removeBtnTable.addEventListener('click', () => removeEntry(index));
                actionsCell.appendChild(removeBtnTable);

                tableRow.appendChild(posterCell);
                tableRow.appendChild(titleCell);
                tableRow.appendChild(typeCell);
                tableRow.appendChild(watchedCell);
                tableRow.appendChild(actionsCell);
                mediaTableBody.appendChild(tableRow);


                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.classList.toggle('watched', media.watched);

                const posterContainer = document.createElement('div');
                posterContainer.classList.add('poster-container');
                const gridImg = document.createElement('img');
                gridImg.alt = `Poster de ${media.title}`;
                gridImg.classList.add('poster-img');
                gridImg.onerror = () => { gridImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster'; };
                if (media.poster && media.poster !== 'N/A' && isValidHttpUrl(media.poster)) {
                    gridImg.src = media.poster;
                } else {
                    gridImg.src = 'https://via.placeholder.com/60x90?text=Sem+Poster';
                }
                posterContainer.appendChild(gridImg);
                gridItem.appendChild(posterContainer);

                const itemDetails = document.createElement('div');
                itemDetails.classList.add('item-details');
                
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('title');
                titleDiv.textContent = media.title;
                itemDetails.appendChild(titleDiv);

                const typeDiv = document.createElement('div');
                typeDiv.classList.add('type');
                typeDiv.textContent = media.type;
                itemDetails.appendChild(typeDiv);
                
                const actionsGrid = document.createElement('div');
                actionsGrid.classList.add('actions');

                const markWatchedBtnGrid = document.createElement('button');
                markWatchedBtnGrid.textContent = media.watched ? 'Desmarcar' : 'Assistido';
                markWatchedBtnGrid.classList.add('mark-watched-btn');
                markWatchedBtnGrid.addEventListener('click', () => toggleWatched(index));
                actionsGrid.appendChild(markWatchedBtnGrid);

                const removeBtnGrid = document.createElement('button');
                removeBtnGrid.textContent = 'Remover';
                removeBtnGrid.classList.add('remove-btn');
                removeBtnGrid.addEventListener('click', () => removeEntry(index));
                actionsGrid.appendChild(removeBtnGrid);

                itemDetails.appendChild(actionsGrid);
                gridItem.appendChild(itemDetails);
                mediaGridDiv.appendChild(gridItem);
            });
        }
    }

    function isValidHttpUrl(string) {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    // MÉTODOS QUE INTERAGEM COM localStorage
    function toggleWatched(index) {
        mediaList[index].watched = !mediaList[index].watched;
        saveMediaList();
        renderMedia();
    }

    function removeEntry(index) {
        if (confirm('Tem certeza que deseja remover esta entrada?')) {
            mediaList.splice(index, 1);
            saveMediaList();
            renderMedia();
        }
    }

    function addCustomEntry() {
        const title = manualTitleInput.value.trim();
        const type = manualTypeInput.value;
        const poster = manualPosterInput.value.trim();

        if (!title) {
            alert('O título é obrigatório para adicionar um filme/série.');
            return;
        }

        const newMedia = {
            title: title,
            type: type,
            poster: poster || 'https://via.placeholder.com/60x90?text=Sem+Poster',
            watched: false
        };

        const exists = mediaList.some(item => 
            item.title === newMedia.title && item.type === newMedia.type
        );

        if (exists) {
            alert('Este filme/série já está na sua lista!');
            return;
        }

        mediaList.push(newMedia);
        saveMediaList();
        renderMedia();

        manualTitleInput.value = '';
        manualPosterInput.value = '';
        manualTypeInput.value = 'Filme';
        
        // Esconde o formulário após adicionar um item com sucesso, se visível
        if (addMediaSection.style.display !== 'none') {
            toggleAddForm();
        }
    }
    
    function chooseRandomUnwatched() {
        const unwatchedMedia = mediaList.filter(media => !media.watched);

        if (unwatchedMedia.length > 0) {
            const randomIndex = Math.floor(Math.random() * unwatchedMedia.length);
            const chosenMedia = unwatchedMedia[randomIndex];
            randomResult.textContent = `Que tal assistir: ${chosenMedia.title} (${chosenMedia.type})?`;
            randomResult.style.display = 'block';
        } else {
            randomResult.textContent = 'Não há filmes ou séries não assistidos na lista!';
            randomResult.style.display = 'block';
        }
    }

    function clearList() {
        if (confirm('Tem certeza que deseja limpar TODA a sua lista? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('mediaList');
            mediaList = [];
            renderMedia();
            randomResult.style.display = 'none';
            alert('Sua lista foi limpa com sucesso!');
        }
    }

    function saveMediaList() {
        localStorage.setItem('mediaList', JSON.stringify(mediaList));
    }

    function toggleView() {
        if (currentViewMode === 'list') {
            currentViewMode = 'grid';
            toggleViewBtn.textContent = 'Alternar Visualização (Lista)';
        } else {
            currentViewMode = 'list';
            toggleViewBtn.textContent = 'Alternar Visualização (Grade)';
        }
        localStorage.setItem('viewMode', currentViewMode);
        setInitialView();
    }

    // --- Event Listeners ---
    addCustomEntryBtn.addEventListener('click', addCustomEntry);
    randomBtn.addEventListener('click', chooseRandomUnwatched);
    clearListBtn.addEventListener('click', clearList);
    toggleViewBtn.addEventListener('click', toggleView);
    
    // Conecta os botões de toggle do formulário
    toggleAddFormBtnDesktop.addEventListener('click', toggleAddForm);
    if (toggleAddFormBtnMobile) { // Verifica se o botão mobile existe antes de adicionar listener
        toggleAddFormBtnMobile.addEventListener('click', toggleAddForm);
    }

    // --- Inicialização ---
    setInitialView();
    renderMedia();
});
