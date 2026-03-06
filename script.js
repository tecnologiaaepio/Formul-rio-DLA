// Aguardar o carregamento completo da página
window.onload = function() {
    // Event listeners para os radio buttons de produto
    const produtos = document.getElementsByName('produto');
    
    produtos.forEach(produto => {
        produto.onchange = function() {
            // Esconder todas as seções primeiro
            document.getElementById('qtdDlaNbGas').style.display = 'none';
            document.getElementById('opcoesGasMedidor').style.display = 'none';
            document.getElementById('qtdDlaNbAgua').style.display = 'none';
            document.getElementById('opcoesAguaMedidor').style.display = 'none';
            
            // Mostrar apenas a seção do produto selecionado
            if (document.getElementById('dlaNbGas').checked) {
                document.getElementById('qtdDlaNbGas').style.display = 'block';
            } else if (document.getElementById('dlaNbGasMedidor').checked) {
                document.getElementById('opcoesGasMedidor').style.display = 'block';
            } else if (document.getElementById('dlaNbAgua').checked) {
                document.getElementById('qtdDlaNbAgua').style.display = 'block';
            } else if (document.getElementById('dlaNbAguaMedidor').checked) {
                document.getElementById('opcoesAguaMedidor').style.display = 'block';
            }
        };
    });

    // Event listener para os radio buttons de ingestão
    const ingestaoRadios = document.getElementsByName('ingestao');
    ingestaoRadios.forEach(radio => {
        radio.onchange = function() {
            const mostrar = document.getElementById('ingestaoServidor').checked;
            const servidorSection = document.getElementById('servidorSection');
            const portSection = document.getElementById('portSection');
            const dominioSection = document.getElementById('dominioSection');
            
            if (servidorSection) servidorSection.style.display = mostrar ? 'block' : 'none';
            if (portSection) portSection.style.display = mostrar ? 'block' : 'none';
            if (dominioSection) dominioSection.style.display = mostrar ? 'block' : 'none';
        };
    });
};

// Coletar dados do formulário
function coletarDados() {
    const dados = {
        nomeCliente: document.getElementById('nomeCliente').value,
        produtos: [],
        ingestoes: [],
        servidor: {
            ip: document.getElementById('seuIP').value,
            port: document.getElementById('suaPort').value,
            dominio: document.getElementById('seuDominio').value
        }
    };

    // DLA NB - Gás
    if (document.getElementById('dlaNbGas')?.checked) {
        const qtd = document.querySelector('#qtdDlaNbGas input[type="number"]')?.value || 0;
        dados.produtos.push({
            tipo: 'DLA NB — Gás',
            protocolo: 'RÁDIO',
            quantidade: qtd
        });
    }

    // DLA NB - Gás com Medidor
    if (document.getElementById('dlaNbGasMedidor')?.checked) {
        const modelos = [];
        document.querySelectorAll('input[name="modeloGasMedidor"]:checked').forEach(el => {
            modelos.push(el.value);
        });
        const qtd = document.querySelector('#opcoesGasMedidor input[type="number"]')?.value || 0;
        dados.produtos.push({
            tipo: 'DLA NB — Gás com Medidor',
            protocolo: 'NB-IoT',
            modelos: modelos.join(', '),
            quantidade: qtd
        });
    }

    // DLA NB - Água
    if (document.getElementById('dlaNbAgua')?.checked) {
        const qtd = document.querySelector('#qtdDlaNbAgua input[type="number"]')?.value || 0;
        dados.produtos.push({
            tipo: 'DLA NB — Água',
            protocolo: 'RÁDIO',
            quantidade: qtd
        });
    }

    // DLA NB - Água com Medidor
    if (document.getElementById('dlaNbAguaMedidor')?.checked) {
        const modelo = document.getElementById('modeloAguaMedidor')?.value || '';
        const qtd = document.querySelector('#opcoesAguaMedidor input[type="number"]')?.value || 0;
        dados.produtos.push({
            tipo: 'DLA NB — Água com Medidor',
            protocolo: 'NB-IoT',
            modelo: modelo,
            quantidade: qtd
        });
    }

    // Coletar ingestão selecionada (apenas uma)
    const ingestaoSelecionada = document.querySelector('input[name="ingestao"]:checked');
    if (ingestaoSelecionada) {
        dados.ingestoes.push(ingestaoSelecionada.value);
    }

    return dados;
}

// Gerar resumo da solicitação
function gerarResumo() {
    const dados = coletarDados();
    
    if (!dados.nomeCliente) {
        alert('Por favor, preencha o nome do cliente.');
        return;
    }
    
    if (dados.produtos.length === 0) {
        alert('Por favor, selecione ao menos um produto.');
        return;
    }
    
    // Atualizar resumo
    document.getElementById('resumoCliente').textContent = dados.nomeCliente;
    
    // Limpar e adicionar apenas produtos selecionados
    const resumoProdutosContainer = document.getElementById('resumoProdutos');
    resumoProdutosContainer.innerHTML = '';
    
    dados.produtos.forEach(produto => {
        const qtd = produto.quantidade || 0;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'resumo-item';
        itemDiv.innerHTML = `
            <span class="resumo-label">${produto.tipo}</span>
            <span class="resumo-valor">${qtd} unid.</span>
        `;
        resumoProdutosContainer.appendChild(itemDiv);
    });
    
    // Atualizar recebimento
    const recebimento = dados.ingestoes[0] || 'Não especificado';
    document.getElementById('resumoRecebimento').textContent = recebimento;
    
    // Mostrar resumo e esconder botões iniciais
    document.getElementById('resumoSection').style.display = 'block';
    document.getElementById('botoesIniciais').style.display = 'none';
}

// Exportar para Excel
function exportarExcel() {
    const dados = coletarDados();
    
    if (!dados.nomeCliente) {
        alert('Por favor, preencha o nome do cliente.');
        return;
    }

    const wb = XLSX.utils.book_new();
    
    // Data atual
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');

    // Planilha 1: Solicitação de DLA NB
    const wsData = [
        ['SOLICITAÇÃO DE DLA NB'],
        [],
        ['Cliente:', dados.nomeCliente],
        ['Data:', dataFormatada],
        ['Forma de Recebimento:', dados.ingestoes[0] || ''],
        [],
        ['ITENS SOLICITADOS'],
        ['Tipo', 'Modelo', 'Quantidade']
    ];

    // Adicionar produto selecionado
    dados.produtos.forEach(produto => {
        const modelo = produto.modelos || produto.modelo || '—';
        wsData.push([produto.tipo, modelo, produto.quantidade]);
    });

    // Adicionar informações do servidor se aplicável
    if (dados.ingestoes.includes('Servidor Próprio')) {
        wsData.push([]);
        wsData.push(['Configuração do Servidor:']);
        wsData.push(['Seu IP:', dados.servidor.ip]);
        wsData.push(['Sua Port:', dados.servidor.port]);
        wsData.push(['Seu Domínio:', dados.servidor.dominio]);
    }

    const ws1 = XLSX.utils.aoa_to_sheet(wsData);
    
    // Estilizar largura das colunas
    ws1['!cols'] = [
        { wch: 25 },
        { wch: 30 },
        { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Solicitação');

    // Planilha 2: Tabela de Medidores (editável)
    // Determinar colunas baseado no produto selecionado
    const produtoSelecionado = dados.produtos[0];
    const temMedidor = produtoSelecionado && produtoSelecionado.tipo.includes('com Medidor');
    const quantidade = produtoSelecionado ? (parseInt(produtoSelecionado.quantidade) || 0) : 0;
    
    let wsTableData = [];
    let colunas = [];
    
    // Título da planilha
    const titulo = produtoSelecionado 
        ? `Planilha de Preenchimento — ${produtoSelecionado.tipo} (${produtoSelecionado.protocolo})`
        : 'Planilha de Preenchimento';
    
    wsTableData.push([titulo]);
    wsTableData.push([`Cliente: ${dados.nomeCliente}`]);
    wsTableData.push([`Quantidade solicitada: ${quantidade}`]);
    wsTableData.push([]); // Linha vazia
    
    // Definir cabeçalho baseado no produto
    if (temMedidor) {
        // Produto com medidor
        wsTableData.push(['#', 'Nº MEDIDOR', 'Nº DLA', 'SIMCARD']);
        colunas = [{ wch: 8 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    } else {
        // Apenas DLA (sem medidor)
        wsTableData.push(['#', 'Nº DLA', 'SIMCARD']);
        colunas = [{ wch: 8 }, { wch: 20 }, { wch: 20 }];
    }
    
    // Adicionar linhas numeradas para preenchimento
    for (let i = 1; i <= quantidade; i++) {
        if (temMedidor) {
            wsTableData.push([i, '', '', '']);
        } else {
            wsTableData.push([i, '', '']);
        }
    }

    const ws2 = XLSX.utils.aoa_to_sheet(wsTableData);
    
    // Definir largura das colunas
    ws2['!cols'] = colunas;

    XLSX.utils.book_append_sheet(wb, ws2, 'Medidores');

    // Gerar arquivo
    const nomeArquivo = `Formulario_Solicitacao_${dados.nomeCliente || 'Cliente'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
}

// Limpar formulário
function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        document.getElementById('formulario').reset();
        document.getElementById('qtdDlaNbGas').style.display = 'none';
        document.getElementById('opcoesGasMedidor').style.display = 'none';
        document.getElementById('qtdDlaNbAgua').style.display = 'none';
        document.getElementById('opcoesAguaMedidor').style.display = 'none';
        document.getElementById('servidorSection').style.display = 'none';
        document.getElementById('portSection').style.display = 'none';
        document.getElementById('dominioSection').style.display = 'none';
        document.getElementById('resumoSection').style.display = 'none';
        document.getElementById('botoesIniciais').style.display = 'flex';
    }
}
