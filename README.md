# Blissful Bookings

## Agenda de Massagem 

A empresa possui vários departamentos. Para proporcionar qualidade de vida no trabalho, a empresa disponibiliza sessões de massagem para seus funcionários.

## Regras de utilização

A massagem ocorre as segundas, quartas e sextas, das 09h até as 16h, com intervalo entre 12h e 13h. 

Não há massagem em feriados

Cada sessão de massagem dura 20 minutos.

Cada funcionário agendar no máximo duas vezes por semana a massagem

Cada departamento possui sua propria massagista

Cada departamento possui uma quantidade funcionarios

Um funcionario so pode pertencer a um unico departamento

Um funcionario pode estar temporariamente em outro departamento

O funcionario pode optar por nunca agendar massagem

Calcular o limite mensal de sessoes de massagem por funcionario, dada a quantidade de funcionários vs quantidade de sessoes do mês

Uma lista impressa com horarios da sessao e nomes dos funcionários deve ser gerada para cada dia de massagem

## UI

A tela inicial deve exibir automaticamente o nome do departamento e da massagista do funcionario, e uma lista de datas disponíveis para agendamento. 

O formato da lista deve ser: (numero de ordem, xx de xxxxxx de xxxx).Ao clicar em uma data da lista, abrir um formulario para exibir a lista de horarios de sessões disponíveis para agendamento. 

Os horários já ocupados não devem permitir edição. A lista de sessões tem o formato: (numero de ordem, hora de inicio, nome do funcionário). 

Funcionarios que ja usufruiram de duas sessoes devem ser impedidos de agendar na sexta-feira

## DB

As tabelas devem guardar dados de:

- Departamentos (id_dep, nome_dep, id_massagista)

- Massagistas (id_massagista, nome_massagista, telefone, id_dep)

- Agendamentos (id_agendamento, id_dep, data_agendamento, horario, id_funcionario)

Não armazenar dados que podem ser calculados a partir dos dados já existentes

## Segurança

Os dados do funcionário e do departamento são fornecidos pela plataforma low code e devem ser automatizados na aplicação

O funcionário só consegue acessar o aplicativo após o login na intranet da empresa

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/38341e05-112e-4a9a-9ba7-2311362e8081).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
