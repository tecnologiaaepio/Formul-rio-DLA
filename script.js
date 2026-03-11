// Aguardar o carregamento completo da página
window.onload = function() {
    // Validar CNPJ - aceitar apenas números
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            // Remove tudo que não é número
            let value = e.target.value.replace(/\D/g, '');
            
            // Formata o CNPJ: XX.XXX.XXX/XXXX-XX
            if (value.length <= 2) {
                e.target.value = value;
            } else if (value.length <= 5) {
                e.target.value = value.slice(0, 2) + '.' + value.slice(2);
            } else if (value.length <= 8) {
                e.target.value = value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5);
            } else if (value.length <= 12) {
                e.target.value = value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5, 8) + '/' + value.slice(8);
            } else {
                e.target.value = value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5, 8) + '/' + value.slice(8, 12) + '-' + value.slice(12, 14);
            }
        });
    }

    // Event listeners para os radio buttons de produto
    const produtos = document.getElementsByName('produto');
    
    produtos.forEach(produto => {
        produto.onchange = function() {
            // Esconder todas as seções primeiro
            document.getElementById('opcoesDlaNbGas').style.display = 'none';
            document.getElementById('opcoesGasMedidor').style.display = 'none';
            document.getElementById('qtdDlaNbAgua').style.display = 'none';
            document.getElementById('opcoesAguaMedidor').style.display = 'none';
            
            // Mostrar apenas a seção do produto selecionado
            if (document.getElementById('dlaNbGas').checked) {
                document.getElementById('opcoesDlaNbGas').style.display = 'block';
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
        cnpj: document.getElementById('cnpj').value,
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
        const sensor = document.querySelector('input[name="sensorDlaNbGas"]:checked')?.value || '—';
        const qtd = document.querySelector('#opcoesDlaNbGas input[type="number"]')?.value || 0;
        dados.produtos.push({
            tipo: 'DLA NB — Gás',
            protocolo: 'RÁDIO',
            modelo: 'Sem Medidor',
            sensor: sensor,
            quantidade: qtd
        });
    }

    // DLA NB - Gás com Medidor
    if (document.getElementById('dlaNbGasMedidor')?.checked) {
        const modelo = document.querySelector('input[name="modeloGasMedidor"]:checked')?.value || '—';
        const qtd = document.querySelector('#opcoesGasMedidor input[type="number"]')?.value || 0;
        dados.produtos.push({
            tipo: 'DLA NB — Gás com Medidor',
            protocolo: 'NB-IoT',
            modelo: modelo,
            sensor: 'Aepio',
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

function voltarFormulario() {
    document.getElementById('resumoSection').style.display = 'none';
    document.getElementById('botoesIniciais').style.display = 'flex';
}

// Exportar para Excel
function exportarPDF() {
    const dados = coletarDados();

    if (!dados.nomeCliente) {
        alert('Por favor, preencha o nome do cliente.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITAÇÃO DE DLA NB', pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Linha separadora
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);
    y += 8;

    // Informações do cliente
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.nomeCliente, 45, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('CNPJ:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cnpj || '—', 45, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Data:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dataFormatada, 45, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Recebimento:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.ingestoes[0] || '—', 45, y);
    y += 10;

    // Título da tabela
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS SOLICITADOS', 10, y);
    y += 6;

    // Cabeçalho da tabela
    const colWidths = [65, 35, 40, 35];
    const colX = [10, 75, 110, 150];
    const rowHeight = 8;

    doc.setFillColor(230, 240, 255);
    doc.setDrawColor(180, 180, 180);
    doc.rect(10, y, pageWidth - 20, rowHeight, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo', colX[0] + 2, y + 5.5);
    doc.text('Modelo Medidor', colX[1] + 2, y + 5.5);
    doc.text('Sensor', colX[2] + 2, y + 5.5);
    doc.text('Quantidade', colX[3] + 2, y + 5.5);
    y += rowHeight;

    // Linhas de produto
    doc.setFont('helvetica', 'normal');
    dados.produtos.forEach(produto => {
        const modelo = produto.modelos || produto.modelo || '—';
        const sensor = produto.sensor || '—';

        doc.setDrawColor(180, 180, 180);
        doc.rect(10, y, pageWidth - 20, rowHeight, 'D');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(String(produto.tipo), colX[0] + 2, y + 5.5);
        doc.text(String(modelo), colX[1] + 2, y + 5.5);
        doc.text(String(sensor), colX[2] + 2, y + 5.5);
        doc.text(String(produto.quantidade), colX[3] + 2, y + 5.5);
        y += rowHeight;
    });

    // Servidor próprio
    if (dados.ingestoes.includes('Servidor Próprio')) {
        y += 8;
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text('CONFIGURAÇÃO DO SERVIDOR', 10, y);
        y += 7;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('IP:', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(dados.servidor.ip || '—', 45, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Port:', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(dados.servidor.port || '—', 45, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Domínio:', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(dados.servidor.dominio || '—', 45, y);
    }

    const nomeArquivo = `Formulario_Solicitacao_${dados.nomeCliente || 'Cliente'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nomeArquivo);
}

// Limpar formulário
function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        document.getElementById('formulario').reset();
        document.getElementById('opcoesDlaNbGas').style.display = 'none';
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
