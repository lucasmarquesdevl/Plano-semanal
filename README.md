# ◈ Plano-Semanal

**Plano-Semanal** (StudyWeek) é um organizador de estudos de alta performance com interface *dark mode* e foco em produtividade visual. Desenvolvido para facilitar a gestão de horários, o app permite planejar sessões, monitorar o progresso em tempo real e organizar matérias por cores.

---

## ✨ Funcionalidades Principais

* **Grade Horária Dinâmica:** Exibição clara dos 7 dias da semana com destaque visual para o dia atual e indicação de sessões concluídas por dia.
* **Gestão Completa de Sessões:** Adicione matérias com horários de início/fim, notas personalizadas e uma paleta de 8 cores distintas.
* **Dashboard de Estatísticas:** * Contagem total de sessões planejadas e concluídas.
    * Cálculo automático de horas totais de estudo.
    * Indicador visual de progresso via anel percentual dinâmico (SVG).
* **Edição e Controle:** Interface modal para editar detalhes de sessões, marcar como concluídas ou excluir registros com feedback via *Toast*.
* **Persistência de Dados:** Integração com `localStorage` sob a chave `studyweek_sessions`, mantendo os dados salvos no navegador.
* **Design Moderno:** Interface responsiva utilizando as fontes *Syne* e *DM Mono* para uma estética técnica e limpa.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído puramente com tecnologias web nativas (**Vanilla Stack**):

* **HTML5:** Estrutura semântica, modais de diálogo e acessibilidade.
* **CSS3:** Layouts com **CSS Grid** e **Flexbox**, animações de entrada, variáveis globais e efeitos de *glassmorphism* (`backdrop-filter`).
* **JavaScript (ES6+):** Lógica de estado, manipulação de DOM, cálculos de tempo e armazenamento local.

---

## 🚀 Como Executar o Projeto

1. Clone este repositório:
   ```bash
   git clone [https://github.com/lucasmarquesdevl/Plano-Semanal.git](https://github.com/lucasmarquesdevl/Plano-Semanal.git)
Navegue até a pasta do projeto e abra o arquivo index.html em qualquer navegador moderno.

📂 Estrutura de Arquivos
index.html: Estrutura principal e containers de estatísticas.

style.css: Estilização completa e definições de responsividade.

app.js: Lógica de gerenciamento de sessões e renderização da grade.

🤝 Créditos
Desenvolvimento: Lucas Marques

Concepção e Ideia: Claudia Trindade

Projeto desenvolvido para fins de organização pessoal e portfólio. ◈

