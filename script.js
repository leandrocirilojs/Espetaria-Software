
    // Dados do aplicativo (simulando um banco de dados) usando localstorad
    let db = {
      produtos: JSON.parse(localStorage.getItem('produtos')) || [],
      vendas: JSON.parse(localStorage.getItem('vendas')) || []
    };

    // Funções utilitárias
    function salvarDados() {
      localStorage.setItem('produtos', JSON.stringify(db.produtos));
      localStorage.setItem('vendas', JSON.stringify(db.vendas));
    }

    function formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR');
    }

    function formatarMoeda(valor) {
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function gerarId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Navegação entre módulos
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        // Remover classe active de todos os links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        // Adicionar classe active ao link clicado
        link.classList.add('active');
        
        // Esconder todos os módulos
        document.querySelectorAll('#module-container > div').forEach(div => div.classList.remove('active'));
        // Mostrar o módulo correspondente ao link clicado
        const moduleId = link.getAttribute('data-module');
        document.getElementById(moduleId).classList.add('active');
        
        // Atualizar o conteúdo do módulo
        if (moduleId === 'dashboard') {
          atualizarDashboard();
        } else if (moduleId === 'produtos') {
          listarProdutos();
        } else if (moduleId === 'vendas') {
          atualizarSelectProdutos();
          listarVendas();
        }
      });
    });

    // Navegação entre tabs nos relatórios
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover classe active de todas as tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // Adicionar classe active à tab clicada
        tab.classList.add('active');
        
        // Esconder todos os conteúdos de tab
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        // Mostrar o conteúdo correspondente à tab clicada
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // ======= Módulo de Produtos =======
    
    // Exibir/esconder formulário de produto
    document.getElementById('btn-novo-produto').addEventListener('click', () => {
      document.getElementById('form-title').textContent = 'Adicionar Produto';
      document.getElementById('produto-form').reset();
      document.getElementById('produto-id').value = '';
      document.getElementById('form-produto').style.display = 'block';
    });

    document.getElementById('btn-cancelar-produto').addEventListener('click', () => {
      document.getElementById('form-produto').style.display = 'none';
    });

    // Adicionar/editar produto
    document.getElementById('produto-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = document.getElementById('produto-id').value;
      const produto = {
        id: id || gerarId(),
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        preco: parseFloat(document.getElementById('preco').value),
        estoque: parseInt(document.getElementById('estoque').value),
        estoqueMinimo: parseInt(document.getElementById('estoque-minimo').value)
      };
      
      if (id) {
        // Editando produto existente
        const index = db.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
          db.produtos[index] = produto;
        }
      } else {
        // Adicionando novo produto
        db.produtos.push(produto);
      }
      
      salvarDados();
      listarProdutos();
      document.getElementById('form-produto').style.display = 'none';
      
      // Atualizar select de produtos no módulo de vendas
      atualizarSelectProdutos();
      // Atualizar dashboard
      atualizarDashboard();
    });

    // Listar produtos
    function listarProdutos() {
      const tbody = document.getElementById('produtos-table');
      tbody.innerHTML = '';
      
      db.produtos.forEach(produto => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${produto.nome}</td>
          <td>${produto.descricao}</td>
          <td>${formatarMoeda(produto.preco)}</td>
          <td>${produto.estoque}</td>
          <td>${produto.estoqueMinimo}</td>
          <td class="actions">
            <button class="btn-small" onclick="editarProduto('${produto.id}')">Editar</button>
            <button class="btn-small btn-danger" onclick="excluirProduto('${produto.id}')">Excluir</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Editar produto
    window.editarProduto = function(id) {
      const produto = db.produtos.find(p => p.id === id);
      if (produto) {
        document.getElementById('produto-id').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('descricao').value = produto.descricao;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('estoque').value = produto.estoque;
        document.getElementById('estoque-minimo').value = produto.estoqueMinimo;
        
        document.getElementById('form-title').textContent = 'Editar Produto';
        document.getElementById('form-produto').style.display = 'block';
      }
    };

    // Excluir produto
    window.excluirProduto = function(id) {
      if (confirm('Tem certeza que deseja excluir este produto?')) {
        db.produtos = db.produtos.filter(p => p.id !== id);
        salvarDados();
        listarProdutos();
        atualizarDashboard();
      }
    };

    // Buscar produtos
    document.getElementById('busca-produto').addEventListener('input', (e) => {
      const busca = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#produtos-table tr');
      
      rows.forEach(row => {
        const nome = row.cells[0].textContent.toLowerCase();
        const descricao = row.cells[1].textContent.toLowerCase();
        
        if (nome.includes(busca) || descricao.includes(busca)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });

    // ======= Módulo de Vendas =======
    
    // Atualizar select de produtos
    function atualizarSelectProdutos() {
      const select = document.getElementById('produto-venda');
      select.innerHTML = '<option value="">Selecione um produto</option>';
      
      db.produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = `${produto.nome} - ${formatarMoeda(produto.preco)}`;
        select.appendChild(option);
      });
    }

    // Atualizar preço e total ao selecionar produto
    document.getElementById('produto-venda').addEventListener('change', () => {
      const produtoId = document.getElementById('produto-venda').value;
      const quantidade = parseInt(document.getElementById('quantidade-venda').value) || 0;
      
      if (produtoId) {
        const produto = db.produtos.find(p => p.id === produtoId);
        if (produto) {
          document.getElementById('preco-venda').value = produto.preco;
          document.getElementById('total-venda').value = produto.preco * quantidade;
          
          // Mostrar informação de estoque disponível
          const estoqueInfo = document.getElementById('estoque-disponivel-info');
          estoqueInfo.textContent = `Estoque disponível: ${produto.estoque} unidades`;
          
          if (produto.estoque < 5) {
            estoqueInfo.style.color = 'red';
          } else {
            estoqueInfo.style.color = 'green';
          }
        }
      } else {
        document.getElementById('preco-venda').value = '';
        document.getElementById('total-venda').value = '';
        document.getElementById('estoque-disponivel-info').textContent = '';
      }
    });

    // Atualizar total ao alterar quantidade
    document.getElementById('quantidade-venda').addEventListener('input', () => {
      const produtoId = document.getElementById('produto-venda').value;
      const quantidade = parseInt(document.getElementById('quantidade-venda').value) || 0;
      
      if (produtoId) {
        const produto = db.produtos.find(p => p.id === produtoId);
        if (produto) {
          document.getElementById('total-venda').value = produto.preco * quantidade;
        }
      }
    });

    // Registrar venda
    document.getElementById('venda-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const produtoId = document.getElementById('produto-venda').value;
      const quantidade = parseInt(document.getElementById('quantidade-venda').value);
      
      if (!produtoId) {
        alert('Selecione um produto.');
        return;
      }
      
      const produto = db.produtos.find(p => p.id === produtoId);
      
      if (!produto) {
        alert('Produto não encontrado.');
        return;
      }
      
      if (quantidade <= 0) {
        alert('A quantidade deve ser maior que zero.');
        return;
      }
      
      if (quantidade > produto.estoque) {
        alert('Quantidade indisponível em estoque.');
        return;
      }
      
      // Atualizar estoque
      produto.estoque -= quantidade;
      
      // Registrar venda
      const venda = {
        id: gerarId(),
        data: new Date().toISOString(),
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: quantidade,
        valorUnitario: produto.preco,
        valorTotal: produto.preco * quantidade
      };
      
      db.vendas.push(venda);
      salvarDados();
      
      // Limpar formulário
      document.getElementById('venda-form').reset();
      document.getElementById('preco-venda').value = '';
      document.getElementById('total-venda').value = '';
      document.getElementById('estoque-disponivel-info').textContent = '';
      
      // Atualizar tabela de vendas
      listarVendas();
      
      // Atualizar dashboard
      atualizarDashboard();
      
      alert('Venda registrada com sucesso!');
    });

    // Listar vendas
    function listarVendas() {
      const tbody = document.getElementById('vendas-table');
      tbody.innerHTML = '';
      
      // Ordenar vendas por data (mais recentes primeiro)
      const vendasOrdenadas = [...db.vendas].sort((a, b) => new Date(b.data) - new Date(a.data));
      
      vendasOrdenadas.forEach(venda => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${formatarData(venda.data)}</td>
          <td>${venda.produtoNome}</td>
          <td>${venda.quantidade}</td>
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
