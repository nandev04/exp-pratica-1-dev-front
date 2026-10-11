/* Cadastro de voluntários — máscaras e validações */
(function () {
  'use strict';

  var form = document.getElementById('form-cadastro');
  if (!form) return;

  /* ---------- Utilitários ---------- */
  function somenteDigitos(valor) {
    return valor.replace(/\D/g, '');
  }

  /* ---------- Máscaras ---------- */
  function mascaraCPF(valor) {
    var d = somenteDigitos(valor).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }

  function mascaraTelefone(valor) {
    var d = somenteDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function mascaraCEP(valor) {
    var d = somenteDigitos(valor).slice(0, 8);
    return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
  }

  var mascaras = {
    cpf: mascaraCPF,
    telefone: mascaraTelefone,
    cep: mascaraCEP
  };

  Object.keys(mascaras).forEach(function (id) {
    var campo = document.getElementById(id);
    campo.addEventListener('input', function () {
      campo.value = mascaras[id](campo.value);
    });
  });

  /* ---------- Validadores ---------- */
  function cpfValido(cpf) {
    var d = somenteDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
      var dv = ((soma * 10) % 11) % 10;
      if (dv !== Number(d[t])) return false;
    }
    return true;
  }

  function maiorDeIdade(dataISO) {
    var nasc = new Date(dataISO + 'T00:00:00');
    if (isNaN(nasc.getTime())) return false;
    var limite = new Date();
    limite.setFullYear(limite.getFullYear() - 18);
    return nasc <= limite;
  }

  function dataRazoavel(dataISO) {
    var nasc = new Date(dataISO + 'T00:00:00');
    return nasc.getFullYear() >= 1900 && nasc <= new Date();
  }

  /* Cada regra devolve uma mensagem de erro ou '' se válido */
  var regras = {
    nome: function (c) {
      var v = c.value.trim();
      if (!v) return 'Informe seu nome completo.';
      if (!/^[A-Za-zÀ-ÿ'’ ]+$/.test(v)) return 'Use apenas letras no nome.';
      if (v.length < 5 || v.split(/\s+/).length < 2) return 'Informe nome e sobrenome.';
      return '';
    },
    nascimento: function (c) {
      if (!c.value) return 'Informe sua data de nascimento.';
      if (!dataRazoavel(c.value)) return 'Data de nascimento inválida.';
      if (!maiorDeIdade(c.value)) return 'É necessário ter 18 anos ou mais.';
      return '';
    },
    cpf: function (c) {
      if (!c.value) return 'Informe seu CPF.';
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(c.value)) return 'Formato esperado: 000.000.000-00.';
      if (!cpfValido(c.value)) return 'CPF inválido. Confira os números.';
      return '';
    },
    email: function (c) {
      if (!c.value.trim()) return 'Informe seu e-mail.';
      if (!c.checkValidity()) return 'E-mail inválido. Exemplo: nome@dominio.com.';
      return '';
    },
    telefone: function (c) {
      if (!c.value) return 'Informe seu telefone com DDD.';
      var d = somenteDigitos(c.value);
      if (d.length < 10) return 'Telefone incompleto. Informe DDD e número.';
      if (/^(\d)\1+$/.test(d)) return 'Telefone inválido.';
      if (d.length === 11 && d[2] !== '9') return 'Celular deve começar com 9 após o DDD.';
      return '';
    },
    cep: function (c) {
      if (!c.value) return 'Informe seu CEP.';
      if (!/^\d{5}-\d{3}$/.test(c.value)) return 'Formato esperado: 00000-000.';
      return '';
    },
    logradouro: function (c) { return c.value.trim() ? '' : 'Informe a rua ou avenida.'; },
    numero: function (c) { return c.value.trim() ? '' : 'Informe o número (ou S/N).'; },
    bairro: function (c) { return c.value.trim() ? '' : 'Informe o bairro.'; },
    cidade: function (c) { return c.value.trim() ? '' : 'Informe a cidade.'; },
    uf: function (c) { return c.value ? '' : 'Selecione o estado.'; },
    area: function (c) { return c.value ? '' : 'Selecione uma área de interesse.'; },
    termos: function (c) { return c.checked ? '' : 'É necessário concordar para continuar.'; }
  };

  /* ---------- Exibição de erros ---------- */
  function mostrarErro(id, msg) {
    var campo = document.getElementById(id);
    var alvoErro = document.getElementById('erro-' + id);
    if (alvoErro) alvoErro.textContent = msg;
    if (campo) {
      campo.classList.toggle('invalido', !!msg);
      campo.classList.toggle('valido', !msg && campo.type !== 'checkbox');
      if (msg) campo.setAttribute('aria-invalid', 'true');
      else campo.removeAttribute('aria-invalid');
    }
  }

  function validarCampo(id) {
    var campo = document.getElementById(id);
    var msg = regras[id](campo);
    mostrarErro(id, msg);
    return msg;
  }

  function validarDisponibilidade() {
    var marcado = form.querySelectorAll('input[name="disponibilidade"]:checked').length > 0;
    document.getElementById('erro-disponibilidade').textContent =
      marcado ? '' : 'Marque pelo menos uma opção de disponibilidade.';
    return marcado ? '' : 'Marque pelo menos uma opção de disponibilidade.';
  }

  /* Validação ao sair do campo e correção ao digitar */
  Object.keys(regras).forEach(function (id) {
    var campo = document.getElementById(id);
    campo.addEventListener('blur', function () { validarCampo(id); });
    var evento = (campo.tagName === 'SELECT' || campo.type === 'checkbox') ? 'change' : 'input';
    campo.addEventListener(evento, function () {
      if (campo.classList.contains('invalido')) validarCampo(id);
    });
  });

  form.querySelectorAll('input[name="disponibilidade"]').forEach(function (cb) {
    cb.addEventListener('change', validarDisponibilidade);
  });

  /* Data máxima: hoje */
  var nascimento = document.getElementById('nascimento');
  nascimento.max = new Date().toISOString().split('T')[0];

  /* ---------- Contador do textarea ---------- */
  var mensagem = document.getElementById('mensagem');
  var contador = document.getElementById('contador');
  mensagem.addEventListener('input', function () {
    contador.textContent = mensagem.value.length + '/' + mensagem.maxLength + ' caracteres';
  });

  /* ---------- Busca de CEP (ViaCEP) ---------- */
  var cepCampo = document.getElementById('cep');
  var controle = null;

  cepCampo.addEventListener('input', function () {
    if (cepCampo.value.length === 9) buscarCEP(somenteDigitos(cepCampo.value));
  });

  function buscarCEP(cep) {
    if (controle) controle.abort();
    controle = new AbortController();
    fetch('https://viacep.com.br/ws/' + cep + '/json/', { signal: controle.signal })
      .then(function (r) { return r.json(); })
      .then(function (dados) {
        if (dados.erro) {
          mostrarErro('cep', 'CEP não encontrado. Confira ou preencha o endereço manualmente.');
          return;
        }
        mostrarErro('cep', '');
        document.getElementById('logradouro').value = dados.logradouro || '';
        document.getElementById('bairro').value = dados.bairro || '';
        document.getElementById('cidade').value = dados.localidade || '';
        document.getElementById('uf').value = dados.uf || '';
        ['logradouro', 'bairro', 'cidade', 'uf'].forEach(function (id) {
          if (document.getElementById(id).value) mostrarErro(id, '');
        });
        document.getElementById(dados.logradouro ? 'numero' : 'logradouro').focus();
      })
      .catch(function (e) {
        if (e.name !== 'AbortError') { /* sem rede: o usuário preenche manualmente */ }
      });
  }

  /* ---------- Envio ---------- */
  var resumo = document.getElementById('resumo-erros');
  var sucesso = document.getElementById('sucesso');

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    sucesso.hidden = true;

    var erros = [];
    Object.keys(regras).forEach(function (id) {
      var msg = validarCampo(id);
      if (msg) erros.push({ id: id, msg: msg });
    });
    var msgDisp = validarDisponibilidade();
    if (msgDisp) erros.push({ id: 'disp-manha', msg: msgDisp });

    if (erros.length) {
      resumo.innerHTML = '<strong>Corrija ' + erros.length +
        (erros.length === 1 ? ' campo' : ' campos') + ' para continuar:</strong><ul>' +
        erros.map(function (e) {
          return '<li><a href="#' + e.id + '">' + e.msg + '</a></li>';
        }).join('') + '</ul>';
      resumo.hidden = false;
      resumo.focus();
      resumo.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          document.getElementById(a.getAttribute('href').slice(1)).focus();
        });
      });
      return;
    }

    resumo.hidden = true;
    var nome = document.getElementById('nome').value.trim().split(/\s+/)[0];
    sucesso.textContent = 'Obrigado, ' + nome + '! Seu cadastro foi recebido. Entraremos em contato em breve.';
    sucesso.hidden = false;
    sucesso.focus();
    form.reset();
    contador.textContent = '0/' + mensagem.maxLength + ' caracteres';
    form.querySelectorAll('.valido, .invalido').forEach(function (el) {
      el.classList.remove('valido', 'invalido');
    });
  });

  form.addEventListener('reset', function () {
    resumo.hidden = true;
    sucesso.hidden = true;
    form.querySelectorAll('.erro').forEach(function (p) { p.textContent = ''; });
    form.querySelectorAll('.valido, .invalido').forEach(function (el) {
      el.classList.remove('valido', 'invalido');
      el.removeAttribute('aria-invalid');
    });
    contador.textContent = '0/' + mensagem.maxLength + ' caracteres';
  });
})();
