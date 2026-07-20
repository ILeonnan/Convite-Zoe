export const INVITE_TEMPLATE = `Olá, *{nome}*! 🐝

É com o coração cheio de *mel e amor* que a gente te convida para celebrar o *primeiro aninho da nossa Zoe*! 🌼🍯

Seria uma alegria enorme contar com a sua presença nesse dia tão especial pra gente.

Para facilitar a organização, preparamos um *convite digital exclusivo* com todas as informações:

▫️ *Local, data e horário* da festinha
▫️ *Lista de presentes* (caso queira contribuir)
▫️ *Confirmação de presença* interativa

👇 Acesse pelo link abaixo:
{link}

⚠️ Pedimos que a *confirmação seja feita até o dia 20 de Agosto*, para conseguirmos organizar tudo com carinho. Confirmações após essa data infelizmente não poderemos garantir. 🙏

Qualquer dúvida, é só chamar! Esperamos muito a sua companhia nessa *data tão doce*. 🐝💛`;

export const REMINDER_TEMPLATE = `Olá, *{nome}*! 🐝🌼

Passando para dar um *lembrete carinhoso* sobre o *primeiro aninho da Zoe*! 🍯

Ainda não identificamos a sua confirmação de presença. Acesse o convite pelo link abaixo e confirme até o *dia 20 de Agosto*:

👇
{link}

Será um prazer enorme celebrar esse dia tão especial com você! 💛

Qualquer dúvida, é só chamar. 🙏`;

export function fillTemplate(template: string, nome: string, link: string) {
  return template.replace(/\{nome\}/g, nome).replace(/\{link\}/g, link);
}
