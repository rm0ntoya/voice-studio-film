# voice-agent

Chat de voz ao vivo: ElevenLabs Agents (voz, escuta, interrupção) + OpenRouter (modelo).

```bash
cp .env.example .env   # preencha as chaves, a voz e o modelo
npm install
npm start              # abre o navegador e já começa a escutar
```

- Use o Chrome. Ele cancela o eco, então funciona sem fone.
- Fale por cima da IA pra interromper. Ela para, escuta e continua sabendo o que chegou a dizer.
- Pra trocar voz ou modelo, edite o `.env` e reinicie o `npm start`.
- Na 1ª execução o script cria na sua conta ElevenLabs um secret (com a chave do OpenRouter) e um agent "voice-studio-agent". Os IDs ficam em `.state.json`. Se trocar a chave do OpenRouter, apague esse arquivo.
