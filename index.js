      <td>${formatarMoeda(venda.valorUnitario)}</td>
      <td>${formatarMoeda(venda.valorTotal)}</td>
      <td class="actions">
        <button class="btn-small btn-danger" onclick="excluirVenda('${venda.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Excluir venda
window.excluirVenda = function(id) {
  if (confirm('Tem certeza que deseja excluir esta venda?')) {
    const venda = db.vendas.find(v => v.id === id);
    if (venda) {
      // Restaurar estoque do produto
      const produto = db.produtos.find(p => p.id === venda.produtoId);
      if (produto) {
        produto.estoque += venda.quantidade;
      }
      
      // Remover venda
      db.vendas = db.vendas.filter(v => v.id !== id);
      salvarDados();
      listarVendas();
      atualizarDashboard();
    }
  }
};

// Buscar vendas
document.getElementById('busca-venda').addEventListener('input', (e) => {
  const busca = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#vendas-table tr');
  
  rows.forEach(row => {
    const produtoNome = row.cells[1].textContent.toLowerCase();
    const data = row.cells[0].textContent.toLowerCase();
    
    if (produtoNome.includes(busca) || data.includes(busca)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});

// ======= Módulo de Relatórios =======

// Gerar relatório de vendas por período
document.getElementById('btn-gerar-relatorio-periodo').addEventListener('click', () => {
  const dataInicio = document.getElementById('data-inicio').value;
  const dataFim = document.getElementById('data-fim').value;
  
  if (!dataInicio || !dataFim) {
    alert('Selecione um período válido.');
    return;
  }
  
  const vendasFiltradas = db.vendas.filter(venda => {
    const dataVenda = new Date(venda.data).toISOString().split('T')[0];
    return dataVenda >= dataInicio && dataVenda <= dataFim;
  });
  
  const totalVendasPeriodo = vendasFiltradas.reduce((total, venda) => total + venda.valorTotal, 0);
  
  document.getElementById('total-vendas-periodo').textContent = formatarMoeda(totalVendasPeriodo);
  
  const tbody = document.getElementById('relatorio-vendas-periodo-table');
  tbody.innerHTML = '';
  
  vendasFiltradas.forEach(venda => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatarData(venda.data)}</td>
      <td>${venda.produtoNome}</td>
      <td>${venda.quantidade}</td>
      <td>${formatarMoeda(venda.valorTotal)}</td>
    `;
    tbody.appendChild(row);
  });
});

// Gerar relatório de produtos mais vendidos
document.getElementById('btn-gerar-relatorio-produtos').addEventListener('click', () => {
  const dataInicio = document.getElementById('data-inicio-produtos').value;
  const dataFim = document.getElementById('data-fim-produtos').value;
  
  if (!dataInicio || !dataFim) {
    alert('Selecione um período válido.');
    return;
  }
  
  const vendasFiltradas = db.vendas.filter(venda => {
    const dataVenda = new Date(venda.data).toISOString().split('T')[0];
    return dataVenda >= dataInicio && dataVenda <= dataFim;
  });
  
  const produtosVendidos = {};
  
  vendasFiltradas.forEach(venda => {
    if (!produtosVendidos[venda.produtoId]) {
      produtosVendidos[venda.produtoId] = {
        nome: venda.produtoNome,
        quantidade: 0,
        valorTotal: 0
      };
    }
    
    produtosVendidos[venda.produtoId].quantidade += venda.quantidade;
    produtosVendidos[venda.produtoId].valorTotal += venda.valorTotal;
  });
  
  const produtosOrdenados = Object.values(produtosVendidos).sort((a, b) => b.quantidade - a.quantidade);
  
  const tbody = document.getElementById('relatorio-produtos-vendidos-table');
  tbody.innerHTML = '';
  
  produtosOrdenados.forEach(produto => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${produto.nome}</td>
      <td>${produto.quantidade}</td>
      <td>${formatarMoeda(produto.valorTotal)}</td>
    `;
    tbody.appendChild(row);
  });
});

// Gerar relatório de posição de estoque
document.getElementById('btn-gerar-relatorio-estoque').addEventListener('click', () => {
  const tbody = document.getElementById('relatorio-estoque-table');
  tbody.innerHTML = '';
  
  db.produtos.forEach(produto => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${produto.nome}</td>
      <td>${produto.estoque}</td>
      <td>${produto.estoqueMinimo}</td>
      <td>${produto.estoque < produto.estoqueMinimo ? 'Estoque Baixo' : 'OK'}</td>
    `;
    tbody.appendChild(row);
  });
});

// ======= Módulo de Dashboard =======

function atualizarDashboard() {
  // Total de vendas hoje
  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = db.vendas.filter(venda => venda.data.split('T')[0] === hoje);
  const totalVendasHoje = vendasHoje.reduce((total, venda) => total + venda.valorTotal, 0);
  document.getElementById('vendas-hoje').textContent = formatarMoeda(totalVendasHoje);
  
  // Total de vendas no mês
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const vendasMes = db.vendas.filter(venda => {
    const dataVenda = new Date(venda.data);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  });
  const totalVendasMes = vendasMes.reduce((total, venda) => total + venda.valorTotal, 0);
  document.getElementById('vendas-mes').textContent = formatarMoeda(totalVendasMes);
  
  // Total de produtos
  document.getElementById('total-produtos').textContent = db.produtos.length;
  
  // Estoque total
  const estoqueTotal = db.produtos.reduce((total, produto) => total + produto.estoque, 0);
  document.getElementById('estoque-total').textContent = estoqueTotal;
  
  // Produtos com estoque baixo
  const tbody = document.getElementById('low-stock-table');
  tbody.innerHTML = '';
  
  db.produtos.filter(produto => produto.estoque < produto.estoqueMinimo).forEach(produto => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${produto.nome}</td>
      <td>${produto.estoque}</td>
      <td>${produto.estoqueMinimo}</td>
      <td class="actions">
        <button class="btn-small" onclick="editarProduto('${produto.id}')">Editar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Últimas vendas
  const ultimasVendas = db.vendas.slice(-5).reverse();
  const tbodyVendas = document.getElementById('ultimas-vendas');
  tbodyVendas.innerHTML = '';
  
  ultimasVendas.forEach(venda => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatarData(venda.data)}</td>
      <td>${venda.produtoNome}</td>
      <td>${venda.quantidade}</td>
      <td>${formatarMoeda(venda.valorTotal)}</td>
    `;
    tbodyVendas.appendChild(row);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  atualizarDashboard();
  listarProdutos();
  atualizarSelectProdutos();
  listarVendas();
});
